"use client";

import { useActionState, useRef } from "react";
import { Plus } from "lucide-react";
import { createPerson } from "@/app/actions/people";

export function AddPersonForm({ seasonId }: { seasonId: string }) {
  const [state, formAction, pending] = useActionState(createPerson, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:gap-4"
    >
      <input type="hidden" name="seasonId" value={seasonId} />
      <label className="flex flex-1 flex-col gap-1">
        <span className="text-xs font-semibold text-cocoa-soft">Name</span>
        <input
          name="name"
          required
          placeholder="e.g. Auntie Rosa"
          className="rounded-full border border-cocoa/15 bg-cream px-4 py-2 text-sm text-cocoa outline-none focus:border-pine"
        />
      </label>
      <label className="flex w-full flex-col gap-1 sm:w-40">
        <span className="text-xs font-semibold text-cocoa-soft">
          Allocation (optional)
        </span>
        <input
          name="allocation"
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
        Add person
      </button>
      {state?.error && (
        <p className="w-full text-sm text-berry-deep sm:basis-full">{state.error}</p>
      )}
    </form>
  );
}
