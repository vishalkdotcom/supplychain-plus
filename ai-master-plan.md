# 🚀 WOVO AI Master Implementation Plan

## Phase 1: Realizing the Core (Replacing Mocks & Quick Wins)
*Objective: Eradicate mocked data, deliver immediate value using existing workflows, and polish the user experience.*

| Feature | Status/Source | Implementation Details | UI/UX Strategy (shadcn/ui) |
| :--- | :--- | :--- | :--- |
| **Real Education Pipeline** | ✅ Completed | Replace `simulatePipeline` in `/educate` with a real `api/ai/educate` route. Use the Vercel AI SDK to extract PDF text, generate structured course outlines, and auto-generate knowledge check quizzes. | Use `Progress` and animated `Badge` components for real-time extraction status. Add a drag-and-drop zone using `Card`. |
| **AI-Narrated Scorecards & HRDD** | ✅ Completed | Connect the existing `jsPDF` export to an LLM prompt that writes a 3-paragraph executive summary per supplier. Add templates for EU CSDDD and UK Modern Slavery Act. | Add a "Preview Report" `Sheet` or `Dialog` before export. Render markdown summaries dynamically before burning to PDF. |
| **Smart FAQ Auto-Resolution** | ✅ Completed | Embed the existing 298 FAQs. In the `/connect` case guidance panel, automatically suggest the top matching FAQ resolution with a confidence score. | Render suggestions as `Collapsible` cards. Include a "1-Click Apply" `Button` to insert the FAQ response into the draft reply. |
| **Multi-Language Hub** | ✅ Completed | Upgrade the "Draft Response" feature in `/connect/[id]`. Allow users to select a target language (Bengali, Vietnamese, etc.) and tone (Formal, Empathetic). | Add a `Select` dropdown for language and a `ToggleGroup` for tone next to the drafting `Textarea`. |

---

## Phase 2: Actionable Intelligence (Dashboards & Workflows)
*Objective: Surface existing data visually so users can proactively manage supply chain health.*

| Feature | Status/Source | Implementation Details | UI/UX Strategy (shadcn/ui) |
| :--- | :--- | :--- | :--- |
| **Risk Trend Visualization** | ✅ Completed | Query the existing `supplier_risk_history` table. Show improving or worsening trends over 30/60/90 days on both the Dashboard and Supplier Detail pages. | Integrate `Recharts` (Line/Area charts) within `Card` components. Use green/red text for % changes with `ArrowUpRight` icons. |
| **Proactive Alerts Center** | ✅ Completed | The background job already generates alerts. Surface these in a global notification center and a dedicated dashboard widget. | Build a `Popover` notification bell in the `AppHeader`. Use `ScrollArea` to list unread alerts with distinct severity colors. |
| **Engagement Health Score** | ✅ Completed | Radar Chart on Supplier Detail page converting risk breakdown to health scores (100 - risk). Combines case, survey, training, and engagement dimensions. | Radar Chart (`Recharts`) on `/suppliers/[id]` visualizing "genuine engagement vs. checkbox compliance." |
| **Brand vs. Supplier Views** | ✅ Completed | Finalize the toggle mechanism in the header to switch context between a portfolio-wide view and a single-factory view. | Use a specialized `Command` palette or `Combobox` in the navigation to easily swap contexts. |

---

## Phase 3: Advanced Visualizations (Differentiators)
*Objective: Build high-impact, boardroom-ready visualizations that serve as massive competitive advantages.*

| Feature | Status/Source | Implementation Details | UI/UX Strategy (shadcn/ui) |
| :--- | :--- | :--- | :--- |
| **Geographic Risk Heatmap** | 🔄 Needs Fix | UI built with React Simple Maps + interactive tooltips. **Issue**: Uses hardcoded country coordinates instead of real `CompanyPost.Latitude/Longitude`. Fix: cache real lat/lng in `supplier_risk_scores` during risk calculation. | Integrate a map library (e.g., Mapbox GL JS or React Simple Maps) inside a large Dashboard `Card` with interactive tooltips. |
| **Supply Chain Network Graph** | 🔄 Needs Fix | UI built with React Flow. **Issue**: Uses simulated region hubs instead of real `CompanyHierarchy`/`ParentCompanyId`. Fix: cache `parent_company_id` in `supplier_risk_scores` and build real corporate tree. | Use `React Flow` to build an interactive, force-directed node graph. Nodes will use shadcn `Avatar` and `Badge` styling. |
| **Case Resolution Playbook** | ⏳ Not Started | Analyze the 2,944 resolved cases + 81 case notes to extract the fastest resolution paths for specific regions/case types. | Surface insights in the `/connect` view as a "Historical Context" `Accordion`, showing average resolution times and best practices. |

---

## Phase 4: Heavy Compute & Batch Operations (Costly/Long Tasks)
*Objective: Process massive datasets via asynchronous jobs. Isolated here to strictly control token costs, API limits, and prevent UI blocking.*

| Feature | Status/Source | Implementation Details | Architecture Note |
| :--- | :--- | :--- | :--- |
| **Worker Voice Analytics** | ⏳ Planned | Batch NLP on 22,675 survey responses. Extract deep topics, emerging themes, and sentiment shifts month-over-month. | **Local Ollama** (`qwen3.5:4b`, think:false). Run weekly. Store in `worker_voice_trends` table. |
| **Automatic Case Clustering** | ⏳ Planned | Group 8,277 messages via embedding and cosine similarity. Detect systemic, cross-factory patterns (e.g., regional wage withholding). | **Local Ollama** (`bge-m3` for embeddings + `qwen3.5:4b` for labeling). pgvector for similarity search. Store in `case_embeddings` + `case_clusters` tables. |
| **Predictive Risk Forecasting** | ⏳ Planned | Time-series AI analysis calculating rate-of-change across cases, surveys, and training to predict if a supplier will become high-risk in 60 days. | **Local Ollama** (`qwen3.5:4b`, think:false). Process historical snapshots in batches. Write to `supplier_risk_forecast` table. |
| **Payslip Anomaly Detection** | ⏳ Planned | Statistical analysis + AI interpretation of 1,900+ payslip records against country-specific minimum wage thresholds to flag wage theft. | **Local Ollama** (`gemma3:1b`). Cross-database join + static minimum wage data. Store in `payslip_anomalies` table. |

---

### 🎨 Universal UI/UX Guidelines for this Plan
1. **Skeletons over Spinners**: Every async AI call must use `Skeleton` components mirroring the final UI structure to prevent layout shift.
2. **Streaming Responses**: Wherever text is generated (Chat, Summaries, Drafts), we will utilize the `ai-sdk` `streamText` capabilities so the UI feels instantly responsive.
3. **Graceful Failures**: If an AI request fails (timeout or rate limit), the UI must fail gracefully using `Alert` or `sonner` toasts, allowing the user to retry without losing context.
4. **Explainability First**: Every AI-generated score or insight must include a tooltip (`TooltipProvider`) or a "Why?" button explaining the underlying data that drove the decision.