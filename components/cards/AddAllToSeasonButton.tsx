"use client";

import { useActionState } from "react";
import { ListPlus } from "lucide-react";
import { addAllContactsToSeason } from "@/app/actions/cards";

/** One click to add every not-yet-listed contact to the season being
 *  viewed. Only rendered when there are 2+ of them. */
export function AddAllToSeasonButton({ seasonId }: { seasonId: string }) {
  const [state, formAction, pending] = useActionState(addAllContactsToSeason, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="seasonId" value={seasonId} />
      <button
        type="submit"
        disabled={pending}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-pine px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-pine-deep disabled:opacity-60"
      >
        <ListPlus size={14} />
        {pending ? "Adding…" : "Add all"}
      </button>
      {state?.error && <p className="text-xs text-berry-deep">{state.error}</p>}
    </form>
  );
}
