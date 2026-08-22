"use client";

import { useActionState, useRef, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { createTripItem } from "@/app/actions/trip";
import { TRIP_ITEM_TYPES, TRIP_ITEM_TYPE_LABELS, MEAL_SLOTS, MEAL_SLOT_LABELS, type TripItemType } from "@/lib/trip";
import type { DayOption } from "./types";

export function AddItemForm({
  tripId,
  days,
  defaultType,
  defaultDate,
  defaultSlot,
}: {
  tripId: string;
  days: DayOption[];
  defaultType?: TripItemType;
  defaultDate?: string;
  defaultSlot?: string;
}) {
  const [state, formAction, pending] = useActionState(createTripItem, null);
  const [type, setType] = useState<TripItemType>(defaultType ?? "ACTIVITY");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div id="add-item-form" className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm scroll-mt-20">
      <h2 className="flex items-center gap-2 font-display text-lg text-pine-deep">
        <CalendarPlus className="h-5 w-5 text-amber" aria-hidden />
        Add to the itinerary
      </h2>
      <form
        ref={formRef}
        action={async (formData) => {
          await formAction(formData);
          formRef.current?.reset();
          setType(defaultType ?? "ACTIVITY");
        }}
        className="flex flex-col gap-3"
      >
        <input type="hidden" name="tripId" value={tripId} />
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Type
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as TripItemType)}
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          >
            {TRIP_ITEM_TYPES.map((t) => (
              <option key={t} value={t}>
                {TRIP_ITEM_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Title
          <input
            name="title"
            required
            placeholder="e.g. Winter Wonderland"
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Day
          <select
            name="date"
            defaultValue={defaultDate ?? ""}
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          >
            <option value="">Unscheduled</option>
            {days.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        {type === "MEAL" && (
          <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
            Meal
            <select
              name="mealSlot"
              defaultValue={defaultSlot ?? ""}
              className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
            >
              <option value="">Not sure yet</option>
              {MEAL_SLOTS.map((s) => (
                <option key={s} value={s}>
                  {MEAL_SLOT_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
            Time
            <input
              name="time"
              placeholder="19:30"
              className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
            Venue
            <input
              name="venue"
              placeholder="Optional"
              className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Notes
          <input
            name="notes"
            placeholder="Optional"
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-cocoa-soft">
          <input type="checkbox" name="booked" className="h-4 w-4 rounded border-cocoa-soft/40" />
          Already booked
        </label>
        {state?.error && <p className="text-sm text-berry-deep">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-1 rounded-full bg-berry px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add item"}
        </button>
      </form>
    </div>
  );
}
