import Link from "next/link";

export function EmptyState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      <span className="text-4xl" aria-hidden="true">
        🎄
      </span>
      <h1 className="font-display text-2xl text-pine-deep">No Christmas seasons yet</h1>
      <p className="text-sm text-cocoa-soft">
        Create your first season to start tracking budgets, gifts, and ideas.
      </p>
      <Link
        href="/seasons"
        className="rounded-full bg-berry px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep"
      >
        Set up a season
      </Link>
    </div>
  );
}
