// Year-over-year comparison for the dashboard. Small dataset (SQLite, a
// couple of families' worth of Christmases) so — matching lib/queries.ts —
// we favour a findMany + in-memory reduce over clever groupBy for clarity.

import { prisma } from "@/lib/db";
import { isActualSpend } from "@/lib/domain";

export type PreviousSeasonComparison = {
  year: number;
  /** Actual (non-IDEA) spend for the previous season, summed by category kind. */
  spentByKind: Record<string, number>;
  /**
   * Actual (non-IDEA) GIFTS-category spend for the previous season, summed
   * by the GLOBAL Person id — Person identity spans seasons, so this keys
   * straight onto this season's person ids without any translation.
   */
  giftSpendByPersonId: Record<string, number>;
  totalSpentPence: number;
};

/**
 * Quiet "last year" context for a season: finds the Season with year - 1
 * (if any) and summarises its actual spend for comparison against the
 * currently-viewed season.
 */
export async function getPreviousSeasonComparison(
  year: number,
): Promise<PreviousSeasonComparison | null> {
  const previousSeason = await prisma.season.findUnique({
    where: { year: year - 1 },
    select: { id: true },
  });
  if (!previousSeason) return null;

  const purchases = await prisma.purchase.findMany({
    where: { seasonId: previousSeason.id },
    select: {
      pricePence: true,
      status: true,
      personId: true,
      category: { select: { kind: true } },
    },
  });

  const spentByKind: Record<string, number> = {};
  const giftSpendByPersonId: Record<string, number> = {};

  for (const purchase of purchases) {
    if (!isActualSpend(purchase.status)) continue;
    const kind = purchase.category.kind;
    spentByKind[kind] = (spentByKind[kind] ?? 0) + purchase.pricePence;

    if (kind === "GIFTS" && purchase.personId) {
      giftSpendByPersonId[purchase.personId] =
        (giftSpendByPersonId[purchase.personId] ?? 0) + purchase.pricePence;
    }
  }

  const totalSpentPence = Object.values(spentByKind).reduce((sum, p) => sum + p, 0);

  return { year: year - 1, spentByKind, giftSpendByPersonId, totalSpentPence };
}
