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

  const totalPurchases = PURCHASE_STATUSES.reduce((sum, status) => sum + statusCounts[status], 0);
  const allWrapped = totalPurchases > 0 && statusCounts.WRAPPED === totalPurchases;

  return (
    <div
      className={`gift-tag-card gift-tag-shape relative flex flex-col gap-3 p-5 shadow-sm ${
        over ? "gift-tag-card--over" : "bg-tag"
      }`}
    >
      {/* Punched hole + string, tucked into the clipped corner */}
      <div className="pointer-events-none absolute left-2 top-2 h-8 w-8" aria-hidden="true">
        <svg viewBox="0 0 32 32" className="absolute inset-0 h-full w-full overflow-visible">
          <path
            d="M14 14 Q4 8 -6 -6"
            fill="none"
            stroke="var(--cocoa-soft)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
        <span className="absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded-full bg-cream ring-1 ring-inset ring-cocoa-soft/40" />
      </div>

      <div className="flex items-baseline justify-between gap-2 pl-3">
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
            className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-cocoa-soft"
          >
            {statusCounts[status]} {CHIP_LABELS[status]}
          </span>
        ))}
      </div>

      {allWrapped && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-pine">
          <svg aria-hidden="true" viewBox="0 0 32 24" className="h-4 w-5 shrink-0">
            <path
              d="M16 12 C13 4 4 3 4 9 C4 14 11 14.5 16 12 Z"
              fill="var(--berry)"
              stroke="var(--berry-deep)"
              strokeWidth="1"
            />
            <path
              d="M16 12 C19 4 28 3 28 9 C28 14 21 14.5 16 12 Z"
              fill="var(--berry)"
              stroke="var(--berry-deep)"
              strokeWidth="1"
            />
            <path
              d="M15 13 C13 17 12 19 10 21 M17 13 C19 17 20 19 22 21"
              stroke="var(--pine)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="16" cy="12" r="3" fill="var(--berry-deep)" />
          </svg>
          All wrapped!
        </p>
      )}
    </div>
  );
}
