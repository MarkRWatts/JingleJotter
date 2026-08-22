import { Sparkles } from "lucide-react";

function daysUntilChristmas(year: number, now: Date): number {
  const christmasUtc = Date.UTC(year, 11, 25);
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((christmasUtc - todayUtc) / 86_400_000);
}

export function CountdownChip({ year }: { year: number }) {
  const days = daysUntilChristmas(year, new Date());
  const wrapped = days < 0;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-tag px-4 py-1.5 text-sm font-semibold text-pine-deep">
      {wrapped ? (
        "🎄 Wrapped up!"
      ) : (
        <>
          <Sparkles size={16} className="text-amber" aria-hidden="true" />
          {days === 0 ? "It's here!" : `${days} sleep${days === 1 ? "" : "s"} 'til Christmas`}
        </>
      )}
    </span>
  );
}
