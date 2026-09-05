import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "NaijaLingo – Nigerian Language Technology",
  description:
    "English ↔ Urhobo translation and a community effort to build better Nigerian language AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="text-lg font-semibold tracking-tight text-emerald-800">
              NaijaLingo
            </Link>
            <nav className="flex gap-6 text-sm font-medium text-stone-600">
              <Link href="/translate" className="hover:text-emerald-800">
                Translate
              </Link>
              <Link href="/contribute" className="hover:text-emerald-800">
                Contribute
              </Link>
              <Link href="/about" className="hover:text-emerald-800">
                About
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
        <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-500">
          <p>
            NaijaLingo – building better technology for Nigerian languages. Translations are not
            authoritative; native speakers guide quality.
          </p>
        </footer>
      </body>
    </html>
  );
}
