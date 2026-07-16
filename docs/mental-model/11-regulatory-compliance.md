# Regulatory Compliance — The Evidence Chain

## Why This Exists

Regulations don't just say "find problems." They say **"prove you found problems, prove you fixed them, and show the evidence."** The compliance system turns SupplyChain+'s intelligence into audit-ready documentation.

## The Four Frameworks

| Framework | Jurisdiction | Effective | Key Requirements |
|-----------|-------------|-----------|-----------------|
| **EU CSDDD** | EU | July 2027 | Due diligence policy, risk assessment, prevention, remediation, monitoring, stakeholder engagement, annual reporting |
| **UFLPA** | USA | Active now | Supply chain mapping, forced labor risk assessment, import compliance documentation |
| **UK MSA** | UK | March 2026 | Annual statement, supply chain due diligence, risk assessment, remedial action, training, KPIs |
| **German LkSG** | Germany | June 2026 | Risk analysis, prevention, remediation, complaint mechanism, documentation, BAFA reporting |

Each framework is stored in `regulatoryFrameworks` with metadata: jurisdiction, effective date, next deadline, and a risk weight profile (JSONB that could be used to adjust scoring per framework).

## The Chain: Framework → Requirement → Evidence Type → Actual Evidence

This is the core mental model for how compliance works:

```
EU CSDDD Framework
  │
  ├── Requirement: "Due Diligence Policy"
  │     └── Evidence types: [risk_score_drop, manual_note]
  │
  ├── Requirement: "Risk Assessment"
  │     └── Evidence types: [risk_score_drop, survey_improvement]
  │
  ├── Requirement: "Prevention Measures"
  │     └── Evidence types: [training_completed, engagement_improvement]
  │
  ├── Requirement: "Remediation"
  │     └── Evidence types: [case_resolved, anomaly_resolved, case_volume_decrease]
  │
  └── Requirement: "Monitoring"
        └── Evidence types: [satisfaction_improvement, engagement_improvement]
```

Each **requirement** specifies which **evidence types** satisfy it. These are stored as JSONB arrays in `frameworkRequirements.evidenceTypes`.

**`requirementEvidence`** is the linking table: it connects a specific piece of `remediationEvidence` to a specific `frameworkRequirement` for a specific `supplier`. When evidence is auto-attached to a remediation (see [10-remediation-and-evidence.md](10-remediation-and-evidence.md)), the compliance layer can link that evidence to the requirements it satisfies.

## Supplier Compliance Status

`supplierFrameworkCompliance` tracks each supplier's status per framework:

```
status: "not_assessed" | "in_progress" | "compliant" | "non_compliant"
completedRequirements: 5
totalRequirements: 8
lastAssessedAt: "2026-03-15"
```

The compliance percentage = `completedRequirements / totalRequirements`. The UI renders this as a progress bar per supplier per framework.

## The Compliance Matrix

The governance page shows a **supplier × framework** heatmap:

```
              EU CSDDD    UK MSA    German LkSG    UFLPA
Factory A     ██████░░    ████████  ██████░░░░     ████████
Factory B     ████░░░░    ██████░░  ████████████   ██░░░░░░
Factory C     ░░░░░░░░    ████░░░░  ██████░░░░     ████████
```

Green = compliant, yellow = in progress, red = non-compliant, gray = not assessed. This gives compliance officers a single-screen view of where gaps exist.

## HRDD Report Generation

When you need to present evidence to a regulator, the AI generates an **HRDD (Human Rights Due Diligence) narrative** via `/api/ai/reports`:

Input: supplier data, risk scores, evidence items, framework requirements.

Output: A multi-paragraph narrative structured as:
1. **Supplier overview & risk posture** — who they are, where they operate, current risk level
2. **Specific findings by module** — cases, surveys, training, with evidence citations
3. **Regulatory alignment & next steps** — how the evidence maps to framework requirements, what gaps remain

This uses the `strongModel` (e.g., GPT-4o) because regulatory narratives need to be precise, well-structured, and defensible. A small model might produce vague or inaccurate language.

## The Full Evidence Flow

Tracing one scenario end-to-end:

```
1. case-clustering detects overtime cluster affecting Factory X      [DETECT]
2. Compliance officer creates remediation plan (sourceType: cluster)  [ACT]
3. Root cause analysis: excessive production quotas from Brand Y
4. Action plan: renegotiate quotas, deploy overtime monitoring
5. Factory X implements new shift schedule                            [ACT]
6. calculate-risk: Factory X risk drops 78 → 61 → auto-evidence      [EVIDENCE]
7. remediation-evidence-sweep: 8 cases resolved → auto-evidence       [EVIDENCE]
8. analyze-surveys: "overtime" theme declining → auto-evidence         [EVIDENCE]
9. Compliance officer advances plan to "verifying"
10. Evidence links to EU CSDDD "Remediation" requirement
11. HRDD report generated citing all three evidence items              [EVIDENCE]
12. Plan closed with complete audit trail
```

Steps 6-8 happen **automatically**. The system noticed improvements and linked them to the plan without human intervention. The compliance officer's job is to verify the plan, not to manually hunt for evidence.

## Deadline Tracking

Each framework has `nextDeadline`. The UI surfaces:
- Frameworks with deadlines in the next 90 days
- Suppliers with `non_compliant` or `not_assessed` status for upcoming frameworks
- Overdue remediations (past `targetDate` and not closed)

This creates urgency: "EU CSDDD is effective in 16 months and 45 of your suppliers haven't been assessed."
