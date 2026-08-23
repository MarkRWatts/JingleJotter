"use server";

// Server actions for the /trip city-break planning page. Follows the same
// useActionState-compatible (prevState, formData) -> ActionState pattern as
// app/actions/{people,seasons}.ts — ids travel as hidden formData fields
// rather than as extra function arguments, so every action here can be
// wired straight into useActionState.
//
// Money never lives here — Purchase rows under the CITY_BREAK category are
// the ledger. This file only ever touches Trip/TripItem (the plan).

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { assertSeasonWritable } from "@/lib/season";
import { geocodeVenue } from "@/lib/geocode";
import { TRADITIONS } from "@/lib/traditions";
import {
  TRIP_ITEM_TYPES,
  MEAL_SLOTS,
  type TripItemType,
  type MealSlot,
} from "@/lib/trip";

export type ActionState = { error?: string } | null;

function revalidateAll() {
  revalidatePath("/trip");
  revalidatePath("/");
}

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not signed in");
  }
  return session.user;
}

function isTripItemType(value: unknown): value is TripItemType {
  return typeof value === "string" && (TRIP_ITEM_TYPES as readonly string[]).includes(value);
}

function isMealSlot(value: unknown): value is MealSlot {
  return typeof value === "string" && (MEAL_SLOTS as readonly string[]).includes(value);
}

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** UTC-midnight for a Date, matching lib/trip.ts's day convention. */
function startOfUTCDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Parses a "YYYY-MM-DD" (or any ISO date) string to a UTC-midnight Date. */
function parseDateOnly(raw: string): Date | null {
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return startOfUTCDay(date);
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Create or update the season's one Trip. End must be on/after start, and
 *  the whole trip is capped at 14 nights as a sanity check against typos. */
export async function upsertTrip(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const seasonId = readField(formData, "seasonId");
  if (!seasonId) return { error: "Missing season." };
  const season = await prisma.season.findUnique({ where: { id: seasonId } });
  if (!season) return { error: "That season wasn't found." };
  await assertSeasonWritable(seasonId);

  const destination = readField(formData, "destination") || "London";
  const startDate = parseDateOnly(readField(formData, "startDate"));
  const endDate = parseDateOnly(readField(formData, "endDate"));
  if (!startDate || !endDate) {
    return { error: "Pick both a start and end date." };
  }
  if (endDate < startDate) {
    return { error: "The end date needs to be on or after the start date." };
  }

  const nights = Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY);
  if (nights > 14) {
    return { error: "That's more than 14 nights — double-check the dates." };
  }

  const notes = readField(formData, "notes") || null;

  await prisma.trip.upsert({
    where: { seasonId },
    create: { seasonId, destination, startDate, endDate, notes },
    update: { destination, startDate, endDate, notes },
  });

  revalidateAll();
  return null;
}

type ParsedItemFields = {
  type: TripItemType;
  title: string;
  date: Date | null;
  mealSlot: MealSlot | null;
  time: string | null;
  venue: string | null;
  booked: boolean;
  notes: string | null;
  reference: string | null;
};

type ParseResult =
  | { ok: true; data: ParsedItemFields }
  | { ok: false; error: string };

/** Shared field parsing/validation for create and update: type/mealSlot
 *  against lib/trip.ts's constants, mealSlot only alongside type MEAL, and
 *  an optional date must fall within the trip's own date range. */
function parseItemFields(
  formData: FormData,
  trip: { startDate: Date; endDate: Date },
): ParseResult {
  const typeRaw = readField(formData, "type");
  if (!isTripItemType(typeRaw)) return { ok: false, error: "Choose a valid item type." };
  const type = typeRaw;

  const title = readField(formData, "title");
  if (!title) return { ok: false, error: "Give it a title." };

  const mealSlotRaw = readField(formData, "mealSlot");
  let mealSlot: MealSlot | null = null;
  if (mealSlotRaw) {
    if (type !== "MEAL") {
      return { ok: false, error: "Only meals can have a meal slot." };
    }
    if (!isMealSlot(mealSlotRaw)) return { ok: false, error: "Choose a valid meal slot." };
    mealSlot = mealSlotRaw;
  }

  const dateRaw = readField(formData, "date");
  let date: Date | null = null;
  if (dateRaw) {
    const parsedDate = parseDateOnly(dateRaw);
    if (!parsedDate) return { ok: false, error: "That date doesn't look right." };
    const start = startOfUTCDay(trip.startDate);
    const end = startOfUTCDay(trip.endDate);
    if (parsedDate < start || parsedDate > end) {
      return { ok: false, error: "That date falls outside the trip." };
    }
    date = parsedDate;
  }

  const time = readField(formData, "time") || null;
  const venue = readField(formData, "venue") || null;
  const booked = formData.get("booked") === "on" || formData.get("booked") === "true";
  const notes = readField(formData, "notes") || null;
  const reference = readField(formData, "reference") || null;

  return {
    ok: true,
    data: { type, title, date, mealSlot, time, venue, booked, notes, reference },
  };
}

type PurchaseLinkResult =
  | { ok: true; purchaseId: string | null }
  | { ok: false; error: string };

/** Validates the "Paid via" select. Empty clears the link. Otherwise the
 *  chosen Purchase must exist, belong to the trip's own season, sit in a
 *  CITY_BREAK-kind category, and not already be linked to a *different*
 *  TripItem (currentItemId is null on create, so nothing passes that check
 *  yet — every already-linked purchase is off the table). */
