// ---------------------------------------------------------------------------
// MOCK DATA: the "quick and dirty" fake backend.
// Everything the UI shows (returns, tasks, extracted values, source documents,
// traceability links, AI confidence + evidence) is hardcoded here. No OCR, no
// real AI, no server. See README for what's real vs simulated.
// ---------------------------------------------------------------------------

export const FIRM = { name: "Meridian Tax Partners", taxYear: 2025 };

export const PREPARERS = {
  u_riya: { id: "u_riya", name: "Riya Soni", initials: "RS", role: "Preparer" },
  u_dev: { id: "u_dev", name: "Devin Cole", initials: "DC", role: "Preparer" },
  u_amara: { id: "u_amara", name: "Amara Okafor", initials: "AO", role: "Reviewer" },
};

// ---- Source documents (fake OCR pages represented as structured lines) ------
// Each doc has "pages"; each page has "lines" we can highlight for traceability.
export const DOCUMENTS = {
  d_w2_acme: {
    id: "d_w2_acme",
    type: "W-2",
    title: "W-2: Acme Robotics Inc.",
    filename: "W2_AcmeRobotics_2025.pdf",
    uploadedBy: "client",
    uploadedAt: "2026-02-08",
    pages: [
      {
        page: 1,
        heading: "W-2 Wage and Tax Statement 2025",
        lines: [
          { box: "b", label: "Employer EIN", value: "84-1938472" },
          { box: "c", label: "Employer", value: "Acme Robotics Inc." },
          { box: "1", label: "Wages, tips, other comp.", value: "142,850.00", key: true },
          { box: "2", label: "Federal income tax withheld", value: "26,410.00", key: true },
          { box: "3", label: "Social security wages", value: "160,200.00" },
          { box: "4", label: "Social security tax withheld", value: "9,932.40" },
          { box: "5", label: "Medicare wages and tips", value: "148,900.00" },
          { box: "12a", label: "Code D: 401(k)", value: "6,050.00", key: true },
        ],
      },
    ],
  },
  d_w2_side: {
    id: "d_w2_side",
    type: "W-2",
    title: "W-2: Northwind Consulting LLC",
    filename: "W2_Northwind_2025.pdf",
    uploadedBy: "client",
    uploadedAt: "2026-02-09",
    pages: [
      {
        page: 1,
        heading: "W-2 Wage and Tax Statement 2025",
        lines: [
          { box: "c", label: "Employer", value: "Northwind Consulting LLC" },
          { box: "1", label: "Wages, tips, other comp.", value: "38,400.00", key: true },
          { box: "2", label: "Federal income tax withheld", value: "4,120.00", key: true },
        ],
      },
    ],
  },
  d_1099int: {
    id: "d_1099int",
    type: "1099-INT",
    title: "1099-INT: First Ridge Bank",
    filename: "1099INT_FirstRidge_2025.pdf",
    uploadedBy: "client",
    uploadedAt: "2026-02-10",
    pages: [
      {
        page: 1,
        heading: "1099-INT Interest Income 2025",
        lines: [
          { box: "payer", label: "Payer", value: "First Ridge Bank, N.A." },
          { box: "1", label: "Interest income", value: "1,284.55", key: true },
          { box: "4", label: "Federal income tax withheld", value: "0.00" },
        ],
      },
    ],
  },
  d_1099div: {
    id: "d_1099div",
    type: "1099-DIV",
    title: "1099-DIV: Vanguard Brokerage",
    filename: "1099DIV_Vanguard_2025.pdf",
    uploadedBy: "client",
    uploadedAt: "2026-02-11",
    pages: [
      {
        page: 1,
        heading: "1099-DIV Dividends and Distributions 2025",
        lines: [
          { box: "1a", label: "Total ordinary dividends", value: "3,942.18", key: true },
          { box: "1b", label: "Qualified dividends", value: "3,610.00", key: true },
          { box: "2a", label: "Total capital gain distr.", value: "1,120.44" },
        ],
      },
    ],
  },
  d_mortgage: {
    id: "d_mortgage",
    type: "1098",
    title: "1098: Summit Mortgage",
    filename: "1098_Summit_2025.pdf",
    uploadedBy: "client",
    uploadedAt: "2026-02-12",
    pages: [
      {
        page: 1,
        heading: "1098 Mortgage Interest Statement 2025",
        lines: [
          { box: "1", label: "Mortgage interest received", value: "18,240.00", key: true },
          { box: "5", label: "Mortgage insurance premiums", value: "0.00" },
          { box: "10", label: "Property taxes paid", value: "9,600.00", key: true },
        ],
      },
    ],
  },
};

