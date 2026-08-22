import { Link2 } from "lucide-react";
import { formatPence } from "@/lib/money";
import { PersonAllocationForm } from "./PersonAllocationForm";
import { LinkUserSelect, type LinkableUser } from "./LinkUserSelect";
import { RemoveFromSeasonButton } from "./RemoveFromSeasonButton";
import { BudgetBar } from "./BudgetBar";
import type { PersonRowData } from "./types";

/** Desktop table row for one person — shown at md and up. */
export function PersonTableRow({
  person,
  seasonId,
  year,
  users,
  readOnly = false,
}: {
  person: PersonRowData;
  seasonId: string;
  year: number;
  users: LinkableUser[];
  readOnly?: boolean;
}) {
  return (
    <tr className="border-b border-cocoa/10 align-top last:border-0">
      <td className="py-3 pr-4">
        <div className="flex flex-col gap-1">
          <span className="font-display text-base text-pine-deep">{person.name}</span>
          {person.linkedUserEmail && (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-tag px-2.5 py-0.5 text-xs font-semibold text-pine-deep">
              <Link2 size={11} />
              linked to {person.linkedUserEmail}
            </span>
          )}
        </div>
      </td>
      <td className="py-3 pr-4">
        {readOnly ? (
          <span className="text-sm font-semibold text-cocoa">
            {formatPence(person.allocatedPence)}
          </span>
        ) : (
          <PersonAllocationForm
            personId={person.id}
            seasonId={seasonId}
            allocatedPence={person.allocatedPence}
          />
        )}
      </td>
      <td className="w-40 py-3 pr-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-right text-sm font-semibold text-cocoa">
            {person.isSurpriseForViewer
              ? "🎁 kept secret"
              : formatPence(person.actualSpendPence ?? 0)}
          </span>
          {!person.isSurpriseForViewer && person.allocatedPence > 0 && (
            <BudgetBar
              spentPence={person.actualSpendPence ?? 0}
              budgetPence={person.allocatedPence}
            />
          )}
        </div>
      </td>
      <td className="w-64 py-3 pr-4">
        {readOnly ? (
          <span className="text-sm text-cocoa-soft">
            {person.linkedUserEmail ? `Linked to ${person.linkedUserEmail}` : "Not linked"}
          </span>
        ) : (
          <LinkUserSelect
            personId={person.id}
            currentUserId={person.linkedUserId}
            users={users}
          />
        )}
      </td>
      <td className="w-10 py-3">
        {!readOnly && (
          <RemoveFromSeasonButton
            personId={person.id}
            personName={person.name}
            seasonId={seasonId}
            year={year}
          />
        )}
      </td>
    </tr>
  );
}
