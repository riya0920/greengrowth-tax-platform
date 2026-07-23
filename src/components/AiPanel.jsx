import { useEffect, useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Calculator,
  Check,
  Pencil,
  Loader2,
  CornerDownRight,
} from "lucide-react";
import { DOCUMENTS, confidenceBucket } from "../data/mockData";
import { explainField, acknowledgeCorrection } from "../data/aiEngine";
import { ConfidenceBadge } from "./Badges";

const fmt = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : n);

// The trust surface for a single field (Challenge 10).
// Progressive disclosure: headline verdict up top, evidence + math one layer
// down, full model reasoning behind a toggle. Correction never leaves the panel.
export default function AiPanel({ field, onFocusSource, onVerify, onEdit }) {
  const [explain, setExplain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReasoning, setShowReasoning] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [ack, setAck] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setAck(null);
    setEditing(false);
    setShowReasoning(false);
    explainField(field.returnId, field.id).then((r) => {
      if (alive) {
        setExplain(r);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [field.id, field.returnId]);

  const bucket = confidenceBucket(field.confidence);
  const locked = field.locked;

  async function confirm(newValue) {
    const res = await acknowledgeCorrection(field.id, field.aiValue, newValue);
    setAck(res);
    if (newValue === field.aiValue) onVerify?.(field.id);
    else onEdit?.(field.id, newValue);
  }

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ai-600">
          <Sparkles size={14} /> AI extraction
        </div>
        <div className="mt-1 text-sm font-semibold">{field.label}</div>
        <div className="text-xs text-ink-500">Return line {field.line}</div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-ink-500">
          <Loader2 size={16} className="animate-spin" /> Gathering the evidence…
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-auto p-4">
          {/* 1. The verdict — the one thing to read */}
          <div
            className={`rounded-lg p-3 ${
              locked
                ? "bg-slate-50"
                : bucket === "high"
                ? "bg-verified-50"
                : bucket === "medium"
                ? "bg-warn-50"
                : "bg-danger-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-500">The value</span>
              {locked ? (
                <span className="pill bg-slate-200 text-ink-500">Calculated · locked</span>
              ) : (
                <ConfidenceBadge score={field.confidence} />
              )}
            </div>
            <div className="mt-1 font-mono text-2xl font-bold">${fmt(field.value)}</div>
            {field.warning && (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-warn-600">
                <AlertTriangle size={13} className="mt-px shrink-0" />
                <span>{field.warning}</span>
              </div>
            )}
            {locked && <div className="mt-2 text-xs text-ink-500">{field.lockReason}</div>}
          </div>

          {/* 2. Evidence — click to jump to the source (Challenge 01 bridge) */}
          {field.sources.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-700">
                <FileText size={13} /> Where it came from
              </div>
              <div className="space-y-1.5">
                {field.sources.map((s, i) => {
                  const doc = DOCUMENTS[s.doc];
                  return (
                    <button
                      key={i}
                      onClick={() => onFocusSource(s)}
                      className="group flex w-full items-center gap-2 rounded-lg border border-slate-200 p-2 text-left text-sm transition hover:border-brand-500 hover:bg-brand-50"
                    >
                      <FileText size={14} className="shrink-0 text-ink-500 group-hover:text-brand-600" />
                      <span className="min-w-0 flex-1 truncate">
                        {doc.title} <span className="text-ink-500">· Box {s.box}, p.{s.page}</span>
                      </span>
                      <span className="pill bg-brand-50 text-brand-600 opacity-0 transition group-hover:opacity-100">
                        View
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. The math — how source became the field value (Challenge 01) */}
          {field.transform && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-700">
                <Calculator size={13} /> How it was calculated
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="mb-2 text-xs text-ink-500">{field.transform.summary}</div>
                <div className="space-y-1 font-mono text-[13px]">
                  {field.transform.steps.map((st, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-ink-700">
                        {i > 0 && field.transform.op === "+" && <span className="text-ink-300">+</span>}
                        {st.label}
                      </span>
                      <span className="font-semibold">${fmt(st.amount)}</span>
                    </div>
                  ))}
                  <div className="mt-1 flex items-center justify-between border-t border-slate-300 pt-1">
                    <span className="text-ink-500">
                      {field.transform.op === "round"
                        ? "Rounded"
                        : field.transform.op === "="
                        ? "Taken as-is"
                        : "Total"}
                    </span>
                    <span className="font-bold text-brand-700">${fmt(field.transform.result)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Reasoning — full model rationale, hidden by default */}
          <div>
            <button
              onClick={() => setShowReasoning((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-ai-600 hover:underline"
            >
              <CornerDownRight size={13} />
              {showReasoning ? "Hide" : "Why did the AI do this?"}
            </button>
            {showReasoning && explain && (
              <div className="mt-2 animate-fade-in rounded-lg border border-ai-100 bg-ai-50/50 p-3 text-xs leading-relaxed text-ink-700">
                {explain.reasoning}
                <div className="mt-2 text-[10px] text-ink-300">
                  {explain.model} · generated for this review
                </div>
              </div>
            )}
          </div>

          {/* 5. Correction workflow — accept or fix without leaving (Challenge 10) */}
          {!locked && (
            <div className="border-t border-slate-200 pt-3">
              {ack ? (
                <div className="animate-fade-in rounded-lg bg-verified-50 p-3 text-sm text-verified-600">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Check size={14} /> {ack.message}
                  </div>
                  <div className="mt-1 text-xs text-ink-500">{ack.learn}</div>
                </div>
              ) : editing ? (
                <div className="animate-fade-in space-y-2">
                  <label className="text-xs font-medium text-ink-500">Corrected value</label>
                  <div className="flex items-center gap-2">
                    <span className="text-ink-500">$</span>
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value.replace(/[^\d.]/g, ""))}
                      className="w-full rounded-lg border border-brand-500 px-2 py-1.5 font-mono text-sm outline-none ring-2 ring-brand-500/20"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirm(Number(draft) || field.value)}
                      className="btn-primary flex-1 justify-center"
                    >
                      Save correction
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-outline">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => confirm(field.aiValue)} className="btn-primary flex-1 justify-center">
                    <ShieldCheck size={15} /> Looks right — verify
                  </button>
                  <button
                    onClick={() => {
                      setDraft(String(field.value));
                      setEditing(true);
                    }}
                    className="btn-outline"
                  >
                    <Pencil size={14} /> Fix
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
