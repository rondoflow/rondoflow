---
name: discover-supporter-personality-find-tools
description: "Discover your supporter personality and find AI tools you'll love. Get personalized recommendations, connect with your first 100 supporters, and search for skills that match how you work. For indie devs, vibe coders, and AI builders."
category: "Integrations"
author: community
version: "2.0.1"
icon: plug
---

# Bloom Supporter Identity

**Discover your supporter personality—straight from your conversations.**

## ⚠️ Permissions & Capabilities

This skill requires the following permissions:

**📖 Read Conversations** - Analyzes your last ~120 messages to understand your interests and supporter type. Raw conversation text stays local; only analysis results are used.

**🌐 External Network** - Connects to Bloom Protocol API to:
- Generate your shareable dashboard URL
- Store your identity card (personality type, tagline, categories)
- Enable future features (skill recommendations, creator tipping)

**🔐 Agent Wallet (Optional)** - Creates a blockchain wallet on Base network (Coinbase CDP) for future tipping features. This is generated automatically but not required for basic functionality.

**Your Control**: Your conversation is analyzed locally. You decide whether to share your identity card publicly via the dashboard link.

Are you a Visionary who jumps on new tools early? An Explorer trying everything? A Cultivator building communities? An Optimizer fine-tuning workflows? Or an Innovator pushing boundaries?

Find out in seconds with Bloom Supporter Identity.

## 🎯 What You Get

Your personalized Bloom Supporter Identity Card reveals:

- **🎴 Your Supporter Type** – Visionary, Explorer, Cultivator, Optimizer, or Innovator
- **💬 Custom Tagline** – A one-liner that captures your vibe ("First to try new AI tools")
- **📊 2x2 Dimensions** – Conviction vs. Intuition, showing how you make decisions
- **🏷️ Top Categories** – AI Tools, Productivity, Consumer Apps—where you spend your energy
- **🎯 Tool Recommendations** – The top 5 tools matched to your profile
- **🔗 Shareable Card** – Show off your supporter identity
- **🤖 Agent Wallet** – Ready for tipping creators (powered by Coinbase on Base)

## ⚡️ How It Works

Simple: just type `/bloom` in your chat.

We analyze your last ~120 messages to understand:
- **What excites you** (AI agents? productivity hacks? creative tools?)
- **How you engage** (deep dives vs. quick experiments)
- **Your supporter archetype** (early adopter or wait-and-see?)

**No complex setup. No wallet signatures. No auth flows.**
Just pure conversation intelligence.

## 🚀 Usage

```
/bloom
```

That's it. Or use natural language:
```
"discover my supporter type"
"what's my bloom identity"
"create my supporter card"
```

Works with as few as 3 messages—but richer history = deeper insights.

## 🌟 Why Bloom Supporter Identity?

**For Indie Devs & AI Builders:**
Building something new? Show you were early—not through complex analytics, but through *conviction*. Your supporter card helps you **find your first 100 supporters** who share your vision.

**For Vibe Coders:**
Stop guessing what tools to try next. Get personalized recommendations based on how you actually work, not generic listicles. **Discover skills you'll actually use** instead of scrolling endless lists.

**For Consumer AI Enthusiasts:**
**Find AI tools that match your vibe**. Search by supporter type (Visionary, Explorer, etc.) to connect with others who work like you. Rally early adopters for bold launches. Engage optimizers for feedback loops.

## 📋 Requirements

- **Minimum 3 messages** in your conversation (more is better)
- **Node.js 18+** (usually pre-installed)
- **Bloom Identity Skill** installed

## 💡 Example Output

```
═══════════════════════════════════════════════════════
🎉 Your Bloom Supporter Identity Card is ready! 🤖
═══════════════════════════════════════════════════════

🔗 VIEW YOUR IDENTITY CARD:
   https://bloomprotocol.ai/agents/27811541

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💜 The Visionary
💬 "First to try new AI tools"

You jump on cutting-edge tools before they're mainstream. Your
conviction is your edge, and you see potential where others see
hype. AI agents are where you spot the next big thing.

🏷️  Categories: AI Tools · Productivity · Automation
   Interests: AI Agents · No-code Tools · Creative AI

📊 2x2 Dimensions:
   Conviction: 78/100
   Intuition: 85/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Top 5 Recommended Tools:

1. agent-frameworks (94% match) · by @builder_alice
   Build AI agents with tool use and memory
   → https://clawhub.ai/skills/agent-frameworks

2. no-code-automation (89% match) · by @automation_guru
   Connect your apps without writing code
   → https://clawhub.ai/skills/no-code-automation

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 Your Agent Wallet Created

   Network: Base
   Status: ✅ Wallet generated and ready

   💡 Use your agent wallet to tip tool creators!
   ⚠️  Tipping features coming soon
   🔒 Do not deposit funds yet - withdrawals not ready

═══════════════════════════════════════════════════════

🌸 Bloom Supporter Identity · Built for indie builders
```

