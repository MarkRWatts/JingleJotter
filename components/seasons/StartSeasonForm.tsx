"use client";

import { useActionState, useRef } from "react";
import { Sparkles } from "lucide-react";
import { startNewSeason } from "@/app/actions/seasons";

export function StartSeasonForm({ suggestedYear }: { suggestedYear: number }) {
  const [state, formAction, pending] = useActionState(startNewSeason, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:gap-4"
    >
      <div className="flex flex-1 flex-col gap-1">
        <span className="flex items-center gap-1.5 font-display text-lg text-pine-deep">
          <Sparkles size={18} className="text-amber" />
          Start a new season
        </span>
        <p className="text-sm text-cocoa-soft">
          Copies this year&apos;s people, allocations and categories across, ready for a
          fresh start.
        </p>
      </div>
      <label className="flex flex-col gap-1 sm:w-32">
        <span className="text-xs font-semibold text-cocoa-soft">Year</span>
        <input
          name="year"
          type="number"
          required
          defaultValue={suggestedYear}
          className="rounded-full border border-cocoa/15 bg-cream px-4 py-2 text-sm text-cocoa outline-none focus:border-pine"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-1.5 rounded-full bg-berry px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep disabled:opacity-60"
      >
        Start season
      </button>
      {state?.error && (
        <p className="w-full text-sm text-berry-deep sm:basis-full">{state.error}</p>
      )}
    </form>
  );
}
