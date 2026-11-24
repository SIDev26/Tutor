import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beacon Math",
  description: "Parent-controlled mastery practice for elementary math.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
