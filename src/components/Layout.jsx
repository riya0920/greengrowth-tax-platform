import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Sparkles, Search, Palette, CornerDownLeft } from "lucide-react";
import { FIRM, PREPARERS, RETURNS, DOCUMENTS } from "../data/mockData";

const me = PREPARERS.u_riya;

// Map each source document to the first return + field that cites it, so a
// document hit deep-links straight to the number it backs.
const DOC_LINK = {};
Object.values(RETURNS).forEach((r) =>
  (r.fields || []).forEach((f) =>
    (f.sources || []).forEach((s) => {
      if (!DOC_LINK[s.doc]) DOC_LINK[s.doc] = `/return/${r.id}?field=${f.id}`;
    })
  )
);

// Flatten returns, their fields, and source documents into one searchable
// index. Small on purpose — 6 returns, 7 fields, 5 docs — so a plain substring
// match is plenty, and every hit deep-links somewhere real.
const SEARCH_INDEX = [
  ...Object.values(RETURNS).flatMap((r) => [
    { kind: "Return", title: r.client, sub: r.entity, to: `/return/${r.id}` },
    ...(r.fields || []).map((f) => ({
      kind: "Field",
      title: f.label,
      sub: `${r.client} · line ${f.line}`,
      to: `/return/${r.id}?field=${f.id}`,
    })),
  ]),
  ...Object.values(DOCUMENTS)
    .filter((d) => DOC_LINK[d.id])
    .map((d) => ({ kind: "Document", title: d.title, sub: d.filename, to: DOC_LINK[d.id] })),
];

// Global search — the affordance is honest: it looks interactive and it is.
function GlobalSearch() {
  const nav = useNavigate();
  const inputRef = useRef(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  // "/" focuses search from anywhere (unless already typing in a field).
  useEffect(() => {
    const onKey = (e) => {
      const typing = ["INPUT", "TEXTAREA"].includes(e.target.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return SEARCH_INDEX.filter(
      (i) => i.title.toLowerCase().includes(term) || i.sub.toLowerCase().includes(term)
    ).slice(0, 7);
  }, [q]);

  const go = (to) => {
    nav(to);
    setQ("");
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-ink-500 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/15">
        <Search size={15} />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) go(results[0].to);
            if (e.key === "Escape") {
              setQ("");
              e.currentTarget.blur();
            }
          }}
          placeholder="Search returns, clients, documents…"
          className="w-full bg-transparent text-ink-900 placeholder:text-ink-500 focus:outline-none"
        />
        <kbd className="hidden rounded bg-slate-100 px-1.5 text-[10px] text-ink-500 sm:inline">/</kbd>
      </div>

      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-pop">
          {results.length === 0 ? (
            <div className="px-3 py-3 text-xs text-ink-500">No matches for “{q}”.</div>
          ) : (
            results.map((r) => (
              <button
                key={r.to}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(r.to)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-brand-50"
              >
                <span className="pill bg-slate-100 text-[10px] text-ink-500">{r.kind}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink-900">{r.title}</span>
                  <span className="block truncate text-xs text-ink-500">{r.sub}</span>
                </span>
                <CornerDownLeft size={13} className="shrink-0 text-ink-300" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive ? "bg-brand-50 text-brand-700" : "text-ink-500 hover:bg-slate-100 hover:text-ink-900"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const loc = useLocation();
  const onReview = loc.pathname.startsWith("/return");
  return (
    <div className="flex h-full">
      {/* Sidebar — global navigation */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-3 md:flex">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight">{FIRM.name}</div>
            <div className="text-xs text-ink-500">Tax Year {FIRM.taxYear}</div>
          </div>
        </div>
        <nav className="mt-2 flex flex-col gap-1">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/return/r_chen" icon={FileText} label="Chen — Return" />
          <NavItem to="/system" icon={Palette} label="Interaction System" />
        </nav>
        <div className="mt-auto flex items-center gap-2 rounded-lg border border-slate-200 p-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-ink-900 text-xs font-semibold text-white">
            {me.initials}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold">{me.name}</div>
            <div className="text-[11px] text-ink-500">{me.role}</div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-2.5 backdrop-blur">
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-2 text-xs text-ink-500">
            {onReview ? "Return review" : "Firm workspace"}
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
