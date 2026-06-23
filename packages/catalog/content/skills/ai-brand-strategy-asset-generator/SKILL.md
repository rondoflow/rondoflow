---
name: ai-brand-strategy-asset-generator
description: "An advanced AI agent that acts as a Senior Brand Strategist. It automates project setup, applies elite market methodologies (Archetypes, StoryBrand, Personas), and generates structured brand assets while preventing hallucinations via strict context shielding."
category: "AI & Agents"
author: community
version: "1.0.0"
icon: bot
---

# Senior Brand Strategist Skill

This skill transforms your AI into a **Senior Brand Strategist** capable of orchestrating complex branding projects from chaos to structured strategy.

## ✨ Features

*   **🏆 Elite Methodologies:** Built-in knowledge of Archetypes (Mark/Pearson), StoryBrand (Miller), and Goal-Directed Personas (Cooper).
*   **🛡️ Hallucination Shield:** "Context Saver" and "Reality Check" protocols ensure the strategy is grounded in client data.
*   **⚖️ Strategy Auditor:** The agent acts as a consultant, flagging if a client's request (e.g., "Neon Red") contradicts their goal (e.g., "Calmness").
*   **⚡ Automated Workflow:** One command (`/branding-start`) sets up the entire folder structure and prepares templates.
*   **🎨 Asset Output:** Generates assets in a specific Markdown format ready for import into documentation tools.
*   **🧠 Interrogation Mode:** If the briefing is weak, the agent refuses to generate strategy and interviews the user instead.

## 🚀 How to Use

1.  **Start a Project:**
    Typing any of these commands triggers the automated setup:
    *   `Start branding project`
    *   `/branding-start`
    *   `Novo projeto de marca`

2.  **Provide Context:**
    The system will create a `client_intel` folder. Upload your PDFs, briefings, or transcripts there.

3.  **Generate Strategy:**
    The agent will analyze the documents using the RACE framework and fill the templates in `strategy_output`.

## 📂 Directory Structure

```
clients/
└── [Client_Name]/
    ├── client_intel/       <-- Drop your files here
    ├── creative_assets/    <-- Place logos/images here
    └── strategy_output/    <-- The AI renders final MD files here
```

## 🛠️ Installation

1.  Clone this repository into your `.agent/skills/` directory.
2.  Ensure you have Python 3 installed.
3.  Restart your agent to load the new rules.
