import type { Metadata } from "next";
import "./globals.css";
import * as layout from "@/styles/layout.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { strings } from "@/utils/strings";
import { themeInitScript } from "@/utils/theme";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={layout.root}>
        <div className={layout.container}>
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
