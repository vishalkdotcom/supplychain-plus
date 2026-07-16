# SupplyChain+

Compliance intelligence product: turn worker voice, surveys, training, and wage signals across many factories into attention, action, and evidence.

## Language

### Data

**Source database**:
A ground-truth operational store the product reads but does not treat as its intelligence layer (suppliers/surveys, workers, cases/payslips, training).
_Avoid_: Upstream DB (as a synonym in product talk), raw DB

**Derived database**:
The rebuildable store of computed intelligence (risk, clusters, forecasts, anomalies, remediations, briefings, job history).
_Avoid_: AI database (as the only name), warehouse (unless meaning analytics platform)

**Demo as-of**:
The fixed present moment a frozen demonstration dataset treats as “now” for relative windows and freshness language.
_Avoid_: Fake today, mocked clock (in product language)

### Demo surface

**Intelligence-first demo**:
A demonstration that only guarantees product areas backed by the derived database, and does not require live source databases.
_Avoid_: Full-stack demo, production-parity demo
