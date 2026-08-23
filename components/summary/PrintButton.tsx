"use client";

import { Printer } from "lucide-react";

/** Triggers the browser print dialog — paired with the page's local
 *  @media print rules. Hidden from the printed output itself. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden flex items-center gap-1.5 rounded-full bg-berry px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep"
    >
      <Printer size={15} />
      Print / save as PDF
    </button>
  );
}
