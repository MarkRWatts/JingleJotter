// Shared nav destinations for the desktop top bar and mobile bottom tabs.

import { Home, Gift, Users, CalendarRange, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  /** Shorter label for the cramped mobile tab bar. */
  tabLabel: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", tabLabel: "Home", icon: Home },
  { href: "/purchases", label: "Purchases", tabLabel: "Purchases", icon: Gift },
  { href: "/people", label: "People", tabLabel: "People", icon: Users },
  { href: "/seasons", label: "Seasons", tabLabel: "Seasons", icon: CalendarRange },
];

/** A nav item is "active" for its own route and any nested route beneath it. */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
