// ---------------------------------------------------------------------------
// SIMULATED AI ENGINE
// There is no real model here. These functions return plausible fake JSON with
// a small artificial delay so the UI can show "thinking" states. This is the
// "stub function returning fake JSON" the case study explicitly asks for.
// ---------------------------------------------------------------------------

import { RETURNS, confidenceBucket } from "./mockData";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Prioritization "logic" for the dashboard (Challenge 07).
// Real ranking against the mock dataset — deterministic, explainable.
export function rankTasks(tasks) {
  const urgencyWeight = { high: 100, medium: 50, low: 10 };
  const today = new Date("2026-03-18");
  return [...tasks]
    .map((t) => {
      const due = new Date(t.dueDate);
      const daysToDue = Math.round((due - today) / 86400000);
      let score = urgencyWeight[t.urgency] || 0;
      if (daysToDue <= 0) score += 60; // overdue
      else if (daysToDue <= 2) score += 30; // due soon
      if (t.kind === "ai_flag") score += 15; // AI wants a human
      if (t.kind === "blocked" && t.owner === "client") score -= 20; // not on us
      return { ...t, daysToDue, priorityScore: score };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function priorityReason(task) {
  const bits = [];
  if (task.daysToDue <= 0) bits.push("past due");
  else if (task.daysToDue <= 2) bits.push(`due in ${task.daysToDue}d`);
  if (task.kind === "ai_flag") bits.push("AI needs review");
  if (task.urgency === "high") bits.push("high urgency");
  if (task.owner === "client") bits.push("waiting on client");
  return bits.slice(0, 2).join(" · ") || "routine";
}

// Fake "explain this field" call — returns the AI's rationale packet.
// In a real system this would hit an LLM; here it's just the pre-baked
// reasoning attached to the field, wrapped in an async shape.
export async function explainField(returnId, fieldId) {
  await sleep(450);
  const ret = RETURNS[returnId];
  const f = ret?.fields.find((x) => x.id === fieldId);
  if (!f) return null;
  return {
    fieldId,
    confidence: f.confidence,
    bucket: confidenceBucket(f.confidence),
    reasoning: f.reasoning,
    warning: f.warning || null,
    evidence: f.sources,
    transform: f.transform,
    generatedAt: new Date().toISOString(),
    model: "meridian-extract-v3 (simulated)",
  };
}

// Fake "re-check after correction" — simulates the AI acknowledging a human edit.
export async function acknowledgeCorrection(fieldId, oldValue, newValue) {
  await sleep(400);
  return {
    fieldId,
    accepted: true,
    message:
      newValue === oldValue
        ? "Value confirmed. I've marked this as human-verified."
        : `Got it — updated to ${newValue.toLocaleString()}. I've recorded this as a human correction and won't override it.`,
    learn:
      "In production I'd use this correction as a signal to improve extraction on similar documents.",
  };
}
