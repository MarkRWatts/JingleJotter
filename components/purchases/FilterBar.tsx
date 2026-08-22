"use client";

import { useRouter, usePathname } from "next/navigation";
import { PURCHASE_STATUSES, STATUS_LABELS } from "@/lib/domain";
import type { SelectOption } from "./types";

type Selected = {
  year?: string;
  category?: string;
  person?: string;
  status?: string;
};

export default function FilterBar({
  categories,
  people,
  selected,
}: {
  categories: SelectOption[];
  people: SelectOption[];
  selected: Selected;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function buildHref(next: Partial<Selected>): string {
    const merged = { ...selected, ...next };
    const params = new URLSearchParams();
    if (merged.year) params.set("year", merged.year);
    if (merged.category) params.set("category", merged.category);
    if (merged.person) params.set("person", merged.person);
    if (merged.status) params.set("status", merged.status);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function handleChange(key: "category" | "person" | "status", value: string) {
    router.push(buildHref({ [key]: value || undefined }));
  }

  const hasFilters = Boolean(selected.category || selected.person || selected.status);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={selected.category ?? ""}
        onChange={(e) => handleChange("category", e.target.value)}
        aria-label="Filter by category"
        className="rounded-full border border-cocoa-soft/30 bg-white px-3 py-1.5 text-sm text-cocoa"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        value={selected.person ?? ""}
        onChange={(e) => handleChange("person", e.target.value)}
        aria-label="Filter by person"
        className="rounded-full border border-cocoa-soft/30 bg-white px-3 py-1.5 text-sm text-cocoa"
      >
        <option value="">Everyone</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select
        value={selected.status ?? ""}
        onChange={(e) => handleChange("status", e.target.value)}
        aria-label="Filter by status"
        className="rounded-full border border-cocoa-soft/30 bg-white px-3 py-1.5 text-sm text-cocoa"
      >
        <option value="">All statuses</option>
        {PURCHASE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push(buildHref({ category: undefined, person: undefined, status: undefined }))}
          className="rounded-full border border-pine px-3 py-1.5 text-sm font-semibold text-pine transition hover:bg-pine/10"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
