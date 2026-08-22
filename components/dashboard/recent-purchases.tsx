import Link from "next/link";
import { formatPence } from "@/lib/money";
import { STATUS_LABELS, type PurchaseStatus } from "@/lib/domain";
import type { getRecentPurchases } from "@/lib/queries";

type RawPurchase = Awaited<ReturnType<typeof getRecentPurchases>>[number];
export type MaskedRecentPurchase = RawPurchase & { isMasked: boolean };

const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

export function RecentPurchases({ purchases }: { purchases: MaskedRecentPurchase[] }) {
  if (purchases.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-6 text-center text-sm text-cocoa-soft shadow-sm">
        No purchases logged yet this season.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-cocoa/10 rounded-3xl bg-white shadow-sm">
      {purchases.map((purchase) => (
        <Link
          key={purchase.id}
          href="/purchases"
          className="flex items-center justify-between gap-3 px-5 py-3 transition first:rounded-t-3xl last:rounded-b-3xl hover:bg-tag/40"
        >
          <div className="flex min-w-0 flex-col">
            <span
              className={`truncate font-semibold ${
                purchase.isMasked ? "italic text-cocoa-soft" : "text-cocoa"
              }`}
            >
              {purchase.title}
            </span>
            <span className="truncate text-xs text-cocoa-soft">
              {purchase.person?.name ?? "—"} · {dateFormatter.format(purchase.purchasedOn ?? purchase.createdAt)}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusChip status={purchase.status as PurchaseStatus} />
            <span
              className={`text-sm font-semibold ${purchase.isMasked ? "text-cocoa-soft" : "text-cocoa"}`}
            >
              {formatPence(purchase.pricePence)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function StatusChip({ status }: { status: PurchaseStatus }) {
  return (
    <span className="whitespace-nowrap rounded-full bg-tag px-2.5 py-1 text-[11px] font-semibold text-cocoa-soft">
      {STATUS_LABELS[status]}
    </span>
  );
}
