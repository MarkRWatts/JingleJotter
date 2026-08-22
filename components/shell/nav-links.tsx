"use client";

// Desktop top-bar nav links. Needs usePathname for active-state, hence the
// small client boundary — everything else in the shell can stay server-only.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavItemActive } from "./nav-items";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-tag text-pine-deep"
                : "text-cocoa-soft hover:bg-tag/60 hover:text-cocoa"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
