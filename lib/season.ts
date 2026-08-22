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
