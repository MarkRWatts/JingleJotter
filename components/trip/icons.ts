// Icon-per-type mapping shared between ItemRow and MealPlaceholder, so both
// the booked-row and the "nothing booked yet" placeholder for the same slot
// show the same glyph.

import {
  BedDouble,
  Croissant,
  Sandwich,
  UtensilsCrossed,
  TrainFront,
  Ticket,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import type { TripItemType, MealSlot } from "@/lib/trip";

export const MEAL_SLOT_ICONS: Record<MealSlot, LucideIcon> = {
  BREAKFAST: Croissant,
  LUNCH: Sandwich,
  DINNER: UtensilsCrossed,
};

/** The glyph for an itinerary item — meals vary by slot (falls back to
 *  UtensilsCrossed for a meal with no slot yet), everything else is fixed
 *  per type. Indexed directly (not called) at each use site so it reads as
 *  a plain lookup rather than a component built during render. */
export const ITEM_TYPE_ICONS: Record<TripItemType, LucideIcon> = {
  HOTEL: BedDouble,
  MEAL: UtensilsCrossed,
  TRAVEL: TrainFront,
  ACTIVITY: Ticket,
  OTHER: MapPin,
};
