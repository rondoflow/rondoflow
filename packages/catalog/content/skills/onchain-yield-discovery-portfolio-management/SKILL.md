---
name: onchain-yield-discovery-portfolio-management
description: "On-chain yield discovery, transaction building, and portfolio management via the Yield.xyz API. Use when the user wants to find yields, stake, lend, deposit into vaults, check balances, claim rewards, exit positions, compare APYs, or manage any on-chain yield across 80+ networks."
category: "Finance & Crypto"
author: community
version: "0.1.5"
icon: coins
---

# YieldAgent by Yield.xyz

Access the complete on-chain yield landscape through Yield.xyz's unified API. Discover 2600+ yields across staking, lending, vaults, restaking, and liquidity pools. Build transactions and manage positions across 80+ networks.

## CRITICAL: Never Modify Transactions From The API

> **DO NOT MODIFY `unsignedTransaction` returned by the API UNDER ANY CIRCUMSTANCES.**
>
> Do not change, reformat, or "fix" any part of it — not addresses, amounts, fees, encoding, or any other field, on any chain.
>
> **If the amount is wrong:** Request a NEW action from the API with the correct amount.
> **If gas is insufficient:** Ask the user to add funds, then request a NEW action.
> **If anything looks wrong:** STOP. Always request a new action with corrected arguments. Never attempt to "fix" an existing transaction.
>
> Modifying `unsignedTransaction` WILL RESULT IN PERMANENT LOSS OF FUNDS.

---

## Key Rules

> **The API is self-documenting.** Every yield describes its own requirements through the `YieldDto`. Before taking any action, always fetch the yield and inspect it. The `mechanics` field tells you everything: what arguments are needed (`mechanics.arguments.enter`, `.exit`), entry limits (`mechanics.entryLimits`), and what tokens are accepted (`inputTokens[]`). Never assume — always check the yield first.

1. **Always fetch the yield before calling an action.** Call `GET /v1/yields/{yieldId}` and read `mechanics.arguments.enter` (or `.exit`) to discover the exact fields required. Each yield is different — the schema is the contract. Do not guess or hardcode arguments.

   Each field in the schema (`ArgumentFieldDto`) tells you:
   - `name`: the field name (e.g., `amount`, `validatorAddress`, `inputToken`)
   - `type`: the value type (`string`, `number`, `address`, `enum`, `boolean`)
   - `required`: whether it must be provided
   - `options`: static choices for enum fields (e.g., `["individual", "batched"]`)
   - `optionsRef`: a dynamic API endpoint to fetch choices (e.g., `/api/v1/validators?integrationId=...`) — if present, call it to get the valid options (validators, providers, etc.)
   - `minimum` / `maximum`: value constraints
   - `isArray`: whether the field expects an array

   If a field has `optionsRef`, you must call that endpoint to get the valid values. This is how validators, providers, and other dynamic options are discovered.

2. **For manage actions, always fetch balances first.** Call `POST /v1/yields/{yieldId}/balances` and read `pendingActions[]` on each balance. Each pending action tells you its `type`, `passthrough`, and optional `arguments` schema. Only call manage with values from this response.

3. **Amounts are human-readable.** `"100"` means 100 USDC. `"1"` means 1 ETH. `"0.5"` means 0.5 SOL. Do NOT convert to wei or raw integers — the API handles decimals internally.

4. **Set `inputToken` to what the user wants to deposit** — but only if `inputToken` appears in the yield's `mechanics.arguments.enter` schema. The API handles the full flow (swaps, wrapping, routing) to get the user into the position.

5. **ALWAYS submit the transaction hash after broadcasting — no exceptions.** For every transaction: sign, broadcast, then submit the hash via `PUT /v1/transactions/{txId}/submit-hash` with `{ "hash": "0x..." }`. Balances will not appear until the hash is submitted. This is the most common mistake — do not skip this step.

6. **Execute transactions in exact order.** If an action has multiple transactions, they are ordered by `stepIndex`. Wait for `CONFIRMED` before proceeding to the next. Never skip or reorder.

7. **Consult `{baseDir}/references/openapi.yaml` for types.** All enums, DTOs, and schemas are defined there. Do not hardcode values.

## Quick Start

```bash
# Discover yields on a network
./scripts/find-yields.sh base USDC

# Inspect a yield's schema before entering
./scripts/get-yield-info.sh base-usdc-aave-v3-lending

# Enter a position (amounts are human-readable)
./scripts/enter-position.sh base-usdc-aave-v3-lending 0xYOUR_ADDRESS '{"amount":"100"}'

# Check balances and pending actions
./scripts/check-portfolio.sh base-usdc-aave-v3-lending 0xYOUR_ADDRESS
```

