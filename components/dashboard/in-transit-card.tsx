import { PackageOpen } from "lucide-react";
import { prisma } from "@/lib/db";
import { maskPurchase } from "@/lib/mask";
import DueChip from "@/components/purchases/DueChip";
import { isOverdue } from "@/components/purchases/dueDate";

const MAX_ROWS = 6;

/** Dashboard nudge: this season's PURCHASED-with-an-expected-date items,
 *  soonest due first. Self-contained — fetches and masks its own data so it
 *  can be dropped into the dashboard without threading extra props through
 *  app/page.tsx. Renders nothing if there's nothing in transit. */
export default async function InTransitCard({
  seasonId,
  userId,
}: {
  seasonId: string;
  userId: string;
}) {
  const purchasesRaw = await prisma.purchase.findMany({
    where: { seasonId, status: "PURCHASED", expectedBy: { not: null } },
    include: {
      person: { include: { linkedUser: { select: { id: true } } } },
    },
    orderBy: { expectedBy: "asc" },
    take: MAX_ROWS,
  });

  if (purchasesRaw.length === 0) return null;

  const items = purchasesRaw.map((raw) => {
    const masked = maskPurchase(raw, userId);
    return {
      id: masked.id,
      title: masked.title,
      personName: masked.person?.name ?? null,
      // Non-null by the where clause above; Prisma's generated type doesn't
      // narrow on filters, hence the assertion.
      expectedBy: masked.expectedBy!.toISOString(),
      status: masked.status,
      isMasked: masked.isMasked,
    };
  });

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-pine-deep">
        <PackageOpen className="h-5 w-5 text-pine" aria-hidden />
        Still in transit
      </h2>
      <ul className="flex flex-col divide-y divide-cocoa/10">
        {items.map((item) => {
          const overdue = isOverdue(item.expectedBy, item.status);
          return (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="flex min-w-0 flex-col">
                <span
                  className={`truncate font-semibold ${
                    item.isMasked ? "italic text-cocoa-soft" : "text-cocoa"
                  }`}
                >
                  {item.title}
                </span>
                {item.personName && (
                  <span className="truncate text-xs text-cocoa-soft">{item.personName}</span>
                )}
              </div>
              <DueChip
                expectedBy={item.expectedBy}
                overdue={overdue}
                label={overdue ? "overdue" : undefined}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
