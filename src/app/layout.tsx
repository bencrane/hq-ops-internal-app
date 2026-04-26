import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth-constants";
import { SignOutButton } from "./SignOutButton";
import "./globals.css";
import { OrgUserPicker } from "@/components/OrgUserPicker";
import { getSelection } from "@/lib/selection";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const signedIn = Boolean(jar.get(SESSION_COOKIE)?.value);
  const { orgId, userId } = await getSelection();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-900 bg-black/60 px-6 py-3 backdrop-blur">
          <Link
            href="/"
            className="text-sm font-semibold tracking-wide text-white transition-colors hover:text-zinc-300"
          >
            Ops
          </Link>
          <div className="flex items-center gap-3">
            <OrgUserPicker defaultOrgId={orgId} defaultUserId={userId} />
            {signedIn && <SignOutButton />}
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
