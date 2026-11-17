import { PoolsView } from "@/components/app/pools-view";

export default function LiquidityPage() {
  return <>
    <div className="page-title"><h1>Liquidity</h1><p>Explore Testnet pools and their on-chain reserves.</p></div>
    <div className="dashboard-notice" role="status"><div><span><b>Liquidity management is coming soon</b><small>Pool discovery is available. Adding and removing liquidity will be available when the backend supports transaction preparation.</small></span></div></div>
    <PoolsView />
  </>;
}
