import { CalendarDays, ChevronDown } from "lucide-react";

// The run-up to Christmas: September–December of the season's year as mini
// calendars. Collapsed by default (native <details> — no JS needed).
// Weekends tinted, Christmas Day/Boxing Day highlighted, and — once we're
// inside the window — a hand-drawn X over days already gone and a sparkle
// "you are here" marker on today.

// TEMP (2026-08): August included so the past-day X's and today-marker are
// visible before September — revert to [8, 9, 10, 11] / Sep..Dec once seen.
const MONTHS = [7, 8, 9, 10, 11]; // Aug..Dec (0-indexed)
const MONTH_NAMES = ["August", "September", "October", "November", "December"];
const WINDOW_START_MONTH = 7; // TEMP: normally 8 (September)
const DOW = ["M", "T", "W", "T", "F", "S", "S"];

// Snowflake from Phosphor Icons (phosphoricons.com, MIT) — a gone day gets
// gently snowed over rather than crossed out.
function Snowflake() {
  return (
    <svg
      viewBox="0 0 256 256"
      className="absolute inset-0.5 h-auto w-auto text-cocoa-soft/70"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M223.77,150.09a8,8,0,0,1-5.86,9.68l-24.64,6,6.46,24.11a8,8,0,0,1-5.66,9.8A8.25,8.25,0,0,1,192,200a8,8,0,0,1-7.72-5.93l-7.72-28.8L136,141.86v46.83l21.66,21.65a8,8,0,0,1-11.32,11.32L128,203.31l-18.34,18.35a8,8,0,0,1-11.32-11.32L120,188.69V141.86L79.45,165.27l-7.72,28.8A8,8,0,0,1,64,200a8.25,8.25,0,0,1-2.08-.27,8,8,0,0,1-5.66-9.8l6.46-24.11-24.64-6a8,8,0,0,1,3.82-15.54l29.45,7.23L112,128,71.36,104.54l-29.45,7.23A7.85,7.85,0,0,1,40,112a8,8,0,0,1-1.91-15.77l24.64-6L56.27,66.07a8,8,0,0,1,15.46-4.14l7.72,28.8L120,114.14V67.31L98.34,45.66a8,8,0,0,1,11.32-11.32L128,52.69l18.34-18.35a8,8,0,0,1,11.32,11.32L136,67.31v46.83l40.55-23.41,7.72-28.8a8,8,0,0,1,15.46,4.14l-6.46,24.11,24.64,6A8,8,0,0,1,216,112a7.85,7.85,0,0,1-1.91-.23l-29.45-7.23L144,128l40.64,23.46,29.45-7.23A8,8,0,0,1,223.77,150.09Z" />
    </svg>
  );
}

function Star({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M10 1 L12.2 7.8 L19 10 L12.2 12.2 L10 19 L7.8 12.2 L1 10 L7.8 7.8 Z"
        fill="var(--amber)"
        stroke="var(--berry-deep)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MonthGrid({ year, month, today }: { year: number; month: number; today: Date }) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadBlanks = (first.getDay() + 6) % 7; // Monday-start week

  const windowStart = new Date(year, WINDOW_START_MONTH, 1);
  const inWindow = today >= windowStart && today.getFullYear() === year;
  const todayIsInMonth =
    inWindow && today.getMonth() === month && today.getFullYear() === year;

  const cells: (number | null)[] = [
    ...Array.from({ length: leadBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="min-w-[13rem] flex-1 rounded-2xl bg-white p-3 shadow-sm">
      <p className="flex items-center justify-between pb-2 font-display text-sm text-pine-deep">
        {MONTH_NAMES[MONTHS.indexOf(month)]}
        {todayIsInMonth && (
          <span className="flex items-center gap-1 text-[0.65rem] font-bold text-berry">
            <Star className="h-3 w-3" />
            you are here
          </span>
        )}
      </p>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[0.65rem]">
        {DOW.map((d, i) => (
          <span
            key={`${d}${i}`}
            className={`pb-1 font-semibold ${i >= 5 ? "text-berry/60" : "text-cocoa-soft"}`}
            aria-hidden="true"
          >
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`b${i}`} />;
          const date = new Date(year, month, day);
          const dow = (date.getDay() + 6) % 7;
          const isWeekend = dow >= 5;
          const isChristmas = month === 11 && (day === 25 || day === 26);
          const isEve = month === 11 && day === 24;
          const isToday =
            todayIsInMonth && today.getDate() === day;
          const isPast = inWindow && !isToday && date < today;

          let cls =
            "relative flex aspect-square items-center justify-center rounded-md tabular-nums ";
          if (isChristmas) cls += "bg-berry font-bold text-white ";
          else if (isEve) cls += "bg-amber/25 font-semibold text-cocoa ";
          else if (isToday)
            cls += "rounded-full bg-pine font-bold text-white shadow-md ring-2 ring-amber ";
          else if (isWeekend) cls += "bg-tag text-cocoa ";
          else cls += "text-cocoa ";
          if (isPast && !isChristmas) cls += "text-cocoa-soft/60 ";

          return (
            <span key={day} className={cls}>
              {day}
              {isPast && !isChristmas && <Snowflake />}
              {isToday && (
                <Star className="absolute -right-2 -top-2 h-4.5 w-4.5 drop-shadow-sm" />
              )}
              {isToday && <span className="sr-only">(today — you are here)</span>}
              {isChristmas && (
                <span className="sr-only">
                  {day === 25 ? "(Christmas Day)" : "(Boxing Day)"}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function RunUpCalendar({ year }: { year: number }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <details className="group rounded-3xl bg-tag/60 shadow-sm">
      <summary className="flex cursor-pointer select-none items-center gap-2 rounded-3xl px-5 py-3 font-display text-pine-deep transition hover:bg-tag [&::-webkit-details-marker]:hidden">
        <CalendarDays size={18} className="text-berry" aria-hidden="true" />
        The run-up to Christmas
        <ChevronDown
          size={16}
          className="ml-auto text-cocoa-soft transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="flex snap-x gap-3 overflow-x-auto px-4 pb-4 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-3">
        {MONTHS.map((m) => (
          <div key={m} className="snap-start">
            <MonthGrid year={year} month={m} today={today} />
          </div>
        ))}
      </div>
    </details>
  );
}
