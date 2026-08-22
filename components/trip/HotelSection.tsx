import Link from "next/link";
import { BedDouble } from "lucide-react";
import { HotelCard } from "./HotelCard";
import type { DayOption, TripItemData } from "./types";

/** "Where we're staying": every HOTEL TripItem as a feature card, above the
 *  day-by-day itinerary — hotels live only here now, not in the day cards
 *  or the Unscheduled card (see app/trip/page.tsx). */
export function HotelSection({
  hotels,
  tripStartDate,
  tripEndDate,
  days,
}: {
  hotels: TripItemData[];
  /** "YYYY-MM-DD" */
  tripStartDate: string;
  /** "YYYY-MM-DD" */
  tripEndDate: string;
  days: DayOption[];
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 font-display text-xl text-pine-deep">
        <BedDouble className="h-5 w-5 text-berry" aria-hidden />
        Where we&apos;re staying
      </h2>
      {hotels.length > 0 ? (
        <div className="flex flex-col gap-4">
          {hotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              item={hotel}
              tripStartDate={tripStartDate}
              tripEndDate={tripEndDate}
              days={days}
            />
          ))}
        </div>
      ) : (
        <Link
          href="/trip?add=HOTEL#add-item-form"
          className="flex items-center gap-3 rounded-3xl border border-dashed border-amber bg-amber/5 px-5 py-4 text-sm text-cocoa transition hover:bg-amber/10"
        >
          <BedDouble className="h-5 w-5 shrink-0 text-amber" aria-hidden />
          <span>
            Nowhere to stay yet
            <span className="text-cocoa-soft"> — add a hotel to see it here.</span>
          </span>
        </Link>
      )}
    </section>
  );
}
