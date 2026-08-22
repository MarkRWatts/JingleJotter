import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, PiggyBank, CalendarRange } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolveSeason } from "@/lib/season";
import { AddPersonForm } from "@/components/people/AddPersonForm";
import { PersonCard } from "@/components/people/PersonCard";
import { PersonTableRow } from "@/components/people/PersonTableRow";
import type { PersonRowData } from "@/components/people/types";
import type { LinkableUser } from "@/components/people/LinkUserSelect";
import { AddCategoryForm } from "@/components/people/AddCategoryForm";
import { CategoryCard, type CategoryRowData } from "@/components/people/CategoryCard";
import { CategoryTableRow } from "@/components/people/CategoryTableRow";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { year } = await searchParams;
  const season = await resolveSeason(year);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      {!season ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-10 text-center shadow-sm">
          <PiggyBank size={32} className="text-pine" />
          <h1 className="font-display text-2xl text-pine-deep">No season yet</h1>
          <p className="max-w-sm text-sm text-cocoa-soft">
            Start your first Christmas season to begin tracking people and budgets.
          </p>
          <Link
            href="/seasons"
            className="rounded-full bg-berry px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep"
          >
            Go to Seasons
          </Link>
        </div>
      ) : (
        <PeopleAndBudgets seasonId={season.id} year={season.year} currentUserId={session.user.id} />
      )}
    </div>
  );
}

async function PeopleAndBudgets({
  seasonId,
  year,
  currentUserId,
}: {
  seasonId: string;
  year: number;
  currentUserId: string;
}) {
  const [people, spendGroups, users, categories, purchaseCounts] = await Promise.all([
    prisma.person.findMany({
      orderBy: { name: "asc" },
      include: {
        linkedUser: { select: { id: true, email: true } },
        personBudgets: { where: { seasonId } },
      },
    }),
    prisma.purchase.groupBy({
      by: ["personId"],
      where: { seasonId, personId: { not: null }, status: { not: "IDEA" } },
      _sum: { pricePence: true },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        person: { select: { name: true } },
      },
      orderBy: { email: "asc" },
    }),
    prisma.category.findMany({
      where: { seasonId },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.purchase.groupBy({
      by: ["categoryId"],
      where: { seasonId },
      _count: { _all: true },
    }),
  ]);

  const spendByPerson = new Map(
    spendGroups.map((g) => [g.personId as string, g._sum.pricePence ?? 0]),
  );
  const purchaseCountByCategory = new Map(
    purchaseCounts.map((g) => [g.categoryId, g._count._all]),
  );

  const linkableUsers: LinkableUser[] = users.map((u) => ({
    id: u.id,
    label:
      (u.email ?? u.name ?? "Unnamed login") +
      (u.person && u.person.name ? ` (linked to ${u.person.name})` : ""),
  }));

  const personRows: PersonRowData[] = people.map((p) => {
    const isSurpriseForViewer = p.linkedUser?.id === currentUserId;
    return {
      id: p.id,
      name: p.name,
      allocatedPence: p.personBudgets[0]?.allocatedPence ?? 0,
      actualSpendPence: isSurpriseForViewer ? null : spendByPerson.get(p.id) ?? 0,
      linkedUserEmail: p.linkedUser?.email ?? null,
      linkedUserId: p.linkedUser?.id ?? null,
      isSurpriseForViewer,
    };
  });

  const categoryRows: CategoryRowData[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    kind: c.kind,
    budgetPence: c.budgetPence,
    purchaseCount: purchaseCountByCategory.get(c.id) ?? 0,
  }));

  return (
    <>
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Users size={22} className="text-berry" />
          <h1 className="font-festive text-3xl text-pine-deep sm:text-4xl">
            People &amp; Budgets
          </h1>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-cocoa-soft">
          <CalendarRange size={14} />
          Christmas {year}
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl text-pine-deep">People</h2>
        <AddPersonForm seasonId={seasonId} />

        {personRows.length === 0 ? (
          <EmptyState label="No one on the list yet — add your first person above." />
        ) : (
          <>
            <div className="flex flex-col gap-3 md:hidden">
              {personRows.map((p) => (
                <PersonCard key={p.id} person={p} seasonId={seasonId} users={linkableUsers} />
              ))}
            </div>
            <div className="hidden overflow-x-auto rounded-2xl bg-white p-4 shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-cocoa/10 text-xs font-semibold uppercase tracking-wide text-cocoa-soft">
                    <th className="py-2 pr-4 font-semibold">Name</th>
                    <th className="py-2 pr-4 font-semibold">Allocation</th>
                    <th className="py-2 pr-4 font-semibold">Gift spend</th>
                    <th className="py-2 pr-4 font-semibold">Linked login</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {personRows.map((p) => (
                    <PersonTableRow
                      key={p.id}
                      person={p}
                      seasonId={seasonId}
                      users={linkableUsers}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl text-pine-deep">Category budgets</h2>
        <AddCategoryForm seasonId={seasonId} />

        {categoryRows.length === 0 ? (
          <EmptyState label="No categories yet — add one above." />
        ) : (
          <>
            <div className="flex flex-col gap-3 md:hidden">
              {categoryRows.map((c) => (
                <CategoryCard key={c.id} category={c} />
              ))}
            </div>
            <div className="hidden overflow-x-auto rounded-2xl bg-white p-4 shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-cocoa/10 text-xs font-semibold uppercase tracking-wide text-cocoa-soft">
                    <th className="py-2 pr-4 font-semibold">Category</th>
                    <th className="py-2 pr-4 font-semibold">Kind</th>
                    <th className="py-2 pr-4 font-semibold">Budget</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {categoryRows.map((c) => (
                    <CategoryTableRow key={c.id} category={c} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="rounded-2xl bg-white p-6 text-center text-sm text-cocoa-soft shadow-sm">
      {label}
    </p>
  );
}
