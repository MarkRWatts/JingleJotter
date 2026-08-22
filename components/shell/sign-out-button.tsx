// A tiny server component wrapping next-auth's signOut server action in a
// POST form, per next-auth v5 conventions (no client JS needed).

import { LogOut } from "lucide-react";
import { signOut } from "@/auth";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/signin" });
      }}
    >
      {compact ? (
        <button
          type="submit"
          aria-label="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-full text-cocoa-soft transition hover:bg-tag hover:text-berry-deep"
        >
          <LogOut size={18} aria-hidden="true" />
        </button>
      ) : (
        <button
          type="submit"
          className="rounded-full bg-berry px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep"
        >
          Sign out
        </button>
      )}
    </form>
  );
}