async function resolvePurchaseLink(
  formData: FormData,
  trip: { seasonId: string },
  currentItemId: string | null,
): Promise<PurchaseLinkResult> {
  const raw = readField(formData, "purchaseId");
  if (!raw) return { ok: true, purchaseId: null };

  const purchase = await prisma.purchase.findUnique({
    where: { id: raw },
    include: { category: true, tripItem: true },
  });
  if (!purchase) return { ok: false, error: "That purchase wasn't found." };
  if (purchase.seasonId !== trip.seasonId) {
    return { ok: false, error: "That purchase isn't from this season." };
  }
  if (purchase.category.kind !== "CITY_BREAK") {
    return { ok: false, error: "Only city-break purchases can be linked to a trip item." };
  }
  if (purchase.tripItem && purchase.tripItem.id !== currentItemId) {
    return { ok: false, error: "That purchase is already linked to another item." };
  }

  return { ok: true, purchaseId: raw };
}

/** Best-effort venue -> lat/lng, reusing a previous geocode when the venue
 *  text hasn't changed (so editing e.g. just the time doesn't re-hit
 *  Nominatim). No venue means no coordinates; a failed/unmatched geocode
 *  (geocodeVenue returns null) means the item just doesn't show on the map
 *  — it never fails the save. */
async function resolveVenueCoordinates(
  venue: string | null,
  destination: string,
  previous?: { venue: string | null; lat: number | null; lng: number | null },
): Promise<{ lat: number | null; lng: number | null }> {
  if (!venue) return { lat: null, lng: null };

  const unchanged =
    previous && previous.venue === venue && previous.lat !== null && previous.lng !== null;
  if (unchanged) {
    return { lat: previous.lat, lng: previous.lng };
  }

  const point = await geocodeVenue(venue, destination);
  return { lat: point?.lat ?? null, lng: point?.lng ?? null };
}

/** Add a new itinerary item to a trip. */
export async function createTripItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const tripId = readField(formData, "tripId");
  if (!tripId) return { error: "Missing trip." };
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return { error: "That trip wasn't found." };
  await assertSeasonWritable(trip.seasonId);

  const parsed = parseItemFields(formData, trip);
  if (!parsed.ok) return { error: parsed.error };

  const purchaseLink = await resolvePurchaseLink(formData, trip, null);
  if (!purchaseLink.ok) return { error: purchaseLink.error };

  const { lat, lng } = await resolveVenueCoordinates(parsed.data.venue, trip.destination);

  await prisma.tripItem.create({
    data: { tripId, ...parsed.data, purchaseId: purchaseLink.purchaseId, lat, lng },
  });

  revalidateAll();
  return null;
}

/** Edit an existing itinerary item. */
export async function updateTripItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const itemId = readField(formData, "itemId");
  if (!itemId) return { error: "Missing item." };
  const existing = await prisma.tripItem.findUnique({ where: { id: itemId } });
  if (!existing) return { error: "That item no longer exists." };
  const trip = await prisma.trip.findUnique({ where: { id: existing.tripId } });
  if (!trip) return { error: "That trip no longer exists." };
  await assertSeasonWritable(trip.seasonId);

  const parsed = parseItemFields(formData, trip);
  if (!parsed.ok) return { error: parsed.error };

  const purchaseLink = await resolvePurchaseLink(formData, trip, itemId);
  if (!purchaseLink.ok) return { error: purchaseLink.error };

  const { lat, lng } = await resolveVenueCoordinates(parsed.data.venue, trip.destination, {
    venue: existing.venue,
    lat: existing.lat,
    lng: existing.lng,
  });

  await prisma.tripItem.update({
    where: { id: itemId },
    data: { ...parsed.data, purchaseId: purchaseLink.purchaseId, lat, lng },
  });

  revalidateAll();
  return null;
}

/** Remove an itinerary item. */
export async function deleteTripItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const itemId = readField(formData, "itemId");
  if (!itemId) return { error: "Missing item." };

  const existing = await prisma.tripItem.findUnique({
    where: { id: itemId },
    include: { trip: true },
  });
  if (!existing) return { error: "That item no longer exists." };
  await assertSeasonWritable(existing.trip.seasonId);

  await prisma.tripItem.delete({ where: { id: itemId } });

  revalidateAll();
  return null;
}

/** Flip an item's booked flag. */
export async function toggleBooked(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const itemId = readField(formData, "itemId");
  if (!itemId) return { error: "Missing item." };
  const existing = await prisma.tripItem.findUnique({
    where: { id: itemId },
    include: { trip: true },
  });
  if (!existing) return { error: "That item no longer exists." };
  await assertSeasonWritable(existing.trip.seasonId);

  await prisma.tripItem.update({
    where: { id: itemId },
    data: { booked: !existing.booked },
  });

  revalidateAll();
  return null;
}

/** The one-click "the usual" tradition: an undated, unbooked haircut &
 *  shave activity at Truefitt & Hill — offered only while the trip is to
 *  London and nothing like it exists yet (see app/trip/page.tsx). */
export async function addTraditionItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const tripId = readField(formData, "tripId");
  if (!tripId) return { error: "Missing trip." };
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return { error: "That trip wasn't found." };
  await assertSeasonWritable(trip.seasonId);

  const key = readField(formData, "tradition");
  const tradition = TRADITIONS.find((t) => t.key === key);
  if (!tradition) return { error: "That tradition wasn't found." };

  // Traditions carry a precise street address — geocode with that rather
  // than the display venue name.
  const point = await geocodeVenue(tradition.address, trip.destination);

  await prisma.tripItem.create({
    data: {
      tripId,
      type: "ACTIVITY",
      title: tradition.title,
      venue: tradition.venue,
      booked: false,
      lat: point?.lat ?? null,
      lng: point?.lng ?? null,
    },
  });

  revalidateAll();
  return null;
}
