"use client";

import { useActionState } from "react";
import { Scissors, HandHeart, type LucideIcon } from "lucide-react";
import { addTraditionItem } from "@/app/actions/trip";
import { TRADITIONS, type TraditionKey } from "@/lib/traditions";

const TRADITION_ICONS: Record<TraditionKey, LucideIcon> = {
  truefitt: Scissors,
  townhouse: HandHeart,
};

/** Offered only while the trip is to London, listing whichever traditions
 *  aren't on the itinerary yet — see the check in app/trip/page.tsx. Once
 *  a tradition is added it shows up in "Unscheduled" and drops off this
 *  card; the card disappears entirely when none are missing. */
export function TraditionCard({
  tripId,
  missing,
}: {
  tripId: string;
  missing: TraditionKey[];
}) {
  const traditions = TRADITIONS.filter((t) => missing.includes(t.key));

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-tag p-5 shadow-sm">
      <h2 className="font-display text-base text-pine-deep">The usual?</h2>
      {traditions.map((t) => (
        <TraditionRow key={t.key} tripId={tripId} traditionKey={t.key} label={t.label} />
      ))}
    </div>
  );
}

function TraditionRow({
  tripId,
  traditionKey,
  label,
}: {
  tripId: string;
  traditionKey: TraditionKey;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(addTraditionItem, null);
  const Icon = TRADITION_ICONS[traditionKey];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm text-cocoa">
          <Icon className="h-5 w-5 shrink-0 text-berry" aria-hidden />
          {label}
        </p>
        <form action={formAction}>
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="tradition" value={traditionKey} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-berry px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep disabled:opacity-60"
          >
            {pending ? "Adding…" : "Add it"}
          </button>
        </form>
      </div>
      {state?.error && <p className="text-sm text-berry-deep">{state.error}</p>}
    </div>
  );
}
