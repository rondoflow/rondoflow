---
name: private-anonymous-agent-payments
description: "Private payments for AI agents - no on-chain link between sender and recipient"
category: "Finance & Crypto"
author: community
version: "1.1.0"
icon: coins
---

# ClawPay 🦞

**Send money privately. Recipient sees funds from Railgun - can't trace back to you.**

## Just Run It

**Prerequisites:** You need a wallet private key with USDT on BSC.

Save this as `send-private.mjs` and run with `node send-private.mjs`:

```javascript
// send-private.mjs - Copy this entire file and run it
import { Wallet, JsonRpcProvider, Contract, parseUnits } from 'ethers';

// ============ CONFIGURE THESE ============
const PRIVATE_KEY = process.env.WALLET_KEY || '0xYOUR_PRIVATE_KEY';
const RECIPIENT = '0xRECIPIENT_ADDRESS';
const AMOUNT = '0.10';  // USDT amount
// =========================================

const API = 'https://clawpay.dev';
const BSC_RPC = 'https://bsc-dataseed.binance.org/';
const USDT = '0x55d398326f99059fF775485246999027B3197955';
const SIGN_MSG = 'b402 Incognito EOA Derivation';

async function sendPrivate() {
  const provider = new JsonRpcProvider(BSC_RPC);
  const wallet = new Wallet(PRIVATE_KEY, provider);
  const myAddress = wallet.address;

  console.log('Sending', AMOUNT, 'USDT privately to', RECIPIENT);
  console.log('From wallet:', myAddress, '\n');

  // 1. Sign message
  console.log('1. Signing...');
  const signature = await wallet.signMessage(SIGN_MSG);

  // 2. Get invoice address
  console.log('2. Getting invoice...');
  const invoiceRes = await fetch(
    API + '/invoice?eoa=' + myAddress + '&signature=' + encodeURIComponent(signature)
  );
  const { invoiceAddress } = await invoiceRes.json();
  console.log('   Invoice:', invoiceAddress);

  // 3. Transfer USDT to invoice
  console.log('3. Transferring USDT to invoice...');
  const usdt = new Contract(USDT, ['function transfer(address,uint256) returns (bool)'], wallet);
  const tx = await usdt.transfer(invoiceAddress, parseUnits(AMOUNT, 18));
  console.log('   TX:', tx.hash);
  await tx.wait();

  // 4. Execute private transfer
  console.log('4. Executing private transfer...');
  const transferRes = await fetch(API + '/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eoa: myAddress,
      signature,
      recipient: RECIPIENT,
      amount: AMOUNT,
      token: 'USDT'
    })
  });
  const result = await transferRes.json();

  if (result.transferId) {
    console.log('\n✓ SUCCESS!');
    console.log('Transfer ID:', result.transferId);
    console.log('Status:', result.status);
    console.log('\nRecipient gets funds from Railgun in ~60 seconds.');
    console.log('They CANNOT see your wallet address.');
    console.log('\nCheck status: curl ' + API + '/status/' + result.transferId);
  } else {
    console.log('Error:', result.error);
  }
}

sendPrivate().catch(console.error);
```

**Run it:**
```bash
npm install ethers
WALLET_KEY=0xYourPrivateKey node send-private.mjs
```

---

## How It Works

```
YOU                    CLAWPAY API                 RECIPIENT
 │                          │                          │
 ├── USDT to invoice ──────►│                          │
 │                          │                          │
 ├── Sign message ─────────►│                          │
 │                          │                          │
 ├── POST /transfer ───────►│                          │
 │                          ├── Shield (Railgun) ─────►│
 │                          ├── ZK Proof (~60s) ──────►│
 │                          ├── Unshield ─────────────►│
 │                          │                          │
 │                          │    Funds from "Railgun"  │
 │                          │    NO LINK TO YOU        │
```

---

## API Reference

**Base URL:** `https://clawpay.dev`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | API status |
| `/invoice?eoa=...&signature=...` | GET | Get your invoice address |
| `/transfer` | POST | Send private payment |
| `/status/:id` | GET | Check transfer status |
| `/balance?eoa=...&signature=...&token=USDT` | GET | Check shielded balance |
| `/faucet` | POST | Get BNB for gas (testnet) |

### POST /transfer

```json
{
  "eoa": "0xYourAddress",
  "signature": "0xSignedMessage...",
  "recipient": "0xRecipientAddress",
  "amount": "1.00",
  "token": "USDT"
}
```

Response:
```json
{
  "transferId": "tx_123...",
  "status": "pending",
  "message": "Transfer initiated"
}
```

Status flow: `pending` → `shielding` → `proving` → `complete`

---

## No Private Key? Use Bankr Wallet

If you're an agent without direct wallet access, use Bankr:

```javascript
// 1. Get your wallet from Bankr
const bankrWallet = await bankr.getWallet();

// 2. Sign the ClawPay message
const signature = await bankr.signMessage('b402 Incognito EOA Derivation');

// 3. Use signature with ClawPay API
// (same flow as above)
```

---

## Supported Tokens (BSC)

| Token | Address |
|-------|---------|
| USDT | `0x55d398326f99059fF775485246999027B3197955` |
| USDC | `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` |

---

## Need Gas?

```bash
curl -X POST https://clawpay.dev/faucet \
  -H "Content-Type: application/json" \
  -d '{"address": "0xYourAddress"}'
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| "Insufficient balance" | Transfer USDT to invoice first |
| "Signature does not match" | Sign exact message: `b402 Incognito EOA Derivation` |
| "No spendable UTXOs" | Wait 2 min after funding invoice |

---

**Privacy for the agent economy** | Built on Railgun | https://clawpay.dev
