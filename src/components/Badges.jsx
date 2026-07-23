import { Sparkles, ShieldCheck, Lock, Pencil, AlertTriangle } from "lucide-react";
import { confidenceBucket } from "../data/mockData";

// --- Confidence badge: the core trust signal (Challenge 10) ------------------
export function ConfidenceBadge({ score, showLabel = true }) {
  const bucket = confidenceBucket(score);
  const map = {
    high: { cls: "bg-verified-50 text-verified-600", label: "High confidence", Icon: ShieldCheck },
    medium: { cls: "bg-warn-50 text-warn-600", label: "Needs a look", Icon: AlertTriangle },
    low: { cls: "bg-danger-50 text-danger-600", label: "Low confidence", Icon: AlertTriangle },
  };
  const { cls, label, Icon } = map[bucket];
  return (
    <span className={`pill ${cls}`} title={`AI confidence: ${Math.round(score * 100)}%`}>
      <Icon size={12} />
      {showLabel && label}
      <span className="opacity-70">{Math.round(score * 100)}%</span>
    </span>
  );
}

// --- Field status affordance (Challenge 08) ----------------------------------
// A consistent visual language for: AI-suggested / verified / edited / locked.
export const FIELD_STYLES = {
  ai_suggested: {
    label: "AI-suggested",
    Icon: Sparkles,
    chip: "bg-ai-50 text-ai-600",
    ring: "ring-1 ring-ai-100 hover:ring-ai-500/40 cursor-pointer bg-white",
  },
  verified: {
    label: "Verified",
    Icon: ShieldCheck,
    chip: "bg-verified-50 text-verified-600",
    ring: "ring-1 ring-verified-100 hover:ring-verified-500/40 cursor-pointer bg-white",
  },
  edited: {
    label: "Edited by you",
    Icon: Pencil,
    chip: "bg-brand-50 text-brand-600",
    ring: "ring-1 ring-brand-100 hover:ring-brand-500/40 cursor-pointer bg-white",
  },
  locked: {
    label: "Calculated · locked",
    Icon: Lock,
    chip: "bg-slate-100 text-ink-500",
    ring: "ring-1 ring-slate-100 bg-slate-50/60 cursor-not-allowed",
  },
};

export function StatusChip({ status }) {
  const s = FIELD_STYLES[status] || FIELD_STYLES.ai_suggested;
  const { Icon } = s;
  return (
    <span className={`pill ${s.chip}`}>
      <Icon size={12} />
      {s.label}
    </span>
  );
}

export function StageBadge({ stage, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-ink-700",
    active: "bg-brand-50 text-brand-700",
    done: "bg-verified-50 text-verified-600",
  };
  return <span className={`pill ${tones[tone]}`}>{stage}</span>;
}

export function UrgencyDot({ urgency }) {
  const map = { high: "bg-danger-500", medium: "bg-warn-500", low: "bg-slate-300" };
  return <span className={`inline-block h-2 w-2 rounded-full ${map[urgency]}`} />;
}
