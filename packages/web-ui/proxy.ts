import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { internalPath } from "@/utils/routes";

// Crawlers and scraping tools are turned away by user agent. robots.txt
// already asks every bot to stay out; this catches the ones that ignore it. A
// scraper that pretends to be a browser still gets through.

// Link previews fetch a single page when someone shares a link, so they're
// allowed. iMessage previews identify as facebookexternalhit and Twitterbot.
const LINK_PREVIEW =
  /facebookexternalhit|twitterbot|slackbot|discordbot|telegrambot|whatsapp|linkedinbot|mastodon|bluesky|skypeuripreview/i;

const BOT =
  /bot|crawl|spider|slurp|scrap|archiver|headless|python|curl|wget|httpx|aiohttp|go-http-client|java\/|okhttp|axios|undici|^node|libwww|perl|ruby|php|guzzle|postman|insomnia|ahrefs|semrush|yandex|baidu|bytespider|claude|perplexity|meta-externalagent/i;

export function proxy(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  // Browsers always send a user agent
  if (userAgent === "" || (BOT.test(userAgent) && !LINK_PREVIEW.test(userAgent))) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const url = request.nextUrl.clone();
  url.pathname = internalPath(url.pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  // Not on static files, robots.txt (so bots can still read it) or the Fly
  // health check
  matcher: "/((?!_next/static|_next/image|favicon.ico|robots.txt|healthz).*)",
};
