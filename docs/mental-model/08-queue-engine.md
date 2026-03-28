# Queue Engine — Why Serial Execution Wins Here

## The Problem

9 batch jobs need to run. Some depend on others. One uses a GPU. All access shared databases. How do you orchestrate this?

## The Decision: One Job at a Time

WOVO+ runs jobs **serially** — one at a time, in a defined order. No parallel workers. This is unusual for a job system, and it's deliberate.

### Why Not Parallel?

**1. Resource contention.** `calculate-risk` reads from 4 databases simultaneously with batch queries. If `analyze-surveys` also runs at the same time (hitting the same PostgreSQL and reading the same survey tables), you risk connection pool exhaustion and query timeouts.

**2. Data dependencies.** Most jobs depend on `calculate-risk` finishing first — they need fresh risk scores. With parallel execution, you'd need an explicit dependency graph (directed acyclic graph, topological sort, etc.). With serial execution in a known order, dependencies are **implicit**: calculate-risk runs first because it's first in the list.

**3. GPU exclusivity.** `case-clustering` uses Ollama for embeddings. Only one model fits in GPU VRAM at a time. If two Ollama-using jobs ran simultaneously, the GPU would thrash — constantly loading and unloading models, each taking 30+ seconds. The result: both jobs take 10x longer than they would sequentially.

**4. Debuggability.** A serial pipeline has one possible execution order. A parallel pipeline has many possible interleavings. When something goes wrong, serial is trivially reproducible.

### When Would Parallel Make Sense?

If WOVO+ scaled to thousands of suppliers with hourly job runs, serial wouldn't keep up. The right move then: a proper DAG executor (like Temporal or Apache Airflow) with explicit dependencies. But for 300 suppliers with daily runs and 9 jobs totaling ~30 minutes, serial is simpler, reliable, and fast enough.

## The Queue Implementation

### Tables

**`jobQueue`** — The work queue. Each entry represents one job to process:
- `jobRunId` → links to the execution record
- `jobType` → which handler to call
- `priority` → lower number = runs first
- `requiresOllama` → flag for GPU jobs
- `status` → "waiting" / "processing" / "done" / "retry_pending"
- `lockedAt` → when a worker claimed this job
- `retryCount`, `maxRetries`, `timeoutMs`, `retryAfter`

**`jobRuns`** — The execution log. Each entry records one attempt:
- `jobType`, `status` (queued/running/completed/failed/cancelled)
- `triggeredBy` → "manual" / "schedule" / "seed-script"
- `startedAt`, `completedAt`, `durationMs`
- `resultSummary` (JSONB), `error`, `attempt`

**`jobSchedules`** — Cron-based recurring schedules. `cronExpression`, `enabled`, `lastRunAt`, `nextRunAt`.

### The Poll Loop

Every 10 seconds, the engine polls for work:

```
POLL CYCLE:
1. Promote retry_pending jobs whose retryAfter has elapsed
2. Reset stale locks (processing for >20 minutes)
3. SELECT next waiting job (FOR UPDATE SKIP LOCKED)
4. If found: execute handler with timeout wrapper
5. On success: mark done, record result
6. On failure: retry or mark done (exhausted)
```

### FOR UPDATE SKIP LOCKED — The Key Pattern

```sql
SELECT * FROM job_queue
WHERE status = 'waiting'
ORDER BY priority ASC
FOR UPDATE SKIP LOCKED
LIMIT 1;
```

**`FOR UPDATE`** acquires a row-level lock. No other transaction can claim this row until ours commits.

