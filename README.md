# VELTRIXAE Frontend
VELTRIXAE is a non-custodial Stellar trading interface. This repository targets **Stellar Testnet only**; Mainnet is intentionally unavailable.

![VELTRIXAE desktop dashboard and swap mockup](docs/mockups/veltrixae-desktop.png)

## Current status

| Feature | Status |
| --- | --- |
| Freighter connect, network detection, address, and signing | Implemented; mocked tests pass, live wallet not verified in this audit |
| Horizon balances, recent transactions, and network health | Implemented with validated live Testnet reads |
| Backend tokens, pools, markets, quotes, preparation, and status | Integrated against the published `/api/v1` contract |
| Swap execution | Guarded implementation; unavailable while backend quotes are non-executable |
| Pool and market discovery | Read-only, backed by verified factory snapshots |
| Market and asset explorer | Searchable by code, issuer, and contract ID; duplicate codes disambiguated by issuer/contract; verification badges link to provenance |
| Trading pairs, pools, liquidity, and issuer details | Displayed from verified snapshots |
| Historical charts | Shown only when supported data exists; unsupported metrics render an explicit unavailable state |
| Indexed protocol analytics | UI/schema support exists; historical series remain unavailable because the backend exposes only an overview |
| Add/remove liquidity | Unavailable; no supported preparation API |
| Portfolio quantities | Available from Horizon |
| USD prices, LP positions, history, volume, and TVL | Unavailable without verified providers/indexers |
| End-to-end, responsive, and accessibility tests | Playwright with deterministic wallet/API fixtures; Chromium desktop and mobile projects; critical accessibility violations fail CI |
| Observability | Privacy-conscious error monitoring and web-vitals reporting; frontend errors correlated with backend request identifiers |
| Mainnet policy | Testnet only; builds reject Mainnet configuration and no release flag can override this |

The web app is deployed at https://veltrixae.vercel.app. The backend records an older Factory/Router AMM deployment from source commit `133b18d`, distinct from current Contract main. Read-only verification on November 21, 2026 confirmed matching WASM hashes and an empty factory; the separate aggregator is not deployed. Quotes and swap preparation remain unavailable without funded routes and a verified aggregator. No successful live wallet-signed swap is claimed. Analytics never render missing data as zero; unsupported metrics show an unavailable state.

See [backend deployment evidence](https://github.com/VELTRIXAE/Aggregator-and-Backend/tree/main/docs/evidence), [reconciliation](https://github.com/VELTRIXAE/Aggregator-and-Backend/blob/main/docs/DEPLOYMENT_RECONCILIATION.md), and [live readiness](https://veltrixae.vercel.app/api/aggregator/readiness). Live state can change after verification or Testnet resets. Contract code derives from Soroswap; upstream attribution and unresolved licensing are documented in those repositories. A deployed website does not establish audited or executable trading.

## Development

Requires Node.js 22+ and pnpm 12.16.1.

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:3000>.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical frontend URL |
| `VELTRIXAE_API_URL` | For hosted backend data | Server-side backend origin; the same-origin `/api/aggregator/*` proxy forwards to `/api/v1/*`. Development defaults to `http://127.0.0.1:3100` |
| `NEXT_PUBLIC_VELTRIXAE_API_URL` | Compatibility fallback | Older backend-origin setting; prefer the server-side variable |
| `NEXT_PUBLIC_STELLAR_RPC_URL` | Optional | Defaults to Stellar Testnet RPC |
| `NEXT_PUBLIC_STELLAR_HORIZON_URL` | Optional | Defaults to Testnet Horizon |

Never provide private keys or recovery phrases. All wallet authorization stays in Freighter. Signed envelopes are submitted directly to Stellar RPC, never to the VELTRIXAE backend.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm test:e2e
pnpm build
```

Wallet and backend tests are mocked unless explicitly documented as live. Playwright end-to-end, responsive, and accessibility suites run in CI against deterministic wallet and API fixtures without real funds or private keys. See [testing](docs/TESTING.md) and the [frontend audit](docs/FRONTEND_AUDIT.md).

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Frontend setup](docs/FRONTEND_SETUP.md)
- [Wallet integration](docs/WALLET_INTEGRATION.md)
- [Backend integration](docs/BACKEND_INTEGRATION.md)
- [Testing](docs/TESTING.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## Deployment

For Vercel, import the repository, use Node.js 22 and the pinned pnpm version, set `VELTRIXAE_API_URL` to the reachable HTTPS backend origin and `NEXT_PUBLIC_APP_URL` to the frontend URL, and deploy. Browser API requests use the same-origin proxy, so the backend port need not be publicly forwarded when both processes run in the same Codespace.

Mainnet is unsupported and rejected at build time. No environment release flag enables it. Future support requires an explicitly reviewed implementation. Executable Testnet trading must be demonstrated through backend readiness, verified contract identifiers, wallet review, independent simulation, direct RPC submission and finality. Mock wallet tests are not live integration evidence. Liquidity management and additional wallet integrations must remain labeled unavailable or unverified until their respective flows have evidence.

Operational readiness requires the release, rollback, incident, and environment-validation checklists. Telemetry must never include wallet secrets, signed XDR, or sensitive account data. Health and configuration failures are observable, and frontend errors are correlated with backend request identifiers.

Licensed under the [MIT License](LICENSE).
