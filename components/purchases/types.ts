import type { PurchaseStatus } from "@/lib/domain";

// Plain, serializable shape handed from the server page down to the client
// components below (dates as ISO strings, relations flattened to id + name).
export type PurchaseListItem = {
  id: string;
  title: string;
  store: string | null;
  pricePence: number;
  purchasedOn: string | null;
  createdAt: string;
  status: PurchaseStatus;
  notes: string | null;
  categoryId: string;
  categoryName: string;
  personId: string | null;
  personName: string | null;
  isMasked: boolean;
};

export type SelectOption = { id: string; name: string };
