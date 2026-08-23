"use client";

import { useActionState } from "react";
import { Archive } from "lucide-react";
import { archiveCardContact } from "@/app/actions/cards";

/** Moves a contact from the active list into the archived section — keeps
 *  their history but stops offering them on future seasons' lists. */
export function ArchiveContactButton({
  contactId,
  contactName,
}: {
  contactId: string;
  contactName: string;
}) {
  const [state, formAction, pending] = useActionState(archiveCardContact, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="contactId" value={contactId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={`Archive ${contactName}`}
        title="Archive"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-cocoa-soft transition hover:bg-berry/10 hover:text-berry-deep disabled:opacity-60"
      >
        <Archive size={16} />
      </button>
      {state?.error && (
        <p className="max-w-[10rem] text-right text-xs text-berry-deep">{state.error}</p>
      )}
    </form>
  );
}
