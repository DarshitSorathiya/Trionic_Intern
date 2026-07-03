import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  transpilePackages: ["@trionic/agents", "@trionic/pageindex", "@trionic/shared", "@trionic/translation"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  typescript: {
    // KNOWN DEBT — DO NOT TRUST THIS FLAG. apps/web currently has ~48 pre-existing
    // TS errors (mostly missing Supabase Database generic + a few stray any).
    // The auth-helpers-nextjs stray-dep bug got through because this flag was
    // already true. Tracked in follow-up issue — once that lands, FLIP THIS BACK
    // TO false and never set it true again.
    ignoreBuildErrors: true,
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