"use client";

// Fixed bottom tab bar for mobile (<md). Hidden at md+ where the top nav
// takes over. Safe-area padding keeps it clear of home-indicator gestures.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavItemActive } from "./nav-items";

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-cocoa/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Primary"
    >
      <div className="flex items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition ${
                active ? "text-berry" : "text-cocoa-soft"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
              {item.tabLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
