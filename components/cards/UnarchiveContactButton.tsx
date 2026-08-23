"use client";

import { useActionState } from "react";
import { ArchiveRestore } from "lucide-react";
import { unarchiveCardContact } from "@/app/actions/cards";

export function UnarchiveContactButton({
  contactId,
  contactName,
}: {
  contactId: string;
  contactName: string;
}) {
  const [state, formAction, pending] = useActionState(unarchiveCardContact, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="contactId" value={contactId} />
      <button
        type="submit"
        disabled={pending}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-pine px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-pine-deep disabled:opacity-60"
      >
        <ArchiveRestore size={14} />
        {pending ? "Restoring…" : "Unarchive"}
      </button>
      {state?.error && (
        <p className="max-w-[10rem] text-right text-xs text-berry-deep">{`Couldn't unarchive ${contactName}: ${state.error}`}</p>
      )}
    </form>
  );
}
