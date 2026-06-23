---
name: agents-bank
description: "**Version:** 1.0.6"
category: "AI & Agents"
author: community
version: "1.0.6"
icon: bot
---

# AgentsBank SDK Skill Definition

**Version:** 1.0.6  
**Publisher:** AgentsBank  
**Contact:** info@agentsbank.online  
**Status:** 🟢 Public Release - Production Ready

---

## 🎯 PURPOSE & CAPABILITY

This skill provides **secure, scoped crypto banking operations** for AI agents via the official AgentsBank SDK. It enables agents to manage wallets, check balances, and execute transactions with explicit user control.

### ✅ Capabilities (Read-Only & Safe)
- ✓ Fetch agent wallet balances across all supported chains (Ethereum, BSC, Solana, Bitcoin)
- ✓ Retrieve transaction history with filtering and pagination
- ✓ Query wallet details, metadata, and account information
- ✓ Sign messages for authentication and verification (no fund transfer)
- ✓ Estimate gas fees before transaction execution
- ✓ List all wallets with pagination support

### ⚠️ Capabilities (Write/Financial - Requires Explicit User Invocation)
- ⚠️ Send crypto transactions (only if `disableModelInvocation: false` is explicitly overridden by user)
- ⚠️ Create new wallets (only if `disableModelInvocation: false` is explicitly overridden by user)
- ⚠️ Self-register agents and humans autonomously

### ❌ NOT Included (Out of Scope)
- OAuth2 delegated access to external wallets
- Webhooks or event subscriptions
- Smart contract deployment
- Sandboxed testing (use testnet chains directly)
- Private key export or management

---

## 🔐 CREDENTIALS & ENVIRONMENT VARIABLES

### Required Environment Variables

| Variable | Type | Purpose | Example |
|----------|------|---------|---------|
| `AGENTSBANK_API_URL` | string | API endpoint (primary) | `https://api.agentsbank.online` |
| `AGENTSBANK_AGENT_USERNAME` | string | Agent identifier | `agent_123456_abc` |
| `AGENTSBANK_AGENT_PASSWORD` | string | Agent credential (secret) | *(user-specific)* |

**⚠️ SECURITY NOTES:**
- `AGENTSBANK_AGENT_PASSWORD` must **never** be committed to version control
- Store in `.env` file (add to `.gitignore`)
- Rotate credentials quarterly or if exposed
- Use a secret manager (e.g., HashiCorp Vault, AWS Secrets Manager) in production

### Optional Environment Variables

| Variable | Type | Purpose | Default |
|----------|------|---------|---------|
| `AGENTSBANK_API_KEY` | string | Alternative to password-based auth | *(not set)* |
| `AGENTSBANK_LOG_LEVEL` | string | Logging verbosity | `info` |
| `AGENTSBANK_TIMEOUT_MS` | number | Request timeout | `30000` |

---

## 🚀 INSTALL & SETUP

### 1. Install SDK

The published npm package is **lightweight** (~6.8 KB) with no node_modules included. Installation only fetches dependencies you need:

```bash
npm install @agentsbankai/sdk
# or
yarn add @agentsbankai/sdk
# or
pnpm add @agentsbankai/sdk
```

This will:
- ✅ Download the compiled SDK (CJS + ESM formats)
- ✅ Install required dependencies (axios, ethers, @solana/web3.js, etc.)
- ✅ No bloat: node_modules are excluded from the published package

### 2. Initialize Environment

Create `.env` file in your project root:

```env
AGENTSBANK_API_URL=https://api.agentsbank.online
AGENTSBANK_AGENT_USERNAME=agent_123456_abc
AGENTSBANK_AGENT_PASSWORD=your_secure_password_here
```

### 3. Create Client Instance

```typescript
import { AgentsBankSDK } from '@agentsbankai/sdk';

// Initialize SDK with API credentials
const bank = new AgentsBankSDK({
  apiUrl: process.env.AGENTSBANK_API_URL || 'https://api.agentsbank.online',
  timeout: parseInt(process.env.AGENTSBANK_TIMEOUT_MS || '30000')
});

// Authenticate using agent credentials
const { token, agent } = await bank.login({
  agentUsername: process.env.AGENTSBANK_AGENT_USERNAME!,
  agentPassword: process.env.AGENTSBANK_AGENT_PASSWORD!
});

console.log('✅ Authenticated as:', agent.agent_id);
```

### 4. Use Safe Operations (Always Allowed)

```typescript
// Get wallet balance (safe, read-only)
const balance = await bank.getBalance(walletId);
console.log('Balance:', balance);

// Get transaction history (safe, read-only)
const history = await bank.getTransactionHistory(walletId, { 
  limit: 10,
  offset: 0 
});
console.log('Recent transactions:', history);

// Sign a message (safe, no fund transfer)
const signature = await bank.signMessage(walletId, 'verify-ownership');
console.log('Signature:', signature);

// Estimate gas fees before sending
const gasEstimate = await bank.estimateGas({
  walletId,
  toAddress: '0x...',
  amount: '1.5',
  chain: 'ethereum'
});
console.log('Estimated gas:', gasEstimate);

// List all wallets with pagination
const wallets = await bank.listWallets({ limit: 20, offset: 0 });
console.log('Agent wallets:', wallets);
```

---

## ⚠️ RESTRICTED OPERATIONS (Require Explicit User Approval)

The following operations **will not execute autonomously** and require explicit user invocation:

