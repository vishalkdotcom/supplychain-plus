# Forecasting — Predicting Where Risk Is Heading

## The Problem

Knowing a factory's risk score today is useful. Knowing where it'll be **in 60 days** is more useful. A factory at risk 55 today that's trending upward at 0.5 points/day will hit 85 in two months — by then it's a crisis. Catching it now lets you intervene early.

## Why Ordinary Least Squares (OLS)?

OLS is the simplest regression: fit a straight line through data points, then extend the line forward. Given 180 days of daily risk scores, it finds the slope (trend direction) and intercept (baseline).

### Why Not Something Fancier?

**Neural networks?** Need thousands of training examples to generalize. You have at most 180 data points per supplier — a neural network would memorize the noise and produce garbage predictions.

**Random forests / gradient boosting?** Same problem: too few data points. These methods also require feature engineering, and the only feature you have is "date → risk_score."

**ARIMA / exponential smoothing?** These time-series methods assume regular intervals and stationary patterns. Risk scores are computed by a batch job that runs on-demand (not always at regular intervals), and the underlying process (cases + surveys + training) is highly non-stationary.

**Polynomial regression?** A quadratic or cubic fit through 180 points would capture short-term curves but extrapolate wildly. A polynomial that curves upward at the end of the data would predict astronomical values 60 days out.

**OLS is honest about what the data supports:** with 180 noisy points, you can reliably estimate a linear trend and not much else.

## The Full Algorithm

```
1. Fetch 180 days of history from supplierRiskHistory
2. Need >= 14 data points (otherwise skip — not enough data)
3. Fit OLS: slope = (n*sumXY - sumX*sumY) / (n*sumXX - sumX^2)
4. Extrapolate: rawPrediction = lastActualValue + slope * 60
5. Mean-reversion damp: prediction = rawPrediction * 0.7 + historicalAverage * 0.3
6. Clamp to [0, 100]
7. Confidence = (dataDensity * 0.3 + R^2 * 0.7) * 100
8. Trend: slope > 0.3 → "rising", slope < -0.3 → "falling", else "stable"
```

### Step 3: OLS Regression

The classic closed-form formula. No iterative optimization, no gradient descent. Just arithmetic on sums:

```
slope = (n * sum(x*y) - sum(x) * sum(y)) / (n * sum(x^2) - sum(x)^2)
intercept = (sum(y) - slope * sum(x)) / n
```

Where x = day index (0, 1, 2, ... 179) and y = risk score that day.

This runs in O(n) time — one pass through the data. For 180 points, it's instantaneous.

### Step 5: Mean Reversion Damping

This is the most important step. Without it, forecasts would be absurd.

**The problem:** A supplier with risk increasing at 0.5/day over 180 days would forecast: `current + 0.5*60 = current + 30`. If current is 60, that's 90. But real risk scores don't increase linearly forever — when a factory hits 70+, it gets attention, interventions happen, and risk drops.

**Mean reversion** is the statistical observation that extreme values tend to return toward the average over time. SupplyChain+ applies it as a weighted blend:

```
prediction = rawPrediction * 0.7 + historicalAverage * 0.3
```

- **70% trend signal:** Genuine deterioration still shows up clearly.
- **30% historical pull:** Prevents runaway extrapolation by anchoring to the long-term norm.

**Example:** Factory has averaged 45 risk over 6 months. Recently trending up, raw extrapolation says 80 in 60 days.
```
Damped = 80 * 0.7 + 45 * 0.3 = 56 + 13.5 = 69.5
```
Instead of "definitely going to 80" you get "probably heading toward high 60s" — more realistic.

### Step 7: Confidence Score

Not all predictions deserve the same trust. The confidence score tells you how seriously to take the forecast:

```
confidence = (dataDensity * 0.3 + R^2 * 0.7) * 100
```

**R^2 (coefficient of determination):** How well does the linear trend explain the data's variance?
- R^2 = 0.9 → 90% of the variance follows the trend → strong prediction
- R^2 = 0.1 → data is mostly noise → prediction is barely better than random
- R^2 can be negative (when the mean is a better predictor than the line) → really don't trust this

**Data density:** `min(n / 30, 1) * 0.3` — how many of the possible 180 days have data?
- All 30+ days filled → full 0.3 bonus
- Only 14 days (minimum) → 0.14 bonus
- Rewards having more data, maxes out at 30 (diminishing returns beyond that)

**How the UI uses this:** Predictions with confidence < 30% are shown with a "low confidence" badge. Users learn to not act on low-confidence forecasts.

### Step 8: Trend Direction

Simple threshold on slope:
- slope > 0.3 → "rising" (risk increasing meaningfully)
- slope < -0.3 → "falling" (risk decreasing meaningfully)
- otherwise → "stable"

The 0.3 threshold means a change of less than 0.3 points/day (~18 points over 60 days) is considered noise. This prevents reporting "rising" for every tiny upward wiggle.

## LLM Enrichment (Conditional)

Calling an LLM for every supplier's forecast would be expensive. The job only calls the LLM when:
- Score delta > 5 (meaningful change predicted), OR
- Confidence > 0.5 (the prediction is trustworthy enough to explain)

The LLM generates `aiReasoning` — a human-readable explanation of why the forecast looks the way it does. For suppliers that don't meet either threshold, a templated explanation is used instead.

## When Forecasting Fails Gracefully

- **< 14 data points:** Supplier is skipped. No forecast is better than a meaningless one.
- **LLM call fails:** Templated reasoning is used. The forecast numbers are still valid — they come from math, not the LLM.
- **All data points are the same value:** Slope = 0, R^2 = undefined. Falls back to "stable" trend with low confidence.

The key principle: **degrade gracefully**. Every step has a fallback that preserves the core prediction even if enrichment steps fail.
