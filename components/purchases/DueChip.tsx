import { Truck } from "lucide-react";
import { formatDue } from "./dueDate";

/** Delivery-nudge chip: amber "due <date>" normally, berry when overdue. The
 *  overdue label is swappable so the dashboard's in-transit card can just say
 *  "overdue" instead of repeating a date the reader already saw. */
export default function DueChip({
  expectedBy,
  overdue,
  label,
}: {
  expectedBy: string;
  overdue: boolean;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        overdue ? "bg-berry/15 text-berry-deep" : "bg-amber/15 text-cocoa"
      }`}
    >
      <Truck className="h-3 w-3" aria-hidden />
      {label ?? `due ${formatDue(expectedBy)}`}
    </span>
  );
}
