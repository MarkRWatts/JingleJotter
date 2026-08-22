"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { formatPence } from "@/lib/money";
import StatusChip from "./StatusChip";
import PurchaseActions from "./PurchaseActions";
import PurchaseEditForm from "./PurchaseEditForm";
import type { PurchaseListItem, SelectOption } from "./types";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function PurchaseCard({
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
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <PurchaseEditForm
          purchase={purchase}
          categories={categories}
          people={people}
          onCancel={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      </div>
    );
  }

  const isIdea = purchase.status === "IDEA";
  const meta = [
    purchase.categoryName,
    purchase.personName,
    purchase.store,
    formatDate(purchase.purchasedOn) || null,
  ].filter((v): v is string => Boolean(v));

  return (
    <div
      className={`rounded-2xl p-4 shadow-sm ${
        isIdea ? "border border-dashed border-cocoa-soft/50 bg-cream" : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium text-cocoa">
          {purchase.isMasked && (
            <Gift className="h-4 w-4 shrink-0 text-berry" aria-hidden />
          )}
          <span>{purchase.title}</span>
        </div>
        <span className="shrink-0 font-semibold text-cocoa">
          {formatPence(purchase.pricePence)}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-cocoa-soft">
        {meta.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>·</span>}
            {item}
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <StatusChip status={purchase.status} />
        {purchase.isMasked && (
          <span className="text-xs italic text-cocoa-soft">Shh — surprise</span>
        )}
      </div>
      {!purchase.isMasked && (
        <div className="mt-3">
          <PurchaseActions
            id={purchase.id}
            status={purchase.status}
            onEdit={() => setEditing(true)}
          />
        </div>
      )}
    </div>
  );
}
