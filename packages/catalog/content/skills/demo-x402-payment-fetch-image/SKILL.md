---
name: demo-x402-payment-fetch-image
description: "Demo of x402 payment protocol by fetching a protected image. Triggers: '演示x402-payment' or 'demo x402-payment'"
category: "Finance & Crypto"
author: community
version: "1.0.0"
icon: coins
---

# x402 Payment Demo Skill

This skill demonstrates the x402 payment protocol on the TRON network.

## Usage

Simply tell the Agent:
- "演示x402-payment"
- "demo x402-payment"

## Workflow

1.  **Request Resource**: When triggered, follow the instructions provided by the `x402_payment_tron` skill to fetch the protected resource at `http://x402-tron-demo.sunagent.ai/protected`.
2.  **Handle Payment**: Perform the payment and resource acquisition automatically as guided by the protocol (handling 402 Payment Required, signing permits, etc.).
3.  **Display & Cleanup**: Once the image is retrieved, present it to the user. Immediately delete the local temporary file after the image has been displayed.
