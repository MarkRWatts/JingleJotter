import { CategoryBudgetForm } from "./CategoryBudgetForm";
import { DeleteCategoryButton } from "./DeleteCategoryButton";
import { categoryKindLabel } from "./categoryKindLabel";
import { formatPence } from "@/lib/money";

export type CategoryRowData = {
  id: string;
  name: string;
  kind: string;
  budgetPence: number;
  purchaseCount: number;
};

/** Mobile-first stacked card for one category — shown below md. */
export function CategoryCard({
  category,
  readOnly = false,
}: {
  category: CategoryRowData;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-1">
        <span className="font-display text-base text-pine-deep">{category.name}</span>
        <span className="w-fit rounded-full bg-tag px-2.5 py-0.5 text-xs font-semibold text-cocoa-soft">
          {categoryKindLabel(category.kind)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {readOnly ? (
          <span className="text-sm font-semibold text-cocoa">
            {formatPence(category.budgetPence)}
          </span>
        ) : (
          <>
            <CategoryBudgetForm categoryId={category.id} budgetPence={category.budgetPence} />
            <DeleteCategoryButton
              categoryId={category.id}
              categoryName={category.name}
              purchaseCount={category.purchaseCount}
            />
          </>
        )}
      </div>
    </div>
  );
}
