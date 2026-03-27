# What Else Can We Build With Existing Data?

> **Approach**: Every idea below is grounded in **real tables and data** I verified across your 3 databases. No hypotheticals.

## Data Inventory (What We're Working With)

| Database | Key Tables | Records |
|---|---|---|
| **SQL Server** | Cases, Messages, CaseNotes, CaseTypes | 2,944 cases · 8,277 messages · 81 notes |
| | Company, CompanyHierarchy, CompanyPost | 484+ companies · 126 hierarchies · 4,272 posts |
| | Payslip, PayslipDocument, PaySlipResponse | 1,174 payslips |
| | User, FAQ, Questionnaire, AuditLog | 3,852 users · 298 FAQs |
| **PostgreSQL** | survey_mdlsurvey*, survey responses | 4,122 surveys · 13,027 questions · 22,675 responses |
| | clients_clientinfo, payslip, payslip_employee | 484 clients · 783 payslips |
| **MySQL** | mdl_course, mdl_course_completions | 3,172 completions |

---

## The Ideas

### 1. 🔮 Predictive Risk Forecasting
**"This supplier will become high-risk within 60 days"**

Instead of showing *current* risk, predict *future* risk using time-series patterns across cases, survey sentiment, and training completion trends.

| | |
|---|---|
| **Data** | `Case.Created` time-series + `survey_mdlsurveyquestionresponses` trends + `mdl_course_completions` velocity |
| **How** | AI analyzes rate-of-change across modules. Rising case frequency + declining survey sentiment + stalled training = predicted escalation |
| **End-User Value** | Brand compliance managers can intervene *before* a supplier becomes a headline |
| **Impact** | ⭐⭐⭐⭐⭐ | **Effort** | ⭐⭐⭐ |

---

### 2. 🔗 Automatic Case Clustering & Pattern Detection
**"We found 14 cases about wage withholding across 3 factories in Vietnam — this may be systemic"**

Group cases by semantic similarity across suppliers to detect industry-wide or regional patterns that no single supplier view would reveal.

| | |
|---|---|
| **Data** | `Message.MessageText` (8,277 messages), `CaseType`, `Company.MailingCountry` |
| **How** | Embed message text with AI, cluster similar cases via cosine similarity, surface patterns that cross supplier boundaries |
| **End-User Value** | Shifts from reactive case-by-case management to **systemic issue detection** — exactly what HRDD regulations require |
| **Impact** | ⭐⭐⭐⭐⭐ | **Effort** | ⭐⭐⭐ |

---

### 3. 📊 AI-Narrated Supplier Scorecards (Auto-Generated PDF)
**"Here's your monthly supplier scorecard — written in natural language, not just charts"**

Generate a one-page PDF per supplier combining risk score, case trends, survey sentiment, training progress, and an AI-written executive narrative — ready to email to clients.

