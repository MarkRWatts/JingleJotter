"use client";

// Global season switcher, shown in TopNav on every page. Reads the viewed
// year straight out of the URL (falling back to the active season when no
// ?year= is present) so it always reflects what the current page actually
// resolved via lib/season.ts's resolveSeason(). Switching pushes the same
// pathname with ?year= set — or dropped entirely when picking the active
// season, so default URLs stay clean.

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { ChangeEvent } from "react";

export type SeasonSwitcherOption = { id: string; year: number; active: boolean };

export function SeasonSwitcher({
  seasons,
  currentYear,
}: {
  seasons: SeasonSwitcherOption[];
  currentYear: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // /seasons doesn't read ?year at all — a switcher there would just be a
  // dead control, so it's skipped in favour of that page's own season table.
  if (pathname.startsWith("/seasons") || seasons.length === 0) return null;

  const yearParam = searchParams.get("year");
  const parsedYear = yearParam ? parseInt(yearParam, 10) : NaN;
  const viewedYear = seasons.some((s) => s.year === parsedYear) ? parsedYear : currentYear;

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const year = parseInt(event.target.value, 10);
    const params = new URLSearchParams(searchParams.toString());
    if (year === currentYear) {
      params.delete("year");
    } else {
      params.set("year", String(year));
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <select
      value={viewedYear}
      onChange={handleChange}
      aria-label="Season"
      className="h-10 rounded-xl border border-cocoa-soft/30 bg-white px-3 text-sm font-semibold text-cocoa"
    >
      {seasons.map((s) => (
        <option key={s.id} value={s.year}>
          {s.active ? `${s.year} · current` : s.year}
        </option>
      ))}
    </select>
  );
}
