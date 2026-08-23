import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, CalendarRange, PiggyBank } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolveSeason } from "@/lib/season";
import { decryptPII, DECRYPT_FAILED } from "@/lib/pii";
import { ArchivedNotice } from "@/components/shell/archived-notice";
import { AddContactForm } from "@/components/cards/AddContactForm";
import { ContactCard } from "@/components/cards/ContactCard";
import { ContactTableRow } from "@/components/cards/ContactTableRow";
import { NotOnListSection } from "@/components/cards/NotOnListSection";
import { ArchivedContactsSection } from "@/components/cards/ArchivedContactsSection";
import type {
  ContactRowData,
  OtherContactRowData,
  ArchivedContactRowData,
  LinkablePersonOption,
} from "@/components/cards/types";

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { year } = await searchParams;
  const season = await resolveSeason(year);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      {!season ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-10 text-center shadow-sm">
          <PiggyBank size={32} className="text-pine" />
          <h1 className="font-display text-2xl text-pine-deep">No season yet</h1>
          <p className="max-w-sm text-sm text-cocoa-soft">
            Start your first Christmas season before building a card list.
          </p>
          <Link
            href="/seasons"
            className="rounded-full bg-berry px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep"
          >
            Go to Seasons
          </Link>
        </div>
      ) : (
        <ChristmasCards
          seasonId={season.id}
          year={season.year}
          readOnly={!season.active}
        />
      )}
    </div>
  );
}

async function ChristmasCards({
  seasonId,
  year,
  readOnly,
}: {
  seasonId: string;
  year: number;
  readOnly: boolean;
}) {
  const [contacts, archivedContacts, allPeople, linkedContactRows, totalContactCount] =
    await Promise.all([
      prisma.cardContact.findMany({
        where: { archived: false },
        orderBy: { name: "asc" },
        include: {
          statuses: { where: { seasonId } },
          person: { select: { id: true, name: true } },
        },
      }),
      readOnly
        ? Promise.resolve([] as { id: string; name: string }[])
        : prisma.cardContact.findMany({
            where: { archived: true },
            orderBy: { name: "asc" },
            select: { id: true, name: true },
          }),
      readOnly
        ? Promise.resolve([] as { id: string; name: string }[])
        : prisma.person.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
      readOnly
        ? Promise.resolve([] as { id: string; name: string; personId: string | null }[])
        : prisma.cardContact.findMany({
            where: { personId: { not: null } },
            select: { id: true, name: true, personId: true },
          }),
      prisma.cardContact.count(),
    ]);

  // Which Person is already linked to which card contact, so the "link to a
  // person" select can mark the ones already taken (CardContact.personId is
  // @unique — one contact per person).
  const linkedByPersonId = new Map(
    linkedContactRows
      .filter((c) => c.personId)
      .map((c) => [c.personId as string, { id: c.id, name: c.name }]),
  );
  function personOptionsFor(excludeContactId?: string): LinkablePersonOption[] {
    return allPeople.map((p) => {
      const link = linkedByPersonId.get(p.id);
      const takenBy = link && link.id !== excludeContactId ? link.name : null;
      return { id: p.id, name: p.name, takenBy };
    });
  }

  const onList = contacts.filter((c) => c.statuses.length > 0);
  const notOnList = contacts.filter((c) => c.statuses.length === 0);

  const contactRows: ContactRowData[] = onList.map((c) => {
    const decrypted = decryptPII(c.addressEnc);
    const addressDecryptFailed = decrypted === DECRYPT_FAILED;
    const status = c.statuses[0];
    return {
      id: c.id,
      name: c.name,
      address: addressDecryptFailed ? null : (decrypted as string | null),
      addressDecryptFailed,
      notes: c.notes,
      personId: c.personId,
      linkedPersonName: c.person?.name ?? null,
      status: {
        sendCard: status.sendCard,
        sent: status.sent,
        received: status.received,
      },
    };
  });

  const otherContactRows: OtherContactRowData[] = notOnList.map((c) => ({
    id: c.id,
    name: c.name,
    linkedPersonName: c.person?.name ?? null,
  }));

  const archivedContactRows: ArchivedContactRowData[] = archivedContacts.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const toSendCount = contactRows.filter((c) => c.status.sendCard).length;
  const sentCount = contactRows.filter((c) => c.status.sendCard && c.status.sent).length;
  const receivedCount = contactRows.filter((c) => c.status.sendCard && c.status.received).length;

  const nothingAtAll = totalContactCount === 0;

  return (
    <>
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Mail size={22} className="text-berry" />
          <h1 className="font-festive text-3xl text-pine-deep sm:text-4xl">Christmas Cards</h1>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-cocoa-soft">
          <CalendarRange size={14} />
          Christmas {year}
        </p>
        {contactRows.length > 0 && (
          <p className="text-sm text-cocoa-soft">
            <span className="font-semibold text-pine-deep">{toSendCount}</span> to send
            {" · "}
            <span className="font-semibold text-pine-deep">{sentCount}</span> sent
            {" · "}
            <span className="font-semibold text-pine-deep">{receivedCount}</span> received
          </p>
        )}
      </header>

      {readOnly && <ArchivedNotice year={year} />}

      {nothingAtAll ? (
        <>
          {!readOnly && <AddContactForm seasonId={seasonId} personOptions={personOptionsFor()} />}
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-cocoa-soft shadow-sm">
            No card list yet — add your first contact above.
          </p>
        </>
      ) : (
        <section className="flex flex-col gap-4">
          {!readOnly && <AddContactForm seasonId={seasonId} personOptions={personOptionsFor()} />}

          {contactRows.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-cocoa-soft shadow-sm">
              Nobody&apos;s on this year&apos;s list yet.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-3 md:hidden">
                {contactRows.map((c) => (
                  <ContactCard
                    key={c.id}
                    contact={c}
                    seasonId={seasonId}
                    personOptions={personOptionsFor(c.id)}
                    readOnly={readOnly}
                  />
                ))}
              </div>
              <div className="hidden overflow-x-auto rounded-2xl bg-white p-4 shadow-sm md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-cocoa/10 text-xs font-semibold uppercase tracking-wide text-cocoa-soft">
                      <th className="py-2 pr-4 font-semibold">Contact</th>
                      <th className="py-2 pr-4 font-semibold">Status</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {contactRows.map((c) => (
                      <ContactTableRow
                        key={c.id}
                        contact={c}
                        seasonId={seasonId}
                        personOptions={personOptionsFor(c.id)}
                        readOnly={readOnly}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!readOnly && (
            <NotOnListSection contacts={otherContactRows} seasonId={seasonId} year={year} />
          )}

          {!readOnly && <ArchivedContactsSection contacts={archivedContactRows} />}
        </section>
      )}
    </>
  );
}
