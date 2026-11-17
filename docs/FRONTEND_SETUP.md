# Frontend setup

Requirements: Node.js 22+, pnpm 12.16.1, and optional Freighter for wallet testing.

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

Browser API requests use the same-origin `/api/aggregator/*` route. Set the server environment variable `VELTRIXAE_API_URL` to the backend origin (without `/api/v1`). The older `NEXT_PUBLIC_VELTRIXAE_API_URL` remains a fallback. Restart the frontend after changing environment variables.

Development defaults to a backend at `http://127.0.0.1:3100`. Run the backend with `PORT=3100 npm run dev` in its repository. In Codespaces, run both processes in the same Codespace; only frontend port 3000 needs to be forwarded. Backend port 3100 can remain private because the frontend server connects internally. For a hosted frontend, set `VELTRIXAE_API_URL` to a reachable HTTPS backend and redeploy. A localhost URL cannot reach a backend on a different host.

RPC and Horizon default to Stellar Testnet. `NEXT_PUBLIC_APP_URL` sets canonical metadata. The liquidity screen uses the backend pool snapshot; add/remove actions remain unavailable until transaction preparation is supported.

Do not place secrets in `NEXT_PUBLIC_*` variables. The frontend needs no private key, recovery phrase, backend credential, or wallet secret.

## Network policy

This frontend is **Stellar Testnet-only**. Set `NEXT_PUBLIC_STELLAR_NETWORK=testnet` (or leave the default in place). A build fails immediately if the network is `mainnet`/`public`, or if either configured RPC or Horizon URL contains `mainnet`.

There is no release flag that can override this policy. Future Mainnet work requires an independent security audit, verified deployment provenance, an explicit product decision, and a reviewed implementation change. Until then, no Mainnet contract calls are possible. See `docs/OPERATIONS.md` for the Testnet release, rollback, incident, and environment-validation checklists.
