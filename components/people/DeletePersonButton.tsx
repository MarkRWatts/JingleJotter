"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deletePerson } from "@/app/actions/people";

export function DeletePersonButton({
  personId,
  personName,
}: {
  personId: string;
  personName: string;
}) {
  const [state, formAction, pending] = useActionState(deletePerson, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `Remove ${personName}? Their purchases will stay, just unassigned.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="personId" value={personId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={`Remove ${personName}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-cocoa-soft transition hover:bg-berry/10 hover:text-berry-deep disabled:opacity-60"
      >
        <Trash2 size={16} />
      </button>
      {state?.error && <p className="text-xs text-berry-deep">{state.error}</p>}
    </form>
  );
}
