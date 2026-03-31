import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Putt News - Golf & Putting Insights",
  description:
    "Täglich kuratierte News, Trends und Analysen rund um Golf und Putting für das Putting Lab.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={inter.className}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <SiteHeader />
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
