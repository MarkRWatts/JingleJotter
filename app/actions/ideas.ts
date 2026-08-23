"use server";

// Server actions for the /ideas page — the cross-year gift idea backlog.
// Same shape as app/actions/people.ts: (prevState, formData) => ActionState,
// requireUser() first, friendly error strings, revalidatePath afterwards.

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { assertSeasonWritable } from "@/lib/season";
import { parseToPence } from "@/lib/money";
import { isSurpriseFor } from "@/lib/mask";

export type ActionState = { error?: string } | null;

function revalidateAll() {
  revalidatePath("/ideas");
  revalidatePath("/purchases");
  revalidatePath("/");
}

async function requireUser() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) {
    throw new Error("Not signed in");
  }
  return { ...session.user, id };
}

/** Loads a GiftIdea with enough of its person to check surprise-masking, and
 *  refuses to hand back one that belongs to the caller's own linked Person —
 *  even if the id was forged client-side, a viewer must never be able to
 *  touch ideas jotted down for themselves. */
async function loadMutableIdea(ideaId: string, userId: string) {
  const idea = await prisma.giftIdea.findUnique({
    where: { id: ideaId },
    include: { person: { include: { linkedUser: { select: { id: true } } } } },
  });
  if (!idea) throw new Error("That idea wasn't found.");
  if (isSurpriseFor(idea, userId)) {
    throw new Error("That's a surprise for you — you can't touch it.");
  }
  return idea;
}

/** Jot down a new idea for someone's cross-year backlog. */
export async function createIdea(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const personId = String(formData.get("personId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const approxRaw = String(formData.get("approxPrice") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!personId) return { error: "Choose who it's for." };
  if (!title) return { error: "Give the idea a title." };

  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: { linkedUser: { select: { id: true } } },
  });
  if (!person) return { error: "That person wasn't found." };
  if (person.linkedUser?.id === user.id) {
    return { error: "You can't jot down an idea for yourself." };
  }

  let approxPence: number | null = null;
  if (approxRaw) {
    const parsed = parseToPence(approxRaw);
    if (parsed === null) {
      return { error: "That price doesn't look like a money amount." };
    }
    approxPence = parsed;
  }

  await prisma.giftIdea.create({
    data: {
      personId,
      title,
      approxPence,
      url: url || null,
      notes: notes || null,
    },
  });

  revalidateAll();
  return null;
}

/** Promote an OPEN idea (or one that lapsed back to un-promoted after its
 *  linked purchase was deleted) into the active season's gift list. */
export async function promoteIdea(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const ideaId = String(formData.get("ideaId") ?? "").trim();
  if (!ideaId) return { error: "Missing idea." };

  let idea;
  try {
    idea = await loadMutableIdea(ideaId, user.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Something went wrong." };
  }

  if (idea.status === "DISCARDED") {
    return { error: "Restore this idea before promoting it." };
  }
  if (idea.status === "PROMOTED" && idea.purchaseId) {
    return { error: "Already on this year's list." };
  }

  const season = await prisma.season.findFirst({ where: { active: true } });
  if (!season) return { error: "No active season to promote into." };

  try {
    await assertSeasonWritable(season.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "That season is read-only." };
  }

  const category = await prisma.category.findFirst({
    where: { seasonId: season.id, kind: "GIFTS" },
    orderBy: { sortOrder: "asc" },
  });
  if (!category) return { error: "This season doesn't have a Gifts category yet." };

  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        seasonId: season.id,
        categoryId: category.id,
        personId: idea.personId,
        title: idea.title,
        notes: idea.notes,
        url: idea.url,
        pricePence: idea.approxPence ?? 0,
        status: "IDEA",
      },
    });
    await tx.giftIdea.update({
      where: { id: idea.id },
      data: { status: "PROMOTED", purchaseId: purchase.id },
    });
  });

  revalidateAll();
  return null;
}

/** Move an OPEN idea to DISCARDED — off the active list, kept around in case
 *  it's wanted back later. */
export async function discardIdea(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const ideaId = String(formData.get("ideaId") ?? "").trim();
  if (!ideaId) return { error: "Missing idea." };

  try {
    await loadMutableIdea(ideaId, user.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Something went wrong." };
  }

  await prisma.giftIdea.update({ where: { id: ideaId }, data: { status: "DISCARDED" } });

  revalidateAll();
  return null;
}

/** Bring a DISCARDED idea back to OPEN. */
export async function restoreIdea(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const ideaId = String(formData.get("ideaId") ?? "").trim();
  if (!ideaId) return { error: "Missing idea." };

  try {
    await loadMutableIdea(ideaId, user.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Something went wrong." };
  }

  await prisma.giftIdea.update({ where: { id: ideaId }, data: { status: "OPEN" } });

  revalidateAll();
  return null;
}

/** Permanently delete an idea from the backlog. Doesn't touch any Purchase
 *  it was ever promoted to — this only removes the backlog row. */
export async function deleteIdea(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const ideaId = String(formData.get("ideaId") ?? "").trim();
  if (!ideaId) return { error: "Missing idea." };

  try {
    await loadMutableIdea(ideaId, user.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Something went wrong." };
  }

  await prisma.giftIdea.delete({ where: { id: ideaId } });

  revalidateAll();
  return null;
}
