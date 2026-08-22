import { redirect } from "next/navigation";
import Link from "next/link";
import { Luggage, MapPin } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolveSeason } from "@/lib/season";
import { isActualSpend } from "@/lib/domain";
import {
  tripDays,
  expectedMealSlots,
  TRIP_ITEM_TYPES,
  MEAL_SLOTS,
  type TripItemType,
  type MealSlot,
} from "@/lib/trip";
import { TripHeader } from "@/components/trip/TripHeader";
import { TripSetupForm } from "@/components/trip/TripSetupForm";
import { DayCard } from "@/components/trip/DayCard";
import { ItemRow } from "@/components/trip/ItemRow";
import { AddItemForm } from "@/components/trip/AddItemForm";
import { TraditionCard } from "@/components/trip/TraditionCard";
import { TripMap } from "@/components/trip/TripMap";
import { HotelSection } from "@/components/trip/HotelSection";
import { dateKey, formatDayOptionLabel, dayRoleNote } from "@/components/trip/format";
import type { DayOption, MapMarkerData, TripItemData } from "@/components/trip/types";

function isTripItemType(value: unknown): value is TripItemType {
  return typeof value === "string" && (TRIP_ITEM_TYPES as readonly string[]).includes(value);
}

function isMealSlot(value: unknown): value is MealSlot {
  return typeof value === "string" && (MEAL_SLOTS as readonly string[]).includes(value);
}

