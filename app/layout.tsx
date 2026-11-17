import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { TelemetryProvider } from "@/components/telemetry/TelemetryProvider";

export const metadata: Metadata = {
  title: { default: "VELTRIXAE — Trade Beyond Boundaries", template: "%s | VELTRIXAE" },
  description: "The next generation of decentralized trading on Stellar Testnet.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  applicationName: "VELTRIXAE",
  appleWebApp: { capable: true, title: "VELTRIXAE", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { themeColor: "#080713", colorScheme: "dark" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><PwaProvider><TelemetryProvider>{children}</TelemetryProvider></PwaProvider></body></html>; }
