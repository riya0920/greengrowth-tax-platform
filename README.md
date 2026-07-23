# Meridian — AI-Powered Tax Platform (Case Study Prototype)

**Live demo:** https://greengrowth-tax-platform.vercel.app — best viewed at desktop width (≥1024px;
the left nav collapses on mobile).

> The in-app firm **"Meridian Tax Partners"** and every client, document, and dollar figure are
> fictional sample data invented for this prototype. (The repo and URL say "greengrowth" only
> because that's where it's hosted.)

A clickable, greenfield prototype for the AI Engineer case study. It covers four
interlocking challenges as **one continuous workflow** rather than four disconnected screens:

| # | Challenge | Where to see it |
|---|-----------|-----------------|
| **07** | An Actionable Dashboard | `/` — the CPA landing page |
| **01** | Source Document Traceability | `/return/r_chen` — middle pane |
| **10** | Trustworthy AI | `/return/r_chen` — right pane |
| **08** | Clickable vs. Editable | `/system` — the interaction affordance system |

**Why these four:** diagnosing *why* tax professionals correct AI output — and making that output
defensible enough to trust — is the core of this role. Traceability (01) shows where a number came
from, Trustworthy AI (10) shows why the model chose it and how to correct it, the affordance system
(08) makes "can I change this?" unambiguous, and the dashboard (07) turns all of it into "what do I
do next." I deliberately went deep on the AI-facing challenges rather than broad across all ten.

**No specific challenges were assigned to me**, so I selected the four most central to the AI
Engineer role (transparency, explainability, and correctability of AI output) and went deep.
Elements of **04** (deep-linking to a specific field, breadcrumbs, and context preservation while
moving between dashboard and return) and **06** (a shared stage vocabulary that carries a separate
client-facing label — hover any stage pill to see what the client sees) also appear throughout,
built on the same data model.

## The 60-second demo path
1. **Dashboard** answers *"what should I work on right now?"* — a priority queue ranked by a
   transparent score; every row shows the "why," with filters (On me / AI flags / Blocked). The
   header search jumps straight to any return or field.
2. Click the **"Confirm property tax amount (SALT cap risk)"** task. It deep-links straight to
   that exact field in the return.
3. In the **return review**, the flagged field (`State & local property taxes`, 72% confidence)
   is selected. The middle pane shows the **source 1098 with Box 10 highlighted** — the exact
   figure the number came from.
4. The right **AI panel** shows: the confidence verdict, a plain-language warning, the source
   documents (click to jump), the **calculation** (source → transform → return value), and the
   full model reasoning behind a "Why did the AI do this?" toggle.
5. Hit **"Looks right — verify"** or **"Fix"**. Progress updates, the row flips to human-verified,
   and the AI acknowledges the correction — all without leaving the panel.

Try the multi-document field too: **Wages (line 1a)** is summed from **two** W-2s, and you can
trace each contribution.

## What's REAL vs. SIMULATED

**Real (genuinely wired up):**
- React + Vite + Tailwind app, client-side routing, deep-linking (`?field=`).
- **Prioritization logic** (`src/data/aiEngine.js -> rankTasks`) — deterministic scoring on the
  mock dataset: urgency + deadline proximity + AI-flag boost − "waiting on client" penalty.
- Interactive state: selecting fields, highlighting the matching source box, verify/correct
  actions that mutate progress, filters, scope toggles.
- **Global search** (press `/`) — really filters the 6 returns and their fields and deep-links to
  the exact one you pick. The affordance is honest here too: it looks searchable and it is.
- A consistent **affordance system** (Challenge 08): six interaction states — Clickable / Editable /
  AI-generated / Verified / Needs-approval / Read-only — with one shared visual grammar, proven
  across three different screens on `/system`. Editable fields are genuinely editable; read-only
  fields refuse interaction (note the `not-allowed` cursor).

**Simulated (fake, on purpose — per the brief):**
- **No OCR / no document parsing.** "Source documents" are hardcoded structured lines in
  `src/data/mockData.js`. The highlight is a data match on a box number, not real coordinates.
- **No real AI model.** `explainField()` / `acknowledgeCorrection()` are stub functions that
  return plausible fake JSON after a short delay to mimic latency. Confidence scores, reasoning,
  and warnings are authored, not inferred.
- **No backend / auth.** All state is in-memory and resets on refresh. Six sample returns, six
  tasks, five source documents.
- **Demo clock pinned to Mar 18, 2026** (`rankTasks` in `src/data/aiEngine.js`) so due-date math
  ("Due in 3d," overdue boosts) stays deterministic regardless of when you open it.

## Key design decisions
- **Traceability is a chain, not a link.** Every number connects field -> value -> document ->
  box -> *transformation*. Showing the math (e.g. "Box 1 Acme + Box 1 Northwind = 181,250") is
  what makes AI output defensible, so the calculation is a first-class part of the panel.
- **Trust through progressive disclosure.** The verdict (value + confidence) is always visible;
  evidence and math are one glance down; full model reasoning is one click away. Showing every
  technical detail at once was explicitly called out as a non-solution.
- **Correction never breaks flow.** Verify/fix happens inline in the same panel, and the AI
  responds so the human feels in control, not fighting the tool.
- **The dashboard sorts, then explains.** It doesn't just list work — it ranks it and shows *why*,
  so staff trust the order instead of falling back to a spreadsheet.

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

Partial coverage: **04** (deep-linking, breadcrumbs, context preservation) and **06** (shared stage
vocabulary with client-facing labels) appear throughout. Deliberately out of scope: role-switching
(05), collaboration threads (02), and client onboarding (03) — the data model is structured to
support them later.

## Walkthrough video script (~90 seconds)

> Screen-record while narrating. Start on the Dashboard at 1440px wide.

**[0:00–0:15] Dashboard — "what do I work on now?"**
"This is the CPA's landing page. Instead of a list, it's a priority queue — ranked by a
transparent score: urgency, deadline proximity, and whether the AI flagged something for a human.
Every row shows *why* it's ranked where it is, and work waiting on clients is de-prioritized since
it's not on me."

**[0:15–0:25] Deep-link into the work**
"I'll take the top AI flag — 'Confirm property tax amount, SALT-cap risk.' Notice it takes me
straight to that exact field in the return, not just the return."

**[0:25–0:50] Traceability — every number to its source**
"Here's the core of the product. Left: the return line items. Middle: the actual source
document — this property-tax figure came from Box 10 of the 1098, and it's highlighted. Right: the
AI panel. It tells me the value is only 72% confidence, and *why* — escrow-reported taxes can
differ from taxes actually paid. I can see the exact calculation, and one click jumps me to the
source. Let me show a harder one — Wages. That number is summed from *two* W-2s, and I can trace
each contribution."

**[0:50–1:05] Trustworthy AI — correction without breaking flow**
"'Why did the AI do this?' expands the full reasoning — progressive disclosure, so I'm never
buried in detail. If it's right, I verify; if not, I fix it inline. Watch — I verify, progress
updates, the row is now human-verified, and the AI acknowledges my correction. The human stays in
control."

**[1:05–1:25] Interaction system — clickable vs. editable**
"One more: on a tax return, AI output, client answers, calculations, and reviewer notes all sit
side by side. This is the single visual language that keeps them legible — six states, one rule
set. Dashed border means I can type; a colored left-bar tells me who produced the value; solid grey
means locked. Same vocabulary across every screen — the affordance is honest: what looks editable
actually is."

**[1:25–1:30] Close**
"Everything you saw is a real, clickable frontend on hardcoded data and simulated AI — the README
spells out exactly what's real versus faked. Thanks for watching."