// ---- AI extraction confidence buckets ---------------------------------------
export const CONFIDENCE = {
  high: { label: "High confidence", min: 0.95, tone: "verified" },
  medium: { label: "Needs a look", min: 0.8, tone: "warn" },
  low: { label: "Low confidence", min: 0, tone: "danger" },
};

export function confidenceBucket(score) {
  if (score >= CONFIDENCE.high.min) return "high";
  if (score >= CONFIDENCE.medium.min) return "medium";
  return "low";
}

// ---------------------------------------------------------------------------
// A tax return = a set of line "fields". Each field carries its own traceability
// (which document + page + line it came from) and its own AI metadata
// (confidence, evidence, reasoning, and any transform applied).
// ---------------------------------------------------------------------------

function field(f) {
  return {
    status: "ai_suggested", // ai_suggested | verified | edited | locked
    ...f,
  };
}

export const RETURNS = {
  r_chen: {
    id: "r_chen",
    client: "Jordan & Priya Chen",
    entity: "1040: Married Filing Jointly",
    taxYear: 2025,
    preparerId: "u_riya",
    stage: "review", // intake | docs | preparation | review | client_signoff | filed
    dueDate: "2026-04-15",
    refundEstimate: 3120,
    // used by dashboard prioritization
    openItems: 2,
    lowConfidenceCount: 1,
    blocked: false,
    lastActivity: "2026-03-18T14:20:00",
    fields: [
      field({
        id: "f_wages",
        line: "1a",
        label: "Wages (W-2 box 1)",
        value: 181250,
        aiValue: 181250,
        confidence: 0.97,
        editable: true,
        transform: {
          summary: "Sum of Box 1 across 2 W-2 forms",
          steps: [
            { doc: "d_w2_acme", label: "Acme Robotics: Box 1", amount: 142850 },
            { doc: "d_w2_side", label: "Northwind Consulting: Box 1", amount: 38400 },
          ],
          op: "+",
          result: 181250,
        },
        sources: [
          { doc: "d_w2_acme", page: 1, box: "1" },
          { doc: "d_w2_side", page: 1, box: "1" },
        ],
        reasoning:
          "Two W-2s were uploaded under this SSN. I added Box 1 from each. Both boxes were read clearly, so confidence is high.",
      }),
      field({
        id: "f_withholding",
        line: "25a",
        label: "Federal tax withheld",
        value: 30530,
        aiValue: 30530,
        confidence: 0.96,
        editable: true,
        transform: {
          summary: "Sum of Box 2 across 2 W-2 forms",
          steps: [
            { doc: "d_w2_acme", label: "Acme Robotics: Box 2", amount: 26410 },
            { doc: "d_w2_side", label: "Northwind Consulting: Box 2", amount: 4120 },
          ],
          op: "+",
          result: 30530,
        },
        sources: [
          { doc: "d_w2_acme", page: 1, box: "2" },
          { doc: "d_w2_side", page: 1, box: "2" },
        ],
        reasoning: "Added federal withholding (Box 2) from both W-2s.",
      }),
      field({
        id: "f_interest",
        line: "2b",
        label: "Taxable interest",
        value: 1285,
        aiValue: 1284.55,
        confidence: 0.82,
        editable: true,
        transform: {
          summary: "1099-INT Box 1, rounded to nearest dollar",
          steps: [{ doc: "d_1099int", label: "First Ridge Bank: Box 1", amount: 1284.55 }],
          op: "round",
          result: 1285,
        },
        sources: [{ doc: "d_1099int", page: 1, box: "1" }],
        reasoning:
          "Read $1,284.55 from the 1099-INT and rounded to $1,285 per IRS whole-dollar rules. Flagged for a look because the scan of the cents was slightly blurry.",
        warning: "The cents digits were faint on the scan: worth a 2-second confirm.",
      }),
      field({
        id: "f_dividends",
        line: "3b",
        label: "Ordinary dividends",
        value: 3942,
        aiValue: 3942.18,
        confidence: 0.94,
        editable: true,
        transform: {
          summary: "1099-DIV Box 1a, rounded",
          steps: [{ doc: "d_1099div", label: "Vanguard: Box 1a", amount: 3942.18 }],
          op: "round",
          result: 3942,
        },
        sources: [{ doc: "d_1099div", page: 1, box: "1a" }],
        reasoning: "Ordinary dividends from the Vanguard 1099-DIV, Box 1a.",
      }),
      field({
        id: "f_mortint",
        line: "Sch A 8a",
        label: "Home mortgage interest",
        value: 18240,
        aiValue: 18240,
        confidence: 0.99,
        editable: true,
        transform: {
          summary: "1098 Box 1, taken as-is",
          steps: [{ doc: "d_mortgage", label: "Summit Mortgage: Box 1", amount: 18240 }],
          op: "=",
          result: 18240,
        },
        sources: [{ doc: "d_mortgage", page: 1, box: "1" }],
        reasoning: "Mortgage interest from the 1098, Box 1. Clean scan, exact match.",
      }),
      field({
        id: "f_proptax",
        line: "Sch A 5b",
        label: "State & local property taxes",
        value: 9600,
        aiValue: 9600,
        confidence: 0.72,
        editable: true,
        transform: {
          summary: "1098 Box 10 (property taxes paid via escrow)",
          steps: [{ doc: "d_mortgage", label: "Summit Mortgage: Box 10", amount: 9600 }],
          op: "=",
          result: 9600,
        },
        sources: [{ doc: "d_mortgage", page: 1, box: "10" }],
        reasoning:
          "Pulled property taxes from the 1098 escrow box. Low confidence: escrow-reported taxes are sometimes the amount collected, not the amount actually paid to the county. Recommend confirming with the client.",
        warning:
          "Escrow box amounts can differ from taxes actually paid. This also affects the $10k SALT cap.",
      }),
      field({
        id: "f_agi",
        line: "11",
        label: "Adjusted gross income",
        value: 186477,
        aiValue: 186477,
        confidence: 1.0,
        editable: false,
        locked: true,
        lockReason: "Calculated by the return engine from income lines above. Edit the source lines to change this.",
        transform: {
          summary: "Wages + Interest + Dividends − Adjustments",
          steps: [
            { label: "Wages", amount: 181250 },
            { label: "Taxable interest", amount: 1285 },
            { label: "Ordinary dividends", amount: 3942 },
          ],
          op: "+",
          result: 186477,
        },
        sources: [],
        reasoning: "System-calculated total. Not directly editable.",
      }),
    ],
  },

  r_alvarez: {
    id: "r_alvarez",
    client: "Marcus Alvarez",
    entity: "1040: Single",
    taxYear: 2025,
    preparerId: "u_riya",
    stage: "preparation",
    dueDate: "2026-04-15",
    refundEstimate: -2450,
    openItems: 4,
    lowConfidenceCount: 3,
    blocked: true,
    blockReason: "Waiting on client: missing 1099-B (brokerage sales)",
    lastActivity: "2026-03-17T09:05:00",
    fields: [],
  },
  r_okwu: {
    id: "r_okwu",
    client: "Okwu Family Trust",
    entity: "1041: Trust",
    taxYear: 2025,
    preparerId: "u_dev",
    stage: "review",
    dueDate: "2026-04-15",
    refundEstimate: 0,
    openItems: 1,
    lowConfidenceCount: 0,
    blocked: false,
    lastActivity: "2026-03-18T11:40:00",
    fields: [],
  },
  r_bello: {
    id: "r_bello",
    client: "Bello Consulting LLC",
    entity: "1120-S: S-Corp",
    taxYear: 2025,
    preparerId: "u_riya",
    stage: "client_signoff",
    dueDate: "2026-03-15",
    refundEstimate: 0,
    openItems: 0,
    lowConfidenceCount: 0,
    blocked: false,
    lastActivity: "2026-03-16T16:10:00",
    fields: [],
  },
  r_nakamura: {
    id: "r_nakamura",
    client: "Yuki Nakamura",
    entity: "1040: Single",
    taxYear: 2025,
    preparerId: "u_riya",
    stage: "docs",
    dueDate: "2026-04-15",
    refundEstimate: 890,
    openItems: 6,
    lowConfidenceCount: 0,
    blocked: true,
    blockReason: "Missing documents: 3 requested, 0 received",
    lastActivity: "2026-03-12T13:00:00",
    fields: [],
  },
  r_fitzgerald: {
    id: "r_fitzgerald",
    client: "Fitzgerald & Wong",
    entity: "1040: Married Filing Jointly",
    taxYear: 2025,
    preparerId: "u_dev",
    stage: "filed",
    dueDate: "2026-04-15",
    refundEstimate: 5210,
    openItems: 0,
    lowConfidenceCount: 0,
    blocked: false,
    lastActivity: "2026-03-10T10:30:00",
    fields: [],
  },
};

