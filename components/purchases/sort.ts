import { PURCHASE_STATUSES } from "@/lib/domain";
import type { PurchaseListItem } from "./types";

// URL-driven sorting for the purchases list (?sort=&dir=). "date" means the
// purchase date, falling back to when the row was created (ideas have no
// purchase date yet) — newest first by default.

export const SORT_KEYS = [
  "date",
  "title",
  "person",
  "category",
  "store",
  "price",
  "status",
] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export type SortDir = "asc" | "desc";

export const DEFAULT_SORT: SortKey = "date";

export function defaultDirFor(key: SortKey): SortDir {
  return key === "date" || key === "price" ? "desc" : "asc";
}

export function parseSort(sort?: string, dir?: string): { key: SortKey; dir: SortDir } {
  const key = (SORT_KEYS as readonly string[]).includes(sort ?? "")
    ? (sort as SortKey)
    : DEFAULT_SORT;
  const direction: SortDir = dir === "asc" || dir === "desc" ? dir : defaultDirFor(key);
  return { key, dir: direction };
}

const collator = new Intl.Collator("en", { sensitivity: "base" });

/** Nulls/empties always sort last regardless of direction. */
function compareNullable(a: string | null, b: string | null): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return collator.compare(a, b);
}

export function sortPurchases(
  purchases: PurchaseListItem[],
  key: SortKey,
  dir: SortDir,
): PurchaseListItem[] {
  const sign = dir === "asc" ? 1 : -1;
  const statusRank = (s: string) => PURCHASE_STATUSES.indexOf(s as never);
  return [...purchases].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "date": {
        // Purchase date, with undated rows (ideas, not-yet-bought) always
        // last regardless of direction, newest-created first among them.
        if (!a.purchasedOn && !b.purchasedOn) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (!a.purchasedOn) return 1;
        if (!b.purchasedOn) return -1;
        cmp = new Date(a.purchasedOn).getTime() - new Date(b.purchasedOn).getTime();
        break;
      }
      case "title":
        cmp = collator.compare(a.title, b.title);
        break;
      case "person":
        // Direction applies to names; the "no one" rows stay at the end.
        return compareNullable(a.personName, b.personName) === 0
          ? 0
          : !a.personName || !b.personName
            ? compareNullable(a.personName, b.personName)
            : sign * collator.compare(a.personName, b.personName);
      case "category":
        cmp = collator.compare(a.categoryName, b.categoryName);
        break;
      case "store":
        return !a.store || !b.store
          ? compareNullable(a.store, b.store)
          : sign * collator.compare(a.store, b.store);
      case "price":
        cmp = a.pricePence - b.pricePence;
        break;
      case "status":
        cmp = statusRank(a.status) - statusRank(b.status);
        break;
    }
    return sign * cmp;
  });
}

export const SORT_LABELS: { key: SortKey; dir: SortDir; label: string }[] = [
  { key: "date", dir: "desc", label: "Date · newest first" },
  { key: "date", dir: "asc", label: "Date · oldest first" },
  { key: "price", dir: "desc", label: "Price · high to low" },
  { key: "price", dir: "asc", label: "Price · low to high" },
  { key: "title", dir: "asc", label: "Item · A to Z" },
  { key: "person", dir: "asc", label: "Person · A to Z" },
  { key: "category", dir: "asc", label: "Category · A to Z" },
  { key: "status", dir: "asc", label: "Status · idea to wrapped" },
  { key: "status", dir: "desc", label: "Status · wrapped to idea" },
];
