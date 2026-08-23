import Link from "next/link";
import { redirect } from "next/navigation";
import { ScrollText, CalendarRange, Download } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatPence } from "@/lib/money";
import { resolveSeason } from "@/lib/season";
import { maskPurchase } from "@/lib/mask";
import { getCategorySummaries, getPersonSummaries, getSeasonTotals } from "@/lib/queries";
import { PrintButton } from "@/components/summary/PrintButton";
import { StatTile } from "@/components/summary/StatTile";
import { CategoryTable } from "@/components/summary/CategoryTable";
import { PersonTable } from "@/components/summary/PersonTable";
import { TripLine } from "@/components/summary/TripLine";

// The app shell (nav, bottom tabs, rooftops footer) lives outside this
// page's ownership, so it can't be hidden with print: utilities from here —
// this local stylesheet is the workaround.
const PRINT_STYLE = `
  @media print {
    header, nav, footer { display: none !important; }
    body { background: white; }
  }
`;

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { year } = await searchParams;
  const season = await resolveSeason(year);

  if (!season) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-10 text-center shadow-sm">
          <ScrollText size={32} className="text-pine" />
          <h1 className="font-display text-2xl text-pine-deep">No season yet</h1>
          <p className="max-w-sm text-sm text-cocoa-soft">
            Start your first Christmas season to see its summary here.
          </p>
          <Link
            href="/seasons"
            className="rounded-full bg-berry px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep"
          >
            Go to Seasons
          </Link>
        </div>
      </div>
    );
  }

  const userId = session.user.id;

  // Archived seasons are keepsakes: their surprises were unwrapped long ago,
  // so the recap deliberately shows every person — viewer included. Only the
  // active season still hides your own gifts.
  const maskingUserId = season.active ? userId : null;

  const [categories, people, purchasesRaw, trip] = await Promise.all([
    getCategorySummaries(season.id),
    getPersonSummaries(season.id, maskingUserId),
    prisma.purchase.findMany({
      where: { seasonId: season.id },
      include: {
        category: { select: { kind: true } },
        person: { include: { linkedUser: { select: { id: true } } } },
      },
    }),
    prisma.trip.findUnique({
      where: { seasonId: season.id },
      include: { items: { select: { booked: true } } },
    }),
  ]);

  const totals = getSeasonTotals(categories);
  const purchases = maskingUserId
    ? purchasesRaw.map((p) => maskPurchase(p, maskingUserId))
    : purchasesRaw;

  const giftPurchases = purchases.filter((p) => p.category.kind === "GIFTS");
  const wrappedGiftCount = giftPurchases.filter((p) => p.status === "WRAPPED").length;
  const percentWrapped =
    giftPurchases.length > 0 ? Math.round((wrappedGiftCount / giftPurchases.length) * 100) : null;

  const inTransitCount = purchases.filter(
    (p) => p.status === "PURCHASED" && p.expectedBy,
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <style>{PRINT_STYLE}</style>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ScrollText size={22} className="text-berry" />
            <h1 className="font-festive text-3xl text-pine-deep sm:text-4xl">Season summary</h1>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-cocoa-soft">
            <CalendarRange size={14} />
            Christmas {season.year} in numbers
          </p>
        </div>
        <PrintButton />
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Spent"
          value={formatPence(totals.totalSpentPence)}
          hint={totals.totalBudgetPence > 0 ? `of ${formatPence(totals.totalBudgetPence)} budget` : undefined}
        />
        <StatTile label="Purchases" value={String(purchases.length)} />
        <StatTile
          label="Gifts wrapped"
          value={percentWrapped !== null ? `${percentWrapped}%` : "—"}
          hint={giftPurchases.length > 0 ? `${wrappedGiftCount} of ${giftPurchases.length}` : undefined}
        />
        <StatTile
          label="Still in transit"
          value={String(inTransitCount)}
          hint={inTransitCount > 0 ? "ordered, not yet arrived" : undefined}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-pine-deep">By category</h2>
        <CategoryTable categories={categories} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-pine-deep">By person</h2>
        <PersonTable people={people} />
      </section>

      {trip && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-pine-deep">City break</h2>
          <TripLine
            destination={trip.destination}
            startDate={trip.startDate}
            endDate={trip.endDate}
            itemCount={trip.items.length}
            bookedCount={trip.items.filter((i) => i.booked).length}
          />
        </section>
      )}

      <section className="print:hidden flex flex-wrap items-center gap-3 text-sm">
        <a
          href={`/api/export/purchases?year=${season.year}`}
          className="flex items-center gap-1.5 rounded-full border border-pine px-4 py-2 font-semibold text-pine transition hover:bg-pine/10"
        >
          <Download size={14} />
          Download purchases CSV
        </a>
        <a
          href={`/api/export/cards?year=${season.year}`}
          className="flex items-center gap-1.5 rounded-full border border-pine px-4 py-2 font-semibold text-pine transition hover:bg-pine/10"
        >
          <Download size={14} />
          Download cards CSV
        </a>
      </section>
    </div>
  );
}