## 🔧 Installation

### Quick Install (via ClawHub)
```bash
clawhub install bloom
```

### Manual Install
```bash
# 1. Clone the repo
cd ~/.openclaw/workspace
git clone https://github.com/unicornbloom/bloom-identity-skill.git
cd bloom-identity-skill

# 2. Install dependencies
npm install

# 3. Copy skill wrapper
cp -r openclaw-wrapper ~/.openclaw/skills/bloom

# 4. Test it
/bloom
```

## 🛠 Advanced Usage

### Run from session file (full conversation context)
```bash
npx tsx scripts/run-from-session.ts \
  ~/.openclaw/agents/main/sessions/<SessionId>.jsonl \
  <userId>
```

### Run from piped context (quick test)
```bash
echo "Your conversation here" | \
  npx tsx scripts/run-from-context.ts --user-id <userId>
```

## 🐛 Troubleshooting

**"Insufficient conversation data"**
→ Need at least 3 messages. Keep chatting about tools you're interested in!

**"Command not found"**
→ Verify `bloom-identity-skill` is in `~/.openclaw/workspace/` and run `npm install`

**No tool recommendations**
→ Tool recommendations depend on API availability. Your identity card still works!

## 🔐 Privacy & Data

**What We Analyze (Locally)**:
- ✅ Your conversation messages (last ~120 messages)
- ✅ Topics and interests you discuss
- ✅ No wallet transaction analysis
- ✅ No personal identifiable information

**What We Store**:
- Your identity card (personality type, tagline, categories)
- Agent wallet address (for future tipping features)
- Dashboard URL for sharing

**What We Don't Collect**:
- ❌ Raw conversation text (only analyzed locally)
- ❌ Wallet transaction history
- ❌ Personal contact information
- ❌ Browsing data or cookies

**Data Usage**:
Your identity card is stored on Bloom Protocol to power your shareable dashboard and enable future features like creator tipping and skill recommendations.

## 🔒 Security Notes

**Agent Wallet**:
- Automatically generated on first run via Coinbase CDP (Base network)
- Used for future creator tipping (not yet active)
- ⚠️ **Do not deposit funds** - withdrawal features not ready
- Private keys stored locally with AES-256-GCM encryption
- Read-only until tipping features are enabled

**Conversation Access**:
- Reads from `~/.openclaw/agents/main/sessions/*.jsonl`
- Only analyzes content locally (text not uploaded)
- Results (personality type, categories) sent to Bloom API

**JWT Tokens**:
- Used for dashboard authentication only
- Generated with configurable `JWT_SECRET` in `.env`
- Does not grant access to your OpenClaw account

**External Connections**:
- `api.bloomprotocol.ai` - Identity card storage
- `bloomprotocol.ai` - Dashboard hosting
- `clawhub.ai` - Skill recommendations (optional)

**Open Source**: All code is public at [github.com/unicornbloom/bloom-identity-skill](https://github.com/unicornbloom/bloom-identity-skill) for security audits.

## 🔍 How to Find Skills You'll Love

Once you know your supporter type, you can:
- **Search by archetype** – Find tools made for Visionaries, Explorers, etc.
- **Filter by category** – AI agents, productivity, creative tools, automation
- **Match by vibe** – Connect with creators who share your approach
- **Build your network** – Find your first 100 supporters who get what you're building

## 📊 The 5 Supporter Types

**💜 The Visionary** – First to try new tools
High conviction, high intuition. Jumps on cutting-edge stuff early.

**🔵 The Explorer** – Tries everything
Low conviction, high intuition. Experiments widely, finds hidden gems.

**💚 The Cultivator** – Builds communities
Low conviction, low intuition. Nurtures ecosystems, shares knowledge.

**🟡 The Optimizer** – Refines workflows
High conviction, low intuition. Doubles down on what works, maximizes productivity.

**🔴 The Innovator** – Pushes boundaries
Balanced dimensions. Combines conviction with experimentation.

## 🧬 Technical Details

- **Version**: 2.0.0
- **Analysis Engine**: Conversation memory + category mapping
- **Session Context**: Last ~120 messages (~5KB)
- **Processing Time**: ~2-5 seconds
- **Output Format**: Structured text + shareable dashboard URL
- **Agent Wallet**: Coinbase CDP (Base network)

---

**Built by [Bloom Protocol](https://bloomprotocol.ai) 🌸**

Making supporter identity portable and provable.

*For indie devs, vibe coders, and AI builders who back great tools early.*
