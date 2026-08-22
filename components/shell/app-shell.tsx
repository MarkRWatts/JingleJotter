// Root shell: decides whether to render nav chrome at all. Signed-out pages
// (just /signin today) get bare children on the cream background; everywhere
// else gets the top nav (desktop) / bottom tabs (mobile).
//
// This runs inside the root layout, so it's the one place that has to guard
// against "no session" itself rather than relying on each page's own
// auth()-or-redirect check.

import { auth } from "@/auth";
import { TopNav } from "./top-nav";
import { BottomTabs } from "./bottom-tabs";
import { Rooftops } from "@/components/dashboard/rooftops";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <>
      <TopNav user={{ name: session.user.name, email: session.user.email }} />
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
