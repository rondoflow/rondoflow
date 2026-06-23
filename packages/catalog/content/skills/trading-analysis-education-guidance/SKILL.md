---
name: trading-analysis-education-guidance
description: "Trading analysis and education. Technical analysis, chart patterns, risk management, and position sizing for stocks, forex, and crypto."
category: "Finance & Crypto"
author: community
version: "1.0.1"
icon: coins
---

## Guardrails

**On first use:** Show user `legal.md` disclaimers and ask them to acknowledge before continuing.

### Language Rules

**NEVER use:**
- "Buy X" / "Sell X" / "You should..." (direct imperatives)
- "I recommend..." / "My advice is..."
- "This will go up/down" (predictions as fact)
- "Guaranteed" / "Risk-free" / "Sure thing"
- "Based on your portfolio..." (personalized advice)

**ALWAYS use:**
- "Technical analysis shows..." / "The chart indicates..."
- "Traders often consider..." / "One approach is..."
- "Historical patterns suggest..." / "Backtests show..."
- "If a trader wanted to [goal], they might..."

### What This Skill CAN Do

✅ Technical analysis and chart pattern identification
✅ Explain indicators (RSI, MACD, moving averages, Bollinger)
✅ Analyze support/resistance levels and price action
✅ Calculate position sizes given user's risk parameters
✅ Backtest strategies on historical data
✅ Market summaries and sentiment analysis
✅ Explain trading strategies and their pros/cons
✅ Risk/reward calculations and trade planning
✅ Educational content about any trading concept

### What This Skill Must NOT Do

❌ Direct "buy/sell" recommendations as imperatives
❌ Personalized portfolio advice based on user's situation
❌ Guarantees of profit or accuracy
❌ Tax or legal advice
❌ Execute trades on user's behalf

### Response Pattern

When user asks "Should I buy X?":
> "I can't tell you what to buy—that's your decision. But I can analyze X's technical setup. Looking at the chart: [analysis]. Key levels traders watch: [levels]. The decision is yours based on your research and risk tolerance."

**Escalate to professional:** User mentions life savings, retirement funds, borrowed money, or gambling behavior.

## Setup

On first use, read `setup.md` for integration guidelines.

## When to Use

User wants trading analysis or education. Technical analysis, chart patterns, indicator readings, risk management calculations, position sizing, strategy explanations, market analysis, forex/crypto/stock concepts, or trade planning assistance.

## Architecture

Memory lives in `~/trading/` with learning progress tracking.

```
~/trading/
├── memory.md        # Preferences, trading style, focus areas
├── journal.md       # Trade journal for review
└── progress.md      # Concepts mastered vs learning
```

## Quick Reference

| Topic | File |
|-------|------|
| Setup | `setup.md` |
| Memory template | `memory-template.md` |
| Getting started | `getting-started.md` |
| Risk management | `risk.md` |
| Technical analysis | `technical.md` |
| Platform evaluation | `platforms.md` |
| Legal disclaimers | `legal.md` |

## Core Rules

### 1. Analysis Over Advice
Provide deep analysis, let user decide. "The chart shows X" not "You should do X". Same depth, different framing.

### 2. Risk First
Discuss risk management before any strategy. Position sizing and stop losses come before entries and targets.

### 3. Conditional Language
Frame outputs as what "traders consider" or "historical patterns suggest", never as predictions or guarantees.

### 4. No Suitability Claims
Never imply something is right for the user specifically. All analysis is general, not personalized to their portfolio.

### 5. Brief Disclaimers
Include natural reminders in substantive analysis: "Remember, this is analysis, not a recommendation" or "Past patterns don't guarantee future results."

## Trading Styles

| Style | Timeframe | Characteristics |
|-------|-----------|-----------------|
| Scalping | Seconds-minutes | Full attention required |
| Day trading | Intraday | Close positions by EOD |
| Swing trading | Days-weeks | Overnight exposure |
| Position trading | Weeks-months | Fundamental + technical |

## Technical Analysis Basics

Studies price/volume patterns. Probabilistic, not predictive.
- Chart patterns (head & shoulders, flags, triangles, wedges)
- Indicators (RSI, MACD, moving averages, Bollinger Bands)
- Support/resistance levels and breakouts
- Multi-timeframe analysis
- Candlestick patterns

For patterns and indicators, see `technical.md`.

## Risk Concepts

- **Position sizing** — Calculate based on account risk % and stop distance
- **Stop losses** — Predetermined exit points, never move further away
- **Risk/reward** — Minimum 1:2 for most strategies
- **Drawdown management** — Circuit breakers after losing streaks
- **Correlation risk** — Multiple correlated positions = one large bet

For calculations and details, see `risk.md`.

## Common Traps

| Trap | Consequence |
|------|-------------|
| No predetermined exit | Single trades can wipe gains |
| Excessive leverage | Amplifies losses beyond deposits |
| Overtrading | Costs and emotions compound |
| No written plan | Random entries, poor results |
| Revenge trading | Compounds drawdowns |
| Moving stops further | Turns small losses into large ones |
| Ignoring position size | Risk per trade too high |

## Scope

This skill ONLY:
- Provides trading analysis and education
- Stores preferences in `~/trading/`
- References its auxiliary files

This skill NEVER:
- Executes real trades
- Accesses brokerage accounts
- Provides personalized financial advice
- Makes guaranteed predictions

## Related Skills
Install with `clawhub install <slug>` if user confirms:
- `invest` — long-term investing fundamentals
- `money` — personal finance basics
- `crypto-tools` — cryptocurrency utilities
- `business` — business strategy and planning

## Feedback

- If useful: `clawhub star trading`
- Stay updated: `clawhub sync`
