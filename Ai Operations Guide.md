# AI Operations Guide: Finding Valid Data

This guide outlines the "intelligent" techniques and heuristics used to identify high-quality, valid data in our multi-database environment (SQL Server, PostgreSQL, MySQL).

## 🔍 Core Heuristics for Quality

### 1. The "Authenticity" Filter (Text Density)
- **Heuristic**: Seek records where text length > 50 characters and lacks "demo signatures" (e.g., "test", "abc", "asdf").
- **Keywords**: Search for "resignation", "mask", "bonus", "holiday", "safety", "health". 
  - *Example*: Company 136747 has high-quality "Worker Voice" queries.
- **Interaction Depth**: Look for cases that have both worker messages and manager replies (e.g., Company 137089).
- **Query Logic**: `WHERE LEN(MessageText) > 50 AND MessageText NOT LIKE '%test%'`.
- **Target Tables**: `Message`, `CaseNote`, `survey_mdlsurveyquestionresponses.text_response`.

### 2. High-Saturation Clients
- **Heuristic**: Focus on clients with a balanced distribution of Workers, Surveys, and Cases. A client with 1M survey responses but 0 cases is likely a load test.
- **Top Candidates**:  
  - `Wovo Demo-Child2` (SQL ID: 137089)
  - `Dunzo Patna` (SQL ID: 137284)

### 3. Survey Text Variance
- **Heuristic**: Seek surveys where `text_response` is not only populated but varies among participants, avoiding surveys that are strictly numerical or have empty text fields.
- **Gold Tables in Postgres**: `survey_mdlsurveyquestionresponses`

### 4. Historical Depth
- **Heuristic**: Check for data created between 2018-2020. This data often represents the "original" setup of the demo environment and contains more structured examples than recent "one-off" test records.

## 🛠️ DB-Specific Techniques

### SQL Server (The Source of Truth for Cases/Messages)
- Use `CompanyHierarchy` to find complex multi-tiered organizations.
- Link `Message` to `FAQ` using `FAQId` to find instances of "known issue" resolutions.

### PostgreSQL (The Survey Engine)
- Link `clients_clientinfo.client_key` to SQL Server `Company.Id`.
- Look for surveys with `is_completed = 2` (Fully completed) in `survey_mdlsurveyuserresponses`.

### MySQL (The Education Module)
- Focus on `mdl_course_completions` to find suppliers with high engagement in worker training.

## 🚀 Quick-Start Command
To find a valid survey dataset for a given client:
```sql
-- PostgreSQL
SELECT s.id, s.name, COUNT(r.id) as volumes
FROM survey_mdlsurvey s
JOIN survey_mdlsurveyuserresponses r ON s.id = r.survey_id_id
WHERE s.client_id = (SELECT id FROM clients_clientinfo WHERE client_key = <CLIENT_ID>)
GROUP BY s.id, s.name
ORDER BY volumes DESC;
```
