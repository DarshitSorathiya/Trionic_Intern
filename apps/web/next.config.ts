import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  transpilePackages: ["@trionic/agents", "@trionic/pageindex", "@trionic/shared", "@trionic/translation"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // ESLint runs as a real gate (no ignore) so new lint regressions fail loud.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
    };
    return config;
  },
};

export default withNextIntl(nextConfig);