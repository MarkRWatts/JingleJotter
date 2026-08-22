"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCategory } from "@/app/actions/people";

export function DeleteCategoryButton({
  categoryId,
  categoryName,
  purchaseCount,
}: {
  categoryId: string;
  categoryName: string;
  purchaseCount: number;
}) {
  const [state, formAction, pending] = useActionState(deleteCategory, null);
  const blocked = purchaseCount > 0;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (blocked) {
          e.preventDefault();
          return;
        }
        if (!confirm(`Delete the "${categoryName}" category?`)) {
          e.preventDefault();
        }
      }}
      className="flex flex-col items-end gap-1"
    >
      <input type="hidden" name="categoryId" value={categoryId} />
      <button
        type="submit"
        disabled={pending || blocked}
        title={
          blocked
            ? `Can't delete — ${purchaseCount} purchase${purchaseCount === 1 ? "" : "s"} in here`
            : "Delete category"
        }
        aria-label={`Delete ${categoryName}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-cocoa-soft transition hover:bg-berry/10 hover:text-berry-deep disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Trash2 size={16} />
      </button>
      {state?.error && (
        <p className="max-w-[12rem] text-right text-xs text-berry-deep">{state.error}</p>
      )}
    </form>
  );
}
