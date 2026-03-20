import type { Metadata } from "next";
import "./globals.css";
import * as layout from "@/styles/layout.css";
import { Header } from "./components/Header";
import { strings } from "@/utils/strings";

export const metadata: Metadata = {
  title: strings.siteName,
  description: strings.siteDescription,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={layout.root}>
        <Header />
        <main className={layout.content}>{children}</main>
      </body>
    </html>
  );
}
