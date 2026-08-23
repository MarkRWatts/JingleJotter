import { ContactDetails } from "./ContactDetails";
import { StatusToggle } from "./StatusToggle";
import { ArchiveContactButton } from "./ArchiveContactButton";
import type { ContactRowData, LinkablePersonOption } from "./types";

/** Mobile-first stacked card for one card contact — shown below md. */
export function ContactCard({
  contact,
  seasonId,
  personOptions,
  readOnly = false,
}: {
  contact: ContactRowData;
  seasonId: string;
  personOptions: LinkablePersonOption[];
  readOnly?: boolean;
}) {
  const dimmed = !contact.status.sendCard;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <ContactDetails contact={contact} personOptions={personOptions} readOnly={readOnly} />
        {!readOnly && (
          <ArchiveContactButton contactId={contact.id} contactName={contact.name} />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-cocoa/10 pt-3">
        <StatusToggle
          contactId={contact.id}
          seasonId={seasonId}
          field="sendCard"
          checked={contact.status.sendCard}
          readOnly={readOnly}
        />
        <StatusToggle
          contactId={contact.id}
          seasonId={seasonId}
          field="sent"
          checked={contact.status.sent}
          dimmed={dimmed}
          readOnly={readOnly}
        />
        <StatusToggle
          contactId={contact.id}
          seasonId={seasonId}
          field="received"
          checked={contact.status.received}
          dimmed={dimmed}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
