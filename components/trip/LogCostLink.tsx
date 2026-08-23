import Link from "next/link";

/** Quiet nudge on a booked-but-unlinked item row: off to /purchases to log
 *  what it actually cost. /purchases (off-limits to edit) has no prefill
 *  params beyond the season year, so that's all this carries across. */
export function LogCostLink({ year }: { year?: string }) {
  const href = year ? `/purchases?year=${year}` : "/purchases";
  return (
    <Link
      href={href}
      className="text-xs text-cocoa-soft underline decoration-dotted underline-offset-2 transition hover:text-pine-deep"
    >
      log the cost
    </Link>
  );
}
