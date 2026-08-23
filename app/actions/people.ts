"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { assertSeasonWritable } from "@/lib/season";
import { parseToPence } from "@/lib/money";
import { CATEGORY_KINDS, type CategoryKind } from "@/lib/domain";

export type ActionState = { error?: string } | null;

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/people");
  revalidatePath("/purchases");
  revalidatePath("/seasons");
}

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not signed in");
  }
  return session.user;
}

/** Rename a person. Global by design: a Person is one identity across every
 *  season, so the new name shows on all years' data, archives included —
 *  that's the point (fixing "Dad W" to "Dad Watts" everywhere at once). */
export async function renamePerson(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const personId = String(formData.get("personId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!personId) return { error: "Missing person." };
  if (!name) return { error: "A name can't be empty." };
  if (name.length > 80) return { error: "That name is a bit long." };

  await prisma.person.update({ where: { id: personId }, data: { name } });

  revalidatePath("/");
  revalidatePath("/people");
  revalidatePath("/purchases");
  return null;
}

/** Create a new Person, optionally with a starting allocation for a season. */
export async function createPerson(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Give them a name first." };

  const seasonId = String(formData.get("seasonId") ?? "").trim();
  const allocationRaw = String(formData.get("allocation") ?? "").trim();

  if (seasonId) await assertSeasonWritable(seasonId);

  let allocatedPence = 0;
  if (allocationRaw) {
    const parsed = parseToPence(allocationRaw);
    if (parsed === null) {
      return { error: "That allocation doesn't look like a money amount." };
    }
    allocatedPence = parsed;
  }

  await prisma.person.create({
    data: {
      name,
      // Always create the membership row for the creating season (even at
      // £0) so a new person immediately counts as "in" this season.
      ...(seasonId
        ? { personBudgets: { create: { seasonId, allocatedPence } } }
        : {}),
    },
  });

  revalidateAll();
  return null;
}

/** Upsert this person's PersonBudget allocation for a season. */
export async function updatePersonAllocation(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const personId = String(formData.get("personId") ?? "");
  const seasonId = String(formData.get("seasonId") ?? "");
  const raw = String(formData.get("allocation") ?? "").trim();
  if (!personId || !seasonId) return { error: "Missing person or season." };
  await assertSeasonWritable(seasonId);

  const pence = parseToPence(raw || "0");
  if (pence === null) {
    return { error: "That allocation doesn't look like a money amount." };
  }

  await prisma.personBudget.upsert({
    where: { personId_seasonId: { personId, seasonId } },
    create: { personId, seasonId, allocatedPence: pence },
    update: { allocatedPence: pence },
  });

  revalidateAll();
  return null;
}

/** Link (or unlink, when userId is empty) a Person to a User login. */
export async function linkPersonToUser(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const personId = String(formData.get("personId") ?? "");
  const userId = String(formData.get("userId") ?? "").trim();
  if (!personId) return { error: "Missing person." };

  await prisma.$transaction(async (tx) => {
    // Unlink whoever currently points at this person (a person can only
    // ever be linked from one user, since User.personId is unique).
    await tx.user.updateMany({
      where: { personId },
      data: { personId: null },
    });

    if (userId) {
      await tx.user.update({
        where: { id: userId },
        data: { personId },
      });
    }
  });

  revalidateAll();
  return null;
}

/** Add an existing (already-global) Person to a season as a member, with a
 *  starting allocation of £0 for the season lead to fill in afterwards. */
export async function addPersonToSeason(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const personId = String(formData.get("personId") ?? "");
  const seasonId = String(formData.get("seasonId") ?? "");
  if (!personId || !seasonId) return { error: "Missing person or season." };
  await assertSeasonWritable(seasonId);

  await prisma.personBudget.upsert({
    where: { personId_seasonId: { personId, seasonId } },
    create: { personId, seasonId, allocatedPence: 0 },
    update: {},
  });

  revalidateAll();
  return null;
}

/** Remove a Person from just this season — deletes only their PersonBudget
 *  row for it. The Person and their standing in every other season are
 *  untouched. Refuses when they have purchases logged this season, since
 *  those would otherwise be silently orphaned from the person picker. */
export async function removePersonFromSeason(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const personId = String(formData.get("personId") ?? "");
  const seasonId = String(formData.get("seasonId") ?? "");
  if (!personId || !seasonId) return { error: "Missing person or season." };
  await assertSeasonWritable(seasonId);

  const purchaseCount = await prisma.purchase.count({ where: { personId, seasonId } });
  if (purchaseCount > 0) {
    return { error: "They have purchases this season — reassign or delete those first." };
  }

  await prisma.personBudget.deleteMany({ where: { personId, seasonId } });

  revalidateAll();
  return null;
}

/** Permanently delete a Person. Only ever allowed when they have no history
 *  anywhere — no purchases and no PersonBudget in any season — since Person
 *  identity is global and this can't be scoped to "just this season". */
export async function deletePersonForever(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const personId = String(formData.get("personId") ?? "");
  if (!personId) return { error: "Missing person." };

  const [purchaseCount, budgetCount] = await Promise.all([
    prisma.purchase.count({ where: { personId } }),
    prisma.personBudget.count({ where: { personId } }),
  ]);
  if (purchaseCount > 0 || budgetCount > 0) {
    return { error: "They have history in another season — can't delete forever." };
  }

  await prisma.person.delete({ where: { id: personId } });

  revalidateAll();
  return null;
}

/** Update a Category's budget for the season it belongs to. */
export async function updateCategoryBudget(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const categoryId = String(formData.get("categoryId") ?? "");
  const raw = String(formData.get("budget") ?? "").trim();
  if (!categoryId) return { error: "Missing category." };

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "That category wasn't found." };
  await assertSeasonWritable(category.seasonId);

  const pence = parseToPence(raw || "0");
  if (pence === null) {
    return { error: "That budget doesn't look like a money amount." };
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: { budgetPence: pence },
  });

  revalidateAll();
  return null;
}

