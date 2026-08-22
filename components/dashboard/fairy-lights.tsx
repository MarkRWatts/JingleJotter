// Decorative fairy-lights divider used between dashboard sections. Purely
// ornamental — aria-hidden, no semantic content — with a gentle staggered
// twinkle on the bulbs (disabled under prefers-reduced-motion in globals.css).

const BULB_X = [40, 140, 240, 340, 440, 540, 640, 740, 840];
const BULB_COLORS = ["var(--berry)", "var(--pine)", "var(--amber)"];

const WIRE_PATH =
  "M40,14 Q90,30 140,14 Q190,30 240,14 Q290,30 340,14 Q390,30 440,14 " +
  "Q490,30 540,14 Q590,30 640,14 Q690,30 740,14 Q790,30 840,14";

export function FairyLights() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 900 44"
      className="h-auto w-full"
      role="presentation"
    >
      <path
        d={WIRE_PATH}
        fill="none"
        stroke="var(--cocoa-soft)"
        strokeWidth="1.5"
        opacity="0.5"
      />
      {BULB_X.map((x, i) => {
        const color = BULB_COLORS[i % BULB_COLORS.length];
        return (
          <g key={x} className="bulb-twinkle" style={{ animationDelay: `${i * 0.18}s` }}>
            <line x1={x} y1={14} x2={x} y2={21} stroke="var(--cocoa-soft)" strokeWidth="1.25" opacity="0.5" />
            <ellipse cx={x} cy={28} rx={6.5} ry={8.5} fill={color} />
          </g>
        );
      })}
    </svg>
  );
}
