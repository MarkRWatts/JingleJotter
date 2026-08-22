import type { CategoryKind } from "@/lib/domain";

export const CATEGORY_KIND_LABELS: Record<CategoryKind, string> = {
  GIFTS: "Gifts",
  FOOD: "Food",
  EXTRAS: "Festive Extras",
  CITY_BREAK: "City Break",
  OTHER: "Other",
};

export function categoryKindLabel(kind: string): string {
  return CATEGORY_KIND_LABELS[kind as CategoryKind] ?? kind;
}
