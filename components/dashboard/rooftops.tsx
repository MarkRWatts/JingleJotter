// A snowy rooftop scene for the dashboard footer — hand-drawn flat-vector
// SVG in the brand palette (no external artwork). Purely decorative.

const SNOW = "#ffffff";

function GableHouse({
  x,
  w,
  top,
  roofH,
  body,
  roof,
  windows,
  chimney,
  unlit = [],
}: {
  x: number;
  w: number;
  top: number;
  roofH: number;
  body: string;
  roof: string;
  windows: number; // columns of one window row
  chimney?: boolean;
  unlit?: number[];
}) {
  const bottom = 165;
  const ridge = `M ${x - 8} ${top} L ${x + w / 2} ${top - roofH} L ${x + w + 8} ${top}`;
  const winW = 12;
  const gap = (w - windows * winW) / (windows + 1);
  const chimneyX = x + w * 0.68;
  const chimneyTop = top - roofH * 0.4 - 20;
  return (
    <g>
      {chimney && (
        <>
          <rect x={chimneyX} y={chimneyTop} width={13} height={26} fill={roof} />
          <rect x={chimneyX - 2} y={chimneyTop - 4} width={17} height={6} rx={3} fill={SNOW} />
          <path
            d={`M ${chimneyX + 6} ${chimneyTop - 10} c -6 -8 7 -12 2 -22 c -5 -8 5 -11 3 -19`}
            fill="none"
            stroke="var(--cocoa-soft)"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.45}
          />
        </>
      )}
      <rect x={x} y={top} width={w} height={bottom - top} fill={body} />
      <path d={`${ridge} Z`} fill={roof} />
      <path d={ridge} fill="none" stroke={SNOW} strokeWidth={7} strokeLinecap="round" />
      {Array.from({ length: windows }, (_, i) => (
        <rect
          key={i}
          x={x + gap + i * (winW + gap)}
          y={top + 18}
          width={winW}
          height={16}
          rx={2.5}
          fill={unlit.includes(i) ? "var(--tag-cream)" : "var(--amber)"}
        />
      ))}
    </g>
  );
}

function FlatHouse({
  x,
  w,
  top,
  body,
  rows,
  cols,
}: {
  x: number;
  w: number;
  top: number;
  body: string;
  rows: number;
  cols: number;
}) {
  const bottom = 165;
  const winW = 11;
  const winH = 13;
  const gapX = (w - cols * winW) / (cols + 1);
  return (
    <g>
      <rect x={x} y={top} width={w} height={bottom - top} fill={body} />
      <rect x={x - 4} y={top - 5} width={w + 8} height={8} rx={4} fill={SNOW} />
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        return (
          <rect
            key={i}
            x={x + gapX + c * (winW + gapX)}
            y={top + 14 + r * (winH + 10)}
            width={winW}
            height={winH}
            rx={2.5}
            fill={(r + c) % 3 === 2 ? "var(--tag-cream)" : "var(--amber)"}
          />
        );
      })}
    </g>
  );
}

function Pine({ x, s = 1 }: { x: number; s?: number }) {
  const base = 165;
  const tier = (w: number, y: number) =>
    `M ${x - w * s} ${y} L ${x} ${y - 34 * s} L ${x + w * s} ${y} Z`;
  return (
    <g>
      <rect x={x - 4 * s} y={base - 12 * s} width={8 * s} height={12 * s} fill="var(--cocoa)" />
      <path d={tier(30, base - 8 * s)} fill="var(--pine-deep)" />
      <path d={tier(24, base - 30 * s)} fill="var(--pine)" />
      <path d={tier(17, base - 50 * s)} fill="var(--pine)" />
      <path
        d={`M ${x - 17 * s} ${base - 50 * s} L ${x} ${base - 84 * s} L ${x + 17 * s} ${base - 50 * s}`}
        fill="none"
        stroke={SNOW}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </g>
  );
}

