"use client";

import { useTransition } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { advanceStatus, deletePurchase } from "@/app/actions/purchases";
import { STATUS_LABELS, nextStatus, type PurchaseStatus } from "@/lib/domain";

export default function PurchaseActions({
  id,
  status,
  onEdit,
}: {
  id: string;
  status: PurchaseStatus;
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const next = nextStatus(status);

  function handleAdvance() {
    startTransition(async () => {
      const result = await advanceStatus(id);
      if (!result.ok) window.alert(result.error);
    });
  }

  function handleDelete() {
    if (!window.confirm("Delete this purchase? This can't be undone.")) return;
    startTransition(async () => {
      const result = await deletePurchase(id);
      if (!result.ok) window.alert(result.error);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {next && (
        <button
          type="button"
          onClick={handleAdvance}
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-full bg-pine/15 px-3 py-1.5 text-xs font-semibold text-pine-deep transition hover:bg-pine/25 disabled:opacity-60"
        >
          <Check className="h-3.5 w-3.5" aria-hidden />
          Mark {STATUS_LABELS[next]}
        </button>
      )}
      <button
        type="button"
        onClick={onEdit}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-full border border-pine px-3 py-1.5 text-xs font-semibold text-pine transition hover:bg-pine/10 disabled:opacity-60"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        Edit
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-full border border-berry px-3 py-1.5 text-xs font-semibold text-berry transition hover:bg-berry/10 disabled:opacity-60"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Delete
      </button>
    </div>
  );
}
