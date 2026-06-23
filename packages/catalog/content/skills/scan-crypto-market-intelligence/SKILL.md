---
name: scan-crypto-market-intelligence
description: "Automated crypto market intelligence - prices, sentiment, trending coins, and Polymarket hot markets. Zero dependencies, 100% reliability. Perfect for alpha channels and market monitoring."
category: "Finance & Crypto"
author: community
version: "1.0.0"
icon: coins
---

# 📡 Crypto Alpha Scanner

**Reliable market intelligence in one command.**

No API keys. No external dependencies. Just Python stdlib.

## Features

- 📊 **Live Prices** — BTC, ETH, SOL with 24h change
- 😱 **Fear & Greed Index** — Market sentiment gauge
- 🔥 **Trending Coins** — What's hot on CoinGecko
- 🎯 **Polymarket Hot** — Top prediction markets by volume
- 💡 **Auto Insights** — Actionable commentary based on data

## Quick Start

```bash
# Generate alpha report
python3 scripts/scanner.py

# Output to file
python3 scripts/scanner.py > report.txt

# Post to Telegram (with bot token)
python3 scripts/scanner.py | ./scripts/post_telegram.sh
```

## Sample Output

```
🤖 Alpha Report | 2026-02-11 19:00 UTC

📊 Market Pulse
🔴 BTC: $67,216 (-2.3%)
🔴 ETH: $1,943 (-3.2%)
🔴 SOL: $80 (-3.9%)
😱 Fear/Greed: 11 (Extreme Fear)

🔥 Trending: LayerZero, Uniswap, Bitcoin, Hyperliquid

🎯 Polymarket Hot
• Will Trump nominate Judy Shelton...? ($5.1M)
• Will the Fed decrease rates...? ($3.3M)

💡 Extreme fear = historically strong buy zone.

— Nix 🔥
```

## Data Sources

| Source | Data | Rate Limit |
|--------|------|------------|
| CoinGecko | Prices, trending | 30/min |
| Alternative.me | Fear/Greed | Unlimited |
| Polymarket Gamma | Markets | Unlimited |

## Cron Setup

Run hourly for consistent alpha:

```bash
# Add to crontab
0 * * * * python3 /path/to/scripts/scanner.py >> /var/log/alpha.log
```

## Customization

Edit `scripts/scanner.py` to:
- Add more coins
- Change formatting
- Add custom insights
- Integrate with your channels

## Why This Skill?

✅ **100% Reliable** — Only uses APIs that work  
✅ **Zero Setup** — No API keys needed  
✅ **Fast** — Runs in <3 seconds  
✅ **Portable** — Pure Python, runs anywhere

---

*Built by Nix 🔥 | Free alpha, forever*
