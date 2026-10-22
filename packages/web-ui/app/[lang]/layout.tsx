import type { Metadata } from "next";
import { Suspense } from "react";
import "../globals.css";
import * as layout from "@/styles/layout.css";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { NavigationProgress } from "@/app/components/NavigationProgress";
import { strings } from "@/utils/strings";
import { themeInitScript } from "@/utils/theme";
import { LANGS } from "@/utils/i18n";
import { getLang } from "@/utils/lang";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const s = strings[await getLang()];
  return { title: s.siteName, description: s.siteDescription };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLang();
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
