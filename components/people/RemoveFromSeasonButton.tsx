"use client";

import { useActionState } from "react";
import { UserMinus } from "lucide-react";
import { removePersonFromSeason } from "@/app/actions/people";

/** Compact control on a "this season" row: drops just this season's
 *  PersonBudget membership row. Person identity and other seasons are
 *  untouched — this is not a delete. */
export function RemoveFromSeasonButton({
  personId,
  personName,
  seasonId,
  year,
}: {
  personId: string;
  personName: string;
  seasonId: string;
  year: number;
}) {
  const [state, formAction, pending] = useActionState(removePersonFromSeason, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `Remove ${personName} from ${year}? Their allocation for this season goes away, but they'll keep any history from other seasons.`,
          )
        ) {
          e.preventDefault();
        }
      }}
      className="flex flex-col items-end gap-1"
    >
      <input type="hidden" name="personId" value={personId} />
      <input type="hidden" name="seasonId" value={seasonId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={`Remove ${personName} from ${year}`}
        title={`Remove from ${year}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-cocoa-soft transition hover:bg-berry/10 hover:text-berry-deep disabled:opacity-60"
      >
        <UserMinus size={16} />
      </button>
      {state?.error && (
        <p className="max-w-[10rem] text-right text-xs text-berry-deep">{state.error}</p>
      )}
    </form>
  );
}
