"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { addPersonToSeason } from "@/app/actions/people";

/** Row control in "Not in this season": re-joins the person to the season
 *  being viewed with a starting £0 allocation, ready to edit from the
 *  "This season" list once added. */
export function AddToSeasonButton({
  personId,
  seasonId,
  year,
}: {
  personId: string;
  seasonId: string;
  year: number;
}) {
  const [state, formAction, pending] = useActionState(addPersonToSeason, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="personId" value={personId} />
      <input type="hidden" name="seasonId" value={seasonId} />
      <button
        type="submit"
        disabled={pending}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-pine px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-pine-deep disabled:opacity-60"
      >
        <UserPlus size={14} />
        {pending ? "Adding…" : `Add to ${year}`}
      </button>
      {state?.error && (
        <p className="max-w-[10rem] text-right text-xs text-berry-deep">{state.error}</p>
      )}
    </form>
  );
}
