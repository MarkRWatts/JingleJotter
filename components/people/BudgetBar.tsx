export function BudgetBar({
  spentPence,
  budgetPence,
}: {
  spentPence: number;
  budgetPence: number;
}) {
  if (budgetPence <= 0) return null;
  const pct = Math.min(100, Math.round((spentPence / budgetPence) * 100));
  const over = spentPence > budgetPence;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-cream">
      <div
        className={`h-full rounded-full ${over ? "bg-berry" : "bg-pine"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
