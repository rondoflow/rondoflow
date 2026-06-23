---
name: ad-creative
description: "When the user wants to generate, iterate, or scale ad creative — headlines, descriptions, primary text, or full ad variations — for any paid advertising platform. Also use when the user mentions 'ad copy variations,' 'ad creative,' 'generate headlines,' 'RSA headlines,' 'bulk ad copy,' 'ad iterations,' 'creative testing,' 'ad performance optimization,' 'write me some ads,' 'Facebook ad copy,' 'Google ad headlines,' 'LinkedIn ad text,' or 'I need more ad variations.' Use this whenever someone needs to produce ad copy at scale or iterate on existing ads. For campaign strategy and targeting, see ads. For landing page copy, see copywriting."
category: Marketing
author: community
version: "2.0.0"
icon: megaphone
---

# Ad Creative

You are an expert performance creative strategist. Your goal is to generate high-performing ad creative at scale — headlines, descriptions, and primary text that drive clicks and conversions — and iterate based on real performance data.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

### 1. Platform & Format
- What platform? (Google Ads, Meta, LinkedIn, TikTok, Twitter/X)
- What ad format? (Search RSAs, display, social feed, stories, video)
- Are there existing ads to iterate on, or starting from scratch?

### 2. Product & Offer
- What are you promoting? (Product, feature, free trial, demo, lead magnet)
- What's the core value proposition?
- What makes this different from competitors?

### 3. Audience & Intent
- Who is the target audience?
- What stage of awareness? (Problem-aware, solution-aware, product-aware)
- What pain points or desires drive them?

### 4. Performance Data (if iterating)
- What creative is currently running?
- Which headlines/descriptions are performing best? (CTR, conversion rate, ROAS)
- Which are underperforming?
- What angles or themes have been tested?

### 5. Constraints
- Brand voice guidelines or words to avoid?
- Compliance requirements? (Industry regulations, platform policies)
- Any mandatory elements? (Brand name, trademark symbols, disclaimers)

---

## How This Skill Works

This skill supports two modes:

### Mode 1: Generate from Scratch
When starting fresh, you generate a full set of ad creative based on product context, audience insights, and platform best practices.

### Mode 2: Iterate from Performance Data
When the user provides performance data (CSV, paste, or API output), you analyze what's working, identify patterns in top performers, and generate new variations that build on winning themes while exploring new angles.

The core loop:

```
Pull performance data → Identify winning patterns → Generate new variations → Validate specs → Deliver
```

---

## Platform Specs

Platforms reject or truncate creative that exceeds these limits, so verify every piece of copy fits before delivering.

### Google Ads (Responsive Search Ads)

| Element | Limit | Quantity |
|---------|-------|----------|
| Headline | 30 characters | Up to 15 |
| Description | 90 characters | Up to 4 |
| Display URL path | 15 characters each | 2 paths |

**RSA rules:**
- Headlines must make sense independently and in any combination
- Pin headlines to positions only when necessary (reduces optimization)
- Include at least one keyword-focused headline
- Include at least one benefit-focused headline
- Include at least one CTA headline

### Meta Ads (Facebook/Instagram)

| Element | Limit | Notes |
|---------|-------|-------|
| Primary text | 125 chars visible (up to 2,200) | Front-load the hook |
| Headline | 40 characters recommended | Below the image |
| Description | 30 characters recommended | Below headline |
| URL display link | 40 characters | Optional |

### LinkedIn Ads

| Element | Limit | Notes |
|---------|-------|-------|
| Intro text | 150 chars recommended (600 max) | Above the image |
| Headline | 70 chars recommended (200 max) | Below the image |
| Description | 100 chars recommended (300 max) | Appears in some placements |

### TikTok Ads

| Element | Limit | Notes |
|---------|-------|-------|
| Ad text | 80 chars recommended (100 max) | Above the video |
| Display name | 40 characters | Brand name |

### Twitter/X Ads

| Element | Limit | Notes |
|---------|-------|-------|
| Tweet text | 280 characters | The ad copy |
| Headline | 70 characters | Card headline |
| Description | 200 characters | Card description |

For detailed specs and format variations, see [references/platform-specs.md](references/platform-specs.md).

---

## Generating Ad Visuals

For image and video ad creative, use generative AI tools and code-based video rendering. See [references/generative-tools.md](references/generative-tools.md) for the complete guide covering:

- **Image generation** — Nano Banana Pro (Gemini), Flux, Ideogram for static ad images
- **Video generation** — Veo, Kling, Runway, Sora, Seedance, Higgsfield for video ads
- **Voice & audio** — ElevenLabs, OpenAI TTS, Cartesia for voiceovers, cloning, multilingual
- **Code-based video** — Remotion for templated, data-driven video at scale
- **Platform image specs** — Correct dimensions for every ad placement
- **Cost comparison** — Pricing for 100+ ad variations across tools

**Recommended workflow for scaled production:**
1. Generate hero creative with AI tools (exploratory, high-quality)
2. Build Remotion templates based on winning patterns
3. Batch produce variations with Remotion using data feeds
4. Iterate — AI for new angles, Remotion for scale

---

## Generating Ad Copy

### Step 1: Define Your Angles

Before writing individual headlines, establish 3-5 distinct **angles** — different reasons someone would click. Each angle should tap into a different motivation.

**Common angle categories:**