/** Add a new Category to a season. */
export async function createCategory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const seasonId = String(formData.get("seasonId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const kindRaw = String(formData.get("kind") ?? "OTHER").trim();
  const budgetRaw = String(formData.get("budget") ?? "").trim();

  if (!seasonId) return { error: "Missing season." };
  if (!name) return { error: "Give the category a name." };
  await assertSeasonWritable(seasonId);

  const kind = CATEGORY_KINDS.includes(kindRaw as CategoryKind)
    ? (kindRaw as CategoryKind)
    : "OTHER";

  let budgetPence = 0;
  if (budgetRaw) {
    const parsed = parseToPence(budgetRaw);
    if (parsed === null) {
      return { error: "That budget doesn't look like a money amount." };
    }
    budgetPence = parsed;
  }

  const count = await prisma.category.count({ where: { seasonId } });

  try {
    await prisma.category.create({
      data: { seasonId, name, kind, budgetPence, sortOrder: count },
    });
  } catch {
    return { error: `You already have a category called "${name}" this season.` };
  }

  revalidateAll();
  return null;
}

/** Delete a Category, but only when nothing has been bought in it yet. */
export async function deleteCategory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const categoryId = String(formData.get("categoryId") ?? "");
  if (!categoryId) return { error: "Missing category." };

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "That category wasn't found." };
  await assertSeasonWritable(category.seasonId);

  const purchaseCount = await prisma.purchase.count({ where: { categoryId } });
  if (purchaseCount > 0) {
    return {
      error: `Can't delete this — it already has ${purchaseCount} purchase${purchaseCount === 1 ? "" : "s"} in it. Move or delete those first.`,
    };
  }

  await prisma.category.delete({ where: { id: categoryId } });

  revalidateAll();
  return null;
}
