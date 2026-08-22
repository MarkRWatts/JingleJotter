"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateTripItem } from "@/app/actions/trip";
import {
  TRIP_ITEM_TYPES,
  TRIP_ITEM_TYPE_LABELS,
  MEAL_SLOTS,
  MEAL_SLOT_LABELS,
  type TripItemType,
} from "@/lib/trip";
import type { DayOption, TripItemData } from "./types";

export function ItemEditForm({
  item,
  days,
  onCancel,
  onSaved,
}: {
  item: TripItemData;
  days: DayOption[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<TripItemType>(item.type);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await updateTripItem(null, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl bg-cream/60 p-4">
      <input type="hidden" name="itemId" value={item.id} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            defaultValue={item.title}
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Day
          <select
            name="date"
            defaultValue={item.date ?? ""}
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
              defaultValue={item.mealSlot ?? ""}
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
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Time
          <input
            name="time"
            defaultValue={item.time ?? ""}
            placeholder="19:30"
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Venue
          <input
            name="venue"
            defaultValue={item.venue ?? ""}
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Booking reference
          <input
            name="reference"
            defaultValue={item.reference ?? ""}
            placeholder="e.g. ABC123"
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 font-mono text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft sm:col-span-2">
          Notes
          <input
            name="notes"
            defaultValue={item.notes ?? ""}
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-cocoa-soft">
          <input
            type="checkbox"
            name="booked"
            defaultChecked={item.booked}
            className="h-4 w-4 rounded border-cocoa-soft/40"
          />
          Already booked
        </label>
      </div>
      {error && <p className="text-sm text-berry-deep">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-berry px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="rounded-full border border-pine px-5 py-2 text-sm font-semibold text-pine transition hover:bg-pine/10 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
