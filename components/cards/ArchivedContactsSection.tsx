import { Archive, ChevronDown } from "lucide-react";
import { UnarchiveContactButton } from "./UnarchiveContactButton";
import { DeleteContactForeverButton } from "./DeleteContactForeverButton";
import type { ArchivedContactRowData } from "./types";

/** Collapsed, muted list of archived contacts. Only rendered on the active
 *  season — archives are a lifecycle state, not something to manage while
 *  browsing a past year read-only. */
export function ArchivedContactsSection({
  contacts,
}: {
  contacts: ArchivedContactRowData[];
}) {
  if (contacts.length === 0) return null;

  return (
    <details className="group rounded-3xl bg-cream shadow-sm">
      <summary className="flex cursor-pointer select-none items-center gap-2 rounded-3xl px-5 py-3 font-display text-cocoa-soft transition hover:bg-tag/50 [&::-webkit-details-marker]:hidden">
        <Archive size={16} className="text-cocoa-soft" aria-hidden="true" />
        Archived ({contacts.length})
        <ChevronDown
          size={16}
          className="ml-auto text-cocoa-soft transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="flex flex-col gap-2 px-4 pb-4">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"
          >
            <span className="text-sm text-cocoa-soft">{c.name}</span>
            <div className="flex items-center gap-2">
              <UnarchiveContactButton contactId={c.id} contactName={c.name} />
              <DeleteContactForeverButton contactId={c.id} contactName={c.name} />
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
