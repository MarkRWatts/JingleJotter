import { ItemRow } from "./ItemRow";
import { MealPlaceholder } from "./MealPlaceholder";
import { formatDayHeading } from "./format";
import type { MealSlot } from "@/lib/trip";
import type { DayOption, TripItemData } from "./types";

export function DayCard({
  day,
  roleNote,
  nonMealItems,
  mealSlots,
  extraMeals,
  days,
  readOnly = false,
}: {
  day: Date;
  roleNote: string | null;
  nonMealItems: TripItemData[];
  mealSlots: { slot: MealSlot; item: TripItemData | null }[];
  extraMeals: TripItemData[];
  days: DayOption[];
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-baseline gap-2">
        <h3 className="font-display text-lg text-pine-deep">{formatDayHeading(day)}</h3>
        {roleNote && (
          <span className="rounded-full bg-tag px-2.5 py-0.5 text-xs font-semibold text-cocoa-soft">
            {roleNote}
          </span>
        )}
      </div>

      {nonMealItems.length > 0 && (
        <div className="flex flex-col gap-2">
          {nonMealItems.map((item) => (
            <ItemRow key={item.id} item={item} days={days} readOnly={readOnly} />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {mealSlots.map(({ slot, item }) => {
          if (item) return <ItemRow key={item.id} item={item} days={days} readOnly={readOnly} />;
          if (readOnly) return null;
          return <MealPlaceholder key={slot} date={day} slot={slot} />;
        })}
        {extraMeals.map((item) => (
          <ItemRow key={item.id} item={item} days={days} readOnly={readOnly} />
        ))}
      </div>

      {nonMealItems.length === 0 && mealSlots.length === 0 && extraMeals.length === 0 && (
        <p className="text-sm text-cocoa-soft">Nothing planned for this day yet.</p>
      )}
    </div>
  );
}
