"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { DEFAULT_CATEGORIES } from "@/lib/domain";

export type ActionState = { error?: string } | null;

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/purchases");
  revalidatePath("/people");
  revalidatePath("/seasons");
}

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not signed in");
  }
  return session.user;
}

/** Start a new season: copies the previous active season's categories and
 *  person budgets (or seeds the defaults if this is the very first season),
 *  makes the new season active, and deactivates everything else. */
export async function startNewSeason(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const yearRaw = String(formData.get("year") ?? "").trim();
  const year = parseInt(yearRaw, 10);
  if (!yearRaw || Number.isNaN(year)) {
    return { error: "That doesn't look like a year." };
  }

  const existing = await prisma.season.findUnique({ where: { year } });
  if (existing) {
    return { error: `${year} already has a season.` };
  }

  const previous =
    (await prisma.season.findFirst({ where: { active: true } })) ??
    (await prisma.season.findFirst({ orderBy: { year: "desc" } }));

  try {
    await prisma.$transaction(async (tx) => {
      await tx.season.updateMany({
        where: { active: true },
        data: { active: false },
      });

      const season = await tx.season.create({
        data: { year, active: true },
      });

      if (previous) {
        const [prevCategories, prevBudgets] = await Promise.all([
          tx.category.findMany({ where: { seasonId: previous.id } }),
          tx.personBudget.findMany({ where: { seasonId: previous.id } }),
        ]);

        if (prevCategories.length > 0) {
          await tx.category.createMany({
            data: prevCategories.map((c) => ({
              seasonId: season.id,
              name: c.name,
              kind: c.kind,
              budgetPence: c.budgetPence,
              sortOrder: c.sortOrder,
            })),
          });
        }

        if (prevBudgets.length > 0) {
          await tx.personBudget.createMany({
            data: prevBudgets.map((b) => ({
              seasonId: season.id,
              personId: b.personId,
              allocatedPence: b.allocatedPence,
            })),
          });
        }
      } else {
        await tx.category.createMany({
          data: DEFAULT_CATEGORIES.map((c) => ({
            seasonId: season.id,
            name: c.name,
            kind: c.kind,
            sortOrder: c.sortOrder,
          })),
        });
      }
    });
  } catch {
    return { error: "Couldn't start that season — please try again." };
  }

  revalidateAll();
  return null;
}

/** Make the given season the active one, deactivating all others. */
export async function setActiveSeason(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const seasonId = String(formData.get("seasonId") ?? "");
  if (!seasonId) return { error: "Missing season." };

  await prisma.$transaction([
    prisma.season.updateMany({ where: { active: true }, data: { active: false } }),
    prisma.season.update({ where: { id: seasonId }, data: { active: true } }),
  ]);

  revalidateAll();
  return null;
}
