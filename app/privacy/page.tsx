import Link from "next/link";
import { ShieldCheck } from "lucide-react";

// Public (unauthenticated — see PUBLIC_PATHS in proxy.ts) privacy notice.
// Deliberately generic: it describes what the software captures and how it
// protects it, for whoever runs an instance — it doesn't assume any
// particular deployment.

export const metadata = { title: "Privacy · Jingle Jotter" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <ShieldCheck size={22} className="text-pine" />
          <h1 className="font-festive text-3xl text-pine-deep sm:text-4xl">
            Privacy
          </h1>
        </div>
        <p className="text-sm text-cocoa-soft">
          How this Jingle Jotter instance handles the information you put into it.
        </p>
      </header>

      <Section title="What this app stores">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong>Sign-in identity</strong> — the Google account name and email
            address of each invited user, used only to sign in and to tell users
            apart. Sign-in is invite-only; no one else can create an account.
          </li>
          <li>
            <strong>Gift and budget details</strong> — the names of people gifts
            are bought for, and what's planned, bought and spent.
          </li>
          <li>
            <strong>Card recipients</strong> — only if the card list's address
            feature is used: names and postal addresses of people the household
            sends Christmas cards to.
          </li>
        </ul>
      </Section>

      <Section title="How it's protected">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            Everything lives in this instance's own database, on the server it's
            hosted on. There is no third-party storage and no analytics.
          </li>
          <li>
            Postal addresses are additionally encrypted at rest (AES-256-GCM),
            with the encryption key held outside the database and its backups —
            a copy of the database alone cannot reveal them.
          </li>
          <li>All traffic to and from the app is encrypted in transit (HTTPS).</li>
        </ul>
      </Section>

      <Section title="What ever leaves this instance">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>Google, for sign-in only.</li>
          <li>
            OpenStreetMap, to look up trip <em>venue</em> names for the city-break
            map. Personal addresses are never sent anywhere.
          </li>
        </ul>
      </Section>

      <Section title="Your control">
        <p>
          Anything stored here can be edited, exported (CSV) or permanently
          deleted in-app at any time by this instance's users. Deleting a card
          contact removes their address for good.
        </p>
      </Section>

      <p className="text-sm text-cocoa-soft">
        Questions about a specific instance are for whoever runs it.{" "}
        <Link href="/" className="font-semibold text-pine underline-offset-2 hover:underline">
          Back to Jingle Jotter
        </Link>
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-white p-6 text-sm text-cocoa shadow-sm">
      <h2 className="font-display text-lg text-pine-deep">{title}</h2>
      {children}
    </section>
  );
}
