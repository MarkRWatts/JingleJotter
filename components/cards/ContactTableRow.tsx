import { ContactDetails } from "./ContactDetails";
import { StatusToggle } from "./StatusToggle";
import { ArchiveContactButton } from "./ArchiveContactButton";
import type { ContactRowData, LinkablePersonOption } from "./types";

/** Desktop table row for one card contact — shown at md and up. */
export function ContactTableRow({
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
    <tr className="border-b border-cocoa/10 align-top last:border-0">
      <td className="w-72 py-3 pr-4">
        <ContactDetails contact={contact} personOptions={personOptions} readOnly={readOnly} />
      </td>
      <td className="py-3 pr-4">
        <div className="flex flex-wrap items-center gap-2">
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
      </td>
      <td className="w-10 py-3">
        {!readOnly && (
          <ArchiveContactButton contactId={contact.id} contactName={contact.name} />
        )}
      </td>
    </tr>
  );
}
