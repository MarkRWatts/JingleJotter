"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { toggleBooked, deleteTripItem } from "@/app/actions/trip";
import { ITEM_TYPE_ICONS, MEAL_SLOT_ICONS } from "./icons";
import { ItemEditForm } from "./ItemEditForm";
import type { DayOption, TripItemData } from "./types";

export function ItemRow({ item, days }: { item: TripItemData; days: DayOption[] }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

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

  const Icon = item.mealSlot ? MEAL_SLOT_ICONS[item.mealSlot] : ITEM_TYPE_ICONS[item.type];

  function handleToggleBooked() {
    const formData = new FormData();
    formData.set("itemId", item.id);
    startTransition(async () => {
      const result = await toggleBooked(null, formData);
      if (result?.error) window.alert(result.error);
    });
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${item.title}"? This can't be undone.`)) return;
    const formData = new FormData();
    formData.set("itemId", item.id);
    startTransition(async () => {
      const result = await deleteTripItem(null, formData);
      if (result?.error) window.alert(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-cream/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="flex min-w-0 items-start gap-2.5">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-pine-deep" aria-hidden />
        <div className="flex min-w-0 flex-col">
          <span className="font-semibold text-cocoa">{item.title}</span>
          {(item.venue || item.time) && (
            <span className="text-xs text-cocoa-soft">
              {[item.time, item.venue].filter(Boolean).join(" · ")}
            </span>
          )}
          {item.notes && (
            <span className="truncate text-xs text-cocoa-soft" title={item.notes}>
              {item.notes}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleToggleBooked}
          disabled={pending}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
            item.booked
              ? "bg-pine/15 text-pine-deep hover:bg-pine/25"
              : "border border-dashed border-amber text-amber hover:bg-amber/10"
          }`}
        >
          {item.booked && <Check className="h-3.5 w-3.5" aria-hidden />}
          {item.booked ? "Booked" : "To book"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={pending}
          aria-label={`Edit ${item.title}`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-pine text-pine transition hover:bg-pine/10 disabled:opacity-60"
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          aria-label={`Delete ${item.title}`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-berry text-berry transition hover:bg-berry/10 disabled:opacity-60"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
