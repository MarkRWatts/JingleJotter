import { prisma } from "@/lib/db";
import { DEFAULT_CATEGORIES } from "@/lib/domain";

// Idempotent: safe to run any number of times. Seeds the 2026 Season (active)
// and its default categories, each starting with a zero budget. No people or
// purchases — those are entered through the app.
async function main() {
  const season = await prisma.season.upsert({
    where: { year: 2026 },
    update: { active: true },
    create: { year: 2026, active: true },
  });

  for (const { kind, name, sortOrder } of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { seasonId_name: { seasonId: season.id, name } },
      update: { kind, sortOrder },
      create: { seasonId: season.id, kind, name, sortOrder, budgetPence: 0 },
    });
  }

  console.log(`Seeded Season ${season.year} with ${DEFAULT_CATEGORIES.length} categories.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
