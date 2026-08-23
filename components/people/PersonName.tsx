"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { renamePerson, type ActionState } from "@/app/actions/people";

/** The person's name with an inline rename affordance. Renames are global —
 *  they apply to every season, archives included. */
export function PersonName({
  personId,
  name,
  readOnly = false,
}: {
  personId: string;
  name: string;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    renamePerson,
    null,
  );
  const wasPending = useRef(false);

  // Collapse the form after a clean save (pending -> settled with no error).
  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) setEditing(false);
    wasPending.current = pending;
  }, [pending, state]);

  if (readOnly) {
    return <span className="font-display text-lg text-pine-deep">{name}</span>;
  }

  if (!editing) {
    return (
      <span className="group inline-flex items-center gap-1.5">
        <span className="font-display text-lg text-pine-deep">{name}</span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          title={`Rename ${name} (applies to every year)`}
          className="text-cocoa-soft/50 transition hover:text-pine group-hover:text-cocoa-soft"
        >
          <Pencil size={13} aria-hidden="true" />
          <span className="sr-only">Rename {name}</span>
        </button>
      </span>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <input type="hidden" name="personId" value={personId} />
        <input
          name="name"
          defaultValue={name}
          autoFocus
          maxLength={80}
          aria-label={`New name for ${name}`}
          className="w-36 rounded-xl border border-cocoa-soft/30 px-2 py-1 font-display text-lg text-pine-deep"
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditing(false);
          }}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-pine px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-pine-deep disabled:opacity-60"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-full px-2 py-1 text-xs font-semibold text-cocoa-soft transition hover:bg-tag"
        >
          Cancel
        </button>
      </div>
      <p className="text-[11px] text-cocoa-soft">Renames apply to every year.</p>
      {state?.error && <p className="text-xs text-berry-deep">{state.error}</p>}
    </form>
  );
}
