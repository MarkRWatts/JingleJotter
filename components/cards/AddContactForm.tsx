"use client";

import { useActionState, useRef } from "react";
import { Plus } from "lucide-react";
import { createCardContact } from "@/app/actions/cards";
import type { LinkablePersonOption } from "./types";

export function AddContactForm({
  seasonId,
  personOptions,
}: {
  seasonId: string;
  personOptions: LinkablePersonOption[];
}) {
  const [state, formAction, pending] = useActionState(createCardContact, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm"
    >
      <input type="hidden" name="seasonId" value={seasonId} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-cocoa-soft">Name</span>
          <input
            name="name"
            required
            placeholder="e.g. The Nguyens"
            className="rounded-full border border-cocoa/15 bg-cream px-4 py-2 text-sm text-cocoa outline-none focus:border-pine"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-cocoa-soft">Linked person (optional)</span>
          <select
            name="personId"
            defaultValue=""
            className="rounded-full border border-cocoa/15 bg-cream px-4 py-2 text-sm text-cocoa outline-none focus:border-pine"
          >
            <option value="">— not linked —</option>
            {personOptions.map((p) => (
              <option key={p.id} value={p.id} disabled={!!p.takenBy}>
                {p.name}
                {p.takenBy ? ` (linked to ${p.takenBy})` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-semibold text-cocoa-soft">Address (optional)</span>
          <textarea
            name="address"
            rows={3}
            placeholder="123 Snowy Lane&#10;Frostville&#10;PO5 T4L"
            className="rounded-2xl border border-cocoa/15 bg-cream px-4 py-2 text-sm text-cocoa outline-none focus:border-pine"
          />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-semibold text-cocoa-soft">Notes (optional)</span>
          <input
            name="notes"
            placeholder="e.g. always send early — they post from abroad"
            className="rounded-full border border-cocoa/15 bg-cream px-4 py-2 text-sm text-cocoa outline-none focus:border-pine"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex w-fit items-center justify-center gap-1.5 rounded-full bg-berry px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep disabled:opacity-60"
      >
        <Plus size={16} />
        Add contact
      </button>
      {state?.error && <p className="text-sm text-berry-deep">{state.error}</p>}
    </form>
  );
}
