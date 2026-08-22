// Surprise-masking: purchases whose recipient is the person linked to the
// currently signed-in user must not reveal their details to that user.
// This runs SERVER-SIDE in the data layer — masked fields never reach the
// client. Aggregate totals still include masked amounts by design.

export const SURPRISE_TITLE = "🎁 Surprise";

// The person→user link lives on User.personId; Person exposes it as the
// `linkedUser` relation object, so queries must `include: { person:
// { include: { linkedUser: { select: { id: true } } } } }`.
export type MaskablePurchase = {
  title: string;
  store: string | null;
  notes: string | null;
  url: string | null;
  person?: { linkedUser: { id: string } | null } | null;
};

export function isSurpriseFor(
  purchase: { person?: { linkedUser: { id: string } | null } | null },
  currentUserId: string,
): boolean {
  return purchase.person?.linkedUser?.id === currentUserId;
}

/** Returns a copy with identifying fields masked when the purchase is a
 *  surprise for the current user; otherwise returns the purchase unchanged. */
export function maskPurchase<T extends MaskablePurchase>(
  purchase: T,
  currentUserId: string,
): T & { isMasked: boolean } {
  if (!isSurpriseFor(purchase, currentUserId)) {
    return { ...purchase, isMasked: false };
  }
  return {
    ...purchase,
    title: SURPRISE_TITLE,
    store: null,
    notes: null,
    url: null,
    isMasked: true,
  };
}
