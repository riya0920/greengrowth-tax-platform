import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Sparkles,
  Clock,
  UserRound,
  ArrowRight,
  ListFilter,
  CheckCircle2,
  CircleHelp,
  Ban,
} from "lucide-react";
import { RETURNS, TASKS, STAGES, stageIndex } from "../data/mockData";
import { rankTasks, priorityReason } from "../data/aiEngine";
import { UrgencyDot } from "../components/Badges";

const KIND_META = {
  ai_flag: { label: "AI flag", Icon: Sparkles, cls: "text-ai-600 bg-ai-50" },
  blocked: { label: "Blocked", Icon: Ban, cls: "text-danger-600 bg-danger-50" },
  waiting: { label: "Waiting", Icon: Clock, cls: "text-warn-600 bg-warn-50" },
  question: { label: "Question", Icon: CircleHelp, cls: "text-brand-600 bg-brand-50" },
};

function Stat({ label, value, tone = "default", Icon }) {
  const tones = {
    default: "text-ink-900",
    danger: "text-danger-600",
    warn: "text-warn-600",
    ai: "text-ai-600",
  };
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`grid h-10 w-10 place-items-center rounded-lg bg-slate-50 ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className={`text-2xl font-bold leading-none ${tones[tone]}`}>{value}</div>
        <div className="mt-1 text-xs text-ink-500">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const [scope, setScope] = useState("mine"); // mine | team
  const [filter, setFilter] = useState("all");

  const myReturns = Object.values(RETURNS);
  const myTasks = useMemo(
    () => TASKS.filter((t) => (scope === "mine" ? RETURNS[t.returnId].preparerId === "u_riya" : true)),
    [scope]
  );

  const ranked = useMemo(() => {
    const r = rankTasks(myTasks);
    if (filter === "all") return r;
    if (filter === "onme") return r.filter((t) => t.owner === "preparer");
    return r.filter((t) => t.kind === filter);
  }, [myTasks, filter]);

  // Stats + greeting are computed from the UNFILTERED task list so the queue
  // filter never silently changes the headline counts.
  const needReview = myTasks.filter((t) => t.owner === "preparer").length;
  const aiFlags = myTasks.filter((t) => t.kind === "ai_flag").length;
  const blocked = myTasks.filter((t) => t.kind === "blocked" || t.kind === "waiting").length;
  const dueSoon = rankTasks(myTasks).filter((t) => t.daysToDue <= 2).length;

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Good morning, Riya</h1>
          <p className="mt-1 text-sm text-ink-500">
            You have <b className="text-ink-900">{needReview} things</b> that
            need you today. Start at the top — it's already sorted by priority.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-sm">
          {["mine", "team"].map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`rounded-md px-3 py-1 font-medium capitalize transition ${
                scope === s ? "bg-brand-600 text-white" : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {s === "mine" ? "My work" : "Whole team"}
            </button>
          ))}
        </div>
      </div>

      {/* Stat strip */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Need my review" value={needReview} Icon={UserRound} />
        <Stat label="Due within 48h" value={dueSoon} tone="warn" Icon={Clock} />
        <Stat label="AI wants a look" value={aiFlags} tone="ai" Icon={Sparkles} />
        <Stat label="Blocked / waiting" value={blocked} tone="danger" Icon={Ban} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* PRIORITY QUEUE — the answer to "what do I work on now?" */}
        <section className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-700">Your priority queue</h2>
            <div className="flex items-center gap-1 text-xs text-ink-500">
              <ListFilter size={13} />
              {[
                ["all", "All"],
                ["onme", "On me"],
                ["ai_flag", "AI flags"],
                ["blocked", "Blocked"],
              ].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`rounded-md px-2 py-0.5 font-medium transition ${
                    filter === k ? "bg-ink-900 text-white" : "hover:bg-slate-100"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {ranked.map((task, i) => {
              const ret = RETURNS[task.returnId];
              const meta = KIND_META[task.kind];
              const { Icon } = meta;
              const overdue = task.daysToDue <= 0;
              return (
                <button
                  key={task.id}
                  onClick={() => nav(`/return/${task.returnId}${task.fieldId ? `?field=${task.fieldId}` : ""}`)}
                  className="group card flex w-full items-center gap-3 p-3 text-left transition hover:shadow-pop"
                >
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-50 text-xs font-bold text-ink-500">
                    {i + 1}
                  </div>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${meta.cls}`}>
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <UrgencyDot urgency={task.urgency} />
                      <span className="truncate text-sm font-semibold">{task.title}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-500">
                      <span className="truncate">{ret.client}</span>
                      <span>·</span>
                      <span className="truncate">{ret.entity}</span>
                    </div>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <div
                      className={`text-xs font-semibold ${
                        overdue ? "text-danger-600" : task.daysToDue <= 2 ? "text-warn-600" : "text-ink-500"
                      }`}
                    >
                      {overdue ? "Past due" : `Due in ${task.daysToDue}d`}
                    </div>
                    <div className="mt-0.5 text-[11px] capitalize text-ink-300">
                      why: {priorityReason(task)}
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
                  />
                </button>
              );
            })}
            {ranked.length === 0 && (
              <div className="card grid place-items-center gap-2 p-8 text-center text-sm text-ink-500">
                <CheckCircle2 className="text-verified-500" />
                Nothing in this filter. Nice — inbox zero.
              </div>
            )}
          </div>
        </section>

        {/* RIGHT RAIL — returns at a glance */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink-700">Returns you own</h2>
          <div className="space-y-2">
            {myReturns
              .filter((r) => scope === "team" || r.preparerId === "u_riya")
              .map((r) => {
                const idx = stageIndex(r.stage);
                const pct = Math.round(((idx + 1) / STAGES.length) * 100);
                return (
                  <button
                    key={r.id}
                    onClick={() => nav(`/return/${r.id}`)}
                    className="card w-full p-3 text-left transition hover:shadow-pop"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{r.client}</span>
                      {r.blocked ? (
                        <span className="pill bg-danger-50 text-danger-600">
                          <Ban size={11} /> Blocked
                        </span>
                      ) : r.lowConfidenceCount > 0 ? (
                        <span className="pill bg-warn-50 text-warn-600">
                          <AlertTriangle size={11} /> {r.lowConfidenceCount}
                        </span>
                      ) : (
                        <span className="pill bg-verified-50 text-verified-600">
                          <CheckCircle2 size={11} /> Clear
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-500">{r.entity}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span
                        className="text-[11px] font-medium capitalize text-ink-500"
                        title={`Client sees: “${STAGES[idx].clientLabel}”`}
                      >
                        {STAGES[idx].label}
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>

          <div className="card mt-4 border-ai-100 bg-ai-50/40 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-ai-600">
              <Sparkles size={14} /> How this queue is sorted
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-500">
              Ranked by a transparent score: urgency + how close the deadline is + whether the AI flagged something for
              a human. Work waiting on clients is de-prioritized since it's not on you. Every row shows the "why."
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
