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

  let allocatedPence: number | null = null;
  if (allocationRaw) {
    allocatedPence = parseToPence(allocationRaw);
    if (allocatedPence === null) {
      return { error: "That allocation doesn't look like a money amount." };
    }
  }

  await prisma.person.create({
    data: {
      name,
      ...(seasonId && allocatedPence !== null
        ? {
            personBudgets: {
              create: { seasonId, allocatedPence },
            },
          }
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

/** Delete a Person. Purchases keep their history (personId is set null); their
 *  PersonBudgets go with them (cascade). */
export async function deletePerson(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const personId = String(formData.get("personId") ?? "");
  if (!personId) return { error: "Missing person." };

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
