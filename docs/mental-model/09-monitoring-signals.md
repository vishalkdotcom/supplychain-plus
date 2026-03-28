# Monitoring Signals — Detecting Trouble by Its Absence

## The Core Insight

Most analytics detect problems from data that exists: complaints, anomalies, negative sentiment. Monitoring signals detect problems from data that **doesn't exist**.

This is counterintuitive but critical: in supply chain compliance, **silence is often the scariest signal.** A factory with lots of complaints has functioning grievance channels. A factory with zero complaints might have suppressed ones.

## Signal 1: Silence

### What It Detects

A factory with no case activity AND no survey activity for 60+ days.

### Why Both Channels Must Be Silent

A factory might legitimately not have grievance cases (rare but possible) while still running surveys. That's not silence — workers are participating through one channel. Only when **all channels** go dark is it concerning.

### The Possibilities When Silent

1. **Workers afraid of retaliation.** They've learned that filing complaints leads to punishment. This is the worst scenario.
2. **Channels are broken.** The complaint system is inaccessible (app not installed, phone line disconnected, manager gatekeeping).
3. **Management suppression.** Complaints are intercepted before they enter the system.
4. **Genuinely fine.** The factory has no problems and workers have nothing to report. (This is possible but less likely, especially when peer factories are active.)

The system can't distinguish between these — it flags the situation for human investigation.

### Severity Escalation

- **60-119 days silent → Warning.** "We haven't heard from this factory in a while."
- **120+ days silent → Critical.** "This factory has been dark for 4 months. Something is wrong."

### How It's Computed

```sql
-- Latest case activity per factory (from SQL Server):
SELECT CompanyId, MAX(Created) as lastCaseDate FROM [Case]
GROUP BY CompanyId

-- Latest survey activity per factory (from PostgreSQL):
SELECT client_id, MAX(created_date) as lastSurveyDate
FROM survey_mdlsurveyquestionresponses GROUP BY client_id
```

For each supplier, compute `daysSinceCase` and `daysSinceSurvey`. If both exceed 60, generate a silence signal.

## Signal 2: Engagement Decay

### What It Detects

Survey participation is **declining** — not yet silent, but trending that way. This is a leading indicator: factories that eventually go silent almost always show declining engagement first.

### The Algorithm

```
1. Get monthly response counts for last 6 months per supplier
2. Need >= 3 months of data (less than that → not enough to detect a trend)
3. Compute trailing 3-month average (months 2-4)
4. Compare latest month to trailing average
5. Check for consecutive declining months
```

**Warning** if:
- Latest month < 60% of trailing average

**Critical** if:
- Latest month < 40% of trailing average, OR
- 3+ consecutive months of decline (regardless of absolute level)

### Why Consecutive Decline Matters

A factory might have a bad month (holiday season, busy period) where responses drop. That's noise. But three consecutive months of decline is a trend — something structural is changing. Workers are losing interest, access, or safety to participate.

### The Metadata

Each signal stores diagnostic metadata:
```json
{
  "latestCount": 12,
  "trailingAvg": 45,
  "dropPercent": 73,
  "consecutiveDeclines": 3,
  "monthlyTrend": [45, 38, 25, 12]
}
```

This lets the UI show a mini trend chart alongside the signal, helping users understand whether it's a sudden drop or a gradual fade.

## Signal 3: Regional Contagion

### What It Detects

Multiple high-risk factories in the same region sharing the same risk factors. This suggests a **systemic regional problem**, not isolated incidents.

### The Algorithm

```
1. Group all suppliers by region
2. Filter to suppliers with riskScore >= 70 (high risk)
3. For each region: collect all risk factors (from supplierRiskScores.reasons)
4. Find factors that appear in >= 2 suppliers
5. If a region has >= 3 high-risk suppliers with shared factors → generate signal
```

### Why This Matters

**Example:** Three factories in Vietnam's Mekong Delta region all have high risk driven by "excessive overtime" and "wage payment delays."

- Without regional contagion: Each factory gets investigated separately. Three separate audits, three separate remediation plans.
- With regional contagion: The pattern is recognized as regional. Investigation targets the shared cause — maybe a regional subcontractor, a local labor law gap, or a shared client pushing unrealistic deadlines.

Regional intervention is more effective than per-factory intervention when the root cause is regional.

### The Metadata

```json
{
  "region": "SE Asia",
  "affectedSuppliers": 5,
  "sharedFactors": ["excessive overtime", "wage payment delays"]
}
```

## Auto-Resolution: Signals Aren't Permanent

Each time monitoring signals are computed (after every `calculate-risk` run), the system compares new signals against existing ones:

```
New signals:     {A: silence, B: contagion}
Existing signals: {A: silence, B: contagion, C: silence}

C is no longer in the new set → resolve C (set resolvedAt = now)
A and B are still active → update their metadata (in case details changed)
```

**Why set subtraction?** A previously-silent factory that submits new cases should have its silence signal resolved immediately. The system doesn't wait for a human to manually close the signal. The signal reflects the current state of the data, not a historical finding.

## Interaction with Other Components

Monitoring signals feed into several downstream systems:

- **Regional Benchmarking:** Contextual silence alerts check whether peer factories in the same region are active while this one is silent.
- **Intelligence Briefing:** Silent factories and regional contagion are attention items in the daily briefing.
- **Remediation Plans:** Signals can be the source for a remediation plan (`sourceType = "monitoring_signal"`).
- **Action Suggestions:** Pure domain logic maps signal types to recommended actions:
  - Silence → "Schedule unannounced visit" or "Deploy pulse survey" (urgency: immediate for critical)
  - Engagement decay → "Investigate survey participation barriers" (urgency: soon)
  - Regional contagion → "Convene regional supplier meeting" (urgency: immediate)
