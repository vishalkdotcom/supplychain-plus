# AI Page Redesign — Smart Chat with Inline Intelligence

**Date:** 2026-03-17
**Status:** Approved
**Scope:** `/ai` page — complete redesign of layout, interaction model, and output rendering

## Problem Statement

The current AI page (`/ai`) is a plain chat interface that undersells WOVO's rich AI/ML capabilities. Key issues:

1. **Empty landing state** — Users see 5 static suggested queries with no context about current data state
2. **Text-only output** — AI returns structured data (risk scores, case lists, sentiment analysis) but renders as plain text walls
3. **Limited interaction model** — Users can only type; no click-to-explore, no quick actions, no slash commands
4. **Basic session management** — Sidebar shows timestamps only, no summaries or organization
5. **No proactive intelligence** — AI waits for questions instead of surfacing what matters

## Design Overview

Transform the AI page from a simple chat into a **Smart Chat with Inline Intelligence** — keeping chat as the primary interaction pattern but enriching the landing experience, output rendering, and interaction model.

### Core Concept

- **Chat stays central** — full-width centered layout (~760px max), no persistent split panels
- **AI is proactive** — pre-computed Intelligence Briefing as the first message in every new session
- **Output is rich** — inline interactive cards (charts, tables, action buttons) embedded in AI responses
- **Sessions in the header** — dropdown selector replaces the chat sidebar, no double-sidebar problem
- **Artifacts are downloadable** — lightweight tray accessible from header for saved/exported items

## Design Specifications

### 1. Landing Experience

When a user opens `/ai` with a new session:

**Intelligence Briefing** — The AI's first message is a pre-computed daily digest containing:
- 2-4 **Attention Cards** organized by severity:
  - `CRITICAL` (red) — Issues requiring immediate attention
  - `WATCH` (amber) — Emerging patterns to monitor
  - `POSITIVE` (green) — Improvements and good trends
- Each card shows: title, case/supplier count, region, and a "Click to investigate →" CTA
- Cards are clickable — clicking one sends that topic as a message to start the conversation
- Below the briefing: **Capability Pills** — clickable badges showing what the AI can do:
  - "Investigate cases", "Analyze risk trends", "Generate HRDD report", "Create training", "Design survey", "Recalculate risks"
  - Clicking a pill starts a guided conversation for that capability

**Data source:** Pre-computed by a new batch job endpoint (`/api/jobs/generate-briefing`) that runs after `calculate-risk` completes or can be triggered manually. Piggybacks on existing risk scoring data + recent case/survey/training data to generate attention items. Stored in a new `intelligenceBriefing` table. Shows "Updated X hours ago" timestamp.

**Generation trigger:** The briefing is regenerated when risk scores are recalculated (daily batch or manual trigger via `/recalculate`). It is NOT tenant-scoped (single-tenant application).

**No empty state** — Users always see actionable content on landing.

### 2. Chat Interface

**Layout:**
- Full-width centered chat content (max-width ~760px, auto-centered)
- User messages right-aligned with rounded corners
- AI messages left-aligned with an AI avatar icon (sparkles gradient)
- Scrollable message area with padding

**Rich Inline Cards** — When AI returns structured data, it renders as interactive cards within the message flow:

#### Chart Cards
- Bar charts, trend lines, pie charts rendered inline
- Header with title + "Save" / "Expand" buttons
- Data labels and color-coded values
- Built with Recharts (existing dependency)

#### Table Cards
- Sortable supplier/case/survey lists
- Risk score badges with color coding
- Clickable supplier names → navigate to `/suppliers/[id]`
- Header with "Save" / "Expand" buttons

#### Action Cards
- Prioritized recommendations from the AI
- Each action has: severity indicator, description, context, and an **action button**
- Action buttons: "Escalate" (red), "Send Survey" (amber), "Create Training" (indigo), "Export" (gray)
- Clicking an action button triggers the corresponding AI tool or navigates to the relevant page

**Interactivity level:** View + Interact + Act
- Click supplier names to navigate
- Sort tables by columns
- Click action buttons to trigger workflows
- Save cards as artifacts

### 3. Session Management

**Header-based dropdown** (no second sidebar):

**Header bar contains:**
- AI Assistant label with sparkles icon
- Session name (auto-generated from conversation content)
- Session dropdown (click to expand):
  - **Pinned** section — user-pinned important conversations
  - **Recent** section — chronologically sorted, AI-generated titles
  - Search functionality within the dropdown
- "New Chat" button (always visible)
- "Artifacts" button with badge count

**Session title generation:**
- AI auto-generates a concise title from the first few messages
- Stored alongside the session in `aiChatHistory`
- Users can rename by clicking the title in the header

### 4. Smart Input Bar

