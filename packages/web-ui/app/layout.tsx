import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import * as layout from "@/styles/layout.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { NavigationProgress } from "./components/NavigationProgress";
import { strings } from "@/utils/strings";
import { themeInitScript } from "@/utils/theme";
import { DEFAULT_LANG, langInitScript } from "@/utils/i18n";

// In the default language; LangToggle updates the tab title to match.
export const metadata: Metadata = {
  title: strings[DEFAULT_LANG].siteName,
  description: strings[DEFAULT_LANG].siteDescription,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={DEFAULT_LANG} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: langInitScript }} />
      </head>
      <body className={layout.root}>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <div className={layout.container}>
          <Header />
          <main>{children}</main>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </div>
      </body>
    </html>
  );
}
