# WOVO AI Features Roadmap

> **Purpose**: User-journey focused roadmap connecting AI capabilities to UI/UX implementation.
>
> **Last Updated**: January 2026

---

## Implementation Status Overview

```mermaid
graph LR
    subgraph Implemented["✅ Implemented"]
        Risk["Explainable Risk Scoring"]
        CaseSum["Case Summarization"]
        Guidance["AI Case Guidance"]
        Timeline["Problem→Action→Outcome"]
        CrossMod["Cross-Module Panel"]
        Assistant["AI Assistant"]
    end

    subgraph InProgress["🔄 In Progress"]
        Survey["Survey Designer"]
        Lesson["Lesson Authoring"]
        ViewToggle["Brand/Supplier Views"]
    end

    subgraph Planned["📋 Planned"]
        HRDD["HRDD Reports"]
        Alerts["Proactive Alerts"]
        Trends["Trend Detection"]
    end
```

---

## User Journey 1: "Which suppliers need attention?"

**User Goal**: Quickly identify high-risk suppliers and understand why.

### Features

| Feature              | Status     | Location                        | What it Does                                                          |
| -------------------- | ---------- | ------------------------------- | --------------------------------------------------------------------- |
| Supplier Risk Score  | ✅ Done    | `/suppliers`, `/suppliers/[id]` | Composite score (0-100) from cases, surveys, training, engagement     |
| Explainable Risk     | ✅ Done    | `/suppliers/[id]`               | "Why HIGH Risk?" card showing component scores + contributing factors |
| Risk Trend Indicator | ⏳ Planned | Dashboard                       | Show improving/worsening trend over time                              |
| Proactive Alerts     | ⏳ Planned | Dashboard, Notifications        | "Supplier X crossed risk threshold"                                   |

### Screenshot Reference

![Supplier Detail](file:///C:/Users/vishal/.gemini/antigravity/brain/45b2f153-dade-4b12-8131-80134349e869/supplier_detail_page_top_1768204749754.png)

---

## User Journey 2: "How do I handle this case?"

**User Goal**: Resolve worker grievances efficiently with AI guidance.

### Features

| Feature            | Status  | Location                    | What it Does                          |
| ------------------ | ------- | --------------------------- | ------------------------------------- |
| Case Summarization | ✅ Done | `/connect`, `/connect/[id]` | 1-2 sentence summary of complaint     |
| Severity Auto-Tag  | ✅ Done | `/connect`                  | AI suggests high/medium/low           |
| AI Guidance Panel  | ✅ Done | `/connect/[id]`             | Recommended steps for investigation   |
| Draft Response     | ✅ Done | `/connect/[id]`             | Suggested reply to worker             |
| Related Training   | ✅ Done | `/connect/[id]`             | Courses to deploy for this issue type |
| Status Workflow    | ✅ Done | `/connect/[id]`             | Visual progress from New → Verified   |

### Screenshot Reference

![Case Detail](file:///C:/Users/vishal/.gemini/antigravity/brain/45b2f153-dade-4b12-8131-80134349e869/case_detail_page_ai_guidance_1768205141315.png)

---

## User Journey 3: "I need to create a survey"

**User Goal**: Design worker surveys quickly with AI assistance.

### Features

| Feature            | Status     | Location              | What it Does                              |
| ------------------ | ---------- | --------------------- | ----------------------------------------- |
| AI Survey Designer | ✅ Done    | `/engage`             | Text prompt → generated questions         |
| Question Preview   | ✅ Done    | `/engage`             | See questions before deploying            |
| Language Selection | ✅ Done    | `/engage`             | Choose English, Vietnamese, Bengali, etc. |
| Theme Extraction   | ✅ Done    | `/engage` survey list | Auto-extract themes from responses        |
| Text Analysis      | ⏳ Planned | Survey Detail         | Sentiment analysis of free-text responses |

---

## User Journey 4: "I need training content"

**User Goal**: Create compliance training from policy documents.

### Features

| Feature              | Status     | Location      | What it Does                                        |
| -------------------- | ---------- | ------------- | --------------------------------------------------- |
| PDF Upload           | ✅ Done    | `/educate`    | Drag-drop policy documents                          |
| Processing Pipeline  | ✅ Done    | `/educate`    | Visual: Uploading → Extracting → Generating → Ready |
| Recommended Training | ✅ Done    | `/educate`    | AI suggests courses based on supplier cases         |
| Lesson Generation    | 🔄 Mock    | `/educate`    | Draft lessons from policies                         |
| Quiz Generation      | ⏳ Planned | Course Detail | Auto-generate knowledge checks                      |
| Multi-language       | ⏳ Planned | Course Detail | Auto-translate to worker languages                  |

---

## User Journey 5: "I need an HRDD report"

**User Goal**: Generate regulatory compliance narratives for due diligence.

### Features

| Feature              | Status     | Location        | What it Does                            |
| -------------------- | ---------- | --------------- | --------------------------------------- |
| Narrative Generation | 🔄 Mock    | `/ai`           | Generate HRDD paragraphs from data      |
| Supplier Summary     | ⏳ Planned | Supplier Detail | Exportable due diligence summary        |
| Evidence Links       | ⏳ Planned | HRDD Export     | Link to source cases, surveys, training |
| Regulatory Templates | ⏳ Planned | Export          | EU CSDDD, UK Modern Slavery Act formats |

---

## User Journey 6: "What's happening across my supply chain?"

**User Goal**: Cross-module intelligence and conversational exploration.

### Features

| Feature                | Status  | Location          | What it Does                            |
| ---------------------- | ------- | ----------------- | --------------------------------------- |
| Cross-Module Panel     | ✅ Done | `/suppliers/[id]` | Cases + Surveys + Training in tabs      |
| Problem→Action→Outcome | ✅ Done | `/suppliers/[id]` | Timeline showing linked events          |
| AI Activity Stream     | ✅ Done | `/` Dashboard     | Recent AI actions across modules        |
| AI Assistant           | ✅ Done | `/ai`             | Conversational queries about suppliers  |
| Brand vs Supplier View | ✅ Done | Header            | Toggle portfolio vs single-factory view |

### Screenshot Reference

![AI Assistant](file:///C:/Users/vishal/.gemini/antigravity/brain/45b2f153-dade-4b12-8131-80134349e869/ai_assistant_query_response_1768205184175.png)

---

## Data Sources Reference

| Module  | Database   | Key Tables                             | Records           |
| ------- | ---------- | -------------------------------------- | ----------------- |
| Connect | SQL Server | Message, CaseNote, CaseTypeCultureText | 8,185 messages    |
| Engage  | PostgreSQL | survey_mdlsurveyquestionresponses      | 9,291 responses   |
| Educate | MySQL      | mdl_course, mdl_course_completions     | 3,172 completions |

### Cross-Database Mapping

- **Company ID** (SQL Server) ↔ **ClientId** (PostgreSQL) ↔ **mdl_company.id** (MySQL)
- Mapping verified ✅ — enables cross-module analytics

---

## Next Priorities

1. **Wire up real LLM calls** — Replace mock AI responses with actual API calls
2. **HRDD Export** — PDF/Word export with regulatory templates
3. **Trend Detection** — Time-series analysis for risk changes
4. **Proactive Alerts** — Notifications when thresholds crossed
