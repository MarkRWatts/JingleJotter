import type { Metadata } from "next";
import { Fredoka, Mountains_of_Christmas, Nunito } from "next/font/google";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/shell/app-shell";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

// Hand-lettered festive face for the big page titles only; Fredoka carries
// the smaller headings where legibility matters more.
const mountains = Mountains_of_Christmas({
  variable: "--font-mountains",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jingle Jotter",
  description: "Cosy Christmas budget & gift tracking",
  icons: { icon: "/brand/icon.png" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Festive-decoration switch: stamped on <body> so pure decorations
  // (.whimsy-decor) can hide with one CSS rule, per signed-in user.
  const session = await auth();
  let showWhimsy = true;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { showWhimsy: true },
    });
    showWhimsy = user?.showWhimsy ?? true;
  }

  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${mountains.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" data-whimsy={showWhimsy ? "on" : "off"}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
