import { CalendarHeart, Sparkles } from "lucide-react";

function daysUntilChristmas(year: number, now: Date): number {
  const christmasUtc = Date.UTC(year, 11, 25);
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((christmasUtc - todayUtc) / 86_400_000);
}

/** Saturdays from today (inclusive) up to but not including Christmas Day —
 *  i.e. shopping weekends still usable. */
function weekendsUntilChristmas(year: number, now: Date): number {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const christmas = new Date(Date.UTC(year, 11, 25));
  let count = 0;
  for (let d = new Date(today); d < christmas; d.setUTCDate(d.getUTCDate() + 1)) {
    if (d.getUTCDay() === 6) count++;
  }
  return count;
}

export function CountdownChip({ year }: { year: number }) {
  const now = new Date();
  const days = daysUntilChristmas(year, now);
  const weekends = weekendsUntilChristmas(year, now);
  const wrapped = days < 0;

  if (wrapped) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-tag px-4 py-1.5 text-sm font-semibold text-pine-deep">
        🎄 Wrapped up!
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-tag px-4 py-1.5 text-sm font-semibold text-pine-deep">
        <Sparkles size={16} className="text-amber" aria-hidden="true" />
        {days === 0 ? "It's here!" : `${days} sleep${days === 1 ? "" : "s"} 'til Christmas`}
      </span>
      {days > 0 && weekends > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-berry/10 px-4 py-1.5 text-sm font-semibold text-berry-deep">
          <CalendarHeart size={16} className="text-berry" aria-hidden="true" />
          {weekends} weekend{weekends === 1 ? "" : "s"} left
        </span>
      )}
    </span>
  );
}