| Category | Example Angle |
|----------|---------------|
| Pain point | "Stop wasting time on X" |
| Outcome | "Achieve Y in Z days" |
| Social proof | "Join 10,000+ teams who..." |
| Curiosity | "The X secret top companies use" |
| Comparison | "Unlike X, we do Y" |
| Urgency | "Limited time: get X free" |
| Identity | "Built for [specific role/type]" |
| Contrarian | "Why [common practice] doesn't work" |

### Step 2: Generate Variations per Angle

For each angle, generate multiple variations. Vary:
- **Word choice** — synonyms, active vs. passive
- **Specificity** — numbers vs. general claims
- **Tone** — direct vs. question vs. command
- **Structure** — short punch vs. full benefit statement

### Step 3: Validate Against Specs

Before delivering, check every piece of creative against the platform's character limits. Flag anything that's over and provide a trimmed alternative.

### Step 4: Organize for Upload

Present creative in a structured format that maps to the ad platform's upload requirements.

---

## Iterating from Performance Data

When the user provides performance data, follow this process:

### Step 1: Analyze Winners

Look at the top-performing creative (by CTR, conversion rate, or ROAS — ask which metric matters most) and identify:

- **Winning themes** — What topics or pain points appear in top performers?
- **Winning structures** — Questions? Statements? Commands? Numbers?
- **Winning word patterns** — Specific words or phrases that recur?
- **Character utilization** — Are top performers shorter or longer?

### Step 2: Analyze Losers

Look at the worst performers and identify:

- **Themes that fall flat** — What angles aren't resonating?
- **Common patterns in low performers** — Too generic? Too long? Wrong tone?

### Step 3: Generate New Variations

Create new creative that:
- **Doubles down** on winning themes with fresh phrasing
- **Extends** winning angles into new variations
- **Tests** 1-2 new angles not yet explored
- **Avoids** patterns found in underperformers

### Step 4: Document the Iteration

Track what was learned and what's being tested:

```
## Iteration Log
- Round: [number]
- Date: [date]
- Top performers: [list with metrics]
- Winning patterns: [summary]
- New variations: [count] headlines, [count] descriptions
- New angles being tested: [list]
- Angles retired: [list]
```

---

## Writing Quality Standards

### Headlines That Click

**Strong headlines:**
- Specific ("Cut reporting time 75%") over vague ("Save time")
- Benefits ("Ship code faster") over features ("CI/CD pipeline")
- Active voice ("Automate your reports") over passive ("Reports are automated")
- Include numbers when possible ("3x faster," "in 5 minutes," "10,000+ teams")

**Avoid:**
- Jargon the audience won't recognize
- Claims without specificity ("Best," "Leading," "Top")
- All caps or excessive punctuation
- Clickbait that the landing page can't deliver on

### Descriptions That Convert

Descriptions should complement headlines, not repeat them. Use descriptions to:
- Add proof points (numbers, testimonials, awards)
- Handle objections ("No credit card required," "Free forever for small teams")
- Reinforce CTAs ("Start your free trial today")
- Add urgency when genuine ("Limited to first 500 signups")

---

## Output Formats

### Standard Output

Organize by angle, with character counts:

```
## Angle: [Pain Point — Manual Reporting]

### Headlines (30 char max)
1. "Stop Building Reports by Hand" (29)
2. "Automate Your Weekly Reports" (28)
3. "Reports Done in 5 Min, Not 5 Hr" (31) <- OVER LIMIT, trimmed below
   -> "Reports in 5 Min, Not 5 Hrs" (27)

### Descriptions (90 char max)
1. "Marketing teams save 10+ hours/week with automated reporting. Start free." (73)
2. "Connect your data sources once. Get automated reports forever. No code required." (80)
```

### Bulk CSV Output

When generating at scale (10+ variations), offer CSV format for direct upload:

```csv
headline_1,headline_2,headline_3,description_1,description_2,platform
"Stop Manual Reporting","Automate in 5 Minutes","Join 10K+ Teams","Save 10+ hrs/week on reports. Start free.","Connect data sources once. Reports forever.","google_ads"
```

### Iteration Report

When iterating, include a summary:

```
## Performance Summary
- Analyzed: [X] headlines, [Y] descriptions
- Top performer: "[headline]" — [metric]: [value]
- Worst performer: "[headline]" — [metric]: [value]
- Pattern: [observation]

## New Creative
[organized variations]

## Recommendations
- [What to pause, what to scale, what to test next]
```

---

## Batch Generation Workflow