function timeToMinutes(time: string | null): number {
  if (!time) return Number.POSITIVE_INFINITY;
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return Number.POSITIVE_INFINITY;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

function compareItems(a: TripItemData, b: TripItemData): number {
  const timeDiff = timeToMinutes(a.time) - timeToMinutes(b.time);
  if (timeDiff !== 0) return timeDiff;
  return a.title.localeCompare(b.title);
}

/** A TripItem needs a date AND (if it's a meal) a slot before it can be
 *  placed into a day card's grid — anything short of that lands in the
 *  Unscheduled card at the end instead. */
function isUnscheduled(item: TripItemData): boolean {
  if (!item.date) return true;
  if (item.type === "MEAL" && !item.mealSlot) return true;
  return false;
}

export default async function TripPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; add?: string; date?: string; slot?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { year, add, date, slot } = await searchParams;
  const season = await resolveSeason(year);

  if (!season) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <Luggage className="h-10 w-10 text-berry" aria-hidden />
        <h1 className="font-display text-2xl text-pine-deep">No Christmas season yet</h1>
        <p className="text-sm text-cocoa-soft">
          Set up a season first, then come back to plan the city break.
        </p>
        <Link
          href="/seasons"
          className="rounded-full bg-berry px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep"
        >
          Go to Seasons
        </Link>
      </div>
    );
  }

  const trip = await prisma.trip.findUnique({ where: { seasonId: season.id } });

  if (!trip) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6">
        <TripSetupForm seasonId={season.id} year={season.year} />
      </div>
    );
  }

  const [itemsRaw, cityBreakCategory] = await Promise.all([
    prisma.tripItem.findMany({ where: { tripId: trip.id } }),
    prisma.category.findFirst({ where: { seasonId: season.id, kind: "CITY_BREAK" } }),
  ]);

  let spentPence = 0;
  if (cityBreakCategory) {
    const catPurchases = await prisma.purchase.findMany({
      where: { categoryId: cityBreakCategory.id },
      select: { pricePence: true, status: true },
    });
    spentPence = catPurchases.reduce(
      (sum, p) => (isActualSpend(p.status) ? sum + p.pricePence : sum),
      0,
    );
  }

  const items: TripItemData[] = itemsRaw.map((i) => ({
    id: i.id,
    type: i.type as TripItemType,
    title: i.title,
    date: i.date ? dateKey(i.date) : null,
    mealSlot: i.mealSlot as MealSlot | null,
    time: i.time,
    venue: i.venue,
    booked: i.booked,
    notes: i.notes,
    reference: i.reference,
  }));

  const days = tripDays(trip.startDate, trip.endDate);
  const dayOptions: DayOption[] = days.map((d) => ({
    key: dateKey(d),
    label: formatDayOptionLabel(d),
  }));

  // Hotels get their own section above the itinerary now — pull them out
  // before the day-card/Unscheduled grouping below ever sees them.
  const hotelItems = items.filter((i) => i.type === "HOTEL");
  const nonHotelItems = items.filter((i) => i.type !== "HOTEL");

  const unscheduledItems = nonHotelItems.filter(isUnscheduled).sort(compareItems);
  const placedItems = nonHotelItems.filter((i) => !isUnscheduled(i));

  const dayGroups = days.map((day) => {
    const key = dateKey(day);
    const dayItems = placedItems.filter((i) => i.date === key);
    const nonMealItems = dayItems.filter((i) => i.type !== "MEAL").sort(compareItems);
    const mealsOnDay = dayItems.filter((i) => i.type === "MEAL");
    const expected = expectedMealSlots(day, trip.startDate, trip.endDate);
    const mealSlots = expected.map((s) => ({
      slot: s,
      item: mealsOnDay.find((m) => m.mealSlot === s) ?? null,
    }));
    const extraMeals = mealsOnDay
      .filter((m) => !expected.includes(m.mealSlot as MealSlot))
      .sort(compareItems);
    return { day, roleNote: dayRoleNote(day, days), nonMealItems, mealSlots, extraMeals };
  });

  const defaultType = isTripItemType(add) ? add : undefined;
  const defaultDate = date && dayOptions.some((d) => d.key === date) ? date : undefined;
  const defaultSlot = isMealSlot(slot) ? slot : undefined;

  const destinationIsLondon = trip.destination.toLowerCase().includes("london");
  const hasTruefitt = items.some((i) =>
    `${i.title} ${i.venue ?? ""}`.toLowerCase().includes("truefitt"),
  );
  const showTraditionCard = destinationIsLondon && !hasTruefitt;

  const budget = cityBreakCategory
    ? { categoryId: cityBreakCategory.id, spentPence, budgetPence: cityBreakCategory.budgetPence }
    : null;

  const mapMarkers: MapMarkerData[] = itemsRaw
    .filter(
      (i): i is typeof i & { lat: number; lng: number } =>
        typeof i.lat === "number" && typeof i.lng === "number",
    )
    .map((i) => ({
      id: i.id,
      type: i.type as TripItemType,
      title: i.title,
      venue: i.venue,
      time: i.time,
      booked: i.booked,
      lat: i.lat,
      lng: i.lng,
    }));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <TripHeader
        seasonId={season.id}
        destination={trip.destination}
        startDate={dateKey(trip.startDate)}
        endDate={dateKey(trip.endDate)}
        budget={budget}
      />

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 font-display text-xl text-pine-deep">
          <MapPin className="h-5 w-5 text-berry" aria-hidden />
          On the map
        </h2>
        {mapMarkers.length > 0 ? (
          <TripMap markers={mapMarkers} />
        ) : (
          <p className="text-sm text-cocoa-soft">
            Add venues to your bookings and they&apos;ll appear on a map here.
          </p>
        )}
      </section>

      <HotelSection
        hotels={hotelItems}
        tripStartDate={dateKey(trip.startDate)}
        tripEndDate={dateKey(trip.endDate)}
        days={dayOptions}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {dayGroups.map((g) => (
            <DayCard
              key={dateKey(g.day)}
              day={g.day}
              roleNote={g.roleNote}
              nonMealItems={g.nonMealItems}
              mealSlots={g.mealSlots}
              extraMeals={g.extraMeals}
              days={dayOptions}
            />
          ))}

          {unscheduledItems.length > 0 && (
            <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm">
              <h3 className="font-display text-lg text-pine-deep">Unscheduled</h3>
              <div className="flex flex-col gap-2">
                {unscheduledItems.map((item) => (
                  <ItemRow key={item.id} item={item} days={dayOptions} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:h-fit">
          <AddItemForm
            key={`${defaultType ?? ""}-${defaultDate ?? ""}-${defaultSlot ?? ""}`}
            tripId={trip.id}
            days={dayOptions}
            defaultType={defaultType}
            defaultDate={defaultDate}
            defaultSlot={defaultSlot}
          />
          {showTraditionCard && <TraditionCard tripId={trip.id} />}
        </div>
      </div>
    </div>
  );
}
