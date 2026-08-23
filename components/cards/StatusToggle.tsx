"use client";

import { useActionState } from "react";
import { Send, PackageCheck, Inbox, type LucideIcon } from "lucide-react";
import { setCardSeasonStatus } from "@/app/actions/cards";
import type { CardStatusField } from "./types";

const FIELD_CONFIG: Record<CardStatusField, { label: string; icon: LucideIcon }> = {
  sendCard: { label: "Sending", icon: Send },
  sent: { label: "Sent", icon: PackageCheck },
  received: { label: "Received", icon: Inbox },
};

/** One toggle chip for a contact's season status (sendCard / sent /
 *  received). Posts setCardSeasonStatus on click; shows a plain chip with
 *  no affordance when readOnly. */
export function StatusToggle({
  contactId,
  seasonId,
  field,
  checked,
  dimmed = false,
  readOnly = false,
}: {
  contactId: string;
  seasonId: string;
  field: CardStatusField;
  checked: boolean;
  /** Visually de-emphasise Sent/Received when this contact isn't being
   *  sent a card at all (sendCard is false). */
  dimmed?: boolean;
  readOnly?: boolean;
}) {
  const [state, formAction, pending] = useActionState(setCardSeasonStatus, null);
  const { label, icon: Icon } = FIELD_CONFIG[field];

  const chipClass = `inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
    checked ? "bg-pine text-white" : "bg-cream text-cocoa-soft"
  } ${dimmed ? "opacity-45" : ""}`;

  if (readOnly) {
    return (
      <span className={chipClass}>
        <Icon size={12} aria-hidden="true" />
        {label}
      </span>
    );
  }

  return (
    <form action={formAction} className="inline-flex flex-col gap-0.5">
      <input type="hidden" name="contactId" value={contactId} />
      <input type="hidden" name="seasonId" value={seasonId} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={(!checked).toString()} />
      <button
        type="submit"
        disabled={pending}
        aria-pressed={checked}
        className={`${chipClass} shadow-sm hover:bg-tag hover:text-pine-deep ${checked ? "hover:bg-pine-deep hover:text-white" : ""} disabled:opacity-60`}
      >
        <Icon size={12} aria-hidden="true" />
        {label}
      </button>
      {state?.error && <p className="text-[11px] text-berry-deep">{state.error}</p>}
    </form>
  );
}