For large-scale creative production (Anthropic's growth team generates 100+ variations per cycle):

### 1. Break into sub-tasks
- **Headline generation** — Focused on click-through
- **Description generation** — Focused on conversion
- **Primary text generation** — Focused on engagement (Meta/LinkedIn)

### 2. Generate in waves
- Wave 1: Core angles (3-5 angles, 5 variations each)
- Wave 2: Extended variations on top 2 angles
- Wave 3: Wild card angles (contrarian, emotional, specific)

### 3. Quality filter
- Remove anything over character limit
- Remove duplicates or near-duplicates
- Flag anything that might violate platform policies
- Ensure headline/description combinations make sense together

---

## Common Mistakes

- **Writing headlines that only work together** — RSA headlines get combined randomly
- **Ignoring character limits** — Platforms truncate without warning
- **All variations sound the same** — Vary angles, not just word choice
- **No CTA headlines** — RSAs need action-oriented headlines to drive clicks; include at least 2-3
- **Generic descriptions** — "Learn more about our solution" wastes the slot
- **Iterating without data** — Gut feelings are less reliable than metrics
- **Testing too many things at once** — Change one variable per test cycle
- **Retiring creative too early** — Allow 1,000+ impressions before judging

---

## Tool Integrations

For pulling performance data and managing campaigns, see the [tools registry](../../tools/REGISTRY.md).

| Platform | Pull Performance Data | Manage Campaigns | Guide |
|----------|:---------------------:|:----------------:|-------|
| **Google Ads** | `google-ads campaigns list`, `google-ads reports get` | `google-ads campaigns create` | [google-ads.md](../../tools/integrations/google-ads.md) |
| **Meta Ads** | `meta-ads insights get` | `meta-ads campaigns list` | [meta-ads.md](../../tools/integrations/meta-ads.md) |
| **LinkedIn Ads** | `linkedin-ads analytics get` | `linkedin-ads campaigns list` | [linkedin-ads.md](../../tools/integrations/linkedin-ads.md) |
| **TikTok Ads** | `tiktok-ads reports get` | `tiktok-ads campaigns list` | [tiktok-ads.md](../../tools/integrations/tiktok-ads.md) |

### Workflow: Pull Data, Analyze, Generate

```bash
# 1. Pull recent ad performance
node tools/clis/google-ads.js reports get --type ad_performance --date-range last_30_days

# 2. Analyze output (identify top/bottom performers)
# 3. Feed winning patterns into this skill
# 4. Generate new variations
# 5. Upload to platform
```

---

## Related Skills

- **ads**: For campaign strategy, targeting, budgets, and optimization
- **copywriting**: For landing page copy (where ad traffic lands)
- **ab-testing**: For structuring creative tests with statistical rigor
- **marketing-psychology**: For psychological principles behind high-performing creative
- **copy-editing**: For polishing ad copy before launch

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/generative-tools.md

# Generative AI Tools for Ad Creative

Reference for using AI image generators, video generators, and code-based video tools to produce ad visuals at scale.

---

## When to Use Generative Tools

| Need | Tool Category | Best Fit |
|------|---------------|----------|
| Static ad images (banners, social) | Image generation | ChatGPT Images 2.0, Nano Banana Pro, Flux, Ideogram |
| Ad images with text overlays | Image generation (text-capable) | Ideogram, Nano Banana Pro |
| Short video ads (6-30 sec) | Video generation | Veo, Kling, Runway, Sora, Seedance |
| Video ads with voiceover | Video gen + voice | Veo/Sora (native), or Runway + ElevenLabs |
| Voiceover tracks for ads | Voice generation | ElevenLabs, OpenAI TTS, Cartesia |
| Multi-language ad versions | Voice generation | ElevenLabs, PlayHT |
| Brand voice cloning | Voice generation | ElevenLabs, Resemble AI |
| Product mockups and variations | Image generation + references | Flux (multi-image reference) |
| Templated video ads at scale | Code-based video | Remotion |
| Personalized video (name, data) | Code-based video | Remotion |
| Brand-consistent variations | Image gen + style refs | Flux, Ideogram, Nano Banana Pro |

---

## Image Generation

### Nano Banana Pro (Gemini)

Google DeepMind's image generation model, available through the Gemini API.

**Best for:** High-quality ad images, product visuals, text rendering
**API:** Gemini API (Google AI Studio, Vertex AI)
**Pricing:** ~$0.04/image (Gemini 2.5 Flash Image), ~$0.24/4K image (Nano Banana Pro)

**Strengths:**
- Strong text rendering in images (logos, headlines)
- Native image editing (modify existing images with prompts)
- Available through the same Gemini API used for text generation
- Supports both generation and editing in one model

**Ad creative use cases:**
- Generate social media ad images from text descriptions
- Create product mockup variations
- Edit existing ad images (swap backgrounds, change colors)
- Generate images with headline text baked in

**API example:**
```bash
# Using the Gemini API for image generation
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -d '{
    "contents": [{"parts": [{"text": "Create a clean, modern social media ad image for a project management tool. Show a laptop with a kanban board interface. Bright, professional, 16:9 ratio."}]}],
    "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
  }'
```

**Docs:** [Gemini Image Generation](https://ai.google.dev/gemini-api/docs/image-generation)

---

### Flux (Black Forest Labs)

Open-weight image generation models with API access through Replicate and BFL's native API.

**Best for:** Photorealistic images, brand-consistent variations, multi-reference generation
**API:** Replicate, BFL API, fal.ai
**Pricing:** ~$0.01-0.06/image depending on model and resolution

**Model variants:**
| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| Flux 2 Pro | ~6 sec | Highest | $0.015/MP | Final production assets |
| Flux 2 Flex | ~22 sec | High + editing | $0.06/MP | Iterative editing |
| Flux 2 Dev | ~2.5 sec | Good | $0.012/MP | Rapid prototyping |
| Flux 2 Klein | Fastest | Good | Lowest | High-volume batch generation |

**Strengths:**
- Multi-image reference (up to 8 images) for consistent identity across ads
- Product consistency — same product in different contexts
- Style transfer from reference images
- Open-weight Dev model for self-hosting

**Ad creative use cases:**
- Generate 50+ ad variations with consistent product/person identity
- Create product-in-context images (your SaaS on different devices)
- Style-match to existing brand assets using reference images
- Rapid A/B test image variations

**Docs:** [Replicate Flux](https://replicate.com/black-forest-labs/flux-2-pro), [BFL API](https://docs.bfl.ml/)

---

### Ideogram

Specialized in typography and text rendering within images.

**Best for:** Ad banners with text, branded graphics, social ad images with headlines
**API:** Ideogram API, Runware
**Pricing:** ~$0.06/image (API), ~$0.009/image (subscription)

**Strengths:**
- Best-in-class text rendering (~90% accuracy vs ~30% for most tools)
- Style reference system (upload up to 3 reference images)
- 4.3 billion style presets for consistent brand aesthetics
- Strong at logos and branded typography

**Ad creative use cases:**
- Generate ad banners with headline text directly in the image
- Create social media graphics with branded text overlays
- Produce multiple design variations with consistent typography
- Generate promotional materials without needing a designer for each iteration

**Docs:** [Ideogram API](https://developer.ideogram.ai/), [Ideogram](https://ideogram.ai/)

---

### Other Image Tools

| Tool | Best For | API Status | Notes |
|------|----------|------------|-------|
| **DALL-E 3** (OpenAI) | General image generation | Official API | Integrated with ChatGPT, good text rendering |
| **Midjourney** | Artistic, high-aesthetic images | No official public API | Discord-based; unofficial APIs exist but risk bans |
| **Stable Diffusion** | Self-hosted, customizable | Open source | Best for teams with GPU infrastructure |

---

## Video Generation

### Google Veo

Google DeepMind's video generation model, available through the Gemini API and Vertex AI.

**Best for:** High-quality video ads with native audio, vertical video for social
**API:** Gemini API, Vertex AI
**Pricing:** ~$0.15/sec (Veo 3.1 Fast), ~$0.40/sec (Veo 3.1 Standard)

**Capabilities:**
- Up to 60 seconds at 1080p
- Native audio generation (dialogue, sound effects, ambient)
- Vertical 9:16 output for Stories/Reels/Shorts
- Upscale to 4K
- Text-to-video and image-to-video

**Ad creative use cases:**
- Generate short video ads (15-30 sec) from text descriptions
- Create vertical video ads for TikTok, Reels, Shorts
- Produce product demos with voiceover
- Generate multiple video variations from the same prompt with different styles

**Docs:** [Veo on Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/video/overview)

---

### Kling (Kuaishou)

Video generation with simultaneous audio-visual generation and camera controls.

**Best for:** Cinematic video ads, longer-form content, audio-synced video
**API:** Kling API, PiAPI, fal.ai
**Pricing:** ~$0.09/sec (via fal.ai third-party)

**Capabilities:**
- Up to 3 minutes at 1080p/30-48fps
- Simultaneous audio-visual generation (Kling 2.6)
- Text-to-video and image-to-video
- Motion and camera controls

**Ad creative use cases:**
- Longer product explainer videos
- Cinematic brand videos with synchronized audio
- Animate product images into video ads

**Docs:** [Kling AI Developer](https://klingai.com/global/dev/model/video)

---

### Runway

Video generation and editing platform with strong controllability.

**Best for:** Controlled video generation, style-consistent content, editing existing footage
**API:** Runway Developer Portal

**Capabilities:**
- Gen-4: Character/scene consistency across shots
- Motion brush and camera controls
- Image-to-video with reference images
- Video-to-video style transfer

**Ad creative use cases:**
- Generate video ads with consistent characters/products across scenes
- Style-transfer existing footage to match brand aesthetics
- Extend or remix existing video content

**Docs:** [Runway API](https://docs.dev.runwayml.com/)

---

### Sora 2 (OpenAI)

OpenAI's video generation model with synchronized audio.

**Best for:** High-fidelity video with dialogue and sound
**API:** OpenAI API
**Pricing:** Free tier available; Pro from $0.10-0.50/sec depending on resolution

**Capabilities:**
- Up to 60 seconds with synchronized audio
- Dialogue, sound effects, and ambient audio
- sora-2 (fast) and sora-2-pro (quality) variants
- Text-to-video and image-to-video

**Ad creative use cases:**
- Video testimonials and talking-head style ads
- Product demo videos with narration
- Narrative brand videos

**Docs:** [OpenAI Video Generation](https://platform.openai.com/docs/guides/video-generation)

---

### Seedance 2.0 (ByteDance)

ByteDance's video generation model with simultaneous audio-visual generation and multimodal inputs.

**Best for:** Fast, affordable video ads with native audio, multimodal reference inputs
**API:** BytePlus (official), Replicate, WaveSpeedAI, fal.ai (third-party); OpenAI-compatible API format
**Pricing:** ~$0.10-0.80/min depending on resolution (estimated 10-100x cheaper than Sora 2 per clip)

**Capabilities:**
- Up to 20 seconds at up to 2K resolution
- Simultaneous audio-visual generation (Dual-Branch Diffusion Transformer)
- Text-to-video and image-to-video
- Up to 12 reference files for multimodal input
- OpenAI-compatible API structure

**Ad creative use cases:**
- High-volume short video ad production at low cost
- Video ads with synchronized voiceover and sound effects in one pass
- Multi-reference generation (feed product images, brand assets, style references)
- Rapid iteration on video ad concepts

**Docs:** [Seedance](https://seed.bytedance.com/en/seedance2_0)

---

### Higgsfield

Full-stack video creation platform with cinematic camera controls.

**Best for:** Social video ads, cinematic style, mobile-first content
**Platform:** [higgsfield.ai](https://higgsfield.ai/)

**Capabilities:**
- 50+ professional camera movements (zooms, pans, FPV drone shots)
- Image-to-video animation
- Built-in editing, transitions, and keyframing
- All-in-one workflow: image gen, animation, editing

**Ad creative use cases:**
- Social media video ads with cinematic feel
- Animate product images into dynamic video
- Create multiple video variations with different camera styles
- Quick-turn video content for social campaigns

---

### Video Tool Comparison

| Tool | Max Length | Audio | Resolution | API | Best For |
|------|-----------|-------|------------|-----|----------|
| **Veo 3.1** | 60 sec | Native | 1080p/4K | Gemini | Vertical social video |
| **Kling 2.6** | 3 min | Native | 1080p | Third-party | Longer cinematic |
| **Runway Gen-4** | 10 sec | No | 1080p | Official | Controlled, consistent |
| **Sora 2** | 60 sec | Native | 1080p | Official | Dialogue-heavy |
| **Seedance 2.0** | 20 sec | Native | 2K | Official + third-party | Affordable high-volume |
| **Higgsfield** | Varies | Yes | 1080p | Web-based | Social, mobile-first |

---

## Voice & Audio Generation

For layering realistic voiceovers onto video ads, adding narration to product demos, or generating audio for Remotion-rendered videos. These tools turn ad scripts into natural-sounding voice tracks.

### When to Use Voice Tools

Many video generators (Veo, Kling, Sora, Seedance) now include native audio. Use standalone voice tools when you need:

- **Voiceover on silent video** — Runway Gen-4 and Remotion produce silent output
- **Brand voice consistency** — Clone a specific voice for all ads
- **Multi-language versions** — Same ad script in 20+ languages
- **Script iteration** — Re-record voiceover without reshooting video
- **Precise control** — Exact timing, emotion, and pacing

---

### ElevenLabs

The market leader in realistic voice generation and voice cloning.

**Best for:** Most natural-sounding voiceovers, brand voice cloning, multilingual
**API:** REST API with streaming support
**Pricing:** ~$0.12-0.30 per 1,000 characters depending on plan; starts at $5/month

**Capabilities:**
- 29+ languages with natural accent and intonation
- Voice cloning from short audio clips (instant) or longer recordings (professional)
- Emotion and style control
- Streaming for real-time generation
- Voice library with hundreds of pre-built voices

**Ad creative use cases:**
- Generate voiceover tracks for video ads
- Clone your brand spokesperson's voice for all ad variations
- Produce the same ad in 10+ languages from one script
- A/B test different voice styles (authoritative vs. friendly vs. urgent)

**API example:**
```bash
curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Stop wasting hours on manual reporting. Try DataFlow free for 14 days.",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
  }' --output voiceover.mp3
```

**Docs:** [ElevenLabs API](https://elevenlabs.io/docs/api-reference/text-to-speech)

---

### OpenAI TTS

Simple, affordable text-to-speech built into the OpenAI API.

**Best for:** Quick voiceovers, cost-effective at scale, simple integration
**API:** OpenAI API (same SDK as GPT/DALL-E)
**Pricing:** $15/million chars (standard), $30/million chars (HD); ~$0.015/min with gpt-4o-mini-tts

**Capabilities:**
- 13 built-in voices (no custom cloning)
- Multiple languages
- Real-time streaming
- HD quality option
- Simple API — same SDK you already use for GPT

**Ad creative use cases:**
- Fast, cheap voiceover for draft/test ad versions
- High-volume narration at low cost
- Prototype ad audio before investing in premium voice

**Docs:** [OpenAI TTS](https://platform.openai.com/docs/guides/text-to-speech)

---

### Cartesia Sonic

Ultra-low latency voice generation built for real-time applications.

**Best for:** Real-time voice, lowest latency, emotional expressiveness
**API:** REST + WebSocket streaming
**Pricing:** Starts at $5/month; pay-as-you-go from $0.03/min

**Capabilities:**
- 40ms time-to-first-audio (fastest in class)
- 15+ languages
- Nonverbal expressiveness: laughter, breathing, emotional inflections
- Sonic Turbo for even lower latency
- Streaming API for real-time generation

**Ad creative use cases:**
- Real-time ad preview during creative iteration
- Interactive demo videos with dynamic narration
- Ads requiring natural laughter, sighs, or emotional reactions

**Docs:** [Cartesia Sonic](https://docs.cartesia.ai/build-with-cartesia/tts-models/latest)

---

### Voicebox (Open Source)

Free, local-first voice synthesis studio powered by Qwen3-TTS. The open-source alternative to ElevenLabs.

**Best for:** Free voice cloning, local/private generation, zero-cost batch production
**API:** Local REST API at `http://localhost:8000`
**Pricing:** Free (MIT license). Runs entirely on your machine.
**Stack:** Tauri (Rust) + React + FastAPI (Python)

**Capabilities:**
- Voice cloning from short audio samples via Qwen3-TTS
- Multi-language support (English, Chinese, more planned)
- Multi-track timeline editor for composing conversations
- 4-5x faster inference on Apple Silicon via MLX Metal acceleration
- Local REST API for programmatic generation
- No cloud dependency — all processing on-device

**Ad creative use cases:**
- Free voice cloning for brand spokesperson across all ad variations
- Batch generate voiceovers without per-character costs
- Private/local generation when ad content is sensitive or pre-launch
- Prototype voice variations before committing to a paid service

**API example:**
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Stop wasting hours on manual reporting.", "profile_id": "abc123", "language": "en"}'
```

**Install:** Desktop apps for macOS and Windows at [voicebox.sh](https://voicebox.sh), or build from source:
```bash
git clone https://github.com/jamiepine/voicebox.git
cd voicebox && make setup && make dev
```

**Docs:** [GitHub](https://github.com/jamiepine/voicebox)

---

### Other Voice Tools

| Tool | Best For | Differentiator | API |
|------|----------|---------------|-----|
| **PlayHT** | Large voice library, low latency | 900+ voices, <300ms latency, ultra-realistic | [play.ht](https://play.ht/) |
| **Resemble AI** | Enterprise voice cloning | On-premise deployment, real-time speech-to-speech | [resemble.ai](https://www.resemble.ai/) |
| **WellSaid Labs** | Ethical, commercial-safe voices | Voices from compensated actors, safe for commercial use | [wellsaid.io](https://www.wellsaid.io/) |
| **Fish Audio** | Budget-friendly, emotion control | ~50-70% cheaper than ElevenLabs, emotion tags | [fish.audio](https://fish.audio/) |
| **Murf AI** | Non-technical teams | Browser-based studio, 200+ voices | [murf.ai](https://murf.ai/) |
| **Google Cloud TTS** | Google ecosystem, scale | 220+ voices, 40+ languages, enterprise SLAs | [Google TTS](https://cloud.google.com/text-to-speech) |
| **Amazon Polly** | AWS ecosystem, cost | Neural voices, SSML control, cheap at volume | [Amazon Polly](https://aws.amazon.com/polly/) |

---

### Voice Tool Comparison

| Tool | Quality | Cloning | Languages | Latency | Price/1K chars |
|------|---------|---------|-----------|---------|----------------|
| **ElevenLabs** | Best | Yes (instant + pro) | 29+ | ~200ms | $0.12-0.30 |
| **OpenAI TTS** | Good | No | 13+ | ~300ms | $0.015-0.030 |
| **Cartesia Sonic** | Very good | No | 15+ | ~40ms | ~$0.03/min |
| **PlayHT** | Very good | Yes | 140+ | <300ms | ~$0.10-0.20 |
| **Fish Audio** | Good | Yes | 13+ | ~200ms | ~$0.05-0.10 |
| **WellSaid** | Very good | No (actor voices) | English | ~300ms | Custom pricing |
| **Voicebox** | Good | Yes (local) | 2+ | Local | Free (open source) |

### Choosing a Voice Tool

```
Need voiceover for ads?
├── Need to clone a specific brand voice?
│   ├── Best quality → ElevenLabs
│   ├── Enterprise/on-premise → Resemble AI
│   └── Budget-friendly → Fish Audio, PlayHT
├── Need multilingual (same ad, many languages)?
│   ├── Most languages → PlayHT (140+)
│   └── Best quality → ElevenLabs (29+)
├── Need free / open source / local?
│   └── Voicebox (MIT, runs on your machine)
├── Need cheap, fast, good-enough?
│   └── OpenAI TTS ($0.015/min)
├── Need commercially-safe licensing?
│   └── WellSaid Labs (actor-compensated voices)
└── Need real-time/interactive?
    └── Cartesia Sonic (40ms TTFA)
```

### Workflow: Voice + Video

```
1. Write ad script (use ad-creative skill for copy)
2. Generate voiceover with ElevenLabs/OpenAI TTS
3. Generate or render video:
   a. Silent video from Runway/Remotion → layer voice track
   b. Or use Veo/Sora/Seedance with native audio (skip separate VO)
4. Combine with ffmpeg if layering separately:
   ffmpeg -i video.mp4 -i voiceover.mp3 -c:v copy -c:a aac output.mp4
5. Generate variations (different scripts, voices, or languages)
```

---

## Code-Based Video: Remotion

For templated, data-driven video ads at scale, Remotion is the best option. Unlike AI video generators that produce unique video from prompts, Remotion uses React code to render deterministic, brand-perfect video from templates and data.

**Best for:** Templated ad variations, personalized video, brand-consistent production
**Stack:** React + TypeScript
**Pricing:** Free for individuals/small teams; commercial license required for 4+ employees
**Docs:** [remotion.dev](https://www.remotion.dev/)

### Why Remotion for Ads

| AI Video Generators | Remotion |
|---------------------|----------|
| Unique output each time | Deterministic, pixel-perfect |
| Prompt-based, less control | Full code control over every frame |
| Hard to match brand exactly | Exact brand colors, fonts, spacing |
| One-at-a-time generation | Batch render hundreds from data |
| No dynamic data insertion | Personalize with names, prices, stats |

### Ad Creative Use Cases

**1. Dynamic product ads**
Feed a JSON array of products and render a unique video ad for each:
```tsx
// Simplified Remotion component for product ads
export const ProductAd: React.FC<{
  productName: string;
  price: string;
  imageUrl: string;
  tagline: string;
}> = ({productName, price, imageUrl, tagline}) => {
  return (
    <AbsoluteFill style={{backgroundColor: '#fff'}}>
      <Img src={imageUrl} style={{width: 400, height: 400}} />
      <h1>{productName}</h1>
      <p>{tagline}</p>
      <div className="price">{price}</div>
      <div className="cta">Shop Now</div>
    </AbsoluteFill>
  );
};
```

**2. A/B test video variations**
Render the same template with different headlines, CTAs, or color schemes:
```tsx
const variations = [
  {headline: "Save 50% Today", cta: "Get the Deal", theme: "urgent"},
  {headline: "Join 10K+ Teams", cta: "Start Free", theme: "social-proof"},
  {headline: "Built for Speed", cta: "Try It Now", theme: "benefit"},
];
// Render all variations programmatically
```

**3. Personalized outreach videos**
Generate videos addressing prospects by name for cold outreach or sales.

**4. Social ad batch production**
Render the same content across different aspect ratios:
- 1:1 for feed
- 9:16 for Stories/Reels
- 16:9 for YouTube

### Remotion Workflow for Ad Creative

```
1. Design template in React (or use AI to generate the component)
2. Define data schema (products, headlines, CTAs, images)
3. Feed data array into template
4. Batch render all variations
5. Upload to ad platform
```

### Getting Started

```bash
# Create a new Remotion project
npx create-video@latest

# Render a single video
npx remotion render src/index.ts MyComposition out/video.mp4

# Batch render from data
npx remotion render src/index.ts MyComposition --props='{"data": [...]}'
```

---

## Choosing the Right Tool

### Decision Tree

```
Need video ads?
├── Templated, data-driven (same structure, different data)
│   └── Use Remotion
├── Unique creative from prompts (exploratory)
│   ├── Need dialogue/voiceover? → Sora 2, Veo 3.1, Kling 2.6, Seedance 2.0
│   ├── Need consistency across scenes? → Runway Gen-4
│   ├── Need vertical social video? → Veo 3.1 (native 9:16)
│   ├── Need high volume at low cost? → Seedance 2.0
│   └── Need cinematic camera work? → Higgsfield, Kling
└── Both → Use AI gen for hero creative, Remotion for variations

Need image ads?
├── Need text/headlines in image? → Ideogram
├── Need product consistency across variations? → Flux (multi-ref)
├── Need quick iterations on existing images? → Nano Banana Pro
├── Need highest visual quality? → Flux Pro, Midjourney
└── Need high volume at low cost? → Flux Klein, Nano Banana
```

### Cost Comparison for 100 Ad Variations

| Approach | Tool | Approximate Cost |
|----------|------|-----------------|
| 100 static images | Nano Banana Pro | ~$4-24 |
| 100 static images | Flux Dev | ~$1-2 |
| 100 static images | Ideogram API | ~$6 |
| 100 × 15-sec videos | Veo 3.1 Fast | ~$225 |
| 100 × 15-sec videos | Remotion (templated) | ~$0 (self-hosted render) |
| 10 hero videos + 90 templated | Veo + Remotion | ~$22 + render time |

### Recommended Workflow for Scaled Ad Production

1. **Generate hero creative** with AI (Nano Banana, Flux, Veo) — high-quality, exploratory
2. **Build templates** in Remotion based on winning creative patterns
3. **Batch produce variations** with Remotion using data (products, headlines, CTAs)
4. **Iterate** — use AI tools for new angles, Remotion for scale

This hybrid approach gives you the creative exploration of AI generators and the consistency and scale of code-based rendering.

---

## Platform-Specific Image Specs

When generating images for ads, request the correct dimensions:

| Platform | Placement | Aspect Ratio | Recommended Size |
|----------|-----------|-------------|-----------------|
| Meta Feed | Single image | 1:1 | 1080x1080 |
| Meta Stories/Reels | Vertical | 9:16 | 1080x1920 |
| Meta Carousel | Square | 1:1 | 1080x1080 |
| Google Display | Landscape | 1.91:1 | 1200x628 |
| Google Display | Square | 1:1 | 1200x1200 |
| LinkedIn Feed | Landscape | 1.91:1 | 1200x627 |
| LinkedIn Feed | Square | 1:1 | 1200x1200 |
| TikTok Feed | Vertical | 9:16 | 1080x1920 |
| Twitter/X Feed | Landscape | 16:9 | 1200x675 |
| Twitter/X Card | Landscape | 1.91:1 | 800x418 |

Include these dimensions in your generation prompts to avoid needing to crop or resize.

### references/platform-specs.md

# Platform Specs Reference

Complete character limits, format requirements, and best practices for each ad platform.

---

## Google Ads

### Responsive Search Ads (RSAs)

| Element | Character Limit | Required | Notes |
|---------|----------------|----------|-------|
| Headline | 30 chars | 3 minimum, 15 max | Any 3 may be shown together |
| Description | 90 chars | 2 minimum, 4 max | Any 2 may be shown together |
| Display path 1 | 15 chars | Optional | Appears after domain in URL |
| Display path 2 | 15 chars | Optional | Appears after path 1 |
| Final URL | No limit | Required | Landing page URL |

**Combination rules:**
- Google selects up to 3 headlines and 2 descriptions to show
- Headlines appear separated by " | " or stacked
- Any headline can appear in any position unless pinned
- Pinning reduces Google's ability to optimize — use sparingly

**Pinning strategy:**
- Pin your brand name to position 1 if brand guidelines require it
- Pin your strongest CTA to position 2 or 3
- Leave most headlines unpinned for machine learning

**Headline mix recommendation (15 headlines):**
- 3-4 keyword-focused (match search intent)
- 3-4 benefit-focused (what they get)
- 2-3 social proof (numbers, awards, customers)
- 2-3 CTA-focused (action to take)
- 1-2 differentiators (why you over competitors)
- 1 brand name headline

**Description mix recommendation (4 descriptions):**
- 1 benefit + proof point
- 1 feature + outcome
- 1 social proof + CTA
- 1 urgency/offer + CTA (if applicable)

### Performance Max

| Element | Character Limit | Notes |
|---------|----------------|-------|
| Headline | 30 chars (5 required) | Short headlines for various placements |
| Long headline | 90 chars (5 required) | Used in display, video, discover |
| Description | 90 chars (1 required, 5 max) | Accompany various ad formats |
| Business name | 25 chars | Required |

### Display Ads

| Element | Character Limit |
|---------|----------------|
| Headline | 30 chars |
| Long headline | 90 chars |
| Description | 90 chars |
| Business name | 25 chars |

---

## Meta Ads (Facebook & Instagram)

### Single Image / Video / Carousel

| Element | Recommended | Maximum | Notes |
|---------|-------------|---------|-------|
| Primary text | 125 chars | 2,200 chars | Text above image; truncated after ~125 |
| Headline | 40 chars | 255 chars | Below image; truncated after ~40 |
| Description | 30 chars | 255 chars | Below headline; may not show |
| URL display link | 40 chars | N/A | Optional custom display URL |

**Placement-specific notes:**
- **Feed**: All elements show; primary text most visible
- **Stories/Reels**: Primary text overlaid; keep under 72 chars
- **Right column**: Only headline visible; skip description
- **Audience Network**: Varies by publisher

**Best practices:**
- Front-load the hook in primary text (first 125 chars)
- Use line breaks for readability in longer primary text
- Emojis: test, but don't overuse — 1-2 per ad max
- Questions in primary text increase engagement
- Headline should be a clear CTA or value statement

### Lead Ads (Instant Form)

| Element | Limit |
|---------|-------|
| Greeting headline | 60 chars |
| Greeting description | 360 chars |
| Privacy policy text | 200 chars |

---

## LinkedIn Ads

### Single Image Ad

| Element | Recommended | Maximum | Notes |
|---------|-------------|---------|-------|
| Intro text | 150 chars | 600 chars | Above the image; truncated after ~150 |
| Headline | 70 chars | 200 chars | Below the image |
| Description | 100 chars | 300 chars | Only shows on Audience Network |

### Carousel Ad

| Element | Limit |
|---------|-------|
| Intro text | 255 chars |
| Card headline | 45 chars |
| Card count | 2-10 cards |

### Message Ad (InMail)

| Element | Limit |
|---------|-------|
| Subject line | 60 chars |
| Message body | 1,500 chars |
| CTA button | 20 chars |

### Text Ad

| Element | Limit |
|---------|-------|
| Headline | 25 chars |
| Description | 75 chars |

**LinkedIn-specific guidelines:**
- Professional tone, but not boring
- Use job-specific language the audience recognizes
- Statistics and data points perform well
- Avoid consumer-style hype ("Amazing!" "Incredible!")
- First-person testimonials from peers resonate

---

## TikTok Ads

### In-Feed Ads

| Element | Recommended | Maximum | Notes |
|---------|-------------|---------|-------|
| Ad text | 80 chars | 100 chars | Above the video |
| Display name | N/A | 40 chars | Brand name |
| CTA button | Platform options | Predefined | Select from TikTok's options |

### Spark Ads (Boosted Organic)

| Element | Notes |
|---------|-------|
| Caption | Uses original post caption |
| CTA button | Added by advertiser |
| Display name | Original creator's handle |

**TikTok-specific guidelines:**
- Native content outperforms polished ads
- First 2 seconds determine if they watch
- Use trending sounds and formats
- Text overlay is essential (most watch with sound off)
- Vertical video only (9:16)

---

## Twitter/X Ads

### Promoted Tweets

| Element | Limit | Notes |
|---------|-------|-------|
| Tweet text | 280 chars | Full tweet with image/video |
| Card headline | 70 chars | Website card |
| Card description | 200 chars | Website card |

### Website Cards

| Element | Limit |
|---------|-------|
| Headline | 70 chars |
| Description | 200 chars |

**Twitter/X-specific guidelines:**
- Conversational, casual tone
- Short sentences work best
- One clear message per tweet
- Hashtags: 1-2 max (0 is often better for ads)
- Threads can work for consideration-stage content

---

## Character Counting Tips

- **Spaces count** as characters on all platforms
- **Emojis** count as 1-2 characters depending on platform
- **Special characters** (|, &, etc.) count as 1 character
- **URLs** in body text count against limits
- **Dynamic keyword insertion** (`{KeyWord:default}`) can exceed limits — set safe defaults
- Always verify in the platform's ad preview before launching

---

## Multi-Platform Creative Adaptation

When creating for multiple platforms simultaneously, start with the most restrictive format:

1. **Google Search headlines** (30 chars) — forces the tightest messaging
2. **Expand to Meta headlines** (40 chars) — add a word or two
3. **Expand to LinkedIn intro text** (150 chars) — add context and proof
4. **Expand to Meta primary text** (125+ chars) — full hook and value prop

This cascading approach ensures your core message works everywhere, then gets enriched for platforms that allow more space.

