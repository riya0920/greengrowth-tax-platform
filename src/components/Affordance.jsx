import { useState } from "react";
import { Sparkles, ShieldCheck, Pencil, Lock, MousePointerClick, Stamp } from "lucide-react";

// ---------------------------------------------------------------------------
// THE INTERACTION AFFORDANCE SYSTEM (Challenge 08)
// One vocabulary for every kind of value the platform shows. The rule the whole
// system follows:
//   • DASHED left-border + hover  -> you can interact (click or edit)
//   • SOLID fill, no cursor       -> read-only, look but don't touch
//   • Icon + tint                 -> WHO produced it / WHAT state it's in
// Same language everywhere, so users never wonder "can I change this?"
// ---------------------------------------------------------------------------
export const INTERACTION = {
  clickable: {
    label: "Clickable",
    hint: "Opens something: navigates or expands",
    Icon: MousePointerClick,
    chip: "bg-brand-50 text-brand-600",
    box: "bg-white border border-slate-200 border-l-2 border-l-brand-400 hover:bg-brand-50 hover:border-l-brand-600 cursor-pointer",
    cursor: "pointer",
  },
  editable: {
    label: "Editable",
    hint: "You can type a new value here",
    Icon: Pencil,
    chip: "bg-ink-100 text-ink-700",
    box: "bg-white border border-dashed border-slate-400 hover:border-brand-500 hover:bg-brand-50/40 cursor-text",
    cursor: "text",
  },
  ai: {
    label: "AI-generated",
    hint: "Produced by the model: review before trusting",
    Icon: Sparkles,
    chip: "bg-ai-50 text-ai-600",
    box: "bg-ai-50/40 border border-ai-100 border-l-2 border-l-ai-500 hover:bg-ai-50 cursor-pointer",
    cursor: "pointer",
  },
  verified: {
    label: "Verified",
    hint: "A human confirmed this: safe to rely on",
    Icon: ShieldCheck,
    chip: "bg-verified-50 text-verified-600",
    box: "bg-verified-50/50 border border-verified-100 border-l-2 border-l-verified-500",
    cursor: "default",
  },
  approval: {
    label: "Needs approval",
    hint: "Waiting on a reviewer's sign-off before it counts",
    Icon: Stamp,
    chip: "bg-warn-50 text-warn-600",
    box: "bg-warn-50/50 border border-warn-100 border-l-2 border-l-warn-500 cursor-pointer hover:bg-warn-50",
    cursor: "pointer",
  },
  locked: {
    label: "Read-only",
    hint: "Calculated or filed: can't be changed here",
    Icon: Lock,
    chip: "bg-slate-100 text-ink-500",
    box: "bg-slate-100/70 border border-slate-200 text-ink-500 cursor-not-allowed",
    cursor: "not-allowed",
  },
};

const fmt = (v) => (typeof v === "number" ? v.toLocaleString("en-US") : v);

// A single value rendered with the affordance for its state. Editable ones
// actually become an input on click, so the affordance is honest: what looks
// editable IS editable.
export function AffordanceField({ state, label, value, prefix = "", onChange }) {
  const s = INTERACTION[state];
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const { Icon } = s;

  const startEdit = () => state === "editable" && setEditing(true);

  return (
    <div
      onClick={startEdit}
      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition ${s.box}`}
    >
      <span className="flex items-center gap-2 text-sm text-ink-700">
        <Icon size={13} className="opacity-70" />
        {label}
      </span>
      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => {
            setEditing(false);
            onChange?.(val);
          }}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="w-28 rounded border border-brand-500 px-1.5 py-0.5 text-right font-mono text-sm outline-none ring-2 ring-brand-500/20"
        />
      ) : (
        <span className="font-mono text-sm font-semibold text-ink-900">
          {prefix}
          {fmt(val)}
        </span>
      )}
    </div>
  );
}

export function AffordanceChip({ state }) {
  const s = INTERACTION[state];
  const { Icon } = s;
  return (
    <span className={`pill ${s.chip}`}>
      <Icon size={12} />
      {s.label}
    </span>
  );
}
