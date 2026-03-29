# Genuine Engagement vs. Checkbox Compliance — Seeing Through the Numbers

## The Problem

A factory submits monthly surveys, enrolls workers in training, and has a functioning grievance channel. On paper, it looks compliant. But:

- The surveys always return suspiciously positive results
- Training enrollment is high but completion is near zero
- The grievance channel exists but nobody uses it

This is **checkbox compliance** — doing the minimum to tick boxes without genuinely engaging workers. It's the hardest pattern to detect because every individual metric looks acceptable. Only when you see all four dimensions together does the hollow center become visible.

## Why This Matters for Regulators

EU CSDDD and German LkSG don't just require *having* channels — they require *effective* channels. A grievance mechanism that workers don't trust is not effective. Training that workers don't complete is not prevention. Regulators are increasingly sophisticated about distinguishing real engagement from performative compliance.

## The Four Dimensions

The engagement health radar visualizes four dimensions, each derived by **inverting** the corresponding risk score (higher = healthier):

| Dimension | What It Measures | Risk Score Source | Health = |
|-----------|-----------------|------------------|----------|
| **Grievance Management** | Are workers using complaint channels? | `caseScore` (35% weight) | `100 - caseScore` |
| **Worker Voice** | Are surveys active and generating responses? | `surveyScore` (25% weight) | `100 - surveyScore` |
| **Training Completion** | Are workers finishing compliance courses? | `trainingScore` (25% weight) | `100 - trainingScore` |
| **Proactive Engagement** | Is there activity across all channels? | `engagementScore` (15% weight) | `100 - engagementScore` |

### Why Inversion Works

Risk scoring (see [02-risk-scoring.md](02-risk-scoring.md)) treats absence as danger: no surveys = high risk, no training = high risk. The health radar flips this so compliance officers see a positive framing — "where is this factory strong?" rather than "where is it weak?"

A perfectly engaged factory has a full, symmetrical radar. A checkbox-compliant factory has a lopsided one.

## Reading the Radar

### Pattern 1: Balanced and Full (Genuine Engagement)

```
    Grievance ████████ 85
    Voice     ████████ 80
    Training  ███████░ 75
    Engagement████████ 82
```

All four dimensions are high and roughly equal. This factory has open channels, active participation, and workers are completing training. This is what genuine engagement looks like.

### Pattern 2: Lopsided (Checkbox Compliance)

```
    Grievance ████░░░░ 40
    Voice     ████████ 90
    Training  ██░░░░░░ 20
    Engagement███░░░░░ 35
```

High survey scores but low training completion and low grievance activity. The factory runs surveys (easy to mandate) but doesn't ensure workers complete training (requires effort) and workers don't file grievances (channels may be untrusted).

### Pattern 3: Uniformly Low (Disengaged)

```
    Grievance ██░░░░░░ 20
    Voice     ██░░░░░░ 25
    Training  █░░░░░░░ 15
    Engagement█░░░░░░░ 10
```

Everything is low. No channels are working. This is the most alarming pattern — combined with a silence monitoring signal (see [09-monitoring-signals.md](09-monitoring-signals.md)), this factory needs immediate investigation.

### Pattern 4: Single Spike (Gaming)

```
    Grievance ██████░░ 60
    Voice     █░░░░░░░ 10
    Training  ████████ 95
    Engagement██░░░░░░ 25
```

Very high training completion but near-zero survey participation. The factory forces training attendance (to show compliance) but doesn't give workers a voice. The high training score is real in terms of numbers but not in terms of genuine engagement.

## The Engagement Meta-Signal

The engagement score itself (the fourth dimension) is a **meta-signal** — it's derived from the other three:

```typescript
engagementScore = round((caseScore * 0.3 + surveyScore * 0.3 + trainingScore * 0.4) * 0.5)
```

This catches factories where individual scores look acceptable but overall participation is dead. A factory might game surveys (low surveyScore = looks good) while having minimal case activity and mediocre training. Each individual metric passes the "okay" threshold, but the engagement meta-signal reveals the pattern.

**Why only 15% of the composite risk score?** Because it's derived from the other three, not independent data. Giving it more weight would double-count those signals. But 15% is enough to tip a borderline score into "needs attention" territory when the radar shape is wrong.

## Implementation

The radar is rendered in `components/suppliers/engagement-health-score.tsx` using Recharts' `RadarChart`. It appears on the supplier detail page (`/suppliers/[id]`) alongside the risk breakdown, giving compliance officers both the numerical score and the visual shape in one view.

The component takes a `Supplier` object with `riskBreakdown` (containing `caseScore`, `surveyScore`, `trainingScore`, `engagementScore`) and inverts each for display:

```typescript
const data = [
  { subject: "Grievance Mgmt",      A: 100 - supplier.riskBreakdown.caseScore },
  { subject: "Worker Voice",         A: 100 - supplier.riskBreakdown.surveyScore },
  { subject: "Training Completion",  A: 100 - supplier.riskBreakdown.trainingScore },
  { subject: "Proactive Engagement", A: 100 - supplier.riskBreakdown.engagementScore },
];
```

No additional API calls or data transformations — the radar is a pure visualization of data already computed by the risk scoring job.

## Connection to Other Mental Models

- **Risk Scoring** ([02](02-risk-scoring.md)): The radar visualizes the same four dimensions that compose the risk score, just inverted.
- **Monitoring Signals** ([09](09-monitoring-signals.md)): Silence and engagement decay signals often correlate with lopsided or uniformly low radars.
- **Remediation** ([10](10-remediation-and-evidence.md)): When a radar improves (dimensions rising over time), the auto-evidence system can capture this as proof of genuine engagement improvement.
