import Link from "next/link";

/** Slim banner shown at the top of a page when the season being viewed isn't
 *  the active one — every mutation control on that page is hidden alongside
 *  it (see lib/season.ts's assertSeasonWritable for the server-side guard). */
export function ArchivedNotice({ year }: { year: number }) {
  return (
    <div className="rounded-xl bg-amber/15 px-4 py-2 text-sm text-cocoa">
      Christmas {year} is archived — browsing read-only.{" "}
      <Link href="/seasons" className="font-semibold underline underline-offset-2">
        manage seasons
      </Link>
    </div>
  );
}
