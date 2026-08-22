import { Link2 } from "lucide-react";
import { formatPence } from "@/lib/money";
import { PersonAllocationForm } from "./PersonAllocationForm";
import { LinkUserSelect, type LinkableUser } from "./LinkUserSelect";
import { DeletePersonButton } from "./DeletePersonButton";
import { BudgetBar } from "./BudgetBar";
import type { PersonRowData } from "./types";

/** Mobile-first stacked card for one person — shown below md. */
export function PersonCard({
  person,
  seasonId,
  users,
}: {
  person: PersonRowData;
  seasonId: string;
  users: LinkableUser[];
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="font-display text-lg text-pine-deep">{person.name}</span>
          {person.linkedUserEmail && (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-tag px-2.5 py-0.5 text-xs font-semibold text-pine-deep">
              <Link2 size={11} />
              linked to {person.linkedUserEmail}
            </span>
          )}
        </div>
        <DeletePersonButton personId={person.id} personName={person.name} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-cocoa-soft">Gift spend</span>
        <span className="font-semibold text-cocoa">
          {person.isSurpriseForViewer
            ? "🎁 kept secret"
            : formatPence(person.actualSpendPence ?? 0)}
        </span>
      </div>
      {!person.isSurpriseForViewer && person.allocatedPence > 0 && (
        <BudgetBar
          spentPence={person.actualSpendPence ?? 0}
          budgetPence={person.allocatedPence}
        />
      )}

      <div className="flex items-center justify-between gap-2 border-t border-cocoa/10 pt-3">
        <span className="text-sm text-cocoa-soft">Allocation</span>
        <PersonAllocationForm
          personId={person.id}
          seasonId={seasonId}
          allocatedPence={person.allocatedPence}
        />
      </div>

      <div className="border-t border-cocoa/10 pt-3">
        <LinkUserSelect
          personId={person.id}
          currentUserId={person.linkedUserId}
          users={users}
        />
      </div>
    </div>
  );
}
