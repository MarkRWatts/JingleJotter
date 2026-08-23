// Shared formatting/logic for the "expected by" delivery-nudge chips, used by
// PurchaseRow, PurchaseCard, and the dashboard's in-transit card.

const DUE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** "Sat 20 Dec" */
export function formatDue(expectedBy: string): string {
  return DUE_FORMAT.format(new Date(expectedBy));
}

/** Only a still-PURCHASED item can be overdue — once it's ARRIVED/WRAPPED the
 *  expected-by date is no longer meaningful (see schema.prisma comment). */
export function isOverdue(expectedBy: string, status: string): boolean {
  if (status !== "PURCHASED") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(expectedBy) < today;
}
