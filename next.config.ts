import type { NextConfig } from "next";

/**
 * Build-time network policy.
 *
 * This product is Testnet-only. Refuse a build as soon as any public network
 * setting requests Mainnet rather than trying to make a partial readiness
 * decision in a second runtime gate.
 */
function assertTestnetOnly(): void {
  const network = (process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "").toLowerCase();
  const rpcUrl = (process.env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "").toLowerCase();
  const horizonUrl = (process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ?? "").toLowerCase();
  const mainnetRequested =
    network === "mainnet" ||
    network === "public" ||
    rpcUrl.includes("mainnet") ||
    horizonUrl.includes("mainnet");

  if (!mainnetRequested) return;
  throw new Error(
    "Mainnet configuration was detected, but VELTRIXAE frontend is Testnet-only. Refusing to build.",
  );
}

assertTestnetOnly();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // `pnpm build` runs strict tsc first. Skip Next's duplicate checker because
  // restricted Codespaces cannot pipe `tsc --showConfig` from a child process.
  typescript: { ignoreBuildErrors: true },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
    useOffline: true,
  },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
    ] }];
  },
};

export default nextConfig;
