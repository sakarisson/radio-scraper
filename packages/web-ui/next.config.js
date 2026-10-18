const path = require("path");
const { createVanillaExtractPlugin } = require("@vanilla-extract/next-plugin");

const withVanillaExtract = createVanillaExtractPlugin({
  unstable_turbopack: { mode: "auto" },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server in .next/standalone for a small Docker image
  output: "standalone",
  // The app lives in a pnpm workspace, so trace dependencies from its root
  outputFileTracingRoot: path.join(__dirname, "../.."),
  turbopack: {
    root: path.join(__dirname, "../.."),
  },

  // Data functions in utils/database.ts are cached with "use cache"
  cacheComponents: true,
  // Links prefetch each route's shared shell (layout + loading skeleton)
  partialPrefetching: true,
  cacheLife: {
    // Recent plays. The scraper checks stations every 10 seconds, so a minute
    // behind is fine.
    live: { stale: 30, revalidate: 60, expire: 10 * 60 },
    // Totals and charts for the current month. The precomputed play totals
    // are refreshed every 5 minutes anyway.
    stats: { stale: 60, revalidate: 5 * 60, expire: 60 * 60 },
    // Things that practically never change, like charts for past months.
    archive: { stale: 60 * 60, revalidate: 24 * 60 * 60, expire: 7 * 24 * 60 * 60 },
  },
};

module.exports = withVanillaExtract(nextConfig);
