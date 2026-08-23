import { formatPence } from "@/lib/money";
import type { CategorySummary } from "@/lib/queries";
import { ProgressBar } from "./progress-bar";

export function CategoryCard({
  category,
  lastYearSpentPence,
}: {
  category: CategorySummary;
  /** Same-kind actual spend from the previous season; undefined = no predecessor/data. */
  lastYearSpentPence?: number;
}) {
  const { name, budgetPence, spentPence, plannedPence } = category;
  const hasBudget = budgetPence > 0;
  const percent = hasBudget ? (spentPence / budgetPence) * 100 : 0;
  const over = hasBudget && spentPence > budgetPence;
  const remainingPence = budgetPence - spentPence;
  const totalWithPlannedPence = spentPence + plannedPence;
  // What's left once ideas are counted too — the budget not yet assigned
  // to any purchase, bought or merely planned.
  const unassignedPence = budgetPence - totalWithPlannedPence;

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-base text-pine-deep">{name}</h3>
        {hasBudget && (
          <span className={`text-xs font-semibold ${over ? "text-berry" : "text-cocoa-soft"}`}>
            {Math.round(percent)}%
          </span>
        )}
      </div>

      {hasBudget ? (
        <>
          <ProgressBar percent={percent} over={over} track="cream" />
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-cocoa">{formatPence(spentPence)}</span>
            <span className="text-cocoa-soft">of {formatPence(budgetPence)}</span>
          </div>
          <p className={`text-xs ${over ? "font-semibold text-berry" : "text-cocoa-soft"}`}>
            {over
              ? `${formatPence(Math.abs(remainingPence))} over budget`
              : plannedPence > 0
                ? // With ideas in play the planned line below carries the
                  // left-to-allocate figure; this one is spend-only.
                  `${formatPence(remainingPence)} remaining`
                : `${formatPence(remainingPence)} left to allocate`}
          </p>
        </>
      ) : (
        <p className="text-sm font-semibold text-cocoa">{formatPence(spentPence)} spent</p>
      )}

      {plannedPence > 0 && (
        <p className="text-xs text-cocoa-soft">
          + {formatPence(plannedPence)} planned ·{" "}
          {!hasBudget ? (
            `${formatPence(totalWithPlannedPence)} envisioned`
          ) : unassignedPence >= 0 ? (
            `${formatPence(unassignedPence)} left to allocate`
          ) : (
            <span className="font-semibold text-berry">
              {formatPence(-unassignedPence)} over if every idea lands
            </span>
          )}
        </p>
      )}

      {lastYearSpentPence !== undefined && (
        <p className="text-xs text-cocoa-soft">last year: {formatPence(lastYearSpentPence)}</p>
      )}
    </div>
  );
}
