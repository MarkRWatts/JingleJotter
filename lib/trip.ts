// City-break itinerary domain: item types, meal slots, and the expected-meal
// grid derived from the trip's dates (arrival-day dinner, full-day
// breakfast/lunch/dinner, departure-day breakfast).

export const TRIP_ITEM_TYPES = [
  "HOTEL",
  "MEAL",
  "TRAVEL",
  "ACTIVITY",
  "OTHER",
] as const;
export type TripItemType = (typeof TRIP_ITEM_TYPES)[number];

export const TRIP_ITEM_TYPE_LABELS: Record<TripItemType, string> = {
  HOTEL: "Hotel",
  MEAL: "Meal",
  TRAVEL: "Travel",
  ACTIVITY: "Activity",
  OTHER: "Other",
};

export const MEAL_SLOTS = ["BREAKFAST", "LUNCH", "DINNER"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

/** Days of the trip as UTC-midnight dates, inclusive of both ends. */
export function tripDays(startDate: Date, endDate: Date): Date[] {
  const days: Date[] = [];
  const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

/** The meals a day of the trip is expected to cover: dinner on arrival day,
 *  everything on full days, breakfast on departure day. A one-day trip gets
 *  just dinner. */
export function expectedMealSlots(day: Date, startDate: Date, endDate: Date): MealSlot[] {
  const days = tripDays(startDate, endDate);
  const isFirst = day.getTime() === days[0]?.getTime();
  const isLast = day.getTime() === days[days.length - 1]?.getTime();
  if (isFirst && isLast) return ["DINNER"];
  if (isFirst) return ["DINNER"];
  if (isLast) return ["BREAKFAST"];
  return ["BREAKFAST", "LUNCH", "DINNER"];
}
