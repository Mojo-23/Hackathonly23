import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hackathonly Jordan",
  description:
    "The event intelligence operating system for Jordanian hackathons — team formation, check-in, submissions, judging, and reports in one privacy-first platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
