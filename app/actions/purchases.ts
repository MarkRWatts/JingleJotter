"use server";

// Server actions for the /purchases page. Every action re-checks auth and,
// for anything that mutates an existing purchase, re-fetches it with the
// linkedUser include so isSurpriseFor() can refuse to touch a purchase that
// is a surprise for the caller — even if the id was forged client-side.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { assertSeasonWritable } from "@/lib/season";
import { parseToPence } from "@/lib/money";
import {
  PURCHASE_STATUSES,
  nextStatus,
  type PurchaseStatus,
} from "@/lib/domain";
import { isSurpriseFor } from "@/lib/mask";

export type ActionResult = { ok: true } | { ok: false; error: string };

function isPurchaseStatus(value: unknown): value is PurchaseStatus {
  return (
    typeof value === "string" &&
    (PURCHASE_STATUSES as readonly string[]).includes(value)
  );
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("You must be signed in.");
  return userId;
}

/** Re-fetches the purchase and throws if it's a surprise for this user —
 *  the caller must not be able to see, edit, or delete their own surprise
 *  by forging the id. */
async function loadMutablePurchase(purchaseId: string, userId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { person: { include: { linkedUser: { select: { id: true } } } } },
  });
  if (!purchase) throw new Error("That purchase no longer exists.");
  if (isSurpriseFor(purchase, userId)) {
    throw new Error("That's a surprise for you — you can't edit it.");
  }
  return purchase;
}

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parsePurchasedOn(raw: string): Date | null {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

type ParsedFields =
  | { ok: true; data: {
      title: string;
      pricePence: number;
      categoryId: string;
      personId: string | null;
      store: string | null;
      status: PurchaseStatus;
      purchasedOn: Date | null;
      notes: string | null;
    } }
  | { ok: false; error: string };

async function parseAndValidate(
  formData: FormData,
  seasonId: string,
  fallbackStatus: PurchaseStatus,
): Promise<ParsedFields> {
  const title = readField(formData, "title");
  if (!title) return { ok: false, error: "Give it a title." };

  const pricePence = parseToPence(readField(formData, "price"));
  if (pricePence === null) {
    return { ok: false, error: "Enter a valid price, like 12.50." };
  }

  const categoryId = readField(formData, "categoryId");
  if (!categoryId) return { ok: false, error: "Choose a category." };
  const category = await prisma.category.findFirst({
    where: { id: categoryId, seasonId },
  });
  if (!category) {
    return { ok: false, error: "That category isn't valid for this season." };
  }

  const personIdRaw = readField(formData, "personId");
  let personId: string | null = null;
  if (personIdRaw) {
    const person = await prisma.person.findUnique({ where: { id: personIdRaw } });
    if (!person) return { ok: false, error: "That person wasn't found." };
    personId = person.id;
  }

  const statusRaw = readField(formData, "status");
  const status = isPurchaseStatus(statusRaw) ? statusRaw : fallbackStatus;

  const store = readField(formData, "store") || null;
  const notes = readField(formData, "notes") || null;

  let purchasedOn = parsePurchasedOn(readField(formData, "purchasedOn"));
  if (status === "PURCHASED" && !purchasedOn) purchasedOn = new Date();

  return {
    ok: true,
    data: { title, pricePence, categoryId, personId, store, status, purchasedOn, notes },
  };
}

export async function createPurchase(formData: FormData): Promise<ActionResult> {
  await requireUserId();

  const seasonId = readField(formData, "seasonId");
  if (!seasonId) return { ok: false, error: "Missing season." };
  const season = await prisma.season.findUnique({ where: { id: seasonId } });
  if (!season) return { ok: false, error: "That season wasn't found." };
  await assertSeasonWritable(seasonId);

  const parsed = await parseAndValidate(formData, seasonId, "IDEA");
  if (!parsed.ok) return parsed;

  await prisma.purchase.create({
    data: { seasonId, ...parsed.data },
  });

  revalidatePath("/purchases");
  revalidatePath("/");
  return { ok: true };
}

export async function updatePurchase(
  purchaseId: string,
  formData: FormData,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const existing = await loadMutablePurchase(purchaseId, userId);
  await assertSeasonWritable(existing.seasonId);

  const parsed = await parseAndValidate(
    formData,
    existing.seasonId,
    isPurchaseStatus(existing.status) ? existing.status : "IDEA",
  );
  if (!parsed.ok) return parsed;

  await prisma.purchase.update({
    where: { id: purchaseId },
    data: parsed.data,
  });

  revalidatePath("/purchases");
  revalidatePath("/");
  return { ok: true };
}

export async function deletePurchase(purchaseId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existing = await loadMutablePurchase(purchaseId, userId);
  await assertSeasonWritable(existing.seasonId);

  await prisma.purchase.delete({ where: { id: purchaseId } });

  revalidatePath("/purchases");
  revalidatePath("/");
  return { ok: true };
}

export async function advanceStatus(purchaseId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existing = await loadMutablePurchase(purchaseId, userId);
  await assertSeasonWritable(existing.seasonId);

  if (!isPurchaseStatus(existing.status)) {
    return { ok: false, error: "Unknown status." };
  }
  const next = nextStatus(existing.status);
  if (!next) return { ok: false, error: "Already wrapped — nothing further to do." };

  await prisma.purchase.update({
    where: { id: purchaseId },
    data: {
      status: next,
      purchasedOn:
        next === "PURCHASED" && !existing.purchasedOn ? new Date() : existing.purchasedOn,
    },
  });

  revalidatePath("/purchases");
  revalidatePath("/");
  return { ok: true };
}
