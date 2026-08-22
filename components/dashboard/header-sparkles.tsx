// Small decorative accents scattered around the dashboard's "Christmas
// {year}" heading, echoing the amber sparkles + confetti dots in the app
// logo. Purely ornamental — aria-hidden, absolutely positioned relative to
// a `relative` ancestor, gentle twinkle disabled under reduced motion.

import type { CSSProperties } from "react";
import { Sparkles } from "lucide-react";

const SPARKLE_SPOTS: { style: CSSProperties; className: string; size: number; delay: string }[] = [
  { style: { top: "-14px", left: "-18px" }, className: "text-amber", size: 14, delay: "0s" },
  { style: { top: "-10px", right: "-20px" }, className: "text-berry", size: 11, delay: "0.6s" },
  { style: { bottom: "-10px", left: "36%" }, className: "text-amber", size: 9, delay: "1.2s" },
];

export function HeaderSparkles() {
  return (
    <>
      {SPARKLE_SPOTS.map((spot, i) => (
        <Sparkles
          key={i}
          aria-hidden="true"
          size={spot.size}
          className={`twinkle pointer-events-none absolute ${spot.className}`}
          style={{ ...spot.style, animationDelay: spot.delay }}
        />
      ))}
      <span
        aria-hidden="true"
        className="twinkle pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-pine"
        style={{ top: "2px", right: "-9px", animationDelay: "1.8s" }}
      />
    </>
  );
}
