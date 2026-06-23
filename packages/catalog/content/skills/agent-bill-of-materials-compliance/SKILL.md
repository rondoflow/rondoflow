---
name: agent-bill-of-materials-compliance
description: "AI compliance and policy engine — evaluate scan results against OWASP, NIST, SOC 2, ISO 27001, CMMC, EU AI Act, AISVS v1.0, and related frameworks. Generate SBOMs and compliance reports. Use when: \"compliance report\", \"NIST\", \"SOC 2\", \"ISO 27001\", \"OWASP\", \"EU AI Act\", \"AISVS\",…"
category: "AI & Agents"
author: community
version: "0.81.3"
icon: bot
---

# agent-bom-compliance — AI Compliance & Policy Engine

Evaluate AI infrastructure scan results against 14 security and regulatory
frameworks. Enforce policy-as-code rules. Generate SBOMs in standard formats.
Run AISVS v1.0 and CIS benchmark checks.

## Install

```bash
pipx install agent-bom
agent-bom agents -f compliance-export  # run agents scan with compliance export
agent-bom generate-sbom                # generate CycloneDX SBOM
```

## When to Use

- "compliance report" / "run compliance"
- "NIST" / "NIST AI RMF" / "NIST CSF" / "NIST 800-53"
- "SOC 2" / "SOC2"
- "ISO 27001"
- "OWASP" / "OWASP LLM Top 10" / "OWASP Agentic Top 10"
- "EU AI Act"
- "AISVS" / "AI Security Verification Standard"
- "CMMC" / "FedRAMP"
- "generate SBOM" / "CycloneDX" / "SPDX"
- "policy check" / "policy enforcement"

## Tools (5)

| Tool | Description |
|------|-------------|
| `compliance` | OWASP LLM/Agentic Top 10, EU AI Act, MITRE ATLAS, NIST AI RMF |
| `policy_check` | Evaluate results against custom security policy (17 conditions) |
| `cis_benchmark` | Run CIS benchmark checks against cloud accounts |
| `generate_sbom` | Generate SBOM (CycloneDX or SPDX format) |
| `aisvs_benchmark` | OWASP AISVS v1.0 compliance — 9 AI security checks |

## Supported Frameworks (14)

- **OWASP LLM Top 10** (2025) — prompt injection, supply chain, data leakage
- **OWASP MCP Top 10** — MCP-specific security risks
- **OWASP Agentic Top 10** — tool poisoning, rug pulls, credential theft
- **OWASP AISVS v1.0** — AI Security Verification Standard (9 checks)
- **MITRE ATLAS** — adversarial ML threat framework
- **NIST AI RMF** — govern, map, measure, manage lifecycle
- **NIST CSF 2.0** — identify, protect, detect, respond, recover
- **NIST 800-53 Rev 5** — federal security controls (CM-8, RA-5, SI-2, SR-3)
- **FedRAMP Moderate** — derived from NIST 800-53 controls
- **EU AI Act** — risk classification, transparency, SBOM requirements
- **ISO 27001:2022** — information security controls (Annex A)
- **SOC 2** — Trust Services Criteria
- **CIS Controls v8** — implementation groups IG1/IG2/IG3
- **CMMC 2.0** — cybersecurity maturity model (Level 1-3)

## Examples

```
# Run compliance check against multiple frameworks
compliance(frameworks=["owasp_llm", "eu_ai_act", "nist_ai_rmf"])

# Enforce custom policy
policy_check(policy={"max_critical": 0, "max_high": 5})

# Generate SBOM
generate_sbom(format="cyclonedx")

# Run AISVS v1.0 compliance
aisvs_benchmark()

# Run AWS CIS benchmark
cis_benchmark(provider="aws")
```

## Privacy & Data Handling

**OWASP, NIST, EU AI Act, MITRE ATLAS, AISVS, SBOM generation, and policy
checks** run entirely locally on scan data already in memory. No network calls,
no credentials needed for these features.

**CIS benchmark checks** (optional, user-initiated) call cloud provider APIs
using your locally configured credentials. These are read-only API calls to
AWS, Azure, GCP, or Snowflake. You must explicitly run `cis_benchmark(provider=...)`
and confirm before any cloud API calls are made.

## Verification

- **Source**: [github.com/msaad00/agent-bom](https://github.com/msaad00/agent-bom) (Apache-2.0)
- **7,100+ tests** with CodeQL + OpenSSF Scorecard
- **No telemetry**: Zero tracking, zero analytics
