import { Luggage } from "lucide-react";

const RANGE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** One-line trip recap: destination, dates, item and booked counts. Renders
 *  nothing when the season has no Trip. */
export function TripLine({
  destination,
  startDate,
  endDate,
  itemCount,
  bookedCount,
}: {
  destination: string;
  startDate: Date;
  endDate: Date;
  itemCount: number;
  bookedCount: number;
}) {
  return (
    <p className="flex items-center gap-2 rounded-2xl bg-white p-4 text-sm text-cocoa shadow-sm print:shadow-none print:border print:border-cocoa/15">
      <Luggage size={16} className="shrink-0 text-berry" />
      <span>
        <span className="font-semibold text-pine-deep">{destination}</span>{" "}
        {RANGE_FORMAT.format(startDate)}–{RANGE_FORMAT.format(endDate)} · {itemCount}{" "}
        {itemCount === 1 ? "item" : "items"} planned, {bookedCount} booked
      </span>
    </p>
  );
}
