"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { addContactToSeason } from "@/app/actions/cards";

/** Row control in "Not on this year's list": creates a CardSeasonStatus row
 *  for the season being viewed, moving the contact onto the main list. */
export function AddToCardSeasonButton({
  contactId,
  seasonId,
  year,
}: {
  contactId: string;
  seasonId: string;
  year: number;
}) {
  const [state, formAction, pending] = useActionState(addContactToSeason, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="contactId" value={contactId} />
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
