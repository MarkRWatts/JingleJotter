"use client";

import { useState } from "react";
import { ITEM_TYPE_ICONS, MEAL_SLOT_ICONS } from "./icons";
import { ItemEditForm } from "./ItemEditForm";
import { ItemActions } from "./ItemActions";
import type { DayOption, TripItemData } from "./types";

export function ItemRow({ item, days }: { item: TripItemData; days: DayOption[] }) {
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

  const Icon = item.mealSlot ? MEAL_SLOT_ICONS[item.mealSlot] : ITEM_TYPE_ICONS[item.type];

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
          {item.reference && (
            <span className="text-xs text-cocoa-soft">
              Ref: <span className="font-mono">{item.reference}</span>
            </span>
          )}
        </div>
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