// ---- Stage metadata: the shared vocabulary (Challenge 06 seed, reused) -------
export const STAGES = [
  { id: "intake", label: "Intake", clientLabel: "Getting started" },
  { id: "docs", label: "Documents", clientLabel: "Collecting your documents" },
  { id: "preparation", label: "Preparation", clientLabel: "We're preparing your return" },
  { id: "review", label: "Review", clientLabel: "Final review" },
  { id: "client_signoff", label: "Client sign-off", clientLabel: "Your approval needed" },
  { id: "filed", label: "Filed", clientLabel: "Filed with the IRS" },
];

export function stageIndex(id) {
  return STAGES.findIndex((s) => s.id === id);
}

// ---------------------------------------------------------------------------
// Tasks: the atomic units of "what should I work on right now" (Challenge 07)
// ---------------------------------------------------------------------------
export const TASKS = [
  {
    id: "t1",
    returnId: "r_chen",
    title: "Confirm property tax amount (SALT cap risk)",
    kind: "ai_flag",
    urgency: "high",
    owner: "preparer",
    dueDate: "2026-03-20",
    fieldId: "f_proptax",
    note: "AI flagged escrow vs. paid discrepancy.",
  },
  {
    id: "t2",
    returnId: "r_chen",
    title: "Verify taxable interest ($1,285)",
    kind: "ai_flag",
    urgency: "medium",
    owner: "preparer",
    dueDate: "2026-03-21",
    fieldId: "f_interest",
    note: "Blurry cents on 1099-INT scan.",
  },
  {
    id: "t3",
    returnId: "r_alvarez",
    title: "Client hasn't uploaded 1099-B",
    kind: "blocked",
    urgency: "high",
    owner: "client",
    dueDate: "2026-03-19",
    note: "Return blocked until brokerage sales arrive.",
  },
  {
    id: "t4",
    returnId: "r_bello",
    title: "S-Corp return awaiting client signature",
    kind: "waiting",
    urgency: "high",
    owner: "client",
    dueDate: "2026-03-15",
    note: "Deadline was 3/15: follow up today.",
  },
  {
    id: "t5",
    returnId: "r_okwu",
    title: "Reviewer question on trust K-1 allocation",
    kind: "question",
    urgency: "medium",
    owner: "preparer",
    dueDate: "2026-03-22",
    note: "Amara left a review comment.",
  },
  {
    id: "t6",
    returnId: "r_nakamura",
    title: "Send document reminder (3 outstanding)",
    kind: "blocked",
    urgency: "low",
    owner: "preparer",
    dueDate: "2026-03-25",
    note: "No documents received in 6 days.",
  },
];

export const URGENCY_WEIGHT = { high: 3, medium: 2, low: 1 };
