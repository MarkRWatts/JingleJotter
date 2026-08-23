"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { PURCHASE_STATUSES, STATUS_LABELS } from "@/lib/domain";
import type { SelectOption } from "./types";

type Selected = {
  year?: string;
  category?: string;
  person?: string;
  status?: string;
  q?: string;
};

export default function FilterBar({
  categories,
  people,
  selected,
  resultCount,
}: {
  categories: SelectOption[];
  people: SelectOption[];
  selected: Selected;
  resultCount?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(next: Partial<Selected>): string {
    // Start from the live URL so unrelated params (sort/dir, year) survive.
    const params = new URLSearchParams(searchParams.toString());
    const merged = { ...selected, ...next };
    for (const key of ["category", "person", "status", "q"] as const) {
      if (merged[key]) params.set(key, merged[key]!);
      else params.delete(key);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function handleChange(key: "category" | "person" | "status", value: string) {
    router.push(buildHref({ [key]: value || undefined }));
  }

  // Local text state so typing doesn't navigate on every keystroke — synced
  // back to the URL after a short pause, and re-synced from the URL when it
  // changes some other way (e.g. Clear filters). `hasMounted` only guards
  // the very first render — using it to gate every `selected.q` sync would
  // also swallow the next real keystroke that happens to land right as a
  // debounced navigation completes.
  const [searchText, setSearchText] = useState(selected.q ?? "");
  const hasMounted = useRef(false);

  useEffect(() => {
    setSearchText(selected.q ?? "");
  }, [selected.q]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      router.replace(buildHref({ q: searchText.trim() || undefined }));
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const hasFilters = Boolean(
    selected.category || selected.person || selected.status || selected.q,
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-3 h-4 w-4 text-cocoa-soft"
          aria-hidden
        />
        <input
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search title, store, notes…"
          aria-label="Search purchases"
          className="rounded-full border border-cocoa-soft/30 bg-white py-1.5 pl-9 pr-3 text-sm text-cocoa"
        />
      </label>
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
          onClick={() => {
            setSearchText("");
            router.push(
              buildHref({ category: undefined, person: undefined, status: undefined, q: undefined }),
            );
          }}
          className="rounded-full border border-pine px-3 py-1.5 text-sm font-semibold text-pine transition hover:bg-pine/10"
        >
          Clear filters
        </button>
      )}
      {selected.q && (
        <span className="text-xs text-cocoa-soft">
          {resultCount ?? 0} result{resultCount === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}
