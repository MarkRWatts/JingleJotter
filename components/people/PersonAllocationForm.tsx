"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { updatePersonAllocation } from "@/app/actions/people";

export function PersonAllocationForm({
  personId,
  seasonId,
  allocatedPence,
}: {
  personId: string;
  seasonId: string;
  allocatedPence: number;
}) {
  const [state, formAction, pending] = useActionState(updatePersonAllocation, null);
  const defaultValue = allocatedPence > 0 ? (allocatedPence / 100).toFixed(2) : "";

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <input type="hidden" name="personId" value={personId} />
        <input type="hidden" name="seasonId" value={seasonId} />
        <span className="text-cocoa-soft">£</span>
        <input
          name="allocation"
          inputMode="decimal"
          defaultValue={defaultValue}
          placeholder="0.00"
          aria-label="Allocation"
          className="w-20 rounded-full border border-cocoa/15 bg-cream px-3 py-1 text-right text-sm text-cocoa outline-none focus:border-pine"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Save allocation"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pine text-white transition hover:bg-pine-deep disabled:opacity-60"
        >
          <Check size={14} />
        </button>
      </div>
      {state?.error && <p className="text-xs text-berry-deep">{state.error}</p>}
    </form>
  );
}
