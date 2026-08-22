"use client";

import { useEffect, useRef, useState, useTransition, type CSSProperties } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { advanceStatus, deletePurchase } from "@/app/actions/purchases";
import { STATUS_LABELS, nextStatus, type PurchaseStatus } from "@/lib/domain";

const CONFETTI_COLORS = ["var(--berry)", "var(--pine)", "var(--amber)", "var(--tag-cream)"];
const CONFETTI_PIECE_COUNT = 12;

type ConfettiPiece = {
  tx: number;
  ty: number;
  rot: number;
  color: string;
  left: number;
  delayMs: number;
  round: boolean;
};

function makeConfettiPieces(): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_PIECE_COUNT }, () => {
    // Mostly-upward cone (roughly -140deg to -40deg) so the burst scatters
    // outward and up before gravity/fade takes it, like the CSS keyframe
    // implies via ease-out.
    const angle = -90 + (Math.random() * 100 - 50);
    const distance = 26 + Math.random() * 34;
    const rad = (angle * Math.PI) / 180;
    return {
      tx: Math.cos(rad) * distance,
      ty: Math.sin(rad) * distance,
      rot: Math.random() * 360 - 180,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      left: 35 + Math.random() * 30,
      delayMs: Math.random() * 70,
      round: Math.random() > 0.5,
    };
  });
}

function ConfettiBurst({ onDone }: { onDone: () => void }) {
  const pieces = useRef(makeConfettiPieces()).current;

  useEffect(() => {
    const timer = window.setTimeout(onDone, 780);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
      {pieces.map((piece, i) => (
        <span
          key={i}
          className={`confetti-piece absolute top-1/2 h-1.5 w-1.5 ${piece.round ? "rounded-full" : "rounded-[1px]"}`}
          style={
            {
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delayMs}ms`,
              "--tx": `${piece.tx}px`,
              "--ty": `${piece.ty}px`,
              "--rot": `${piece.rot}deg`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

export default function PurchaseActions({
  id,
  status,
  onEdit,
}: {
  id: string;
  status: PurchaseStatus;
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [celebrate, setCelebrate] = useState(false);
  const next = nextStatus(status);

  function handleAdvance() {
    const willWrap = next === "WRAPPED";
    startTransition(async () => {
      const result = await advanceStatus(id);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      if (willWrap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setCelebrate(true);
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Delete this purchase? This can't be undone.")) return;
    startTransition(async () => {
      const result = await deletePurchase(id);
      if (!result.ok) window.alert(result.error);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {next && (
        <span className="relative inline-flex">
          <button
            type="button"
            onClick={handleAdvance}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-full bg-pine/15 px-3 py-1.5 text-xs font-semibold text-pine-deep transition hover:bg-pine/25 disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" aria-hidden />
            Mark {STATUS_LABELS[next]}
          </button>
          {celebrate && <ConfettiBurst onDone={() => setCelebrate(false)} />}
        </span>
      )}
      <button
        type="button"
        onClick={onEdit}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-full border border-pine px-3 py-1.5 text-xs font-semibold text-pine transition hover:bg-pine/10 disabled:opacity-60"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        Edit
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-full border border-berry px-3 py-1.5 text-xs font-semibold text-berry transition hover:bg-berry/10 disabled:opacity-60"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Delete
      </button>
    </div>
  );
}
