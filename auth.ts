import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

// Comma-separated, case-insensitive allowlist — only these emails may sign in.
// This is a two-person household app, not a public one.
function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  // Self-hosted behind a plain reverse proxy (or bare localhost), not Vercel.
  trustHost: true,
  pages: { signIn: "/signin" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // A User row can exist before its first Google sign-in (seeded in dev,
      // or pre-created for linking). Without this, the adapter refuses with
      // OAuthAccountNotLinked. Safe here: Google verifies emails and the
      // signIn callback allowlists two known addresses.
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    signIn({ user }) {
      return isAllowedEmail(user.email);
    },
    // Database sessions don't put `id` on session.user by default.
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
});
