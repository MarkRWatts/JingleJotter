import { Users2, ChevronDown, Link2 } from "lucide-react";
import { AddToCardSeasonButton } from "./AddToCardSeasonButton";
import { AddAllToSeasonButton } from "./AddAllToSeasonButton";
import type { OtherContactRowData } from "./types";

/** Collapsed-by-default list of every non-archived contact not yet on this
 *  season's list — styled like the people page's "Not in this season"
 *  section. Only ever rendered on the active season. */
export function NotOnListSection({
  contacts,
  seasonId,
  year,
}: {
  contacts: OtherContactRowData[];
  seasonId: string;
  year: number;
}) {
  if (contacts.length === 0) return null;

  return (
    <details className="group rounded-3xl bg-tag/60 shadow-sm">
      <summary className="flex cursor-pointer select-none items-center gap-2 rounded-3xl px-5 py-3 font-display text-pine-deep transition hover:bg-tag [&::-webkit-details-marker]:hidden">
        <Users2 size={18} className="text-berry" aria-hidden="true" />
        Not on this year&apos;s list ({contacts.length})
        <ChevronDown
          size={16}
          className="ml-auto text-cocoa-soft transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="flex flex-col gap-2 px-4 pb-4">
        {contacts.length >= 2 && (
          <div className="flex justify-end">
            <AddAllToSeasonButton seasonId={seasonId} />
          </div>
        )}
        {contacts.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex flex-col gap-1">
              <span className="font-display text-sm text-pine-deep">{c.name}</span>
              {c.linkedPersonName && (
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-tag px-2.5 py-0.5 text-xs font-semibold text-pine-deep">
                  <Link2 size={11} />
                  linked to {c.linkedPersonName}
                </span>
              )}
            </div>
            <AddToCardSeasonButton contactId={c.id} seasonId={seasonId} year={year} />
          </div>
        ))}
      </div>
    </details>
  );
}
