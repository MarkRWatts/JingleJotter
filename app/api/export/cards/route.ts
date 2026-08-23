import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolveSeason } from "@/lib/season";
import { decryptPII, DECRYPT_FAILED } from "@/lib/pii";

// CSV field escaping: quote anything containing a comma, quote, or newline;
// double up embedded quotes. A leading =, +, -, or @ gets a ' prefix so a
// field can never execute as a spreadsheet formula on open. Duplicated in
// app/api/export/purchases/route.ts — small enough not to share.
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

function yesNo(value: boolean | undefined): string {
  if (value === undefined) return "";
  return value ? "yes" : "no";
}

const HEADER = ["Name", "Address", "Notes", "Sending", "Sent", "Received"];

// GDPR portability export: user-initiated, no-store, plaintext addresses in
// the response body are expected here — just never log them.
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

  const contacts = await prisma.cardContact.findMany({
    where: { archived: false },
    orderBy: { name: "asc" },
    include: { statuses: { where: { seasonId: season.id } } },
  });

  let csv = csvRow(HEADER);
  for (const contact of contacts) {
    const status = contact.statuses[0];
    const decrypted = decryptPII(contact.addressEnc);
    const address = decrypted === DECRYPT_FAILED ? "[cannot decrypt]" : (decrypted ?? "");
    csv += csvRow([
      contact.name,
      address,
      contact.notes ?? "",
      yesNo(status?.sendCard),
      yesNo(status?.sent),
      yesNo(status?.received),
    ]);
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jinglejotter-cards-${season.year}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
