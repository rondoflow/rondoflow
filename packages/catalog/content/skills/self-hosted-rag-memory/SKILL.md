---
name: self-hosted-rag-memory
description: "**The Brain for OpenClaw** - Self-hosted RAG engine with hybrid search."
category: "AI & Agents"
author: community
version: "1.2.0"
icon: bot
---

# ClawRAG Connector

**The Brain for OpenClaw** - Self-hosted RAG engine with hybrid search.

> ⚠️ This skill requires Docker. It connects OpenClaw to your local ClawRAG instance.

## What is ClawRAG?

Production-ready RAG infrastructure that keeps your data local:
- 🔒 **Privacy-first**: Vector DB runs on your machine
- 🔍 **Hybrid Search**: Semantic + Keyword (BM25) + RRF ranking
- 📄 **Smart Ingestion**: PDFs, Office docs, Markdown via Docling
- 🧠 **MCP-native**: Seamless OpenClaw integration

## Installation

### Step 1: Start ClawRAG (Docker)
```bash
git clone https://github.com/2dogsandanerd/ClawRag.git
cd ClawRag
cp .env.example .env
docker compose up -d
```

Wait for http://localhost:8080/health to return OK.

### Step 2: Connect OpenClaw
```bash
openclaw mcp add --transport stdio clawrag npx -y @clawrag/mcp-server
```

### Verification
Test your setup:
```bash
curl http://localhost:8080/api/v1/rag/collections
```

## Features

| Capability | Description |
|------------|-------------|
| Document Upload | PDF, DOCX, TXT, MD via API or folder |
| Hybrid Query | Vector similarity + keyword matching |
| Citations | Source tracking for all answers |
| Multi-Collection | Organize knowledge by project |

## Requirements

- Docker + Docker Compose
- 4GB+ RAM (8GB recommended for local LLM)
- Or: OpenAI/Anthropic API key for cloud LLM

## Architecture

```
OpenClaw ◄──MCP──► @clawrag/mcp-server ◄──HTTP──► ClawRAG API (localhost:8080)
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │  ChromaDB   │
                                    │  (vectors)  │
                                    └─────────────┘
```

## Links

- 📚 Full Docs: https://github.com/2dogsandanerd/ClawRag#readme
- 🔧 API Reference: http://localhost:8080/docs (when running)
- 🐛 Issues: https://github.com/2dogsandanerd/ClawRag/issues
- 📦 MCP Package: https://www.npmjs.com/package/@clawrag/mcp-server

## Tags

rag, vector, memory, search, documents, self-hosted, privacy, mcp, local-ai

---

## Metadata für ClawHub-Upload:

| Feld | Wert |
|------|------|
| **Slug** | `clawrag` |
| **Display name** | `ClawRAG - Self-hosted RAG & Memory` |
| **Version** | `1.2.0` |
| **Tags** | `rag`, `vector`, `memory`, `search`, `documents`, `self-hosted`, `privacy`, `mcp`, `local-ai` |

## Changelog für Version 1.2.0

### 1.2.0 - Initial ClawHub Release

- Connector skill for OpenClaw integration
- MCP server support (@clawrag/mcp-server v1.1.0)
- Docker-first deployment
- Hybrid search (Vector + BM25)