function Snowman({ x }: { x: number }) {
  const outline = "var(--cocoa-soft)";
  return (
    <g>
      {/* stick arms */}
      <path
        d={`M ${x - 14} ${138} L ${x - 26} ${128} M ${x + 14} ${138} L ${x + 26} ${128}`}
        stroke="var(--cocoa)"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* body + head */}
      <circle cx={x} cy={148} r={17} fill={SNOW} stroke={outline} strokeOpacity={0.4} />
      <circle cx={x} cy={124} r={12} fill={SNOW} stroke={outline} strokeOpacity={0.4} />
      {/* hat */}
      <rect x={x - 10} y={110} width={20} height={3.5} rx={1.75} fill="var(--cocoa)" />
      <rect x={x - 6.5} y={100} width={13} height={11} rx={1.5} fill="var(--cocoa)" />
      <rect x={x - 6.5} y={107} width={13} height={3} fill="var(--berry)" />
      {/* face */}
      <circle cx={x - 4} cy={121} r={1.6} fill="var(--cocoa)" />
      <circle cx={x + 4} cy={121} r={1.6} fill="var(--cocoa)" />
      <path d={`M ${x} ${124.5} L ${x + 9} ${126.5} L ${x} ${128} Z`} fill="var(--amber)" />
      {/* scarf */}
      <path
        d={`M ${x - 10} ${134} Q ${x} ${140} ${x + 10} ${134}`}
        stroke="var(--berry)"
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M ${x + 7} ${136} q 3 7 1 12`}
        stroke="var(--berry)"
        strokeWidth={4.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* buttons */}
      <circle cx={x} cy={144} r={1.7} fill="var(--cocoa)" />
      <circle cx={x} cy={151} r={1.7} fill="var(--cocoa)" />
    </g>
  );
}

function Sparkle({ x, y, s = 1, delay = 0 }: { x: number; y: number; s?: number; delay?: number }) {
  return (
    <path
      className="twinkle"
      style={{ animationDelay: `${delay}s` }}
      d={`M ${x} ${y - 7 * s} L ${x + 1.8 * s} ${y - 1.8 * s} L ${x + 7 * s} ${y} L ${x + 1.8 * s} ${y + 1.8 * s} L ${x} ${y + 7 * s} L ${x - 1.8 * s} ${y + 1.8 * s} L ${x - 7 * s} ${y} L ${x - 1.8 * s} ${y - 1.8 * s} Z`}
      fill="var(--amber)"
    />
  );
}

export function Rooftops() {
  return (
    <div className="whimsy-decor -mb-6 w-full md:-mb-8" aria-hidden="true">
      <svg viewBox="0 0 1200 190" className="block h-auto w-full" role="presentation">
        {/* Crescent moon */}
        <circle cx={74} cy={38} r={14} fill="var(--amber)" />
        <circle cx={80} cy={33} r={13} fill="var(--cream)" />

        {/* Sky details */}
        <Sparkle x={260} y={42} />
        <Sparkle x={702} y={26} s={0.8} delay={0.9} />
        <Sparkle x={1052} y={48} s={0.9} delay={1.6} />
        {[
          [180, 70], [420, 35], [520, 62], [640, 48], [850, 40], [960, 68], [1140, 30],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.5} fill={SNOW} opacity={0.9} />
        ))}

        {/* Skyline */}
        <GableHouse x={60} w={90} top={90} roofH={42} body="var(--pine-deep)" roof="var(--berry-deep)" windows={2} chimney />
        <FlatHouse x={172} w={80} top={72} body="var(--cocoa)" rows={3} cols={2} />
        <Pine x={288} s={0.9} />
        <GableHouse x={322} w={118} top={100} roofH={48} body="var(--berry-deep)" roof="var(--pine-deep)" windows={3} unlit={[1]} />
        <GableHouse x={468} w={70} top={116} roofH={34} body="var(--cocoa-soft)" roof="var(--berry)" windows={2} />
        <FlatHouse x={558} w={92} top={56} body="var(--pine-deep)" rows={3} cols={3} />
        <Pine x={686} />
        <GableHouse x={728} w={110} top={94} roofH={46} body="var(--cocoa)" roof="var(--berry-deep)" windows={3} chimney />
        <FlatHouse x={862} w={74} top={106} body="var(--berry-deep)" rows={2} cols={2} />
        <GableHouse x={952} w={100} top={82} roofH={44} body="var(--pine)" roof="var(--cocoa)" windows={2} unlit={[0]} chimney />
        <Pine x={1084} s={0.8} />
        <GableHouse x={1112} w={70} top={120} roofH={32} body="var(--cocoa-soft)" roof="var(--pine-deep)" windows={2} />

        {/* Snow drift the houses sit in */}
        <path
          d="M 0 164 Q 80 155 170 160 T 360 158 T 560 162 T 760 156 T 950 161 T 1120 157 L 1200 159 L 1200 190 L 0 190 Z"
          fill={SNOW}
        />

        {/* Snowman in the drift, foreground */}
        <Snowman x={672} />
      </svg>
    </div>
  );
}
