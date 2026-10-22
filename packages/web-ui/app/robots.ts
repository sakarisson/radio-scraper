import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Station-filtered charts: every combination and order of stations is a
      // separate URL, all showing data that's on the unfiltered pages anyway
      disallow: "/charts?*stations=",
    },
  };
}