**`SKIP LOCKED`** means: if another transaction already locked a row, skip it (don't wait for the lock). Return the next unlocked row instead.

**Why this matters:** If two poll cycles happen simultaneously (e.g., during a server restart), they don't deadlock. One gets the job, the other gets nothing (or the next job). No coordination needed beyond the database.

**Why not Redis?** Redis-based queues (BullMQ, Celery) are designed for high-throughput scenarios (thousands of jobs/second). WOVO+ processes 9 jobs/day. PostgreSQL `FOR UPDATE SKIP LOCKED` is simpler (no extra service to run), reliable, and transactional (atomic with job status updates).

### Ollama Serialization

The `EMBEDDING_JOBS` set contains job types that use local GPU (currently only `case-clustering`). During job selection:

```
If next job requires Ollama:
  Check: is any other Ollama job currently processing?
  If yes: skip this job (let it wait)
  If no: proceed
```

This ensures the GPU is never double-booked. Even if another non-Ollama job could run, the system won't start an Ollama job while one is already using the GPU.

### Timeout Handling

Each job has a per-type timeout:

| Job | Timeout |
|-----|---------|
| calculate-risk | 5 min |
| analyze-surveys | 10 min |
| case-clustering | 15 min |
| risk-forecast | 30 min |
| Others | 5-10 min |

Enforcement uses `Promise.race()`:

```typescript
const result = await Promise.race([
  handler(params),           // The actual job
  timeoutPromise(timeoutMs)  // Rejects after N ms
]);
```

If the timeout wins, the job is treated as a failure. This prevents a hung job from blocking the queue forever.

### Exponential Backoff Retry

When a job fails (exception, timeout), the retry logic:

```
retryDelay = BASE_DELAY_MS * 2^retryCount
           = 30,000 * 2^0 = 30 seconds (1st retry)
           = 30,000 * 2^1 = 60 seconds (2nd retry)
           = 30,000 * 2^2 = 120 seconds (3rd retry)
```

The job's queue entry is set to `status = 'retry_pending'` with `retryAfter = now + retryDelay`. A new `jobRuns` record is created with `attempt + 1`. The poll loop will pick it up once `retryAfter` elapses.

**Max retries per type:**
- Most jobs: 2 retries (3 total attempts)
- `case-clustering`: 1 retry (2 total). Ollama failures often indicate persistent VRAM issues that won't resolve with a quick retry.

### Stale Lock Recovery

If the server crashes mid-job, the queue entry stays `status = 'processing'` with a `lockedAt` timestamp. The poll loop checks:

```
IF status = 'processing' AND lockedAt < (now - 20 minutes):
  THEN reset to status = 'waiting'
```

**Why 20 minutes?** The longest job timeout is 30 minutes. A job processing for 20 minutes is likely legitimately running. But since `Promise.race` would have killed it at 30 minutes, a 20-minute-old lock from a *crashed* process (where Promise.race never fired) is safely stale.

In practice: most jobs finish in 1-5 minutes. A 20-minute-old lock is almost certainly from a process that died.

## The "Run All" Order

When you trigger all jobs at once:

```typescript
const RUN_ALL_ORDER = [
  "calculate-risk",           // Foundation: produces risk scores
  "analyze-surveys",          // NLP on survey responses
  "case-clustering",          // Vector clustering of cases
  "payslip-anomaly",          // Wage violation detection
  "risk-forecast",            // 60-day predictions (needs risk history)
  "worker-voice-analytics",   // Topic extraction from feedback
  "regional-benchmarking",    // Peer comparisons (needs scores + signals)
  "generate-briefing",        // Daily digest (needs all above)
  "remediation-evidence-sweep" // Evidence linking (after all analysis)
];
```

Each job is enqueued with escalating priority (0, 1, 2, ...) so the queue processes them in order. The dependencies are implicit in the ordering:
- `risk-forecast` needs `supplierRiskHistory` (produced by `calculate-risk`)
- `regional-benchmarking` needs risk scores AND monitoring signals (produced by `calculate-risk`)
- `generate-briefing` reads ALL intelligence tables (filled by all previous jobs)
- `remediation-evidence-sweep` checks for resolved cases/training (must run after analysis identifies what to look for)

## Schedule Checking

Every 60 seconds, the engine checks `jobSchedules`:

```
IF schedule.enabled AND schedule.nextRunAt <= now:
  enqueue job with triggeredBy = "schedule"
  compute next run from cron expression
```

The cron parser handles daily (`"0 9 * * *"` = 9am daily), weekly (`"0 9 * * 1"` = Mondays at 9am), and monthly (`"0 9 1 * *"` = 1st of month at 9am) patterns.