**Bottom-anchored compose area:**
- Full-width input with rounded corners
- Placeholder: "Ask anything about your supply chain, or type / for commands..."
- **Slash command support:**
  - `/report` — Generate HRDD compliance report
  - `/risk` — Show current risk overview
  - `/cases` — Search/filter cases
  - `/forecast` — Show risk forecasts
  - `/survey` — Design a worker survey
  - `/training` — Create a training course
  - `/recalculate` — Trigger risk score recalculation
- Slash command hints shown as pills next to the input
- Send button (arrow icon)

### 5. Artifacts Tray

**Lightweight header dropdown** (not a panel):
- Triggered by "Artifacts" button in the header
- Shows list of generated items from current session:
  - Charts (PNG/SVG export)
  - Tables (CSV export)
  - Reports (PDF export)
  - Draft responses (text)
- Each item: icon, name, timestamp, "Download" / "View" actions
- Badge count on the Artifacts button shows how many items are available

### 6. Navigation Sidebar

**No modifications to the existing sidebar.** The main AppSidebar stays as-is:
- When the sidebar is in expanded mode, it works normally alongside the chat
- When collapsed to icons, the chat gets maximum width
- The AI page does NOT add a second sidebar

## Technical Approach

### New Components to Build

| Component | Description | Location |
|-----------|-------------|----------|
| `IntelligenceBriefing` | Pre-computed briefing card with attention items + capability pills | `components/ai/intelligence-briefing.tsx` |
| `ChatMessage` | Rich message renderer supporting text + inline cards | `components/ai/chat-message.tsx` |
| `ChartCard` | Inline chart visualization card | `components/ai/cards/chart-card.tsx` |
| `TableCard` | Inline sortable table card | `components/ai/cards/table-card.tsx` |
| `ActionCard` | Inline action recommendation card | `components/ai/cards/action-card.tsx` |
| `SessionDropdown` | Header session selector with pinned/recent | `components/ai/session-dropdown.tsx` |
| `ArtifactsTray` | Header dropdown for generated artifacts | `components/ai/artifacts-tray.tsx` |
| `SmartInput` | Enhanced input with slash command support | `components/ai/smart-input.tsx` |
| `SlashCommandMenu` | Dropdown menu for slash commands | `components/ai/slash-command-menu.tsx` |

### Existing Code to Reuse

| What | Where | How |
|------|-------|-----|
| `useChat()` hook | `@ai-sdk/react` (existing) | Core chat streaming — no changes needed |
| Chat API route | `app/api/ai/chat/route.ts` | Existing tool execution — extend with card metadata |
| Session endpoints | `app/api/ai/chat/sessions/` + `history/` | Extend with title generation |
| AI tools | `lib/ai/tools.ts` | 8 existing tools — add structured output metadata |
| Risk scoring | `app/api/jobs/calculate-risk/route.ts` | Source data for Intelligence Briefing |
| Recharts | Already in `package.json` | For chart cards |
| shadcn/ui | `components/ui/*` | Dropdown, Sheet, Badge, etc. |
| Sonner | Already in `package.json` | Toast notifications for actions |

### Database Changes

**New table: `intelligenceBriefing`**
```
- id: serial primary key
- content: jsonb (attention items, capability list)
- generatedAt: timestamp
- expiresAt: timestamp
```

**Extend `aiChatHistory`:**
- Add `sessionTitle: text` column (AI-generated title)
- Add `isPinned: boolean` column (user pinning)

### API Changes

**New endpoint: `GET /api/ai/briefing`**
- Returns the latest pre-computed Intelligence Briefing
- If stale (>24h), triggers background regeneration

**Extend: `GET /api/ai/chat/sessions`**
- Include `sessionTitle` and `isPinned` in response
- Support `PATCH` for renaming and pin/unpin

**Extend: `POST /api/ai/chat`**
- AI tool responses include a `cardType` field (`chart`, `table`, `action`, `text`)
- Card metadata includes structured data for rendering (not just text)

## Verification Plan

1. **Landing state:** Open `/ai` with no active session → see Intelligence Briefing with attention cards and capability pills
2. **Click attention card:** Click a briefing card → conversation starts about that topic
3. **Rich inline output:** Ask "show high-risk suppliers" → see a chart card + table card inline in the response
4. **Action buttons:** AI recommends actions → click "Escalate" → navigates or triggers workflow
5. **Session management:** Create multiple chats → see AI-generated titles in header dropdown → pin one → verify it appears in Pinned section
6. **Slash commands:** Type `/report` → see command menu → select → AI generates report
7. **Artifacts:** After AI generates a chart → Artifacts badge shows 1 → click → see downloadable chart
8. **Responsive:** Verify layout works on desktop (>1024px) and tablet (768px)
9. **Dark/light mode:** Verify theming works with existing next-themes setup

## Out of Scope

- Mobile-optimized layout (future enhancement)
- Multi-user collaboration features
- Real-time briefing generation (using pre-computed only)
- Modifying the main navigation sidebar
- Canvas/expanded view mode (future enhancement)
