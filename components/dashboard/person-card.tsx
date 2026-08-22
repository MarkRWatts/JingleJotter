import { formatPence } from "@/lib/money";
import { PURCHASE_STATUSES, type PurchaseStatus } from "@/lib/domain";
import type { PersonSummary } from "@/lib/queries";
import { ProgressBar } from "./progress-bar";

const CHIP_LABELS: Record<PurchaseStatus, string> = {
  IDEA: "ideas",
  PURCHASED: "bought",
  ARRIVED: "arrived",
  WRAPPED: "wrapped",
};

export function PersonCard({ person }: { person: PersonSummary }) {
  const { name, allocatedPence, spentPence, statusCounts } = person;
  const hasBudget = allocatedPence > 0;
  const percent = hasBudget ? (spentPence / allocatedPence) * 100 : 0;
  const over = hasBudget && spentPence > allocatedPence;

  return (
    <div className={`flex flex-col gap-3 rounded-3xl p-5 shadow-sm ${over ? "bg-berry/10" : "bg-white"}`}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-base text-pine-deep">{name}</h3>
        <span className={`text-sm font-semibold ${over ? "text-berry" : "text-cocoa"}`}>
          {formatPence(spentPence)}
          {hasBudget && (
            <span className="font-normal text-cocoa-soft"> / {formatPence(allocatedPence)}</span>
          )}
        </span>
      </div>

      {hasBudget && <ProgressBar percent={percent} over={over} track="cream" />}

      <div className="flex flex-wrap gap-1.5">
        {PURCHASE_STATUSES.map((status) => (
          <span
            key={status}
            className="rounded-full bg-tag px-2.5 py-1 text-xs font-semibold text-cocoa-soft"
          >
            {statusCounts[status]} {CHIP_LABELS[status]}
          </span>
        ))}
      </div>
    </div>
  );
}
