"use client";

import { useActionState } from "react";
import { ArrowUpCircle, RotateCcw, Trash2, XCircle } from "lucide-react";
import type { ActionState } from "@/app/actions/ideas";

type IdeaAction = (prevState: ActionState, formData: FormData) => Promise<ActionState>;

const VARIANT_STYLES = {
  "solid-pine": "bg-pine/15 text-pine-deep hover:bg-pine/25",
  "outline-pine": "border border-pine text-pine hover:bg-pine/10",
  "outline-berry": "border border-berry text-berry hover:bg-berry/10",
} as const;

// Icons are resolved here, on the client side of the boundary — a component
// function can't be serialized across the server→client prop divide.
const ICONS = {
  promote: ArrowUpCircle,
  discard: XCircle,
  restore: RotateCcw,
  delete: Trash2,
} as const;

/** One small self-contained action form for an idea (Promote / Discard /
 *  Restore / Delete) — same micro-component shape as
 *  components/people/RemoveFromSeasonButton.tsx and DeleteForeverButton.tsx. */
export function IdeaActionButton({
  action,
  ideaId,
  label,
  icon,
  variant = "outline-pine",
  confirmMessage,
}: {
  action: IdeaAction;
  ideaId: string;
  label: string;
  icon: keyof typeof ICONS;
  variant?: keyof typeof VARIANT_STYLES;
  confirmMessage?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const Icon = ICONS[icon];

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="ideaId" value={ideaId} />
      <button
        type="submit"
        disabled={pending}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${VARIANT_STYLES[variant]}`}
      >
        <Icon size={14} aria-hidden />
        {label}
      </button>
      {state?.error && <p className="mt-1 text-xs text-berry-deep">{state.error}</p>}
    </form>
  );
}
