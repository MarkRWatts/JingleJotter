"use client";

import PurchaseRow from "./PurchaseRow";
import PurchaseCard from "./PurchaseCard";
import type { PurchaseListItem, SelectOption } from "./types";

export default function PurchaseList({
  purchases,
  categories,
  people,
  readOnly = false,
}: {
  purchases: PurchaseListItem[];
  categories: SelectOption[];
  people: SelectOption[];
  readOnly?: boolean;
}) {
  if (purchases.length === 0) {
    return (
      <p className="rounded-2xl bg-tag px-5 py-8 text-center text-cocoa-soft">
        Nothing here yet — add a gift idea above to get started.
      </p>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-cocoa-soft/15 text-xs uppercase tracking-wide text-cocoa-soft">
            <tr>
              <th className="px-4 py-3 font-semibold">Item</th>
              <th className="px-4 py-3 font-semibold">For</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Store</th>
              <th className="px-4 py-3 text-right font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Purchased</th>
              <th className="px-4 py-3 font-semibold">Status</th>
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
