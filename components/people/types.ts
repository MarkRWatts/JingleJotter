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

/** A person who isn't a member of the season being viewed — shown in the
 *  "Not in this season" list, where they can be added (back) in, or deleted
 *  forever if they have no history anywhere yet. */
export type OtherPersonRowData = {
  id: string;
  name: string;
  linkedUserEmail: string | null;
  /** Most recent season year they had a budget or purchase in, if any. */
  lastYear: number | null;
  /** True only when they have zero purchases and zero PersonBudgets in any
   *  season — i.e. no history anywhere, so a hard delete loses nothing. */
  canDeleteForever: boolean;
};