## Scripts

| Script | Purpose |
|--------|---------|
| `find-yields.sh` | Discover yields by network/token |
| `get-yield-info.sh` | Inspect yield schema, limits, token details |
| `list-validators.sh` | List validators for staking yields |
| `enter-position.sh` | Enter a yield position |
| `exit-position.sh` | Exit a yield position |
| `manage-position.sh` | Claim, restake, redelegate, etc. |
| `check-portfolio.sh` | Check balances and pending actions |

## Common Patterns

### Enter a Position
1. Discover yields: `find-yields.sh base USDC`
2. Inspect the yield: `get-yield-info.sh <yieldId>` — read `mechanics.arguments.enter`
3. Enter: `enter-position.sh <yieldId> <address> '{"amount":"100"}'`
4. For each transaction: wallet signs → broadcast → **submit hash** → wait for CONFIRMED

### Manage a Position
1. Check balances: `check-portfolio.sh <yieldId> <address>`
2. Read `pendingActions[]` — each has `{ type, passthrough, arguments? }`
3. Manage: `manage-position.sh <yieldId> <address> <action> <passthrough>`

### Full Lifecycle
1. Discover → 2. Enter → 3. Check balances → 4. Claim rewards → 5. Exit

## Transaction Flow

After any action (enter/exit/manage), the response contains `transactions[]`. For EACH transaction:

1. Pass `unsignedTransaction` to wallet skill for signing and broadcasting
2. **Submit the hash** — `PUT /v1/transactions/{txId}/submit-hash` with `{ "hash": "0x..." }`
3. Poll `GET /v1/transactions/{txId}` until `CONFIRMED` or `FAILED`
4. Proceed to next transaction

Every transaction must follow this flow. Example with 3 transactions:
```
TX1: sign → broadcast → submit-hash → poll until CONFIRMED
TX2: sign → broadcast → submit-hash → poll until CONFIRMED
TX3: sign → broadcast → submit-hash → poll until CONFIRMED
```

`unsignedTransaction` format varies by chain. See `{baseDir}/references/chain-formats.md` for details.

## API Endpoints

All endpoints documented in `{baseDir}/references/openapi.yaml`. Quick reference:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/yields` | List yields (with filters) |
| GET | `/v1/yields/{yieldId}` | Get yield metadata (schema, limits, tokens) |
| GET | `/v1/yields/{yieldId}/validators` | List validators |
| POST | `/v1/actions/enter` | Enter a position |
| POST | `/v1/actions/exit` | Exit a position |
| POST | `/v1/actions/manage` | Manage a position |
| POST | `/v1/yields/{yieldId}/balances` | Get balances for a yield |
| POST | `/v1/yields/balances` | Aggregate balances across yields/networks |
| PUT | `/v1/transactions/{txId}/submit-hash` | Submit tx hash after broadcasting |
| GET | `/v1/transactions/{txId}` | Get transaction status |
| GET | `/v1/networks` | List all supported networks |
| GET | `/v1/providers` | List all providers |

## References

Detailed reference files — read on demand when you need specifics.

- **API types and schemas:** `{baseDir}/references/openapi.yaml` — source of truth for all DTOs, enums, request/response shapes
- **Chain transaction formats:** `{baseDir}/references/chain-formats.md` — `unsignedTransaction` encoding per chain family (EVM, Cosmos, Solana, Substrate, etc.)
- **Wallet integration:** `{baseDir}/references/wallet-integration.md` — Crossmint, Portal, Turnkey, Privy, signing flow
- **Agent conversation examples:** `{baseDir}/references/examples.md` — 10 conversation patterns with real yield IDs
- **Safety checks:** `{baseDir}/references/safety.md` — pre-execution checks, constraints

## Error Handling

The API returns structured errors with `message`, `error`, and `statusCode`. Read the `message`. Error shapes are in `{baseDir}/references/openapi.yaml`. Respect `retry-after` on 429s.

## Add-on Modules

Modular instructions that extend core functionality. Read when relevant.


- `{baseDir}/references/superskill.md` — 40 advanced capabilities: rate monitoring, cross-chain comparison, portfolio diversification, rotation workflows, reward harvesting, scheduled checks

## Resources

- API Docs: https://docs.yield.xyz
- API Recipes: https://github.com/stakekit/api-recipes
- Get API Key: https://dashboard.yield.xyz
