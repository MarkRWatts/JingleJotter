// Dashboard aggregate queries. Small dataset (SQLite, a couple of families'
// worth of Christmases) so we favour a couple of findMany + in-memory reduce
// over clever groupBy — clarity wins here.

import { prisma } from "@/lib/db";
import { isActualSpend, type PurchaseStatus } from "@/lib/domain";

export type CategorySummary = {
  id: string;
  name: string;
  kind: string;
  budgetPence: number;
  /** Actual spend: everything except IDEA-status purchases. */
  spentPence: number;
  /** IDEA-status purchases only — money not yet committed. */
  plannedPence: number;
};

/** Per-category spend vs budget for a season, ordered for display. */
export async function getCategorySummaries(
  seasonId: string,
): Promise<CategorySummary[]> {
  const categories = await prisma.category.findMany({
    where: { seasonId },
    orderBy: { sortOrder: "asc" },
    include: { purchases: { select: { pricePence: true, status: true } } },
  });

  return categories.map((category) => {
    let spentPence = 0;
    let plannedPence = 0;
    for (const purchase of category.purchases) {
      if (isActualSpend(purchase.status)) spentPence += purchase.pricePence;
      else plannedPence += purchase.pricePence;
    }
    return {
      id: category.id,
      name: category.name,
      kind: category.kind,
      budgetPence: category.budgetPence,
      spentPence,
      plannedPence,
    };
  });
}

export type PersonSummary = {
  id: string;
  name: string;
  allocatedPence: number;
  /** Actual spend on gifts for this person (excludes IDEA rows). */
  spentPence: number;
  statusCounts: Record<PurchaseStatus, number>;
};

/**
 * Per-person gift spend vs allocated budget for a season. Only includes
 * people with a budget or at least one purchase this season, and — because
 * this powers the dashboard the signed-in user sees — always omits the
 * Person linked to `currentUserId` so nobody can see spend/status info
 * about gifts bought for themselves.
 */
export async function getPersonSummaries(
  seasonId: string,
  currentUserId: string,
): Promise<PersonSummary[]> {
  const people = await prisma.person.findMany({
    include: {
      linkedUser: { select: { id: true } },
      personBudgets: { where: { seasonId } },
      purchases: { where: { seasonId }, select: { pricePence: true, status: true } },
    },
  });

  return people
    .filter((person) => person.linkedUser?.id !== currentUserId)
    .filter((person) => person.personBudgets.length > 0 || person.purchases.length > 0)
    .map((person) => {
      const allocatedPence = person.personBudgets[0]?.allocatedPence ?? 0;
      let spentPence = 0;
      const statusCounts: Record<PurchaseStatus, number> = {
        IDEA: 0,
        PURCHASED: 0,
        ARRIVED: 0,
        WRAPPED: 0,
      };
      for (const purchase of person.purchases) {
        if (isActualSpend(purchase.status)) spentPence += purchase.pricePence;
        const status = purchase.status as PurchaseStatus;
        statusCounts[status] = (statusCounts[status] ?? 0) + 1;
      }
      return { id: person.id, name: person.name, allocatedPence, spentPence, statusCounts };
    });
}

/**
 * The season's most recent purchases, with the include shape maskPurchase()
 * needs (person.linkedUser). Caller is responsible for masking before this
 * ever reaches a client component.
 */
export async function getRecentPurchases(seasonId: string, take = 8) {
  return prisma.purchase.findMany({
    where: { seasonId },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      person: { include: { linkedUser: { select: { id: true } } } },
      category: { select: { name: true } },
    },
  });
}

export type SeasonTotals = {
  totalSpentPence: number;
  totalBudgetPence: number;
  /** Actual spend plus everything still at the IDEA stage. */
  totalPlannedPence: number;
};

/** Derived from category summaries — no extra query needed. */
export function getSeasonTotals(categories: CategorySummary[]): SeasonTotals {
  const totalSpentPence = categories.reduce((sum, c) => sum + c.spentPence, 0);
  const totalBudgetPence = categories.reduce((sum, c) => sum + c.budgetPence, 0);
  const totalPlannedPence =
    totalSpentPence + categories.reduce((sum, c) => sum + c.plannedPence, 0);
  return { totalSpentPence, totalBudgetPence, totalPlannedPence };
}

/** All seasons' years, newest first — powers the dashboard's year switcher. */
export async function getSeasonYears(): Promise<number[]> {
  const seasons = await prisma.season.findMany({
    orderBy: { year: "desc" },
    select: { year: true },
  });
  return seasons.map((s) => s.year);
}
