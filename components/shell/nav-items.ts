// Shared nav destinations for the desktop top bar and mobile bottom tabs.

import {
  Home,
  Gift,
  Users,
  Lightbulb,
  Mail,
  CalendarRange,
  Luggage,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  /** Shorter label for the cramped mobile tab bar. */
  tabLabel: string;
  icon: LucideIcon;
};

/** Every destination, in desktop top-bar order. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", tabLabel: "Home", icon: Home },
  { href: "/purchases", label: "Purchases", tabLabel: "Purchases", icon: Gift },
  { href: "/people", label: "People", tabLabel: "People", icon: Users },
  { href: "/ideas", label: "Ideas", tabLabel: "Ideas", icon: Lightbulb },
  { href: "/cards", label: "Cards", tabLabel: "Cards", icon: Mail },
  { href: "/trip", label: "City Break", tabLabel: "Trip", icon: Luggage },
  { href: "/seasons", label: "Seasons", tabLabel: "Seasons", icon: CalendarRange },
];

// The mobile tab bar is comfortable at five slots: the four everyday pages
// get their own tab, everything else lives behind the "More" sheet.
const MOBILE_TAB_HREFS = ["/", "/purchases", "/people", "/trip"];

export const MOBILE_TAB_ITEMS: NavItem[] = MOBILE_TAB_HREFS.map(
  (href) => NAV_ITEMS.find((i) => i.href === href)!,
);

export const MORE_ITEMS: NavItem[] = NAV_ITEMS.filter(
  (i) => !MOBILE_TAB_HREFS.includes(i.href),
);

/** A nav item is "active" for its own route and any nested route beneath it. */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
