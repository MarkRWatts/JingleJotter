// Plain, serializable shapes handed from app/trip/page.tsx (server) down to
// the client components below — dates flattened to "YYYY-MM-DD" strings so
// every component can compare/format them the same way (see ./format.ts).

import type { TripItemType, MealSlot } from "@/lib/trip";

export type TripItemData = {
  id: string;
  type: TripItemType;
  title: string;
  /** "YYYY-MM-DD", or null when unscheduled. */
  date: string | null;
  mealSlot: MealSlot | null;
  time: string | null;
  venue: string | null;
  booked: boolean;
  notes: string | null;
  /** Confirmation/booking reference — any item type, not just hotels. */
  reference: string | null;
};

export type DayOption = {
  /** "YYYY-MM-DD" — the value used in <select> options and query params. */
  key: string;
  label: string;
};

/** A geocoded TripItem, ready to plot — see components/trip/TripMap.tsx. */
export type MapMarkerData = {
  id: string;
  type: TripItemType;
  title: string;
  venue: string | null;
  time: string | null;
  booked: boolean;
  lat: number;
  lng: number;
};
