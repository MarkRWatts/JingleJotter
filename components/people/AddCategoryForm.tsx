"use client";

import { useActionState, useRef } from "react";
import { Plus } from "lucide-react";
import { createCategory } from "@/app/actions/people";
import { CATEGORY_KINDS } from "@/lib/domain";

export function AddCategoryForm({ seasonId }: { seasonId: string }) {
  const [state, formAction, pending] = useActionState(createCategory, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:gap-3"
    >
      <input type="hidden" name="seasonId" value={seasonId} />
      <label className="flex flex-1 flex-col gap-1">
        <span className="text-xs font-semibold text-cocoa-soft">Name</span>
        <input
          name="name"
          required
          placeholder="e.g. Stocking Fillers"
          className="rounded-full border border-cocoa/15 bg-cream px-4 py-2 text-sm text-cocoa outline-none focus:border-pine"
        />
      </label>
      <label className="flex flex-col gap-1 sm:w-36">
        <span className="text-xs font-semibold text-cocoa-soft">Kind</span>
        <select
          name="kind"
          defaultValue="OTHER"
          className="rounded-full border border-cocoa/15 bg-cream px-4 py-2 text-sm text-cocoa outline-none focus:border-pine"
        >
          {CATEGORY_KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
      <label className="flex w-full flex-col gap-1 sm:w-32">
        <span className="text-xs font-semibold text-cocoa-soft">Budget</span>
        <input
          name="budget"
          inputMode="decimal"
          placeholder="0.00"
          className="rounded-full border border-cocoa/15 bg-cream px-4 py-2 text-sm text-cocoa outline-none focus:border-pine"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-1.5 rounded-full bg-berry px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep disabled:opacity-60"
      >
        <Plus size={16} />
        Add category
      </button>
      {state?.error && (
        <p className="w-full text-sm text-berry-deep sm:basis-full">{state.error}</p>
      )}
    </form>
  );
}
