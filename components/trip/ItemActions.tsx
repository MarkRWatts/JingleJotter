"use client";

// The booked-toggle / edit / delete trio shared by ItemRow and HotelCard —
// identical wiring in both places, just a different card wrapped around it.

import { useTransition } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { toggleBooked, deleteTripItem } from "@/app/actions/trip";

export function ItemActions({
  itemId,
  itemTitle,
  booked,
  onEdit,
}: {
  itemId: string;
  itemTitle: string;
  booked: boolean;
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleToggleBooked() {
    const formData = new FormData();
    formData.set("itemId", itemId);
    startTransition(async () => {
      const result = await toggleBooked(null, formData);
      if (result?.error) window.alert(result.error);
    });
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${itemTitle}"? This can't be undone.`)) return;
    const formData = new FormData();
    formData.set("itemId", itemId);
    startTransition(async () => {
      const result = await deleteTripItem(null, formData);
      if (result?.error) window.alert(result.error);
    });
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleToggleBooked}
        disabled={pending}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
          booked
            ? "bg-pine/15 text-pine-deep hover:bg-pine/25"
            : "border border-dashed border-amber text-amber hover:bg-amber/10"
        }`}
      >
        {booked && <Check className="h-3.5 w-3.5" aria-hidden />}
        {booked ? "Booked" : "To book"}
      </button>
      <button
        type="button"
        onClick={onEdit}
        disabled={pending}
        aria-label={`Edit ${itemTitle}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-pine text-pine transition hover:bg-pine/10 disabled:opacity-60"
      >
        <Pencil size={13} />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        aria-label={`Delete ${itemTitle}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-berry text-berry transition hover:bg-berry/10 disabled:opacity-60"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
