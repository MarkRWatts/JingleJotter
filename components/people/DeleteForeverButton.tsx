"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deletePersonForever } from "@/app/actions/people";

/** Hard delete, only ever rendered for people with zero history anywhere
 *  (enforced again server-side in deletePersonForever). */
export function DeleteForeverButton({
  personId,
  personName,
}: {
  personId: string;
  personName: string;
}) {
  const [state, formAction, pending] = useActionState(deletePersonForever, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Permanently delete ${personName}? This can't be undone.`)) {
          e.preventDefault();
        }
      }}
      className="flex flex-col items-end gap-1"
    >
      <input type="hidden" name="personId" value={personId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={`Delete ${personName} forever`}
        title="Delete forever"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-cocoa-soft transition hover:bg-berry/10 hover:text-berry-deep disabled:opacity-60"
      >
        <Trash2 size={16} />
      </button>
      {state?.error && (
        <p className="max-w-[10rem] text-right text-xs text-berry-deep">{state.error}</p>
      )}
    </form>
  );
}