| | |
|---|---|
| **Data** | Cross-database join: `Company` + [Case](file:///c:/vishal/xp/wovo/types/index.ts#73-94) + `survey_mdlsurvey` + `mdl_course_completions` + `supplier_risk_scores` |
| **How** | Aggregate metrics, pass to AI with a "write a 3-paragraph executive briefing" prompt, render with jsPDF (already installed!) |
| **End-User Value** | Clients get **polished deliverables** without analysts spending hours writing. This is the "report generator that exceeded years of work" from Elena's email |
| **Impact** | ⭐⭐⭐⭐⭐ | **Effort** | ⭐⭐ |

> [!TIP]
> This is the single highest-ROI idea. You already have `jspdf` + `jspdf-autotable` in [package.json](file:///c:/vishal/xp/wovo/package.json) and [lib/hrdd-export.ts](file:///c:/vishal/xp/wovo/lib/hrdd-export.ts) scaffolded. It's close to "just wire it up."

---

### 4. 💬 Worker Voice Analytics (NLP on Open-Ended Survey Responses)
**"Workers are increasingly mentioning 'unpaid overtime' — this wasn't a theme 3 months ago"**

Run NLP/AI analysis on the 22,675 survey responses to detect emerging topics, sentiment shifts over time, and language-specific patterns.

| | |
|---|---|
| **Data** | `survey_mdlsurveyquestionresponses` (22,675 responses) + `survey_mdlsurveyquestions` (13,027 questions) + `translations_mdlsupportedlanguages` |
| **How** | Batch-process responses through AI for topic extraction + sentiment scoring, compare month-over-month |
| **End-User Value** | Surface the **"weak signals"** — complaints that haven't become formal cases yet, but are brewing in surveys |
| **Impact** | ⭐⭐⭐⭐⭐ | **Effort** | ⭐⭐⭐ |

---

### 5. 🗺️ Geographic Risk Heatmap
**"Southeast Asia is showing a 40% increase in overtime complaints this quarter"**

Visualize risk, cases, and survey sentiment on an interactive map using the geo-data that already exists in `CompanyPost` (Latitude, Longitude) and `Company.MailingCountry`.

| | |
|---|---|
| **Data** | `CompanyPost.Latitude/Longitude` (4,272 posts with geo), `Company.MailingCountry`, cross-referenced with case/survey data |
| **How** | Plot suppliers on a map colored by risk level, overlaid with case density heatmaps. Clickable regions drill down to suppliers |
| **End-User Value** | Executives see **global supply chain health at a glance** — powerful for boardroom presentations and HRDD reporting |
| **Impact** | ⭐⭐⭐⭐ | **Effort** | ⭐⭐⭐ |

---

### 6. 🏗️ Supply Chain Network Graph
**"This parent company controls 8 suppliers — and 6 of them have rising case volumes"**

Use `CompanyHierarchy` (126 relationships) to visualize parent-child corporate structures and aggregate risk up the hierarchy.

| | |
|---|---|
| **Data** | `CompanyHierarchy` + `Company.ParentCompanyId` + aggregated risk scores per supplier |
| **How** | Build a force-directed graph (D3.js or React Flow) showing corporate ownership chains, color-coded by risk |
| **End-User Value** | Brands doing due diligence need to understand **group-level risk**, not just individual factories. EU CSDDD specifically requires this |
| **Impact** | ⭐⭐⭐⭐ | **Effort** | ⭐⭐⭐ |

---

### 7. 💰 Payslip Anomaly Detection
**"Factory X's payslips show wages 30% below regional average — flagging for review"**

Analyze the 1,174 + 783 payslip records across both databases to detect anomalies: below-minimum-wage payments, sudden drops, inconsistencies between declared and actual pay.

| | |
|---|---|
| **Data** | SQL Server `Payslip` (1,174) + PostgreSQL `payslip` (783) + `payslip_employee` + `Company.MailingCountry` |
| **How** | Statistical analysis + AI interpretation of payslip patterns, cross-referenced with country-specific minimum wage data |
| **End-User Value** | **Wage theft is the #1 worker complaint globally** — automated detection is exactly what HRDD auditors need |
| **Impact** | ⭐⭐⭐⭐⭐ | **Effort** | ⭐⭐⭐⭐ |

---

### 8. 🤖 Smart FAQ / Auto-Resolution Engine
**"This case matches FAQ #47 — auto-suggesting resolution with 92% confidence"**

Use the 298 existing FAQs to automatically match incoming cases to known resolutions, potentially auto-responding to common queries.

| | |
|---|---|
| **Data** | `FAQ` (298 entries) + `FAQCultureText` (multi-language) + `Message.FAQId` (already linked!) + `MessageCategory` |
| **How** | Embed FAQs, match incoming messages via semantic similarity, suggest resolutions ranked by confidence |
| **End-User Value** | Reduces case manager workload for repetitive issues. The `Message.FAQId` foreign key shows this linkage was **already intended** but never fully surfaced |
| **Impact** | ⭐⭐⭐⭐ | **Effort** | ⭐⭐ |

---

### 9. 📈 Engagement Health Score (Beyond Surveys)
**"Factory X has high survey participation but zero training completions and 3 unresolved cases — engagement is superficial"**

Create a holistic "engagement health" metric that goes beyond survey response rates by combining post interactions, survey participation, training completion, case resolution speed, and payslip access patterns.

| | |
|---|---|
| **Data** | `CompanyPost` engagement + `survey_mdlsurveyuserresponses` (participation) + `mdl_course_completions` + [Case](file:///c:/vishal/xp/wovo/types/index.ts#73-94) resolution times |
| **How** | Weighted composite score across all touchpoints — AI explains what's driving the score up or down |
| **End-User Value** | Tells a richer story than any single module. Brands can tell the difference between **genuine engagement** and checkbox compliance |
| **Impact** | ⭐⭐⭐⭐ | **Effort** | ⭐⭐⭐ |

---

### 10. 📝 AI Compliance Brief Generator
**"Generate a 2-page EU CSDDD compliance brief for Supplier X using all available data"**

Go beyond HRDD reports — generate regulation-specific compliance documents that pull evidence from all modules and format it for specific regulatory frameworks.

| | |
|---|---|
| **Data** | Everything: cases (evidence of grievance mechanisms), surveys (evidence of worker voice), training (evidence of due diligence efforts), payslips (evidence of fair wages) |
| **How** | Template-driven AI generation — one template per regulation (EU CSDDD, UK Modern Slavery Act, German Supply Chain Act), auto-populated with real data |
| **End-User Value** | This alone could justify the platform cost for many clients. Manual compliance brief writing costs **$5K–$20K per supplier per year** |
| **Impact** | ⭐⭐⭐⭐⭐ | **Effort** | ⭐⭐⭐⭐ |

---

### 11. 🔄 Case Resolution Playbook (AI-Learned from History)
**"Cases of type 'Harassment' at factories in Vietnam take an average of 23 days to resolve. Top-performing factories do it in 8 days. Here's what they do differently."**

Mine the 2,944 resolved cases + 81 case notes to build resolution playbooks — using real historical outcomes, not generic templates.

| | |
|---|---|
| **Data** | [Case](file:///c:/vishal/xp/wovo/types/index.ts#73-94) (Created, ResolvedDate, CaseTypeId, CompanyId) + `CaseNote` (resolution notes) + `CaseType` |
| **How** | Analyze resolution times by type/region/factory, identify fastest resolvers, have AI extract patterns from their case notes |
| **End-User Value** | Turns historical data into **institutional knowledge**. New case managers don't start from zero — they start from what worked |
| **Impact** | ⭐⭐⭐⭐⭐ | **Effort** | ⭐⭐⭐ |

---

### 12. 🌐 Multi-Language Communication Hub
**"Draft this response to a worker in Bengali, matching the tone and formality of previous successful responses"**

Use the existing multi-language infrastructure (`CultureCode`, `translations_mdlsupportedlanguages`, survey translations) + the 8,277 messages to build an AI translation + tone-matching communication layer.

| | |
|---|---|
| **Data** | `Message` corpus (8,277) + `CultureCode` + survey translations + `translations_mdltranslations` |
| **How** | AI drafts responses in worker's preferred language, calibrated by analyzing tone patterns from successful past communications |
| **End-User Value** | Most case managers don't speak Vietnamese, Bengali, or Khmer. AI-mediated communication that sounds human and culturally appropriate is game-changing |
| **Impact** | ⭐⭐⭐⭐ | **Effort** | ⭐⭐⭐ |

---

## Priority Matrix

| Quick Wins (High Impact, Low Effort) | Strategic Bets (High Impact, Higher Effort) |
|---|---|
| 🏆 **#3** AI Supplier Scorecards (jsPDF ready!) | 🎯 **#1** Predictive Risk Forecasting |
| 🏆 **#8** Smart FAQ Auto-Resolution | 🎯 **#2** Case Clustering & Pattern Detection |
| | 🎯 **#4** Worker Voice Analytics |
| | 🎯 **#7** Payslip Anomaly Detection |
| | 🎯 **#10** Compliance Brief Generator |

| Nice Additions | Differentiators |
|---|---|
| **#9** Engagement Health Score | **#5** Geographic Risk Heatmap |
| **#12** Multi-Language Hub | **#6** Supply Chain Network Graph |
| | **#11** Case Resolution Playbook |

---

## The Unifying Theme

> [!IMPORTANT]
> Every single idea follows the same pattern that makes WOVO+ powerful: **take data that exists in siloed tables → connect it across modules with AI → surface insights that no manual process could produce at scale.**
>
> This is the competitive moat. Clients have their data. They don't have the **cross-database intelligence layer** to make it speak.
