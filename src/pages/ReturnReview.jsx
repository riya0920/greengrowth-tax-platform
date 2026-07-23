import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  Home,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Lock,
  Pencil,
  Check,
  ArrowLeft,
} from "lucide-react";
import { RETURNS, STAGES, stageIndex } from "../data/mockData";
import { FIELD_STYLES } from "../components/Badges";
import DocumentViewer from "../components/DocumentViewer";
import AiPanel from "../components/AiPanel";

const fmt = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : n);

const ROW_ICON = {
  ai_suggested: Sparkles,
  verified: ShieldCheck,
  edited: Pencil,
  locked: Lock,
};

export default function ReturnReview() {
  const { returnId } = useParams();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const base = RETURNS[returnId];

  // local editable copy so verify/correct actions actually change state
  const [fields, setFields] = useState(() =>
    (base?.fields || []).map((f) => ({ ...f, returnId, status: f.locked ? "locked" : "ai_suggested" }))
  );
  const activeId = params.get("field") || fields[0]?.id;
  const active = fields.find((f) => f.id === activeId);
  const [source, setSource] = useState(active?.sources?.[0] || null);

  useEffect(() => {
    setSource(active?.sources?.[0] || null);
  }, [activeId]); // eslint-disable-line

  const stats = useMemo(() => {
    const total = fields.length;
    const verified = fields.filter((f) => f.status === "verified" || f.status === "edited").length;
    const flagged = fields.filter((f) => !f.locked && f.confidence < 0.85 && f.status === "ai_suggested").length;
    return { total, verified, flagged, pct: total ? Math.round((verified / total) * 100) : 0 };
  }, [fields]);

  if (!base) return <div className="p-8">Return not found.</div>;
  if (fields.length === 0)
    return (
      <div className="mx-auto max-w-2xl p-8">
        <Link to="/" className="btn-ghost mb-4">
          <ArrowLeft size={15} /> Back to dashboard
        </Link>
        <div className="card p-8 text-center">
          <h1 className="text-lg font-bold">{base.client}</h1>
          <p className="mt-2 text-sm text-ink-500">
            This sample return doesn't have extracted line-items wired up. Open{" "}
            <Link to="/return/r_chen" className="text-brand-600 underline">
              the Chen return
            </Link>{" "}
            to see full source-document traceability and the AI review flow.
          </p>
        </div>
      </div>
    );

  function selectField(id) {
    setParams({ field: id }, { replace: true });
  }
  function markVerified(id) {
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, status: "verified" } : f)));
  }
  function markEdited(id, val) {
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, status: "edited", value: val } : f)));
  }

  const idx = stageIndex(base.stage);

  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb + orientation (Challenge 04 flavor) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 text-sm">
        <Link to="/" className="flex items-center gap-1 text-ink-500 hover:text-ink-900">
          <Home size={14} /> Dashboard
        </Link>
        <ChevronRight size={14} className="text-ink-300" />
        <span className="font-semibold">{base.client}</span>
        <span className="text-ink-500">· {base.entity}</span>
        <span className="ml-auto flex items-center gap-2">
          <span
            className="pill bg-brand-50 text-brand-700 capitalize"
            title={`Client sees: “${STAGES[idx].clientLabel}”`}
          >
            {STAGES[idx].label}
          </span>
          <span className="hidden text-[11px] text-ink-300 md:inline">
            client sees “{STAGES[idx].clientLabel}”
          </span>
          <span className="text-xs text-ink-500">Due {base.dueDate}</span>
        </span>
      </div>

      {/* progress strip */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2">
        <div className="text-xs font-medium text-ink-500">
          Review progress: <b className="text-ink-900">{stats.verified}</b>/{stats.total} verified
        </div>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-verified-500 transition-all" style={{ width: `${stats.pct}%` }} />
        </div>
        {stats.flagged > 0 && (
          <span className="pill bg-warn-50 text-warn-600">
            <AlertTriangle size={11} /> {stats.flagged} need a look
          </span>
        )}
      </div>

      {/* THREE PANES: fields · document · AI */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(280px,340px)_1fr_minmax(300px,360px)]">
        {/* Pane 1 — return line items */}
        <div className="min-h-0 overflow-auto border-r border-slate-200 bg-white">
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Return line items
          </div>
          <div className="space-y-1 px-2 pb-4">
            {fields.map((f) => {
              const st = FIELD_STYLES[f.status];
              const RowIcon = ROW_ICON[f.status];
              const isActive = f.id === activeId;
              const flagged = !f.locked && f.confidence < 0.85 && f.status === "ai_suggested";
              return (
                <button
                  key={f.id}
                  onClick={() => selectField(f.id)}
                  className={`w-full rounded-lg border p-2.5 text-left transition ${
                    isActive
                      ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500/30"
                      : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded ${st.chip}`}>
                      <RowIcon size={12} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{f.label}</span>
                    {flagged && <AlertTriangle size={13} className="shrink-0 text-warn-500" />}
                    {(f.status === "verified" || f.status === "edited") && (
                      <Check size={14} className="shrink-0 text-verified-500" />
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between pl-8">
                    <span className="text-[11px] text-ink-500">Line {f.line}</span>
                    <span className="font-mono text-sm font-semibold">${fmt(f.value)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pane 2 — source document, highlighted to the exact box */}
        <div className="min-h-0 overflow-hidden border-r border-slate-200 bg-slate-100">
          <DocumentViewer docId={source?.doc} highlightBox={source?.box} />
        </div>

        {/* Pane 3 — AI trust + correction */}
        <div className="min-h-0 overflow-hidden bg-white">
          {active && (
            <AiPanel
              key={active.id}
              field={active}
              onFocusSource={(s) => setSource(s)}
              onVerify={markVerified}
              onEdit={markEdited}
            />
          )}
        </div>
      </div>
    </div>
  );
}
