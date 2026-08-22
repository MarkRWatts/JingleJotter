"use client";

import { useState } from "react";
import { ItemEditForm } from "./ItemEditForm";
import { ItemActions } from "./ItemActions";
import { formatStayLine } from "./format";
import type { DayOption, TripItemData } from "./types";

/** The "Where we're staying" feature card for one HOTEL item. The stay line
 *  is derived from the trip's own start/end — hotels span the whole trip,
 *  so the item's own (usually unset) `date` field isn't used here. */
export function HotelCard({
  item,
  tripStartDate,
  tripEndDate,
  days,
}: {
  item: TripItemData;
  /** "YYYY-MM-DD" */
  tripStartDate: string;
  /** "YYYY-MM-DD" */
  tripEndDate: string;
  days: DayOption[];
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <ItemEditForm
        item={item}
        days={days}
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-6">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="font-display text-xl text-pine-deep">{item.title}</h3>
        {item.venue && <p className="text-sm text-cocoa-soft">{item.venue}</p>}
        <p className="text-sm text-cocoa-soft">
          {formatStayLine(new Date(tripStartDate), new Date(tripEndDate))}
        </p>
        {item.reference && (
          <span className="mt-0.5 inline-flex w-fit items-center rounded-full bg-tag px-2.5 py-1 text-xs font-mono text-cocoa-soft">
            Ref: {item.reference}
          </span>
        )}
        {item.notes && <p className="text-sm text-cocoa-soft">{item.notes}</p>}
      </div>

      <ItemActions
        itemId={item.id}
        itemTitle={item.title}
        booked={item.booked}
        onEdit={() => setEditing(true)}
      />
    </div>
  );
}
