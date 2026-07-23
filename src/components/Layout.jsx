import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Sparkles, Search, Palette } from "lucide-react";
import { FIRM, PREPARERS } from "../data/mockData";

const me = PREPARERS.u_riya;

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
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-ink-500">
            <Search size={15} />
            <span className="hidden sm:inline">Search returns, clients, documents…</span>
            <kbd className="ml-2 hidden rounded bg-slate-100 px-1.5 text-[10px] text-ink-500 sm:inline">/</kbd>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-ink-500">
            {onReview ? "Return review" : "Firm workspace"}
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
