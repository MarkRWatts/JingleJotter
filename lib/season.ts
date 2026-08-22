import { prisma } from "@/lib/db";

/** The season being viewed: an explicit ?year= wins, else the active season,
 *  else the newest. Returns null only when no seasons exist at all. */
export async function resolveSeason(yearParam?: string | null) {
  if (yearParam) {
    const year = parseInt(yearParam, 10);
    if (!Number.isNaN(year)) {
      const season = await prisma.season.findUnique({ where: { year } });
      if (season) return season;
    }
  }
  return (
    (await prisma.season.findFirst({ where: { active: true } })) ??
    (await prisma.season.findFirst({ orderBy: { year: "desc" } }))
  );
}

/** Guards a mutating server action: throws unless the given season is the
 *  active one. Archived (non-active) seasons are browse-only — the UI hides
 *  every mutation control on them, but this is the server-side backstop in
 *  case an action is ever invoked directly. */
export async function assertSeasonWritable(seasonId: string): Promise<void> {
  const season = await prisma.season.findUnique({ where: { id: seasonId } });
  if (!season || !season.active) {
    throw new Error("This season is archived — it's read-only.");
  }
}
