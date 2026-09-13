import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, FileSpreadsheet, ClipboardList } from "lucide-react";
import { INTERACTION, AffordanceField, AffordanceChip } from "../components/Affordance";

function Legend() {
  return (
    <div className="card p-4">
      <h2 className="text-sm font-semibold text-ink-700">The interaction vocabulary</h2>
      <p className="mt-1 text-xs text-ink-500">
        Six states, one rule set. A dashed border means you can type; a colored left-bar tells you
        who produced the value and whether it's safe to trust; a solid grey fill means hands-off.
        The same language is reused on every screen below.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(INTERACTION).map(([key, s]) => (
          <div key={key} className={`rounded-lg px-3 py-2 ${s.box}`} style={{ cursor: s.cursor }}>
            <div className="flex items-center justify-between">
              <AffordanceChip state={key} />
              <code className="text-[10px] text-ink-300">cursor: {s.cursor}</code>
            </div>
            <div className="mt-1 text-xs text-ink-500">{s.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Context({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-50 text-ink-500">
          <Icon size={16} />
        </span>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-ink-500">{subtitle}</div>
        </div>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

export default function InteractionSystem() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center gap-2 text-xs text-ink-500">
        <Link to="/" className="hover:text-ink-900">
          Dashboard
        </Link>
        <span>·</span>
        <span>Design system</span>
      </div>
      <h1 className="mt-1 text-2xl font-bold">Clickable vs. Editable</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-500">
        A tax return mixes AI output, extracted data, calculations, reviewer notes, and client
        answers on one screen: some editable, some awaiting approval, some permanently locked. This
        is the single visual language that keeps all of it legible. The states here are the exact
        same ones driving the live{" "}
        <Link to="/return/r_chen" className="text-brand-600 underline">
          return review
        </Link>
        .
      </p>

      <div className="mt-5">
        <Legend />
      </div>

      {/* Same vocabulary proven across three different screens */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Context
          icon={FileSpreadsheet}
          title="Return line items"
          subtitle="Income & deductions"
        >
          <AffordanceField state="verified" label="Wages (1a)" prefix="$" value={181250} />
          <AffordanceField state="ai" label="Taxable interest (2b)" prefix="$" value={1285} />
          <AffordanceField state="editable" label="Charitable gifts (Sch A)" prefix="$" value={2400} />
          <AffordanceField state="locked" label="AGI (11): calculated" prefix="$" value={186477} />
        </Context>

        <Context
          icon={ClipboardList}
          title="Client questionnaire"
          subtitle="Answers from the taxpayer"
        >
          <AffordanceField state="editable" label="Filing status" value="MFJ" />
          <AffordanceField state="editable" label="Dependents" value={2} />
          <AffordanceField state="approval" label="Home office claim" value="Yes" />
          <AffordanceField state="locked" label="SSN: on file" value="•••-••-4821" />
        </Context>

        <Context
          icon={MessageSquare}
          title="Reviewer & AI notes"
          subtitle="Comments and suggestions"
        >
          <AffordanceField state="ai" label="AI: verify escrow tax" value="Open" />
          <AffordanceField state="approval" label="Reviewer sign-off" value="Pending" />
          <AffordanceField state="clickable" label="Jump to 1098 source" value="View" />
          <AffordanceField state="verified" label="K-1 allocation OK" value="Cleared" />
        </Context>
      </div>

      <div className="mt-4 card border-ai-100 bg-ai-50/40 p-4 text-sm">
        <div className="font-semibold text-ai-600">Try it</div>
        <p className="mt-1 text-ink-500">
          The dashed <b className="text-ink-700">Editable</b> fields above are genuinely editable:
          click one and type. The grey <b className="text-ink-700">Read-only</b> fields refuse
          interaction (see the <code className="text-xs">not-allowed</code> cursor). The affordance
          isn't decoration: what looks interactive actually is.
        </p>
      </div>
    </div>
  );
}
