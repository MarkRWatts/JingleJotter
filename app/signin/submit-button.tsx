"use client";

import { useFormStatus } from "react-dom";

// Disables itself while the sign-in redirect is in flight — repeated clicks
// re-submitted the form and made the hero image re-render/jiggle.
export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-3 rounded-full bg-berry px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep disabled:opacity-60"
    >
      {pending ? "Off to Google…" : children}
    </button>
  );
}
