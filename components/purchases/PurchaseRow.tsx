"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { formatPence } from "@/lib/money";
import StatusChip from "./StatusChip";
import PurchaseActions from "./PurchaseActions";
import PurchaseEditForm from "./PurchaseEditForm";
import type { PurchaseListItem, SelectOption } from "./types";

const COLUMN_COUNT = 8;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function PurchaseRow({
  purchase,
  categories,
  people,
}: {
  purchase: PurchaseListItem;
  categories: SelectOption[];
  people: SelectOption[];
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-b border-cocoa-soft/10 last:border-b-0">
        <td colSpan={COLUMN_COUNT} className="bg-cream/40 px-4 py-4">
          <PurchaseEditForm
            purchase={purchase}
            categories={categories}
            people={people}
            onCancel={() => setEditing(false)}
            onSaved={() => setEditing(false)}
          />
        </td>
      </tr>
    );
  }

  const isIdea = purchase.status === "IDEA";

  return (
    <tr
      className={`border-b border-cocoa-soft/10 last:border-b-0 ${isIdea ? "bg-cream/40" : ""}`}
    >
      <td className="px-4 py-3 font-medium text-cocoa">
        <span className="flex items-center gap-1.5">
          {purchase.isMasked && <Gift className="h-4 w-4 shrink-0 text-berry" aria-hidden />}
          {purchase.title}
        </span>
      </td>
      <td className="px-4 py-3 text-cocoa-soft">{purchase.personName ?? "—"}</td>
      <td className="px-4 py-3 text-cocoa-soft">{purchase.categoryName}</td>
      <td className="px-4 py-3 text-cocoa-soft">{purchase.store ?? "—"}</td>
      <td className="px-4 py-3 text-right font-semibold text-cocoa">
        {formatPence(purchase.pricePence)}
      </td>
      <td className="px-4 py-3 text-cocoa-soft">{formatDate(purchase.purchasedOn)}</td>
      <td className="px-4 py-3">
        <StatusChip status={purchase.status} />
      </td>
      <td className="px-4 py-3">
        {purchase.isMasked ? (
          <span className="text-xs italic text-cocoa-soft">Shh — surprise</span>
        ) : (
          <PurchaseActions
            id={purchase.id}
            status={purchase.status}
            onEdit={() => setEditing(true)}
          />
        )}
      </td>
    </tr>
  );
}
