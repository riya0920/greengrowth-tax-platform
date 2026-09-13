import { FileText } from "lucide-react";
import { DOCUMENTS } from "../data/mockData";

// Renders a fake source document as structured, highlightable lines.
// `highlight` = { doc, page, box } tells us which line to spotlight so a return
// field can point at the exact box it was extracted from (Challenge 01).
export default function DocumentViewer({ docId, highlightBox }) {
  const doc = DOCUMENTS[docId];
  if (!doc) {
    return (
      <div className="grid h-full place-items-center text-sm text-ink-500">
        Select a field to see its source document.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5">
        <FileText size={15} className="text-ink-500" />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{doc.title}</div>
          <div className="truncate text-[11px] text-ink-500">
            {doc.filename} · uploaded {doc.uploadedAt} by {doc.uploadedBy}
          </div>
        </div>
        <span className="pill ml-auto bg-slate-100 text-ink-500">{doc.type}</span>
      </div>

      <div className="flex-1 overflow-auto bg-slate-100 p-4">
        {doc.pages.map((p) => (
          <div key={p.page} className="mx-auto max-w-md">
            {/* fake "paper" */}
            <div className="rounded-lg border border-slate-300 bg-white p-5 shadow-card">
              <div className="mb-3 border-b border-dashed border-slate-300 pb-2">
                <div className="text-[10px] uppercase tracking-wide text-ink-300">Page {p.page}</div>
                <div className="text-sm font-bold">{p.heading}</div>
              </div>
              <table className="w-full text-[13px]">
                <tbody>
                  {p.lines.map((ln) => {
                    const isHit = highlightBox && ln.box === highlightBox;
                    return (
                      <tr
                        key={ln.box}
                        className={`transition ${
                          isHit ? "bg-brand-50 outline outline-2 outline-brand-500 animate-fade-in" : ""
                        }`}
                      >
                        <td className="w-8 py-1 align-top text-[10px] font-mono text-ink-300">{ln.box}</td>
                        <td className="py-1 pr-2 align-top text-ink-500">{ln.label}</td>
                        <td
                          className={`py-1 text-right font-mono align-top ${
                            isHit ? "font-bold text-brand-700" : ln.key ? "font-semibold text-ink-900" : "text-ink-700"
                          }`}
                        >
                          {ln.value}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {highlightBox && (
              <div className="mt-2 text-center text-[11px] text-brand-600">
                Highlighted: Box {highlightBox}, the exact figure this return line was pulled from
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
