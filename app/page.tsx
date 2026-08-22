import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolveSeason } from "@/lib/season";
import { maskPurchase } from "@/lib/mask";
import {
  getCategorySummaries,
  getPersonSummaries,
  getRecentPurchases,
  getSeasonTotals,
} from "@/lib/queries";
import { CategoryCard } from "@/components/dashboard/category-card";
import { PersonCard } from "@/components/dashboard/person-card";
import { RecentPurchases, type MaskedRecentPurchase } from "@/components/dashboard/recent-purchases";
import { SeasonTotalsStrip } from "@/components/dashboard/season-totals-strip";
import { CountdownChip } from "@/components/dashboard/countdown-chip";
import { YearSwitcher } from "@/components/dashboard/year-switcher";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FairyLights } from "@/components/dashboard/fairy-lights";
import { HeaderSparkles } from "@/components/dashboard/header-sparkles";
import { RunUpCalendar } from "@/components/dashboard/run-up-calendar";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/signin");

  const { year } = await searchParams;
  const season = await resolveSeason(year);

  if (!season) {
    return <EmptyState />;
  }

  const [categories, people, recentRaw, allYears] = await Promise.all([
    getCategorySummaries(season.id),
    getPersonSummaries(season.id, userId),
    getRecentPurchases(season.id),
    prisma.season.findMany({ orderBy: { year: "desc" }, select: { year: true } }),
  ]);

  const totals = getSeasonTotals(categories);
  const recentPurchases: MaskedRecentPurchase[] = recentRaw.map((purchase) =>
    maskPurchase(purchase, userId),
  );
  const years = allYears.map((s) => s.year);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6 md:px-6 md:py-8">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="relative inline-block">
            <h1 className="font-display text-3xl text-pine-deep">Christmas {season.year}</h1>
            <HeaderSparkles />
          </span>
          <CountdownChip year={season.year} />
        </div>
        <YearSwitcher years={years} activeYear={season.year} />
      </div>

      {/* The run-up: Sep–Dec mini calendars, collapsed by default */}
      <RunUpCalendar year={season.year} />

      {/* Category budget cards */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-pine-deep">Budgets</h2>
        {categories.length === 0 ? (
          <p className="rounded-3xl bg-white p-6 text-sm text-cocoa-soft shadow-sm">
            No categories set up for this season yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* Per-person gift grid */}
      {people.length > 0 && (
        <>
          <FairyLights />
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-xl text-pine-deep">Gifts by person</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {people.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          </section>
        </>
      )}

      <FairyLights />

      {/* Recent purchases */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-pine-deep">Recent purchases</h2>
        <RecentPurchases purchases={recentPurchases} />
      </section>

      {/* Season totals strip */}
      <section>
        <SeasonTotalsStrip totals={totals} />
      </section>
    </div>
  );
}
