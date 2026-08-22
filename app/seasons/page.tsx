import { redirect } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { StartSeasonForm } from "@/components/seasons/StartSeasonForm";
import { SeasonCard } from "@/components/seasons/SeasonCard";
import { SeasonTableRow } from "@/components/seasons/SeasonTableRow";
import type { SeasonRowData } from "@/components/seasons/types";

export default async function SeasonsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const [seasons, purchaseCounts, actualSpendAgg, categoryBudgetAgg] = await Promise.all([
    prisma.season.findMany({ orderBy: { year: "desc" } }),
    prisma.purchase.groupBy({ by: ["seasonId"], _count: { _all: true } }),
    prisma.purchase.groupBy({
      by: ["seasonId"],
      where: { status: { not: "IDEA" } },
      _sum: { pricePence: true },
    }),
    prisma.category.groupBy({ by: ["seasonId"], _sum: { budgetPence: true } }),
  ]);

  const purchaseCountBySeason = new Map(purchaseCounts.map((g) => [g.seasonId, g._count._all]));
  const actualSpendBySeason = new Map(
    actualSpendAgg.map((g) => [g.seasonId, g._sum.pricePence ?? 0]),
  );
  const categoryBudgetBySeason = new Map(
    categoryBudgetAgg.map((g) => [g.seasonId, g._sum.budgetPence ?? 0]),
  );

  const seasonRows: SeasonRowData[] = seasons.map((s) => ({
    id: s.id,
    year: s.year,
    active: s.active,
    purchaseCount: purchaseCountBySeason.get(s.id) ?? 0,
    actualSpendPence: actualSpendBySeason.get(s.id) ?? 0,
    categoryBudgetPence: categoryBudgetBySeason.get(s.id) ?? 0,
  }));

  const suggestedYear = (seasons[0]?.year ?? new Date().getFullYear() - 1) + 1;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <CalendarRange size={22} className="text-berry" />
          <h1 className="font-display text-2xl text-pine-deep sm:text-3xl">Seasons</h1>
        </div>
        <p className="text-sm text-cocoa-soft">One Christmas per season, all in one place.</p>
      </header>

      <StartSeasonForm suggestedYear={suggestedYear} />

      {seasonRows.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-cocoa-soft shadow-sm">
          No seasons yet — start your first one above.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {seasonRows.map((s) => (
              <SeasonCard key={s.id} season={s} />
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-2xl bg-white p-4 shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-cocoa/10 text-xs font-semibold uppercase tracking-wide text-cocoa-soft">
                  <th className="py-2 pr-4 font-semibold">Season</th>
                  <th className="py-2 pr-4 font-semibold" />
                  <th className="py-2 pr-4 text-right font-semibold">Purchases</th>
                  <th className="py-2 pr-4 text-right font-semibold">Actual spend</th>
                  <th className="py-2 pr-4 text-right font-semibold">Category budget</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {seasonRows.map((s) => (
                  <SeasonTableRow key={s.id} season={s} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

