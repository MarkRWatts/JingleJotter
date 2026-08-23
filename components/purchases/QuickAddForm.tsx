"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { createPurchase } from "@/app/actions/purchases";
import { PURCHASE_STATUSES, STATUS_LABELS } from "@/lib/domain";
import type { SelectOption } from "./types";

export default function QuickAddForm({
  seasonId,
  categories,
  people,
}: {
  seasonId: string;
  categories: SelectOption[];
  people: SelectOption[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await createPurchase(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white p-5 shadow-sm"
    >
      <input type="hidden" name="seasonId" value={seasonId} />
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-pine-deep">
        <Sparkles className="h-5 w-5 text-amber" aria-hidden />
        Add a gift idea
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Title
          <input
            name="title"
            required
            placeholder="Lego set"
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Price
          <input
            name="price"
            inputMode="decimal"
            required
            placeholder="12.50"
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Category
          <select
            name="categoryId"
            required
            defaultValue=""
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          >
            <option value="" disabled>
              Choose one
            </option>
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
            defaultValue=""
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
            placeholder="Optional"
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Status
          <select
            name="status"
            defaultValue="IDEA"
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
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Expected by
          <input
            type="date"
            name="expectedBy"
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft sm:col-span-2 lg:col-span-3">
          Notes
          <input
            name="notes"
            placeholder="Optional"
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-berry-deep">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full bg-berry px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add to the list"}
      </button>
    </form>
  );
}