```typescript
// ❌ This requires user to explicitly call it
// (disableModelInvocation: true is set by default)
const tx = await bank.sendTransaction({
  walletId,
  toAddress: recipientAddress,
  amount: '1.5',
  chain: 'solana',
  token: 'SOL'
});
```

**Why restricted?**
- Financial operations that move assets must never be autonomous
- Requires explicit user approval before execution
- Prevents unintended fund transfers due to model hallucination
- v1.0.6 adds comprehensive error handling for validation failures

### Error Handling (v1.0.6)
The SDK provides typed errors for better debugging:

```typescript
import { AgentsBankSDK, SDKError } from '@agentsbankai/sdk';

try {
  const tx = await bank.sendTransaction({
    walletId,
    toAddress: '0xinvalid', // Invalid address
    amount: '100',
    chain: 'ethereum'
  });
} catch (error) {
  if (error instanceof SDKError) {
    console.error('SDK Error:', error.code, error.message);
    // Error codes: INVALID_ADDRESS, INSUFFICIENT_BALANCE, INVALID_CHAIN, etc.
  }
}
```

---

## 📋 METADATA & CONFIGURATION

```json
{
  "name": "@agentsbankai/sdk",
  "namespace": "agentsbank",
  "version": "1.0.6",
  "description": "Scoped crypto banking SDK for AI agents with explicit financial operation protection, comprehensive error handling, and multi-chain support",
  "author": "AgentsBank",
  "license": "MIT",
  "homepage": "https://agentsbank.online",
  "repository": "https://github.com/agentsbank/sdk",
  "docs": "https://docs.agentsbank.online/sdk",
  "primaryEnv": "AGENTSBANK_AGENT_PASSWORD",
  "requiredEnvs": [
    "AGENTSBANK_API_URL",
    "AGENTSBANK_AGENT_USERNAME",
    "AGENTSBANK_AGENT_PASSWORD"
  ],
  "optionalEnvs": [
    "AGENTSBANK_API_KEY",
    "AGENTSBANK_LOG_LEVEL",
    "AGENTSBANK_TIMEOUT_MS"
  ],
  "disableModelInvocation": true,
  "modelInvocationWarning": "Financial operations must be explicitly requested by users. Autonomous transaction execution is disabled.",
  "enforcedScopes": [
    "read:balance",
    "read:history",
    "read:wallet",
    "read:estimate",
    "sign:message"
  ],
  "restrictedScopes": [
    "write:transaction",
    "write:wallet",
    "write:register"
  ],
  "features": {
    "multiChain": ["ethereum", "bsc", "solana", "bitcoin"],
    "errorHandling": "Typed errors with specific error codes",
    "validation": "Client-side parameter validation",
    "pagination": "Supported for wallet and transaction listing"
  },
  "installMechanism": "npm",
  "codeFiles": ["src/client.ts", "src/types.ts", "src/errors.ts", "src/index.ts"],
  "noExecutableScripts": true,
  "noDiskPersistence": true,
  "noModelAutonomy": true,
  "changelog": "https://github.com/agentsbank/sdk/blob/main/CHANGELOG.md"
}
```

---

## 🛡️ SECURITY BOUNDARIES

### What This Skill Can Do
✅ Read wallet balances and history  
✅ Sign messages for authentication  
✅ Create wallets (with explicit user request)  
✅ Retrieve account metadata  

### What This Skill CANNOT Do
❌ Execute transactions autonomously  
❌ Export private keys  
❌ Access external service credentials  
❌ Persist sensitive data to disk  
❌ Make requests to unlisted endpoints  

### Authentication Scopes
- **Read scopes:** `read:balance`, `read:history`, `read:wallet`, `sign:message`
- **Write scopes:** `write:transaction`, `write:wallet` (user-invoked only)
- **No delegation:** Agent cannot request additional scopes

---

## ✅ VERIFICATION CHECKLIST

Before using this skill, confirm:

- [ ] You have obtained valid `AGENTSBANK_AGENT_USERNAME` and `AGENTSBANK_AGENT_PASSWORD` from https://agentsbank.online
- [ ] Credentials are stored securely in `.env` (never committed)
- [ ] You have reviewed the [Security Architecture](https://docs.agentsbank.online/security)
- [ ] You understand that `disableModelInvocation: true` prevents autonomous transactions
- [ ] You have tested read operations first before enabling write operations
- [ ] You monitor activity logs at admin.agentsbank.online

---

## 📖 DOCUMENTATION & SUPPORT

| Resource | URL |
|----------|-----|
| Full SDK Docs | https://docs.agentsbank.online/sdk |
| API Reference | https://api.agentsbank.online/docs |
| Security Guide | https://docs.agentsbank.online/security |
| Troubleshooting | https://docs.agentsbank.online/faq |
| GitHub Issues | https://github.com/agentsbank/sdk/issues |
| Support Email | support@agentsbank.online |

---

## ⚖️ DISCLAIMER

This skill integrates with real cryptocurrency networks (Ethereum, Solana, Bitcoin, BSC). **Transactions are irreversible.** 

- AgentsBank is not responsible for fund loss due to incorrect addresses or user error
- Always test with small amounts first
- Use testnet chains for development
- Enable 2FA on your AgentsBank account

---

**Last Updated:** February 11, 2026 (v1.0.6 release)  
**Status:** 🟢 Public Release - Production Ready ✅  
**npm Package:** https://www.npmjs.com/package/@agentsbankai/sdk  
**GitHub:** https://github.com/agentsbank/sdk  
**Changes in v1.0.6:** Comprehensive error handling, enhanced type definitions, improved client implementation
