"use client";

import { useActionState } from "react";
import { Scissors } from "lucide-react";
import { addTraditionItem } from "@/app/actions/trip";

/** Offered only while the trip is to London and nothing Truefitt-shaped
 *  exists yet on the itinerary — see the check in app/trip/page.tsx. Once
 *  added, the item shows up in "Unscheduled" and this card stops rendering. */
export function TraditionCard({ tripId }: { tripId: string }) {
  const [state, formAction, pending] = useActionState(addTraditionItem, null);

  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-tag p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Scissors className="h-5 w-5 text-berry" aria-hidden />
        <h2 className="font-display text-base text-pine-deep">The usual?</h2>
      </div>
      <p className="text-sm text-cocoa">
        Haircut &amp; shave at Truefitt &amp; Hill.
      </p>
      <form action={formAction} className="self-start">
        <input type="hidden" name="tripId" value={tripId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-berry px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add it"}
        </button>
      </form>
      {state?.error && <p className="text-sm text-berry-deep">{state.error}</p>}
    </div>
  );
}
