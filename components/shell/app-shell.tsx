// Root shell: decides whether to render nav chrome at all. Signed-out pages
// (just /signin today) get bare children on the cream background; everywhere
// else gets the top nav (desktop) / bottom tabs (mobile).
//
// This runs inside the root layout, so it's the one place that has to guard
// against "no session" itself rather than relying on each page's own
// auth()-or-redirect check.

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolveSeason } from "@/lib/season";
import { TopNav } from "./top-nav";
import { BottomTabs } from "./bottom-tabs";
import { Rooftops } from "@/components/dashboard/rooftops";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    return <>{children}</>;
  }

  // Layouts don't see the page's own ?year=, so the shell only supplies the
  // full season list plus the resolved "current" year (active season, or
  // the newest one if none is active) — SeasonSwitcher reconciles that
  // against the URL client-side.
  const [seasons, currentSeason] = await Promise.all([
    prisma.season.findMany({
      orderBy: { year: "desc" },
      select: { id: true, year: true, active: true },
    }),
    resolveSeason(),
  ]);
  const currentYear = currentSeason?.year ?? seasons[0]?.year ?? new Date().getFullYear();

  return (
    <>
      <TopNav
        user={{ name: session.user.name, email: session.user.email }}
        showWhimsy={
          (await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { showWhimsy: true },
          }))?.showWhimsy ?? true
        }
        seasons={seasons}
        currentYear={currentYear}
      />
      <main className="flex-1 pb-24 md:pb-0">
        {children}
        {/* Every page signs off with the snowy skyline. */}
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <Rooftops />
        </div>
      </main>
      <BottomTabs />
    </>
  );
}
