import { IdeaCard } from "./IdeaCard";
import type { IdeaGroupData } from "./types";

/** One person's slice of the backlog: name heading, count chip, ideas —
 *  open/promoted first, discarded ones pushed to the end. */
export function IdeaGroup({
  personName,
  ideas,
}: Pick<IdeaGroupData, "personName" | "ideas">) {
  const sorted = [...ideas].sort((a, b) => {
    const aLast = a.status === "DISCARDED" ? 1 : 0;
    const bLast = b.status === "DISCARDED" ? 1 : 0;
    return aLast - bLast;
  });

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="font-display text-xl text-pine-deep">{personName}</h2>
        <span className="rounded-full bg-tag px-2.5 py-0.5 text-xs font-semibold text-cocoa-soft">
          {ideas.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {sorted.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </div>
    </section>
  );
}
