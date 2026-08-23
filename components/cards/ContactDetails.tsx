"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Pencil, Link2, TriangleAlert } from "lucide-react";
import { updateCardContact, type ActionState } from "@/app/actions/cards";
import type { ContactRowData, LinkablePersonOption } from "./types";

/** Name, address, notes and person-link, with an inline edit affordance —
 *  the PersonName pattern, scaled up to a whole contact's details. Shared by
 *  the mobile card and the desktop table row. */
export function ContactDetails({
  contact,
  personOptions,
  readOnly = false,
}: {
  contact: ContactRowData;
  personOptions: LinkablePersonOption[];
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateCardContact,
    null,
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) setEditing(false);
    wasPending.current = pending;
  }, [pending, state]);

  if (!editing) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="group flex items-center gap-1.5">
          <span className="font-display text-lg text-pine-deep">{contact.name}</span>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              title={`Edit ${contact.name}`}
              className="text-cocoa-soft/50 transition hover:text-pine group-hover:text-cocoa-soft"
            >
              <Pencil size={13} aria-hidden="true" />
              <span className="sr-only">Edit {contact.name}</span>
            </button>
          )}
        </div>
        {contact.linkedPersonName && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-tag px-2.5 py-0.5 text-xs font-semibold text-pine-deep">
            <Link2 size={11} />
            linked to {contact.linkedPersonName}
          </span>
        )}
        {contact.addressDecryptFailed ? (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber/20 px-2.5 py-0.5 text-xs font-semibold text-cocoa">
            <TriangleAlert size={11} />
            can&apos;t decrypt — key changed?
          </span>
        ) : contact.address ? (
          <p className="whitespace-pre-line text-sm text-cocoa">{contact.address}</p>
        ) : (
          <p className="text-sm text-cocoa-soft/70">No address yet</p>
        )}
        {contact.notes && <p className="text-sm italic text-cocoa-soft">{contact.notes}</p>}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="contactId" value={contact.id} />
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-cocoa-soft">Name</span>
        <input
          name="name"
          defaultValue={contact.name}
          autoFocus
          maxLength={80}
          className="rounded-full border border-cocoa/15 bg-cream px-3 py-1.5 text-sm text-cocoa outline-none focus:border-pine"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-cocoa-soft">Address</span>
        <textarea
          name="address"
          defaultValue={contact.addressDecryptFailed ? "" : (contact.address ?? "")}
          rows={3}
          placeholder="123 Snowy Lane&#10;Frostville&#10;PO5 T4L"
          className="rounded-2xl border border-cocoa/15 bg-cream px-3 py-1.5 text-sm text-cocoa outline-none focus:border-pine"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-cocoa-soft">Notes</span>
        <input
          name="notes"
          defaultValue={contact.notes ?? ""}
          className="rounded-full border border-cocoa/15 bg-cream px-3 py-1.5 text-sm text-cocoa outline-none focus:border-pine"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-cocoa-soft">Linked person</span>
        <select
          name="personId"
          defaultValue={contact.personId ?? ""}
          className="rounded-full border border-cocoa/15 bg-cream px-3 py-1.5 text-sm text-cocoa outline-none focus:border-pine"
        >
          <option value="">— not linked —</option>
          {personOptions.map((p) => (
            <option key={p.id} value={p.id} disabled={!!p.takenBy}>
              {p.name}
              {p.takenBy ? ` (linked to ${p.takenBy})` : ""}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-pine px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-pine-deep disabled:opacity-60"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-cocoa-soft transition hover:bg-tag"
        >
          Cancel
        </button>
      </div>
      {state?.error && <p className="text-xs text-berry-deep">{state.error}</p>}
    </form>
  );
}
