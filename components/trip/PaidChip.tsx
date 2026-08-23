import { Coins } from "lucide-react";
import { formatPence } from "@/lib/money";

/** Sits next to BookedChip/ItemActions on a linked item — the pence figure
 *  comes straight from the linked CITY_BREAK Purchase (TripItemData.linkedPurchase). */
export function PaidChip({ pricePence }: { pricePence: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-pine/15 px-3 py-1.5 text-xs font-semibold text-pine-deep">
      <Coins className="h-3.5 w-3.5" aria-hidden />
      {formatPence(pricePence)} · paid
    </span>
  );
}
