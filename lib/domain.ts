// String-enum constants (SQLite: no Prisma enums). The single source of truth
// for category kinds and purchase statuses across schema, seed, and UI.

export const CATEGORY_KINDS = [
  "GIFTS",
  "FOOD",
  "EXTRAS",
  "CITY_BREAK",
  "OTHER",
] as const;
export type CategoryKind = (typeof CATEGORY_KINDS)[number];

export const DEFAULT_CATEGORIES: {
  kind: CategoryKind;
  name: string;
  sortOrder: number;
}[] = [
  { kind: "GIFTS", name: "Gifts", sortOrder: 0 },
  { kind: "FOOD", name: "Food", sortOrder: 1 },
  { kind: "EXTRAS", name: "Festive Extras", sortOrder: 2 },
  { kind: "CITY_BREAK", name: "City Break", sortOrder: 3 },
];

export const PURCHASE_STATUSES = [
  "IDEA",
  "PURCHASED",
  "ARRIVED",
  "WRAPPED",
] as const;
export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number];

export const STATUS_LABELS: Record<PurchaseStatus, string> = {
  IDEA: "Idea",
  PURCHASED: "Purchased",
  ARRIVED: "Arrived",
  WRAPPED: "Wrapped",
};

// Gift idea bank (GiftIdea.status) — the cross-year backlog, distinct from
// the IDEA purchase status: an OPEN idea hasn't entered any season's list.
export const IDEA_BANK_STATUSES = ["OPEN", "PROMOTED", "DISCARDED"] as const;
export type IdeaBankStatus = (typeof IDEA_BANK_STATUSES)[number];

/** Statuses that count toward actual spend (everything except ideas). */
export function isActualSpend(status: string): boolean {
  return status !== "IDEA";
}

/** The next status in the Idea → Purchased → Arrived → Wrapped pipeline, or null at the end. */
export function nextStatus(status: PurchaseStatus): PurchaseStatus | null {
  const i = PURCHASE_STATUSES.indexOf(status);
  return i >= 0 && i < PURCHASE_STATUSES.length - 1
    ? PURCHASE_STATUSES[i + 1]
    : null;
}
