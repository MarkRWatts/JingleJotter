import { redirect } from "next/navigation";
import { Gift } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolveSeason } from "@/lib/season";
import { maskPurchase } from "@/lib/mask";
import { ArchivedNotice } from "@/components/shell/archived-notice";
import { isActualSpend, PURCHASE_STATUSES, type PurchaseStatus } from "@/lib/domain";
import { formatPence } from "@/lib/money";
import QuickAddForm from "@/components/purchases/QuickAddForm";
import FilterBar from "@/components/purchases/FilterBar";
import PurchaseList from "@/components/purchases/PurchaseList";
import type { PurchaseListItem } from "@/components/purchases/types";

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    category?: string;
    person?: string;
    status?: string;
  }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/signin");

  const { year, category, person, status } = await searchParams;
  const season = await resolveSeason(year);

  if (!season) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-3 bg-cream px-6 py-16 text-center">
        <h1 className="font-display text-2xl text-pine-deep">No season yet</h1>
        <p className="text-cocoa-soft">
          Set up a Christmas season before tracking purchases.
        </p>
      </div>
    );
  }

  const [categories, people] = await Promise.all([
    prisma.category.findMany({
      where: { seasonId: season.id },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.person.findMany({ orderBy: { name: "asc" } }),
  ]);

  const categoryFilter = category && categories.some((c) => c.id === category) ? category : undefined;
  const personFilter = person && people.some((p) => p.id === person) ? person : undefined;
  const statusFilter =
    status && (PURCHASE_STATUSES as readonly string[]).includes(status) ? status : undefined;

  const purchasesRaw = await prisma.purchase.findMany({
    where: {
      seasonId: season.id,
      ...(categoryFilter ? { categoryId: categoryFilter } : {}),
      ...(personFilter ? { personId: personFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    include: {
      category: true,
      person: { include: { linkedUser: { select: { id: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const purchases: PurchaseListItem[] = purchasesRaw.map((raw) => {
    const masked = maskPurchase(raw, userId);
    return {
      id: masked.id,
      title: masked.title,
      store: masked.store,
      pricePence: masked.pricePence,
      purchasedOn: masked.purchasedOn ? masked.purchasedOn.toISOString() : null,
      status: masked.status as PurchaseStatus,
      notes: masked.notes,
      categoryId: masked.categoryId,
      categoryName: masked.category.name,
      personId: masked.personId,
      personName: masked.person?.name ?? null,
      isMasked: masked.isMasked,
    };
  });

  const actualSpendPence = purchases
    .filter((p) => isActualSpend(p.status))
    .reduce((sum, p) => sum + p.pricePence, 0);
  const plannedPence = purchases
    .filter((p) => p.status === "IDEA")
    .reduce((sum, p) => sum + p.pricePence, 0);

  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));
  const peopleOptions = people.map((p) => ({ id: p.id, name: p.name }));
  const readOnly = !season.active;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 bg-cream px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 font-festive text-4xl text-pine-deep">
          <Gift className="h-7 w-7 text-berry" aria-hidden />
          Purchases — {season.year}
        </h1>
        <p className="text-sm text-cocoa-soft">
          Every gift idea, order and wrap-up, all in one cosy list.
        </p>
      </header>

      {readOnly && <ArchivedNotice year={season.year} />}

      {!readOnly && (
        <QuickAddForm seasonId={season.id} categories={categoryOptions} people={peopleOptions} />
      )}

      <FilterBar
        categories={categoryOptions}
        people={peopleOptions}
        selected={{ year, category: categoryFilter, person: personFilter, status: statusFilter }}
      />

      <div className="flex flex-col gap-3 rounded-2xl bg-tag px-5 py-4 sm:flex-row sm:items-center sm:gap-8">
        <div>
          <p className="text-xs uppercase tracking-wide text-cocoa-soft">Actual spend</p>
          <p className="font-display text-xl text-cocoa">{formatPence(actualSpendPence)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-cocoa-soft">Planned (ideas)</p>
          <p className="font-display text-xl text-cocoa-soft">{formatPence(plannedPence)}</p>
        </div>
      </div>

      <PurchaseList
        purchases={purchases}
        categories={categoryOptions}
        people={peopleOptions}
        readOnly={readOnly}
      />
    </div>
  );
}
