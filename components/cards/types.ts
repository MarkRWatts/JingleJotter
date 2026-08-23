export type CardStatusField = "sendCard" | "sent" | "received";

/** One contact's season status row for the season being viewed. */
export type ContactStatus = {
  sendCard: boolean;
  sent: boolean;
  received: boolean;
};

/** A card contact that IS on this season's list (has a CardSeasonStatus). */
export type ContactRowData = {
  id: string;
  name: string;
  /** Decrypted address text, or null when there isn't one. */
  address: string | null;
  /** True when the stored envelope couldn't be decrypted (key changed etc.) —
   *  `address` is null in that case too, but this distinguishes "no address"
   *  from "can't read the address that's there". */
  addressDecryptFailed: boolean;
  notes: string | null;
  personId: string | null;
  linkedPersonName: string | null;
  status: ContactStatus;
};

/** A non-archived contact with no status row for the season being viewed. */
export type OtherContactRowData = {
  id: string;
  name: string;
  linkedPersonName: string | null;
};

/** An archived contact — shown collapsed with unarchive/delete controls. */
export type ArchivedContactRowData = {
  id: string;
  name: string;
};

/** One option in the "link to a Person" select. */
export type LinkablePersonOption = {
  id: string;
  name: string;
  /** Set when this person is already linked to a *different* card contact
   *  (personId is unique) — the name of that contact, so the option can be
   *  shown as taken. Null when free to pick. */
  takenBy: string | null;
};
