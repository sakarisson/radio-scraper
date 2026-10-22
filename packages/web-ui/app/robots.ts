import type { MetadataRoute } from "next";

// No crawling at all, search engines included. proxy.ts also turns away
// known bots that ignore this.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
