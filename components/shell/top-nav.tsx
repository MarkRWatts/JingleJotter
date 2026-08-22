// Server component: brand mark, desktop nav links, and the signed-in user's
// name + sign-out control. Collapses to a slim brand-only bar on mobile,
// where BottomTabs (in AppShell) carries the primary navigation instead.

import Image from "next/image";
import Link from "next/link";
import { NavLinks } from "./nav-links";
import { SignOutButton } from "./sign-out-button";

type ShellUser = {
  name?: string | null;
  email?: string | null;
};

function initial(user: ShellUser): string {
  return (user.name ?? user.email ?? "?").trim().charAt(0).toUpperCase() || "?";
}

export function TopNav({ user }: { user: ShellUser }) {
  return (
    <header className="sticky top-0 z-30 border-b border-cocoa/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-6">
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

        <NavLinks />

        <div className="flex items-center gap-2 md:gap-3">
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
    </header>
  );
}
