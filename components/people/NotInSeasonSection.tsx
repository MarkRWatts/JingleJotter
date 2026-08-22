import { Users2, ChevronDown, Link2 } from "lucide-react";
import { AddToSeasonButton } from "./AddToSeasonButton";
import { DeleteForeverButton } from "./DeleteForeverButton";
import type { OtherPersonRowData } from "./types";

/** Collapsed-by-default list of every Person not currently a member of this
 *  season (styled like the dashboard's run-up calendar summary). Only ever
 *  rendered when the season is writable — archived seasons hide this
 *  entirely, since there's nothing to add or delete on a read-only view. */
export function NotInSeasonSection({
  people,
  seasonId,
  year,
}: {
  people: OtherPersonRowData[];
  seasonId: string;
  year: number;
}) {
  if (people.length === 0) return null;

  return (
    <details className="group rounded-3xl bg-tag/60 shadow-sm">
      <summary className="flex cursor-pointer select-none items-center gap-2 rounded-3xl px-5 py-3 font-display text-pine-deep transition hover:bg-tag [&::-webkit-details-marker]:hidden">
        <Users2 size={18} className="text-berry" aria-hidden="true" />
        Not in this season ({people.length})
        <ChevronDown
          size={16}
          className="ml-auto text-cocoa-soft transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="flex flex-col gap-2 px-4 pb-4">
        {people.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex flex-col gap-1">
              <span className="font-display text-sm text-pine-deep">{p.name}</span>
              <div className="flex flex-wrap items-center gap-2">
                {p.linkedUserEmail && (
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-tag px-2.5 py-0.5 text-xs font-semibold text-pine-deep">
                    <Link2 size={11} />
                    linked to {p.linkedUserEmail}
                  </span>
                )}
                {p.lastYear && (
                  <span className="text-xs text-cocoa-soft">Last in {p.lastYear}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AddToSeasonButton personId={p.id} seasonId={seasonId} year={year} />
              {p.canDeleteForever && (
                <DeleteForeverButton personId={p.id} personName={p.name} />
              )}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
