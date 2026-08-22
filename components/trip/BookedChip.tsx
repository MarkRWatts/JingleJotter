import { Check } from "lucide-react";

/** Read-only stand-in for ItemActions' booked toggle — same look, no
 *  interaction, used on archived seasons where nothing can be mutated. */
export function BookedChip({ booked }: { booked: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
        booked
          ? "bg-pine/15 text-pine-deep"
          : "border border-dashed border-amber text-amber"
      }`}
    >
      {booked && <Check className="h-3.5 w-3.5" aria-hidden />}
      {booked ? "Booked" : "To book"}
    </span>
  );
}
