// Date/label formatting shared across the trip components. All formatters
// read fields with the `timeZone: "UTC"` option so that the UTC-midnight
// Dates lib/trip.ts hands back render the same day everywhere, regardless
// of the server's local timezone.

import { MEAL_SLOT_LABELS, type MealSlot } from "@/lib/trip";

const WEEKDAY_SHORT = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
const WEEKDAY_LONG = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" });
const DAY_NUM = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "UTC" });
const MONTH_SHORT = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });
const MONTH_LONG = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" });

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** "2026-12-12" style key for matching a TripItem's date to a trip day. */
export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "Friday 12 December" — a day card's heading. */
export function formatDayHeading(date: Date): string {
  return `${WEEKDAY_LONG.format(date)} ${DAY_NUM.format(date)} ${MONTH_LONG.format(date)}`;
}

/** "Friday 12 Dec" — compact enough for a <select> option label. */
export function formatDayOptionLabel(date: Date): string {
  return `${WEEKDAY_LONG.format(date)} ${DAY_NUM.format(date)} ${MONTH_SHORT.format(date)}`;
}

/** "Fri 11 – Sun 13 Dec · 2 nights" (or "Fri 28 Nov – Sun 1 Dec · …" when the
 *  range crosses a month boundary). */
export function formatDateRangeLabel(start: Date, end: Date): string {
  const startLabel = `${WEEKDAY_SHORT.format(start)} ${DAY_NUM.format(start)}`;
  const endLabel = `${WEEKDAY_SHORT.format(end)} ${DAY_NUM.format(end)}`;
  const sameMonth =
    start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear();
  const nights = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
  const nightsLabel = `${nights} night${nights === 1 ? "" : "s"}`;

  const range = sameMonth
    ? `${startLabel} – ${endLabel} ${MONTH_SHORT.format(end)}`
    : `${startLabel} ${MONTH_SHORT.format(start)} – ${endLabel} ${MONTH_SHORT.format(end)}`;

  return `${range} · ${nightsLabel}`;
}

/** "Saturday dinner" — used in the unbooked-meal placeholder row. */
export function formatMealPlaceholderLabel(date: Date, slot: MealSlot): string {
  return `${WEEKDAY_LONG.format(date)} ${MEAL_SLOT_LABELS[slot].toLowerCase()}`;
}

/** Whether a trip day is the arrival day, departure day, both (a one-day
 *  trip), or neither — for the small role note under a day card's heading. */
export function dayRoleNote(day: Date, days: Date[]): string | null {
  const isFirst = day.getTime() === days[0]?.getTime();
  const isLast = day.getTime() === days[days.length - 1]?.getTime();
  if (isFirst && isLast) return "arrival & departure day";
  if (isFirst) return "arrival day";
  if (isLast) return "departure day";
  return null;
}
