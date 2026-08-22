export type PersonRowData = {
  id: string;
  name: string;
  allocatedPence: number;
  /** null when this page hides it (it's a surprise for the viewer). */
  actualSpendPence: number | null;
  linkedUserEmail: string | null;
  linkedUserId: string | null;
  isSurpriseForViewer: boolean;
};
