"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import PurchaseRow from "./PurchaseRow";
import PurchaseCard from "./PurchaseCard";
import type { PurchaseListItem, SelectOption } from "./types";
import {
  DEFAULT_SORT,
  defaultDirFor,
  SORT_LABELS,
  type SortDir,
  type SortKey,
} from "./sort";

const COLUMNS: { key: SortKey | null; label: string; align?: "right" }[] = [
  { key: "title", label: "Item" },
  { key: "person", label: "For" },
  { key: "category", label: "Category" },
  { key: "store", label: "Store" },
  { key: "price", label: "Price", align: "right" },
  { key: "date", label: "Purchased" },
  { key: "status", label: "Status" },
];

export default function PurchaseList({
  purchases,
  categories,
  people,
  readOnly = false,
  sort,
}: {
  purchases: PurchaseListItem[];
  categories: SelectOption[];
  people: SelectOption[];
  readOnly?: boolean;
  sort: { key: SortKey; dir: SortDir };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigateToSort(key: SortKey, dir: SortDir) {
    const params = new URLSearchParams(searchParams.toString());
    // Default sort keeps a clean URL.
    if (key === DEFAULT_SORT && dir === defaultDirFor(DEFAULT_SORT)) {
      params.delete("sort");
      params.delete("dir");
    } else {
      params.set("sort", key);
      params.set("dir", dir);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleHeaderClick(key: SortKey) {
    const dir: SortDir =
      sort.key === key ? (sort.dir === "asc" ? "desc" : "asc") : defaultDirFor(key);
    navigateToSort(key, dir);
  }

  if (purchases.length === 0) {
    return (
      <p className="rounded-2xl bg-tag px-5 py-8 text-center text-cocoa-soft">
        Nothing here yet — add a gift idea above to get started.
      </p>
    );
  }

  const Arrow = sort.dir === "asc" ? ArrowUp : ArrowDown;

  return (
    <>
      {/* Mobile: same ordering, controlled by a compact select */}
      <label className="flex items-center gap-2 text-sm text-cocoa-soft md:hidden">
        Sort
        <select
          value={`${sort.key}:${sort.dir}`}
          onChange={(e) => {
            const [key, dir] = e.target.value.split(":") as [SortKey, SortDir];
            navigateToSort(key, dir);
          }}
          aria-label="Sort purchases"
          className="flex-1 rounded-full border border-cocoa-soft/30 bg-white px-3 py-1.5 text-sm text-cocoa"
        >
          {SORT_LABELS.map((o) => (
            <option key={`${o.key}:${o.dir}`} value={`${o.key}:${o.dir}`}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-cocoa-soft/15 text-xs uppercase tracking-wide text-cocoa-soft">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  className={`px-4 py-3 font-semibold ${col.align === "right" ? "text-right" : ""}`}
                  aria-sort={
                    col.key === sort.key
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {col.key ? (
                    <button
                      type="button"
                      onClick={() => handleHeaderClick(col.key!)}
                      className={`inline-flex items-center gap-1 uppercase tracking-wide transition hover:text-cocoa ${
                        col.key === sort.key ? "text-pine-deep" : ""
                      }`}
                    >
                      {col.label}
                      {col.key === sort.key && <Arrow size={12} aria-hidden="true" />}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              <th className="px-4 py-3 font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <PurchaseRow
                key={p.id}
                purchase={p}
                categories={categories}
                people={people}
                readOnly={readOnly}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 md:hidden">
        {purchases.map((p) => (
          <PurchaseCard
            key={p.id}
            purchase={p}
            categories={categories}
            people={people}
            readOnly={readOnly}
          />
        ))}
      </div>
    </>
  );
}
