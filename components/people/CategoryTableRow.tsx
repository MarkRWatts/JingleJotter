import { CategoryBudgetForm } from "./CategoryBudgetForm";
import { DeleteCategoryButton } from "./DeleteCategoryButton";
import { categoryKindLabel } from "./categoryKindLabel";
import { formatPence } from "@/lib/money";
import type { CategoryRowData } from "./CategoryCard";

/** Desktop table row for one category — shown at md and up. */
export function CategoryTableRow({
  category,
  readOnly = false,
}: {
  category: CategoryRowData;
  readOnly?: boolean;
}) {
  return (
    <tr className="border-b border-cocoa/10 align-top last:border-0">
      <td className="py-3 pr-4">
        <span className="font-display text-base text-pine-deep">{category.name}</span>
      </td>
      <td className="py-3 pr-4">
        <span className="w-fit rounded-full bg-tag px-2.5 py-0.5 text-xs font-semibold text-cocoa-soft">
          {categoryKindLabel(category.kind)}
        </span>
      </td>
      <td className="w-40 py-3 pr-4">
        {readOnly ? (
          <span className="text-sm font-semibold text-cocoa">
            {formatPence(category.budgetPence)}
          </span>
        ) : (
          <CategoryBudgetForm categoryId={category.id} budgetPence={category.budgetPence} />
        )}
      </td>
      <td className="w-10 py-3">
        {!readOnly && (
          <DeleteCategoryButton
            categoryId={category.id}
            categoryName={category.name}
            purchaseCount={category.purchaseCount}
          />
        )}
      </td>
    </tr>
  );
}
