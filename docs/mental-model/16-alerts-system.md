# Alerts — Automated Attention Routing

## The Problem

A compliance officer manages 300 factories. Risk scores change daily. New clusters emerge. Anomalies are detected. Remediation plans go overdue. Without a notification system, the officer has to manually check every metric, every day, for every factory.

Alerts solve this by inverting the flow: instead of the officer looking for problems, **problems find the officer**.

## How Alerts Are Generated

Alerts are created automatically by background jobs — never manually by users. Two jobs currently generate alerts:

### 1. Risk Threshold Crossing (`calculate-risk` job)

When a supplier's risk score reaches 75 or above:

```typescript
if (riskScore >= 75) {
  await db.insert(alerts).values({
    supplierId,
    supplierName: supplier.name,
    alertType: "risk_spike",
    severity: riskScore >= 90 ? "critical" : "warning",
    title: `High risk score: ${supplier.name} (${riskScore})`,
    message: `Composite risk score is ${riskScore}/100. Top factors: ${topReasons}`,
  });
}
```

**Why 75?** The risk scale is 0-100. Scores below 50 are generally healthy. 50-74 is elevated but manageable. 75+ means multiple risk dimensions are contributing significantly — this is when proactive intervention prevents a crisis.

**Severity escalation:**
- **Warning** (75-89): The factory needs attention soon. Something is deteriorating.
- **Critical** (90+): Multiple severe issues are compounding. Immediate action required.

### 2. Overdue Remediation Plans (`calculate-risk` job)

After risk scoring completes, the job checks for remediation plans past their target date that are still open:

```typescript
const overdueRemediations = await db.select()
  .from(remediationPlans)
  .where(and(
    notInArray(remediationPlans.status, ["closed", "verifying"]),
    isNotNull(remediationPlans.targetDate),
    lte(remediationPlans.targetDate, now)
  ));
```

For each overdue plan, a dedup check prevents duplicate alerts:
- Query existing alerts for `(supplierId, alertType: "remediation_overdue")`
- Only create a new alert if none exists

**Severity escalation:**
- **Warning** (1-14 days overdue): The deadline passed recently.
- **Critical** (14+ days overdue): Significantly overdue — remediation is stalling.

## Alert Data Model

Each alert in the `alerts` table contains:

| Field | Purpose |
|-------|---------|
| `id` | Auto-incrementing primary key |
| `supplierId` | Which factory this alert concerns |
| `supplierName` | Cached name for display without joins |
| `alertType` | "risk_spike" or "remediation_overdue" |
| `severity` | "critical", "warning", or "info" |
| `title` | One-line summary (e.g., "High risk score: Factory X (82)") |
| `message` | Detailed context (e.g., top risk factors) |
| `isRead` | Whether the user has acknowledged it |
| `resolvedAt` | When the issue was resolved (nullable) |
| `createdAt` | When the alert was generated |

## The Alerts API

`/api/alerts` provides two operations:

**GET** — Fetch alerts with filters:
- `unreadOnly` (default true) — Only show unacknowledged alerts
- `severity` — Filter by level (critical/warning/info)
- `hasRemediation` — Filter by whether a remediation plan has been linked
- `limit` — Cap results (default 20)

The `hasRemediation` filter is implemented by cross-referencing with `remediationPlans` where `sourceType = "alert"`. This lets the UI show "alerts without plans" to help officers prioritize which alerts still need action.

**PATCH** — Update alert state:
- Mark as read (`isRead: true`)
- Resolve (`resolve: true` → sets `resolvedAt = now`)

## The NeedsAttentionTabs Widget

Alerts don't exist in isolation. On the dashboard, they live inside the **NeedsAttentionTabs** widget — a unified attention center with four tabs:

```
┌──────────┬──────────┬──────────┬──────────┐
│  Alerts  │  Urgent  │   Risk   │ Forecasts│
│  (5)     │  Cases(3)│  Moves(2)│   (8)    │
└──────────┴──────────┴──────────┴──────────┘
```

| Tab | Data Source | What It Shows |
|-----|-----------|---------------|
| **Alerts** | `/api/alerts` | Auto-generated system alerts (risk spikes, overdue remediations) |
| **Urgent Cases** | `/api/metrics` briefing | High-priority unresolved grievance cases |
| **Risk Movements** | `/api/metrics` briefing | Suppliers whose risk worsened since last computation |
| **Forecasts** | `/api/ml-insights` | Suppliers with rising risk predictions (60-day outlook) |

Each tab shows a **badge count** on the trigger, so officers can see at a glance which category needs attention without clicking.

### Tab Behavior

- **URL-persisted active tab** via `nuqs` (`?attention=alerts`): Refreshing the page preserves which tab is open.
- **60-second auto-refresh** on alerts: New alerts appear without manual reload.
- **5-minute stale time** on briefing and ML insights: Heavier queries cached longer.
- **Remediation action from alerts**: Each alert-tab item can spawn a `CreatePlanDialog` directly, creating a remediation plan linked back to the alert (`sourceType: "alert"`).

## Alert Lifecycle

```
Generated by job  →  Displayed (unread)  →  Acknowledged (read)  →  Resolved
     │                     │                       │                    │
  calculate-risk      Dashboard load          User clicks           User resolves
  detects risk≥75     shows in tab           "Acknowledge"         or issue fixes
                                                                    itself
```

**Acknowledged ≠ Resolved.** Acknowledging means "I've seen this." Resolving means "the underlying issue is fixed." This distinction matters for audit trails — regulators want to see both when the issue was noticed and when it was addressed.

## Visual Design

Each alert is color-coded by severity with corresponding icons:

- **Critical** → Red `IconAlertCircle` — demands immediate action
- **Warning** → Orange `IconAlertCircle` — needs attention soon
- **Info** → Blue `IconInfoCircle` — worth knowing but not urgent

The acknowledge button appears on hover (`opacity-0 group-hover:opacity-100`), keeping the list clean for scanning while making the action easily accessible.

Clicking the alert title navigates to the supplier detail page (`/suppliers/{id}`), providing full context for investigation.

## Connection to Other Mental Models

- **Risk Scoring** ([02](02-risk-scoring.md)): Alerts are a direct downstream effect of risk calculation — crossing 75 triggers an alert.
- **Remediation** ([10](10-remediation-and-evidence.md)): Alerts feed into the remediation pipeline as source triggers (`sourceType: "alert"`).
- **Queue Engine** ([08](08-queue-engine.md)): Alert generation happens inside the `calculate-risk` job, which runs first in the pipeline.
- **Dashboard Architecture** ([17](17-dashboard-architecture.md)): Alerts occupy the first tab of the NeedsAttentionTabs widget.
