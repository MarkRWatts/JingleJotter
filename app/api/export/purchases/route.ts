import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolveSeason } from "@/lib/season";
import { maskPurchase } from "@/lib/mask";
import { STATUS_LABELS, type PurchaseStatus } from "@/lib/domain";

// CSV field escaping: quote anything containing a comma, quote, or newline;
// double up embedded quotes. A leading =, +, -, or @ gets a ' prefix so a
// field can never execute as a spreadsheet formula on open. Duplicated in
// app/api/export/cards/route.ts — small enough not to share.
function csvField(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

function csvRow(fields: string[]): string {
  return fields.map(csvField).join(",") + "\r\n";
}

function dateOnly(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

const HEADER = [
  "Title",
  "Category",
  "For",
  "Price",
  "Status",
  "Purchased on",
  "Expected by",
  "Store",
  "Notes",
  "URL",
];

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const year = request.nextUrl.searchParams.get("year");
  const season = await resolveSeason(year);
  if (!season) {
    return new Response("No matching season", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const purchases = await prisma.purchase.findMany({
    where: { seasonId: season.id },
    orderBy: { createdAt: "asc" },
    include: {
      category: { select: { name: true } },
      person: { select: { name: true, linkedUser: { select: { id: true } } } },
    },
  });

  let csv = csvRow(HEADER);
  for (const purchase of purchases) {
    const masked = maskPurchase(purchase, session.user.id);
    csv += csvRow([
      masked.title,
      masked.category.name,
      masked.person?.name ?? "",
      (masked.pricePence / 100).toFixed(2),
      STATUS_LABELS[masked.status as PurchaseStatus] ?? masked.status,
      dateOnly(masked.purchasedOn),
      dateOnly(masked.expectedBy),
      masked.store ?? "",
      masked.notes ?? "",
      masked.url ?? "",
    ]);
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jinglejotter-purchases-${season.year}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
