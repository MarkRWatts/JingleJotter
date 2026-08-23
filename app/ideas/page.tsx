import Link from "next/link";
import { redirect } from "next/navigation";
import { Lightbulb, Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AddIdeaForm } from "@/components/ideas/AddIdeaForm";
import { IdeaGroup } from "@/components/ideas/IdeaGroup";
import type { IdeaData, IdeaGroupData, PersonOption } from "@/components/ideas/types";

// The gift idea backlog: season-independent, so there's no year scoping and
// no ArchivedNotice here — ideas live outside any one Christmas.
export default async function IdeasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  const userId = session.user.id;

  const people = await prisma.person.findMany({
    orderBy: { name: "asc" },
    include: {
      linkedUser: { select: { id: true } },
      giftIdeas: { orderBy: { createdAt: "desc" } },
    },
  });

  // Surprise masking: the person linked to the signed-in viewer must be
  // omitted entirely — not shown as an empty group, not counted, nothing.
  // Same rule as getPersonSummaries() in lib/queries.ts.
  const visiblePeople = people.filter((p) => p.linkedUser?.id !== userId);

  const personOptions: PersonOption[] = visiblePeople.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  const groups: IdeaGroupData[] = visiblePeople
    .map((p) => ({
      personId: p.id,
      personName: p.name,
      ideas: p.giftIdeas.map(
        (idea): IdeaData => ({
          id: idea.id,
          title: idea.title,
          notes: idea.notes,
          url: idea.url,
          approxPence: idea.approxPence,
          status: idea.status as IdeaData["status"],
          purchaseId: idea.purchaseId,
          createdAt: idea.createdAt.toISOString(),
        }),
      ),
    }))
    .filter((g) => g.ideas.length > 0);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Lightbulb size={22} className="text-amber" />
          <h1 className="font-festive text-3xl text-pine-deep sm:text-4xl">Gift Ideas</h1>
        </div>
        <p className="text-sm text-cocoa-soft">
          Sparks for future Christmases — jotted down before you forget.
        </p>
      </header>

      {personOptions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-10 text-center shadow-sm">
          <Users size={32} className="text-pine" />
          <h2 className="font-display text-xl text-pine-deep">No one to jot ideas for yet</h2>
          <p className="max-w-sm text-sm text-cocoa-soft">
            Add some people first, then come back here to start stashing gift ideas.
          </p>
          <Link
            href="/people"
            className="rounded-full bg-berry px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep"
          >
            Go to People
          </Link>
        </div>
      ) : (
        <>
          <AddIdeaForm people={personOptions} />

          {groups.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-cocoa-soft shadow-sm">
              No ideas yet — jot one down above.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {groups.map((g) => (
                <IdeaGroup key={g.personId} personName={g.personName} ideas={g.ideas} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
