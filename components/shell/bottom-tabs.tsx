"use client";

// Fixed bottom tab bar for mobile (<md). Hidden at md+ where the top nav
// takes over. Safe-area padding keeps it clear of home-indicator gestures.
// Four everyday tabs plus a "More" tab that opens a small sheet with the
// remaining destinations (Ideas, Seasons, …).

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Ellipsis } from "lucide-react";
import { MOBILE_TAB_ITEMS, MORE_ITEMS, isNavItemActive } from "./nav-items";

export function BottomTabs() {
  const pathname = usePathname();
  const year = useSearchParams().get("year");
  const [moreOpen, setMoreOpen] = useState(false);

  const withYear = (href: string) => (year ? `${href}?year=${year}` : href);
  const moreActive = MORE_ITEMS.some((item) => isNavItemActive(pathname, item.href));

  return (
    <>
      {moreOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMoreOpen(false)}
          className="fixed inset-0 z-40 bg-cocoa/30 backdrop-blur-[2px] md:hidden"
        />
      )}

      {moreOpen && (
        <div className="fixed inset-x-3 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-50 flex flex-col gap-1 rounded-3xl bg-white p-3 shadow-lg md:hidden">
          {MORE_ITEMS.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={withYear(item.href)}
                onClick={() => setMoreOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  active ? "bg-tag text-pine-deep" : "text-cocoa hover:bg-tag/60"
                }`}
              >
                <Icon size={20} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-cocoa/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Primary"
      >
        <div className="flex items-stretch justify-around">
          {MOBILE_TAB_ITEMS.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={withYear(item.href)}
                onClick={() => setMoreOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-0.5 px-0.5 py-1.5 text-[10px] font-semibold whitespace-nowrap transition ${
                  active ? "text-berry" : "text-cocoa-soft"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
                {item.tabLabel}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            aria-expanded={moreOpen}
            className={`flex flex-1 flex-col items-center gap-0.5 px-0.5 py-1.5 text-[10px] font-semibold whitespace-nowrap transition ${
              moreActive || moreOpen ? "text-berry" : "text-cocoa-soft"
            }`}
          >
            <Ellipsis size={20} strokeWidth={moreActive || moreOpen ? 2.5 : 2} aria-hidden="true" />
            More
          </button>
        </div>
      </nav>
    </>
  );
}
