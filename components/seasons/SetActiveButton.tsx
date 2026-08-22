"use client";

import { useActionState } from "react";
import { setActiveSeason } from "@/app/actions/seasons";

export function SetActiveButton({ seasonId }: { seasonId: string }) {
  const [state, formAction, pending] = useActionState(setActiveSeason, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="seasonId" value={seasonId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-pine px-4 py-1.5 text-xs font-semibold text-pine transition hover:bg-pine hover:text-white disabled:opacity-60"
      >
        Set active
      </button>
      {state?.error && <p className="text-xs text-berry-deep">{state.error}</p>}
    </form>
  );
}
