import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bowles Docs",
  description: "Documentation for Bowles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
