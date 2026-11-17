# Frontend setup

Requirements: Node.js 22+, pnpm 12.16.1, and optional Freighter for wallet testing.

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

Set `NEXT_PUBLIC_VELTRIXAE_API_URL` to the backend origin, not `/api/v1`; the client adds that path. RPC and Horizon default to Stellar Testnet. `NEXT_PUBLIC_APP_URL` sets canonical metadata.

Do not place secrets in `NEXT_PUBLIC_*` variables. The frontend needs no private key, recovery phrase, backend credential, or wallet secret.

## Network policy

This frontend is **Stellar Testnet-only**. Set `NEXT_PUBLIC_STELLAR_NETWORK=testnet` (or leave the default in place). A build fails immediately if the network is `mainnet`/`public`, or if either configured RPC or Horizon URL contains `mainnet`.

There is no release flag that can override this policy. Future Mainnet work requires an independent security audit, verified deployment provenance, an explicit product decision, and a reviewed implementation change. Until then, no Mainnet contract calls are possible. See `docs/OPERATIONS.md` for the Testnet release, rollback, incident, and environment-validation checklists.
