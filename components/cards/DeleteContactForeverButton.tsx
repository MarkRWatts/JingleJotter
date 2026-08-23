"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCardContactForever } from "@/app/actions/cards";

/** Hard delete — the GDPR erasure path. Statuses cascade with the contact. */
export function DeleteContactForeverButton({
  contactId,
  contactName,
}: {
  contactId: string;
  contactName: string;
}) {
  const [state, formAction, pending] = useActionState(deleteCardContactForever, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `Permanently delete ${contactName}, including their address and card history? This can't be undone.`,
          )
        ) {
          e.preventDefault();
        }
      }}
      className="flex flex-col items-end gap-1"
    >
      <input type="hidden" name="contactId" value={contactId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={`Delete ${contactName} forever`}
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
