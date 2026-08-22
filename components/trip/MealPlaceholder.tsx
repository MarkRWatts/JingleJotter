import Link from "next/link";
import { MEAL_SLOT_ICONS } from "./icons";
import { formatMealPlaceholderLabel } from "./format";
import type { MealSlot } from "@/lib/trip";

/** An expected meal slot with nothing booked yet — links into the add-item
 *  form pre-filled via query params (?add=MEAL&date=...&slot=...), which
 *  app/trip/page.tsx reads back out to default the form's fields. */
export function MealPlaceholder({ date, slot }: { date: Date; slot: MealSlot }) {
  const Icon = MEAL_SLOT_ICONS[slot];
  const dateParam = date.toISOString().slice(0, 10);

  return (
    <Link
      href={`/trip?add=MEAL&date=${dateParam}&slot=${slot}#add-item-form`}
      className="flex items-center gap-3 rounded-2xl border border-dashed border-amber bg-amber/5 px-4 py-3 text-sm text-cocoa transition hover:bg-amber/10"
    >
      <Icon className="h-4 w-4 shrink-0 text-amber" aria-hidden />
      <span>
        {formatMealPlaceholderLabel(date, slot)}
        <span className="text-cocoa-soft"> — nowhere booked yet</span>
      </span>
    </Link>
  );
}
