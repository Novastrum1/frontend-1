import Link from "next/link";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="offline-page">
      <div className="offline-card glass">
        <span className="eyebrow">VELTRIXAE OFFLINE</span>
        <h1>Your app shell is ready.</h1>
        <p>
          Reconnect to request Testnet quotes, load balances, or authorize wallet actions. No transaction is stored,
          queued, or signed while you are offline.
        </p>
        <Link className="offline-action" href="/app">Try again</Link>
      </div>
    </main>
  );
}
