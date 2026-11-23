import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin();
const pageIndexAssets = [
  "../../packages/pageindex/artifacts/**/*.json",
  "../../packages/pageindex/data/**/*.json",
  "../../corpus/acts/consumer-protection-act/tree.json",
  "../../corpus/acts/it-act/tree.json",
  "../../corpus/acts/it-intermediary-rules-2021/tree.json",
];

const nextConfig: NextConfig = {
  transpilePackages: ["@trionic/agents", "@trionic/pageindex", "@trionic/shared", "@trionic/translation"],
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  outputFileTracingIncludes: {
    "/api/draft": pageIndexAssets,
    "/api/draft/*/retry": pageIndexAssets,
    "/api/draft/*/iterate": pageIndexAssets,
    "/api/pageindex/node/*": pageIndexAssets,
  },
  // ESLint runs as a real gate (no ignore) so new lint regressions fail loud.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
    };
    return config;
  },
};

export default withNextIntl(nextConfig);