# Risk Scoring — Turning Messy Data Into One Number

## The Problem

You have 300 factories. Each has complaints, surveys, training data, worker counts — spread across 4 databases. How do you decide which factory needs attention first?

You can't compare raw numbers directly. A factory with 50 cases might be fine (it has 5000 workers and open channels) while one with 5 cases might be alarming (it has 100 workers and the cases are all about forced labor).

## The Solution: Composite Scoring

A composite score collapses multiple signals into a single number (0-100) that enables ranking. It's the same idea as a credit score: take diverse signals, weight them by importance, combine into one comparable number.

```
riskScore = caseScore * 0.35 + surveyScore * 0.25 +
            trainingScore * 0.25 + engagementScore * 0.15
```

Higher score = more risk. A factory scoring 85 needs attention before one scoring 40.

## The Four Dimensions, Deeply

### Case Score (35% weight) — "Are workers complaining, and about what?"

**Source:** SQL Server `[Case]` table.

```
caseScore = min(100, round((highPriority/total * 60) + (openCases/total * 40)))
```

Two sub-signals:
- **High-priority ratio** (× 60): What fraction of cases are marked high priority? This captures severity.
- **Open cases ratio** (× 40): What fraction of cases are still unresolved? This captures neglect.

**Why 35% weight?** Active worker complaints are the most *direct* evidence of problems. A survey might be gamed. Training completion is a process metric. But a worker filing a grievance about harassment is a person saying "this happened to me." It's the strongest signal.

**Default when no data:** 0. No cases = no signal. (Unlike surveys, where no data = blind spot.)

### Survey Score (25% weight) — "Can we see inside this factory?"

**Source:** PostgreSQL `wovo_new`, `survey_mdlsurvey` table.

```
surveyScore = max(0, 50 - activeSurveys * 10)
```

This measures **whether surveys exist at all**, not what they say. Five active surveys → score is 0 (low risk). Zero surveys → score is 60.

**Why does zero surveys = risk 60?** This is the "absence is risk" principle. If you have no visibility into a factory, you literally cannot know if there are problems. The survey score penalizes blind spots. A factory you can't see into is scarier than one where you can see some problems.

**Default when no data:** 60. Same reasoning — no survey data means no visibility.

### Training Score (25% weight) — "Are workers educated about their rights?"

**Source:** MySQL `iomadprod` (Moodle).

```
trainingScore = max(0, 100 - completionRate%)
```

Inverted completion rate. 100% completion → score 0. 0% completion → score 100.

**Why does this matter for risk?** Two reasons:
1. Workers who don't know their rights are more vulnerable to exploitation.
2. Brands that don't train workers can't claim they invested in prevention — which matters when regulators ask "what did you do about this?"

**Default when no data:** 70. No training data is high risk — the brand has no evidence of prevention efforts.

### Engagement Score (15% weight) — "Is anyone participating at all?"

**Source:** Derived from the other three scores.

```
engagementScore = round((caseScore * 0.3 + surveyScore * 0.3 + trainingScore * 0.4) * 0.5)
```

This is a **meta-signal**. It catches factories where everything looks artificially calm. A factory might submit a few surveys (gaming the survey score) and enroll workers in training they never complete (gaming the training score). But if overall engagement is dead across all channels, the engagement score picks that up.

**Why only 15%?** Because it's derived, not independent. Giving it too much weight would double-count the other signals.

## Why Hardcoded Weights Instead of Machine Learning?

This is a design decision worth understanding deeply.

### Reason 1: Not Enough Data

You have ~300 factories. Machine learning needs thousands to tens of thousands of examples to learn meaningful patterns. With 300, you'd overfit — the model would "learn" quirks of your specific factory set that don't generalize.

### Reason 2: No Ground Truth Labels

ML needs labels: "this factory was ACTUALLY high risk" vs "this factory was ACTUALLY fine." You don't have those. Risk is a judgment, not a measurable fact. Without labels, you can't train a supervised model.

### Reason 3: Regulatory Explainability

When a regulator asks "why did you rate this factory as high risk?", you need a clear answer:

- **With hardcoded weights:** "We weight active grievances at 35% because direct worker complaints are the strongest evidence. This factory had 12 high-priority cases out of 15 total."
- **With ML weights:** "Our model determined a weight of 0.347 for the case feature based on training data." This invites "what training data? How do you know it's representative? Has it been audited?"

In regulated domains, explainability isn't a nice-to-have — it's a requirement.

### Reason 4: Domain Stability

The relative importance of cases vs. surveys vs. training doesn't change year to year. Worker complaints have been the strongest risk signal in labor compliance for decades. Learned weights would need retraining to capture shifts that barely happen.

## The RiskReason Pattern — Scores That Explain Themselves

Every risk score comes with explanations:

```typescript
interface RiskReason {
  factor: string;       // "5 high-priority cases open"
  impact: "high" | "medium" | "low";
  description: string;  // "Multiple high-priority grievances suggest ongoing workplace issues"
  module: "connect" | "engage" | "educate";
}
```

Stored as JSONB arrays in the `supplierRiskScores` table. The UI renders them as "why this score is high."

This pattern — **score + explanation** — is essential for regulatory compliance. An auditor can see not just "risk = 78" but exactly which factors drove that number.

## The Batch Query Pattern

Risk calculation touches 4 databases for every supplier. Naively, that's:
```
FOR each of 300 suppliers:
  query SQL Server for case stats     → 300 queries
  query PostgreSQL for survey counts  → 300 queries
  query MySQL for training rates      → 300 queries
  query wc_global for worker counts   → 300 queries
= 1200 database queries
```

Instead, the job runs 4 bulk queries upfront:
```
1 query → all case stats (keyed by CompanyId)
1 query → all survey counts (keyed by client_id)
1 query → all training rates (keyed by companyid)
1 query → all worker counts (keyed by client_id)
= 4 database queries
```

Then it iterates 300 suppliers in memory, looking up precomputed values. This reduces database load by 300x and makes the job finish in seconds instead of minutes.

## What Happens After Scoring

Risk scores don't just sit in a table. They trigger downstream effects:

- **Auto-alerts:** If a score crosses 75, an alert is created in the `alerts` table.
- **Auto-evidence:** If a score *drops* >5 points for a supplier with an active remediation plan, `risk_score_drop` evidence is attached automatically.
- **History snapshot:** Today's scores are appended to `supplierRiskHistory` for trend analysis. The forecast job uses these 180 days of history.
- **Monitoring signals:** After scoring completes, `computeMonitoringSignals()` runs to detect silence, contagion, and engagement decay.

The risk job is the foundation of the pipeline — every other job either reads its output or depends on the state it creates.
