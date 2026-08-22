// Shared progress-bar visual for budget/spend comparisons across the
// dashboard. `track` picks the track colour to keep contrast right whether
// the bar sits inside a bg-white or bg-tag card.

export function ProgressBar({
  percent,
  over = false,
  track = "cream",
}: {
  percent: number;
  over?: boolean;
  track?: "cream" | "white";
}) {
  const width = Math.min(100, Math.max(0, percent));

  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full ${
        track === "cream" ? "bg-cream" : "bg-white"
      }`}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all ${over ? "bg-berry" : "bg-pine"}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
