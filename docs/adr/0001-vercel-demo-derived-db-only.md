# Vercel demo uses derived DB only

For interview/portfolio hosting we deploy a **Demo Mode** profile: one Neon Postgres holding a frozen **derived database** snapshot, a pinned **demo as-of** clock, in-app demo login, hard read-only mutations, jobs off (Jobs UI may show snapshot history), and live chat via Groq/Cerebras with read-only tools against that store. We deliberately do not host SQL Server, MySQL, or source Postgres — the demo is **intelligence-first**, not production-parity multi-DB.

## Considered Options

- Full multi-DB on paid hosts — rejected: cost and ops for a demo
- Zero-DB fixtures only — rejected: too much drift from real API/Drizzle paths
- Soft sandbox writes / running jobs on Vercel — rejected: interview flake and complexity; clustering needs local embedding stack anyway

## Consequences

Source-backed nav (Case Inbox, Surveys, Educate, and similar drill-downs) stays hidden or disabled in Demo Mode; relative “last N days” semantics follow demo as-of, not wall clock.
