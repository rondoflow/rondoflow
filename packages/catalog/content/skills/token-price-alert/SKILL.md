---
name: token-price-alert
description: "🚨 **Monitor session tokens and get alerts at 75%/90%/95%**"
category: "Finance & Crypto"
author: community
version: "1.2.0"
icon: coins
---

# Token Alert Skill

🚨 **Monitor session tokens and get alerts at 75%/90%/95%**

## Overview

The Token Alert Skill automatically monitors your Clawdbot session token usage and sends alerts when you approach limits. Never lose context mid-conversation again!

## Features

- ✅ **6-Level Threshold System** - Alerts at 25%, 50%, 75%, 90%, 95%, 100%
- ✅ **Material Design Progress Bar** - Box-style (▰/▱) with color gradients
- ✅ **Rich UI Dashboard** - Interactive HTML dashboard with animations
- ✅ **Session Status** - Shows current token usage on demand
- ✅ **Telegram Alerts** - Get notified before hitting limits
- ✅ **HEARTBEAT Integration** - Optional automated checks
- ✅ **Stateless** - No state file needed, calculates on-demand
- ✅ **Session Estimates** - Predicts remaining sessions (~50k avg)

## Usage

### Interactive Dashboard

Ask Grym:
- "Show token dashboard"
- "Open dashboard"

Or run directly:
```bash
python3 ~/clawd/skills/token-alert/scripts/show_dashboard.py
```

### Terminal Check

Ask Grym:
- "Wie viele Tokens habe ich noch übrig?"
- "Check token status"
- "Token usage?"

Or run:
```bash
python3 ~/clawd/skills/token-alert/scripts/check.py
```

### Automatic Alerts

Grym will automatically alert you when:
- 🟡 **25%** - Low warning (~150k tokens left)
- 🟠 **50%** - Medium warning (~100k tokens left)
- 🔶 **75%** - High warning (~50k tokens left)
- 🔴 **90%** - Critical warning (~20k tokens left)
- 🚨 **95%** - Emergency! (<10k tokens left)

### Example Output

```
🔶 Token Alert: Achtung!

🔶 ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱ 78.0%
156,000 / 200,000 Tokens verwendet

⚠️ Status: High Warning (Rot-Orange Zone)
💡 Verbleibend: ~44k Tokens
⏰ Geschätzte Sessions: <1 Session

🔧 Empfehlung:
   ✅ Wichtige Entscheidungen jetzt treffen
   ✅ Neue Session vorbereiten
   ✅ Token-sparend arbeiten
```

## Installation

```bash
# Via ClawdHub
clawdhub install token-alert

# Manual
cd ~/clawd/skills
git clone https://github.com/r00tid/clawdbot-token-alert token-alert
```

## Configuration

### HEARTBEAT Integration (Optional)

Add to `~/clawd/HEARTBEAT.md`:

```markdown
### Token Usage Check (täglich)
- [ ] `python3 ~/clawd/skills/token-alert/scripts/check.py`
- **Warning ab 70%:** "⚠️ Session bei XX% - Token-Sparend ab jetzt!"
```

## How It Works

1. Uses Clawdbot's `session_status` tool
2. Calculates percentage of token usage
3. Compares against thresholds (75%, 90%, 95%)
4. Sends Telegram alert if threshold crossed

## Technical Details

### Files

```
skills/token-alert/
├── SKILL.md                    # This file
├── README.md                   # GitHub documentation
├── LICENSE                     # MIT License
├── .clawdhub/
│   └── manifest.json           # ClawdHub metadata
├── assets/
│   ├── dashboard-78-high.png   # Screenshot (High Warning)
│   └── dashboard-96-emergency.png  # Screenshot (Emergency)
└── scripts/
    ├── check.py                # Token checker (Terminal)
    ├── dashboard.html          # Rich UI dashboard
    └── show_dashboard.py       # Dashboard launcher
```

### Dependencies

- Python 3.8+
- Clawdbot session_status tool
- Optional: Telegram channel configured

### Script API

```python
# scripts/check.py
def get_session_tokens():
    """Get current session token usage via session_status tool"""
    
def check_thresholds(percent):
    """Check if usage exceeds thresholds"""
    
def format_alert(used, limit, percent, level):
    """Format alert message for Telegram"""
```

## When to Use

- **Before long tasks** - Check if you have enough tokens
- **Mid-conversation** - Monitor usage during long sessions
- **Daily check** - Add to HEARTBEAT for automatic monitoring

## Limitations

- Only monitors session tokens (not Claude.ai API limits)
- Requires active Clawdbot session
- Alert frequency can be noisy if near threshold

## Future Enhancements

- [ ] Claude.ai API limits scraping (optional)
- [ ] Historical token usage tracking
- [ ] Weekly/monthly usage reports
- [ ] Integration with `token-router` skill

## Support

- GitHub Issues: https://github.com/r00tid/clawdbot-token-alert/issues
- ClawdHub: https://clawdhub.com/skills/token-alert
- Docs: https://docs.clawd.bot

## License

MIT License - See LICENSE file

---

Built with ❤️ by Grym 🥜
