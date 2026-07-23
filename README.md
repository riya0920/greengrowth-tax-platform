# Meridian — AI-Powered Tax Platform (Case Study Prototype)

A clickable, greenfield prototype for the AI Engineer case study. It covers three
interlocking challenges as **one continuous workflow** rather than three disconnected screens:

| # | Challenge | Where to see it |
|---|-----------|-----------------|
| **07** | An Actionable Dashboard | `/` — the CPA landing page |
| **01** | Source Document Traceability | `/return/r_chen` — middle pane |
| **10** | Trustworthy AI | `/return/r_chen` — right pane |

## The 60-second demo path
1. **Dashboard** answers *"what should I work on right now?"* — a priority queue ranked by a
   transparent score, with a "why" on every row and filters (On me / AI flags / Blocked).
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
- A consistent **affordance system** (Challenge 08 flavor): AI-suggested / verified / edited /
  locked fields each have a distinct, reusable visual language.

**Simulated (fake, on purpose — per the brief):**
- **No OCR / no document parsing.** "Source documents" are hardcoded structured lines in
  `src/data/mockData.js`. The highlight is a data match on a box number, not real coordinates.
- **No real AI model.** `explainField()` / `acknowledgeCorrection()` are stub functions that
  return plausible fake JSON after a short delay to mimic latency. Confidence scores, reasoning,
  and warnings are authored, not inferred.
- **No backend / auth.** All state is in-memory and resets on refresh. Six sample returns, six
  tasks, five source documents.

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

Not covered (out of scope for the assigned trio): full role-switching (05), collaboration
threads (02), and client onboarding (03) — the data model is structured to support them later.
