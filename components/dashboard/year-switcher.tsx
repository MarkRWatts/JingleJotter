import Link from "next/link";

export function YearSwitcher({ years, activeYear }: { years: number[]; activeYear: number }) {
  if (years.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {years.map((year) => {
        const active = year === activeYear;
        return (
          <Link
            key={year}
            href={`/?year=${year}`}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              active ? "bg-berry text-white" : "bg-tag text-cocoa-soft hover:text-cocoa"
            }`}
          >
            {year}
          </Link>
        );
      })}
    </div>
  );
}
