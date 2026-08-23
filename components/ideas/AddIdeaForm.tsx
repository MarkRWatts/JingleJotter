"use client";

import { useActionState, useRef } from "react";
import { Plus } from "lucide-react";
import { createIdea } from "@/app/actions/ideas";
import type { PersonOption } from "./types";

export function AddIdeaForm({ people }: { people: PersonOption[] }) {
  const [state, formAction, pending] = useActionState(createIdea, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="rounded-3xl bg-white p-5 shadow-sm"
    >
      <h2 className="mb-3 font-display text-lg text-pine-deep">Jot down an idea</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Who&apos;s it for?
          <select
            name="personId"
            required
            defaultValue=""
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          >
            <option value="" disabled>
              Choose someone
            </option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft sm:col-span-2 lg:col-span-1">
          Idea
          <input
            name="title"
            required
            placeholder="A telescope, maybe?"
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Approx price
          <input
            name="approxPrice"
            inputMode="decimal"
            placeholder="Optional"
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft sm:col-span-2 lg:col-span-2">
          Link
          <input
            name="url"
            type="url"
            placeholder="Optional"
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
      {state?.error && <p className="mt-3 text-sm text-berry-deep">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-berry px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep disabled:opacity-60"
      >
        <Plus size={16} />
        {pending ? "Jotting…" : "Add idea"}
      </button>
    </form>
  );
}
