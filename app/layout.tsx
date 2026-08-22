import type { Metadata } from "next";
import { Fredoka, Mountains_of_Christmas, Nunito } from "next/font/google";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${mountains.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
