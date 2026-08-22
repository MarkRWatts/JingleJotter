"use client";

import { useActionState, useRef } from "react";
import { Link2 } from "lucide-react";
import { linkPersonToUser } from "@/app/actions/people";

export type LinkableUser = {
  id: string;
  label: string;
};

export function LinkUserSelect({
  personId,
  currentUserId,
  users,
}: {
  personId: string;
  currentUserId: string | null;
  users: LinkableUser[];
}) {
  const [state, formAction] = useActionState(linkPersonToUser, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="personId" value={personId} />
      <div className="flex items-center gap-1.5">
        <Link2 size={14} className="shrink-0 text-pine" />
        <select
          name="userId"
          defaultValue={currentUserId ?? ""}
          onChange={() => formRef.current?.requestSubmit()}
          className="w-full rounded-full border border-cocoa/15 bg-cream px-3 py-1 text-sm text-cocoa outline-none focus:border-pine"
        >
          <option value="">— not linked —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-cocoa-soft">
        Linking hides this person&apos;s gifts from that login — keeps surprises safe.
      </p>
      {state?.error && <p className="text-xs text-berry-deep">{state.error}</p>}
    </form>
  );
}
