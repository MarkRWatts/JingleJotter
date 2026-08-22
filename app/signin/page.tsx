import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Real (database-validated) session check — a genuinely signed-in user
  // skips the sign-in page. Deliberately NOT done in proxy.ts: its
  // cookie-presence check can't tell a stale/foreign cookie from a live
  // session and would redirect-loop.
  const session = await auth();
  if (session?.user) redirect("/");

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center md:max-w-3xl">
        {/* The hero graphics carry their own cream background, so they sit
            straight on the page — no card. h1 stays for accessibility. */}
        <h1 className="sr-only">Jingle Jotter — keep the Christmas budget merry and bright</h1>
        <Image
          src="/brand/login-mobile.png"
          alt=""
          width={833}
          height={1282}
          className="w-full max-w-xs rounded-squircle shadow-sm md:hidden"
          priority
        />
        <Image
          src="/brand/login-desktop.png"
          alt=""
          width={1774}
          height={887}
          className="hidden w-full rounded-squircle shadow-sm md:block"
          priority
        />

        {error && (
          <p className="rounded-lg bg-berry/10 px-4 py-3 text-sm text-berry-deep">
            This sleigh is invite-only — that account isn&apos;t on the list.
          </p>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
          className="w-full max-w-xs"
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-full bg-berry px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep"
          >
            <GoogleLogo />
            Sign in with Google
          </button>
        </form>
      </div>
    </main>
  );
}

// Google's official "G" brand mark — see https://developers.google.com/identity/branding-guidelines
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}
