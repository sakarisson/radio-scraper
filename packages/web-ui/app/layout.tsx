import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import "./globals.css";
import * as layout from "@/styles/layout.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Radio Scraper",
  description: "Faroese radio songs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={layout.root}>
        <main className={layout.content}>{children}</main>
      </body>
    </html>
  );
}
