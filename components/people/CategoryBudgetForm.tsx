"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { updateCategoryBudget } from "@/app/actions/people";

export function CategoryBudgetForm({
  categoryId,
  budgetPence,
}: {
  categoryId: string;
  budgetPence: number;
}) {
  const [state, formAction, pending] = useActionState(updateCategoryBudget, null);
  const defaultValue = budgetPence > 0 ? (budgetPence / 100).toFixed(2) : "";

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <input type="hidden" name="categoryId" value={categoryId} />
        <span className="text-cocoa-soft">£</span>
        <input
          name="budget"
          inputMode="decimal"
          defaultValue={defaultValue}
          placeholder="0.00"
          aria-label="Budget"
          className="w-24 rounded-full border border-cocoa/15 bg-cream px-3 py-1 text-right text-sm text-cocoa outline-none focus:border-pine"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Save budget"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pine text-white transition hover:bg-pine-deep disabled:opacity-60"
        >
          <Check size={14} />
        </button>
      </div>
      {state?.error && <p className="text-xs text-berry-deep">{state.error}</p>}
    </form>
  );
}
