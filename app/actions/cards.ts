"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { assertSeasonWritable } from "@/lib/season";
import { encryptPII } from "@/lib/pii";

export type ActionState = { error?: string } | null;

const STATUS_FIELDS = ["sendCard", "sent", "received"] as const;
type StatusField = (typeof STATUS_FIELDS)[number];

function revalidateAll() {
  revalidatePath("/cards");
}

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not signed in");
  }
  return session.user;
}

/** Refuses a personId that's already linked to a different card contact —
 *  CardContact.personId is @unique, so this is the friendly-error version of
 *  that constraint. Pass the contact being edited (if any) so it doesn't
 *  flag itself as "taken". */
async function checkPersonNotTaken(
  personId: string,
  excludingContactId?: string,
): Promise<string | null> {
  const existing = await prisma.cardContact.findUnique({ where: { personId } });
  if (existing && existing.id !== excludingContactId) {
    return `${existing.name} is already linked to that person.`;
  }
  return null;
}

/** Create a new card contact, and its CardSeasonStatus for the season being
 *  viewed (so it immediately shows up on this year's list). */
export async function createCardContact(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const seasonId = String(formData.get("seasonId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const addressRaw = String(formData.get("address") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const personId = String(formData.get("personId") ?? "").trim();

  if (!seasonId) return { error: "Missing season." };
  if (!name) return { error: "Give them a name first." };
  await assertSeasonWritable(seasonId);

  if (personId) {
    const conflict = await checkPersonNotTaken(personId);
    if (conflict) return { error: conflict };
  }

  await prisma.cardContact.create({
    data: {
      name,
      addressEnc: encryptPII(addressRaw),
      notes: notes || null,
      personId: personId || null,
      statuses: { create: { seasonId } },
    },
  });

  revalidateAll();
  return null;
}

/** Update a contact's details. Global data (like a Person's name), not
 *  season-scoped, so there's no season to assert writable here — the page
 *  hides the edit affordance on archived-season views instead. */
export async function updateCardContact(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const contactId = String(formData.get("contactId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const addressRaw = String(formData.get("address") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const personId = String(formData.get("personId") ?? "").trim();

  if (!contactId) return { error: "Missing contact." };
  if (!name) return { error: "A name can't be empty." };

  if (personId) {
    const conflict = await checkPersonNotTaken(personId, contactId);
    if (conflict) return { error: conflict };
  }

  await prisma.cardContact.update({
    where: { id: contactId },
    data: {
      name,
      addressEnc: encryptPII(addressRaw),
      notes: notes || null,
      personId: personId || null,
    },
  });

  revalidateAll();
  return null;
}

/** Flip one of sendCard/sent/received on a contact's status for a season. */
export async function setCardSeasonStatus(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const contactId = String(formData.get("contactId") ?? "");
  const seasonId = String(formData.get("seasonId") ?? "");
  const field = String(formData.get("field") ?? "");
  const value = String(formData.get("value") ?? "") === "true";

  if (!contactId || !seasonId) return { error: "Missing contact or season." };
  if (!STATUS_FIELDS.includes(field as StatusField)) {
    return { error: "That's not a status we track." };
  }
  await assertSeasonWritable(seasonId);

  await prisma.cardSeasonStatus.update({
    where: { contactId_seasonId: { contactId, seasonId } },
    data: { [field as StatusField]: value },
  });

  revalidateAll();
  return null;
}

/** Add a single existing contact to the season being viewed. */
export async function addContactToSeason(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const contactId = String(formData.get("contactId") ?? "");
  const seasonId = String(formData.get("seasonId") ?? "");
  if (!contactId || !seasonId) return { error: "Missing contact or season." };
  await assertSeasonWritable(seasonId);

  await prisma.cardSeasonStatus.upsert({
    where: { contactId_seasonId: { contactId, seasonId } },
    create: { contactId, seasonId },
    update: {},
  });

  revalidateAll();
  return null;
}

/** Add every non-archived contact that isn't already on this season's list. */
export async function addAllContactsToSeason(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const seasonId = String(formData.get("seasonId") ?? "");
  if (!seasonId) return { error: "Missing season." };
  await assertSeasonWritable(seasonId);

  const missing = await prisma.cardContact.findMany({
    where: { archived: false, statuses: { none: { seasonId } } },
    select: { id: true },
  });

  if (missing.length > 0) {
    await prisma.cardSeasonStatus.createMany({
      data: missing.map((c) => ({ contactId: c.id, seasonId })),
    });
  }

  revalidateAll();
  return null;
}

/** Archive a contact: keeps their history but stops offering them on new
 *  seasons' lists. Season-independent, so no season to assert writable. */
export async function archiveCardContact(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const contactId = String(formData.get("contactId") ?? "");
  if (!contactId) return { error: "Missing contact." };

  await prisma.cardContact.update({ where: { id: contactId }, data: { archived: true } });

  revalidateAll();
  return null;
}

/** Bring an archived contact back. */
export async function unarchiveCardContact(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const contactId = String(formData.get("contactId") ?? "");
  if (!contactId) return { error: "Missing contact." };

  await prisma.cardContact.update({ where: { id: contactId }, data: { archived: false } });

  revalidateAll();
  return null;
}

/** Permanently delete a contact — the GDPR erasure path. Statuses cascade.
 *  No history guard: this is deliberately a full, irreversible erasure, and
 *  the UI confirms with the user before calling it. */
export async function deleteCardContactForever(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const contactId = String(formData.get("contactId") ?? "");
  if (!contactId) return { error: "Missing contact." };

  await prisma.cardContact.delete({ where: { id: contactId } });

  revalidateAll();
  return null;
}
