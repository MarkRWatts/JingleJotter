"use client";

import { useActionState } from "react";
import { Luggage } from "lucide-react";
import { upsertTrip } from "@/app/actions/trip";

export function TripSetupForm({
  seasonId,
  year,
}: {
  seasonId: string;
  year: number;
}) {
  const [state, formAction, pending] = useActionState(upsertTrip, null);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-2">
        <Luggage className="h-6 w-6 text-berry" aria-hidden />
        <h1 className="font-display text-2xl text-pine-deep">Plan your city break</h1>
      </div>
      <p className="text-sm text-cocoa-soft">
        A little December getaway, planned alongside the rest of the budget. Most trips
        run early-to-mid December — pick whatever suits.
      </p>

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="seasonId" value={seasonId} />
        <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
          Destination
          <input
            name="destination"
            defaultValue="London"
            required
            className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
          />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
            Arrive
            <input
              type="date"
              name="startDate"
              defaultValue={`${year}-12-12`}
              required
              className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
            Leave
            <input
              type="date"
              name="endDate"
              defaultValue={`${year}-12-14`}
              required
              className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
            />
          </label>
        </div>
        {state?.error && <p className="text-sm text-berry-deep">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-1 self-start rounded-full bg-berry px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : "Plan the trip"}
        </button>
      </form>
    </div>
  );
}
