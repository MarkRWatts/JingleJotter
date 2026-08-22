// Server component: brand mark, desktop nav links, and the signed-in user's
// name + sign-out control. Collapses to a slim brand-only bar on mobile,
// where BottomTabs (in AppShell) carries the primary navigation instead.

import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { toggleWhimsy } from "@/app/actions/prefs";
import { NavLinks } from "./nav-links";
import { SignOutButton } from "./sign-out-button";
import { SeasonSwitcher, type SeasonSwitcherOption } from "./season-switcher";

type ShellUser = {
  name?: string | null;
  email?: string | null;
};

function initial(user: ShellUser): string {
  return (user.name ?? user.email ?? "?").trim().charAt(0).toUpperCase() || "?";
}

export function TopNav({
  user,
  showWhimsy,
  seasons,
  currentYear,
}: {
  user: ShellUser;
  showWhimsy: boolean;
  seasons: SeasonSwitcherOption[];
  currentYear: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-cocoa/10 bg-cream/95 backdrop-blur">
      {/* Row 1: brand + season + user controls. Page links get their own
          row below (desktop only — mobile nav lives in the bottom tabs). */}
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 pt-3 pb-3 md:px-6 md:pb-1.5">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/brand/icon.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-xl shadow-sm"
            priority
          />
          <span className="font-display text-lg text-pine-deep">Jingle Jotter</span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-3">
          <SeasonSwitcher seasons={seasons} currentYear={currentYear} />
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <form action={toggleWhimsy}>
            <button
              type="submit"
              title={showWhimsy ? "Turn festive decorations off" : "Turn festive decorations on"}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                showWhimsy
                  ? "bg-amber/20 text-amber hover:bg-amber/30"
                  : "text-cocoa-soft/60 hover:bg-tag hover:text-cocoa-soft"
              }`}
            >
              <Sparkles size={16} aria-hidden="true" />
              <span className="sr-only">
                {showWhimsy ? "Turn festive decorations off" : "Turn festive decorations on"}
              </span>
            </button>
          </form>
          <div className="hidden items-center gap-2 md:flex">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-tag text-sm font-semibold text-pine-deep"
              aria-hidden="true"
            >
              {initial(user)}
            </span>
            <span className="max-w-[10rem] truncate text-sm font-semibold text-cocoa">
              {user.name ?? user.email}
            </span>
          </div>
          <div className="hidden md:block">
            <SignOutButton />
          </div>
          <div className="md:hidden">
            <SignOutButton compact />
          </div>
        </div>
      </div>

      {/* Row 2: page links, full width to breathe. */}
      <div className="mx-auto hidden max-w-5xl items-center px-4 pb-2 md:flex md:px-6">
        <NavLinks />
      </div>
    </header>
  );
}
