"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updatePurchase } from "@/app/actions/purchases";
import { PURCHASE_STATUSES, STATUS_LABELS } from "@/lib/domain";
import type { PurchaseListItem, SelectOption } from "./types";

function penceToInputValue(pence: number): string {
  return (pence / 100).toFixed(2);
}

function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

export default function PurchaseEditForm({
  purchase,
  categories,
  people,
  onCancel,
  onSaved,
}: {
  purchase: PurchaseListItem;
  categories: SelectOption[];
  people: SelectOption[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await updatePurchase(purchase.id, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Title
          <input
            name="title"
            required
            defaultValue={purchase.title}
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Price
          <input
            name="price"
            inputMode="decimal"
            required
            defaultValue={penceToInputValue(purchase.pricePence)}
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Category
          <select
            name="categoryId"
            required
            defaultValue={purchase.categoryId}
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Who&apos;s it for?
          <select
            name="personId"
            defaultValue={purchase.personId ?? ""}
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          >
            <option value="">No one in particular</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Store
          <input
            name="store"
            defaultValue={purchase.store ?? ""}
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Status
          <select
            name="status"
            defaultValue={purchase.status}
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          >
            {PURCHASE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Purchased on
          <input
            type="date"
            name="purchasedOn"
            defaultValue={toDateInputValue(purchase.purchasedOn)}
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft sm:col-span-2 lg:col-span-3">
          Notes
          <input
            name="notes"
            defaultValue={purchase.notes ?? ""}
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
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
