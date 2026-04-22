import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Internal Operations",
  description: "HQ internal operations console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950">
        <header className="flex items-center border-b border-zinc-900 bg-black/60 px-6 py-3 backdrop-blur">
          <Link
            href="/"
            className="text-sm font-semibold tracking-wide text-white transition-colors hover:text-zinc-300"
          >
            Ops
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
