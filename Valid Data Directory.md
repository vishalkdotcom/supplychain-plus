# Valid Data Directory

This directory lists high-quality, authentic data discovered across SQL Server and PostgreSQL databases for use in demonstrations and AI operations. **Note**: The `wovo_ai` database is considered stale and is strictly NOT referenced here.

## 🏆 Top Demo Clients (High Volume & Authentic)

| Client Name | SQL ID (client_key) | PostgreSQL ID | Key Data Points | Quality Notes |
|---|---|---|---|---|
| **Wovo Demo-Child2** | 137089 | 308 | 73+ Quality Messages | Massive volume. Contains specific multi-turn cases like CaseId `1137451` (10 messages) and `1523084` (8 messages). |
| **WOVO Demo - Child** | 136747 | - | 58+ Quality Messages | Authentic "Worker Voice". Queries about masks, Diwali bonuses, and weather alerts. Includes CaseId `415` (6 messages). |
| **Labor line** | 137308 | 429 | 22+ Quality Messages | Dense case notes and interaction history. |
| **Dunzo Patna** | 137284 | 406 | 18+ Surveys, 100+ Messages | Authentic queries about payslips and salary. |
| **Wovo Demo-Child1** | 137088 | 258 | 2.5M Survey Responses | Best for large-scale categorical analysis (very high volume survey `01832384-68cd-4882-90e7-0a25cc329c77`). |
| **Din Sen Dept Co.** | 136806 | - | Long-form news text | 2000+ char article on Ambani wedding. Great for AI summaries. |

## 💬 High-Quality Message & Case Encodings (SQL Server)

These cases represent real or highly detailed UAT worker queries and can be used for NLP training or Case Clustering demos. Focus on these specific IDs for API targets.

| Entity | ID / Description | Database |
|---|---|---|
| **Case Conversation** | CaseId `1137451` (10 messages) | SQL Server |
| **Case Conversation** | CaseId `1523084` (8 messages) | SQL Server |
| **Case Conversation** | CaseId `415` (6 messages) | SQL Server |
| **Authentic Message** | "I want to resign my job because of my body condition... My id no:69715" (Wovo Demo-Child2) | SQL Server |
| **Authentic Message** | "Hello, we want to suggest the factory provide the workers some masks to work." (WOVO Demo - Child) | SQL Server |
| **Authentic Message** | "diwali bonus?" (WOVO Demo - Child) | SQL Server |
| **Authentic Message** | "holiday because of orange alert?" (WOVO Demo - Child) | SQL Server |

## 📊 High-Quality Surveys (PostgreSQL)

Surveys containing valid, non-empty text responses for sentiment analysis. Use these UUIDs when testing the survey ingestion pipeline.

| Survey ID (UUID) | Survey Name | Valid Responses |
|---|---|---|
| `fe2a74e0-d248-4048-bf47-321044f3cf6f` | Questionnaire - Special Chars !@#$%^&*():"?><{}0 - Global Survey | 8 valid text responses ("NaCool", "Kalyani", etc.) |
| `354b209b-9e8c-47cf-814a-3a4a35b193b0` | Questionnaire for global survey with 3 categories - Global survey | 7 valid text responses ("Green worker", "Red worker") |

## 🛠️ Heuristics for "Valid Data"
- **Text Density**: Messages/Notes > 50 characters, excluding purely repetitive test strings.
- **Conversational Depth**: Cases with > 3 messages or notes, indicating a back-and-forth interaction.
- **Survey Variance**: Surveys with non-empty `text_response` entries in PostgreSQL.
- **Strict Exclusion**: `wovo_ai` is completely ignored due to stale data.
