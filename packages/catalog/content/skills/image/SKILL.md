---
name: image
description: "When the user wants to create, generate, edit, or optimize images for marketing — blog heroes, social graphics, product mockups, profile banners, listing visuals, or brand assets. Also use when the user mentions 'AI image generation,' 'generate an image,' 'create a graphic,' 'product mockup,' 'hero image,' 'social media graphic,' 'banner image,' 'cover photo,' 'profile banner,' 'listing screenshot,' 'Flux,' 'Flux Kontext,' 'Midjourney,' 'DALL-E,' 'GPT Image,' 'ChatGPT Images,' 'Ideogram,' 'Gemini image,' 'Nano Banana,' 'Recraft,' 'Stable Diffusion,' 'Canva,' 'Figma,' 'image optimization,' 'compress images,' 'WebP,' or 'OG image.' Use this for general-purpose marketing image creation and optimization. For paid ad image creative and platform-specific ad specs, see ad-creative. For video production, see video."
category: Marketing
author: community
version: "2.0.1"
icon: megaphone
---

# Image

You are an expert visual content producer who helps create marketing images using AI generation models, design tools, and optimization best practices. Your goal is to help users produce professional visual assets efficiently — from blog heroes and social graphics to product mockups and profile banners.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

### 1. Image Goal
- What type of image? (Blog hero, social graphic, product mockup, banner, brand asset, OG image)
- What platform or placement? (Website, social, directory listing, app store, email)
- What dimensions do you need?

### 2. Production Approach
- Do you have existing brand assets? (Logo, colors, fonts, style guide)
- Do you need photorealistic or illustrative style?
- Is this a one-off or a template for repeated use?

### 3. Technical Context
- Do you have API keys for any image tools? (Gemini, Replicate/Flux, Ideogram)
- Budget constraints? (Some tools charge per image)
- Do you need the image optimized for web performance?

---

## Choosing Your Approach

Pick the right tool for the job:

| Approach | Best For | Tools | When to Use |
|----------|----------|-------|-------------|
| **AI Generation** | Original images from text prompts | Gemini/Nano Banana, Flux, Ideogram | Blog heroes, social graphics, lifestyle scenes |
| **AI Editing** | Modify existing images | Gemini, Flux Flex | Background removal, style changes, variations |
| **Design Tools** | Templated, brand-consistent assets | Canva, Figma | Profile banners, social templates, presentations |
| **Screenshot + Overlay** | Product UI showcases | Browser screenshot + code overlay | Product mockups, feature announcements |
| **Stock Photography** | Generic business/lifestyle scenes | Unsplash, Pexels | When speed matters more than uniqueness |

---

## AI Image Generation

Generate original images from text prompts. The fastest way to create unique marketing visuals.

### Model Comparison

| Model | Best For | Text in Images | API | Cost |
|-------|----------|:-:|-----|------|
| **Gemini Image** (Google, "Nano Banana" / Nano Banana Pro) | All-around, editing, multi-image reference, text rendering | Good | [Gemini API](https://ai.google.dev/gemini-api/docs/image-generation) | Check [pricing](https://ai.google.dev/gemini-api/docs/pricing) |
| **Flux** (Black Forest Labs — Pro 1.1, Kontext, Dev, Schnell) | Photorealism, brand consistency, batch; Kontext for in-image editing | Limited | [BFL API](https://docs.bfl.ai/), Replicate, fal.ai | Check [pricing](https://docs.bfl.ai/quick_start/pricing) |
| **Ideogram 3.0** | Typography, branded graphics, accurate text rendering | Best | [Ideogram API](https://developer.ideogram.ai/) | Check [pricing](https://about.ideogram.ai/api-pricing) |
| **ChatGPT Images 2.0 / GPT Image** (OpenAI) | General purpose, ChatGPT integration, native editing | Good | [OpenAI API](https://platform.openai.com/docs/guides/image-generation) | Check [pricing](https://platform.openai.com/docs/pricing) |
| **Midjourney v7** | Artistic, high-aesthetic, art-directed visuals | Improved | No official API; Discord + Web | Subscription-based |
| **Recraft V3** | Vector + brand-consistent illustrations, design assets | Strong | [Recraft API](https://www.recraft.ai/docs) | Per-credit |
| **Stable Diffusion 3.5 / SDXL** | Self-hosted, customizable, fine-tunable | Varies | Open source | Free (GPU costs) |

**Note:** DALL-E 3 is fully deprecated. OpenAI's current image models are the GPT Image / ChatGPT Images family (`gpt-image-1` and later).

### When to Use Which

```
Need text/headlines in the image?
├── Yes → Ideogram 3.0 (best), Gemini (good), GPT Image / ChatGPT Images (decent)
└── No ↓

Need product/brand consistency across many images?
├── Yes → Flux (multi-image reference), Gemini Nano Banana Pro, Recraft V3
└── No ↓

Need to edit an existing image (in-place)?
├── Yes → Gemini (native editing), Flux Kontext, ChatGPT Images
└── No ↓

Need vector / illustrative brand assets?
├── Yes → Recraft V3 (best for vector + brand consistency), Midjourney (artistic)
└── No ↓

Need highest visual quality / art direction?
├── Yes → Flux Pro 1.1, Midjourney v7
└── No ↓

Need volume at low cost?
└── Flux Schnell, Gemini Flash, Stable Diffusion (self-hosted)
```

### Prompting Basics

A strong image prompt follows: **Subject + Setting + Style + Lighting + Composition + Technical**

```
A laptop on a minimal white desk showing a dashboard UI,
soft directional lighting from the left, shallow depth of field,
clean commercial photography style, 16:9 aspect ratio, 4K
```

**Common mistakes:**
- Too vague ("a business image") — add specific details
- Forgetting aspect ratio — always specify dimensions
- Requesting complex text — use overlays instead for anything beyond short headlines
- No style direction — "photorealistic," "flat illustration," "3D render"

For detailed prompting guides per model, see [references/ai-image-prompting.md](references/ai-image-prompting.md).

---

## Design Tools

For templated, brand-consistent work where AI generation is overkill or too unpredictable.

### Canva

Best for non-designers who need polished output fast.

- **Strengths:** Massive template library, brand kit, Magic Resize (one design → all sizes), team collaboration
- **Best for:** Social graphics, presentations, email headers, simple banners
- **Limitations:** Less control than Figma, templates can look generic
- **Agent-friendliness:** Has an API but limited — better as a human-in-the-loop tool

### Figma

Best for teams with design systems or pixel-perfect needs.

- **Strengths:** Design system components, auto layout, developer handoff, plugins
- **Best for:** OG images via templates, design system assets, complex layouts
- **Limitations:** Steeper learning curve, requires design skill
- **Agent-friendliness:** Has an API and MCP server for reading designs

### When to Use Design Tools vs. AI Generation

| Scenario | Design Tool | AI Generation |
|----------|:-:|:-:|
| Exact brand guidelines must be followed | Yes | Maybe (with strong ref images) |
| Need 20 size variants of one design | Yes (Canva Magic Resize) | No |
| Unique hero image for a blog post | No | Yes |
| Recurring social media template | Yes | No |
| Product mockup with real UI | No (use screenshots) | No (hallucinated UI) |
| Abstract/creative visual | No | Yes |

---

## Marketing Image Workflows

### Blog & Article Hero Images

The image at the top of every post. Sets tone, improves shareability, required for OG/social previews.

1. **Define the concept** — what visual metaphor represents the topic?
2. **Generate with AI** — use Flux or Gemini for photorealistic, Ideogram if text needed
3. **Specify 1200x630** (works for both hero and OG image) or **1920x1080** for full-width
4. **Optimize** — compress to <200KB, serve as WebP with JPEG fallback

**Prompt pattern:**
```
[Visual metaphor for topic], clean modern style,
bright natural lighting, shallow depth of field,
professional blog header aesthetic, 1200x630
```

### Social Media Graphics

Platform-specific images for organic posts.

| Platform | Primary Size | Aspect Ratio | Notes |
|----------|-------------|:---:|-------|
| Twitter/X | 1200x675 | 16:9 | Large image card |
| LinkedIn | 1200x627 | 1.91:1 | Feed image |
| Instagram Feed | 1080x1080 | 1:1 | Square; 1080x1350 (4:5) also strong |
| Instagram Stories | 1080x1920 | 9:16 | Full screen vertical |
| Facebook | 1200x630 | 1.91:1 | Link share image |

**Workflow:**
1. Create the hero concept at highest resolution needed
2. Use Canva Magic Resize or manual crop for platform variants
3. Add text overlays programmatically (Ideogram or post-processing) if needed
4. Export at platform-specific dimensions

### Product Mockups & Screenshots

Showcase your product UI in context. AI models hallucinate UI — don't use them for this.

1. **Capture real screenshots** of your product at 2x resolution
2. **Frame in device mockups** — use browser frame, laptop, or phone templates
3. **Add context** — callout arrows, feature labels, before/after comparisons
4. **Annotate with code** — Hyperframes or HTML/CSS for programmatic overlays

**Tools:** Browser DevTools (screenshot), Shottr (Mac), CleanShot X, or `screencapture` CLI.

### Profile & Listing Banners

Banners for profiles, directory listings, and marketplace pages. Often the first visual impression.

| Platform | Size | Notes |
|----------|------|-------|
| LinkedIn personal cover | 1584x396 | 4:1, safe zone center |
| LinkedIn company cover | 1128x191 | 5.9:1; LinkedIn recommends up to 4200x700 |
| Twitter/X header | 1500x500 | 3:1, partially obscured by avatar |
| Product Hunt gallery | 1270x760 | 5:3, up to 6 images |
| G2 profile | 1280x720 | 16:9, product screenshots preferred |
| GitHub social preview | 1280x640 | 2:1, shows in link cards |
| App Store screenshots | Varies by device | See aso skill for full specs |
| Google Play feature graphic | 1024x500 | ~2:1, required for store listing |

**Best practices:**
- **Keep text minimal** — banners are seen at small sizes on mobile
- **Center critical content** — edges get cropped differently per device
- **Show the product** — real UI screenshots outperform abstract graphics on directory listings
- **Match your brand** — use consistent colors, fonts, logo placement
- **Update seasonally** — stale banners signal an inactive product

**Workflow:**
1. Pick the platform(s) and note exact dimensions
2. For directories (Product Hunt, G2): use real product screenshots with light annotation
3. For profiles (LinkedIn, Twitter): use brand colors + tagline + optional product shot
4. Generate with Canva/Figma templates or Ideogram (if text-heavy)
5. Test at actual display size — zoom out to check readability

### Brand Assets

Logos, icons, and illustrations. AI generation has limits here.

| Asset | AI Generation | Design Tool | Notes |
|-------|:-:|:-:|-------|
| Logo | Poor — inconsistent, not vector | Yes (Figma) | Always design or commission logos |
| App icon | Decent starting point | Yes (Figma) | Generate concepts, refine manually |
| Illustrations | Good for style exploration | Depends | AI for concepts, finalize in design tool |
| Favicons | No | Yes | Derive from logo |
| Social icons | No | Yes | Use platform-provided assets |

---

## Image Optimization

Every image on your site affects page speed, which affects SEO and conversions.

### Format Guide

| Format | Best For | Compression | Browser Support |
|--------|----------|-------------|:---:|
| **WebP** | Photos, graphics — default choice | Lossy + lossless | ~96% |
| **AVIF** | Highest compression, newest | Better than WebP | ~94% |
| **JPEG** | Fallback for older browsers | Lossy only | Universal |
| **PNG** | Transparency, screenshots | Lossless | Universal |
| **SVG** | Logos, icons, illustrations | Vector (scales) | Universal |

### Optimization Checklist

- [ ] **Serve WebP** with JPEG/PNG fallback (`<picture>` element or CDN auto-format)
- [ ] **Resize to display size** — don't serve 4000px images in 800px containers
- [ ] **Compress** — target quality 75-85% for photos, near-lossless for screenshots
- [ ] **Lazy load** below-the-fold images (`loading="lazy"`)
- [ ] **Set explicit dimensions** — `width` and `height` attributes prevent layout shift (CLS)
- [ ] **Use a CDN** with auto-optimization (Cloudflare, Vercel, Imgix, Cloudinary)
- [ ] **Add alt text** — descriptive, keyword-relevant, not stuffed

### Quick Optimization Commands

```bash
# Convert to WebP (using cwebp)
cwebp -q 80 input.png -o output.webp

# Batch convert with ImageMagick
mogrify -format webp -quality 80 *.png

# Optimize JPEG (using jpegoptim)
jpegoptim --max=80 --strip-all *.jpg

# Check image sizes on a page
curl -s https://yoursite.com | grep -oP 'src="[^"]+\.(jpg|png|webp)"' | head -20
```

---

## OG & Social Preview Images

The image that appears when your URL is shared on social media, Slack, Discord, etc.

### Required Meta Tags

```html
<meta property="og:image" content="https://yoursite.com/og/page-name.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://yoursite.com/og/page-name.jpg" />
```

### Dynamic OG Images

Generate OG images programmatically for pages with dynamic content (blog posts, user profiles):

- **Vercel OG** (`@vercel/og`) — generates images at the edge using JSX
- **Satori** — converts HTML/CSS to SVG (powers Vercel OG)
- **Cloudinary** — URL-based text overlay on template images

**Best for programmatic SEO:** Generate unique OG images per page using templates + dynamic data.

---

## Common Mistakes

1. **Using AI for product UI screenshots** — models hallucinate interfaces; capture real screenshots
2. **Skipping image optimization** — unoptimized images are the #1 page speed killer
3. **No OG image** — shared links look broken without a preview image
4. **Wrong aspect ratio** — always check platform specs before generating
5. **Text-heavy images without Ideogram** — most AI models butcher text; use Ideogram or add text in post
6. **Generating without style direction** — "photorealistic," "flat illustration," "3D render" drastically changes output
7. **Inconsistent brand visuals** — use Flux multi-reference or design templates for consistency
8. **Huge images on landing pages** — compress, resize, lazy load

---

## Task-Specific Questions

1. What type of image do you need? (Blog hero, social graphic, mockup, banner, brand asset)
2. What platform or placement? (This determines dimensions)
3. Do you have brand assets to match? (Colors, fonts, logo, style guide)
4. Is this a one-off or a repeatable template?
5. Do you have API keys for any image generation tools?
6. Does this need to be optimized for web performance?

---

## Related Skills

- **ad-creative**: For paid ad image creative, platform-specific ad specs, and scaled ad production
- **video**: For AI video production and programmatic video
- **social**: For what to post and content strategy
- **cro**: For image placement and conversion optimization on landing pages
- **seo-audit**: For image SEO (alt text, file names, lazy loading)
- **aso**: For app store screenshot specs and optimization
- **directory-submissions**: For Product Hunt gallery images and directory listing visuals

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/ai-image-prompting.md

# AI Image Prompting Guide

How to write effective prompts for AI image generation models (Gemini/Nano Banana, Flux, Ideogram, DALL-E, Midjourney).

---

## Prompt Structure

A strong image prompt follows this formula:

```
[Subject] + [Setting/context] + [Visual style] + [Lighting] + [Composition] + [Technical specs]
```

### Example Prompts by Use Case

**Blog hero — SaaS product:**
```
A clean workspace with a laptop displaying a colorful analytics dashboard,
minimalist desk with a coffee cup and notebook,
bright natural window lighting from the right,
shallow depth of field, commercial photography style,
1200x630, high resolution
```

**Social media graphic — announcement:**
```
Abstract flowing gradient in deep purple and electric blue,
geometric shapes forming a network pattern,
dramatic rim lighting on edges,
modern tech aesthetic, clean and minimal,
1080x1080, vibrant colors
```

**Product lifestyle shot:**
```
A person in a modern office smiling while looking at a tablet,
showing a project management interface on screen,
warm candid photography, natural lighting,
medium shot, shallow depth of field, editorial style
```

**Profile banner — professional:**
```
Wide panoramic abstract background in navy blue and teal,
subtle geometric grid pattern with soft gradient,
clean corporate aesthetic, muted lighting,
1584x396, no text, space for logo overlay on left third
```

**Directory listing — Product Hunt:**
```
Product screenshot on a clean gradient background,
soft shadow underneath, slight 3D perspective tilt,
modern SaaS product presentation style,
1270x760, bright and professional
```

---

## Style Keywords

### Photorealistic
- "commercial photography"
- "shot on Canon EOS R5"
- "editorial style"
- "natural lighting"
- "shallow depth of field"

### Clean/Corporate
- "clean modern aesthetic"
- "minimal design"
- "professional corporate style"
- "bright and airy"
- "white background"

### Illustrative
- "flat vector illustration"
- "isometric 3D render"
- "hand-drawn sketch style"
- "watercolor illustration"
- "line art"

### Abstract/Brand
- "flowing gradient"
- "geometric pattern"
- "abstract data visualization"
- "particle effects"
- "holographic iridescent"

### Tech/SaaS
- "dark mode UI aesthetic"
- "neon accent lighting"
- "glassmorphism"
- "futuristic minimal"
- "developer-focused"

---

## Lighting Keywords

| Term | Effect | Best For |
|------|--------|----------|
| **Natural light** | Warm, organic feel | Lifestyle, editorial |
| **Studio lighting** | Even, controlled | Product shots |
| **Rim lighting** | Edge highlights, dramatic | Hero images, abstract |
| **Soft directional** | Gentle shadows, dimensional | Blog headers |
| **Volumetric** | Light rays, atmospheric | Dramatic, cinematic |
| **Flat/even** | No shadows, clean | Icons, diagrams |
| **Golden hour** | Warm orange tones | Lifestyle, outdoor |
| **High key** | Bright, minimal shadows | Clean, corporate |

---

## Composition Keywords

| Term | Effect | Best For |
|------|--------|----------|
| **Rule of thirds** | Subject off-center | Editorial, lifestyle |
| **Centered** | Subject in middle | Product shots, icons |
| **Wide/panoramic** | Expansive view | Banners, headers |
| **Close-up/macro** | Detail focus | Texture, product detail |
| **Bird's eye/overhead** | Top-down view | Desk setups, flat lays |
| **Negative space** | Room for text overlay | Blog headers, banners |
| **Symmetrical** | Balanced, formal | Corporate, luxury |

---

## Model-Specific Tips

### Gemini Image (Google)

- Best all-around for marketing images — good quality, reasonable cost
- Supports **image editing** — upload an existing image and describe changes
- Decent text rendering — can handle short headlines
- Specify "high resolution" for best output
- Works well with detailed, descriptive prompts
- Same API as text generation — easy to integrate

### Flux (Black Forest Labs)

- **Multi-image reference** is the killer feature — upload product screenshots, brand assets, or style references
- Best for **brand consistency** across a set of images
- Use Flux Pro for final assets, Flux Dev for rapid iteration
- Flux Klein for high-volume batch generation (cheapest)
- Style transfer via reference images > style keywords in prompt
- Prompts can be shorter than other models — the references do heavy lifting

### Ideogram

- **Best text rendering** of any model (industry-leading accuracy)
- Use when you need headlines, taglines, or brand names in the image
- Style reference system (up to 3 images) for brand consistency
- Supports "Magic Prompt" auto-enhancement
- Keep text requests simple — 3-5 words max for reliability
- Best for social graphics and banners that need text baked in

### GPT Image (OpenAI)

- Current models: `gpt-image-1` and variants (DALL-E 3 is deprecated)
- Integrated with ChatGPT — conversational image generation
- Good at following detailed prompts
- Decent text rendering (behind Ideogram, comparable to Gemini)
- Automatic prompt rewriting — may deviate from exact request
- Best for quick one-offs through ChatGPT interface
- API gives more control than ChatGPT interface

### Midjourney

- Highest aesthetic quality for artistic/editorial images
- No official API — Discord-based or web interface
- **Not agent-friendly** — use for manual creative exploration only
- Style flags: `--style raw` for less stylized, `--ar 16:9` for aspect ratio
- Best for hero images where pure visual quality matters most
- V6+ has improved text rendering but still unreliable

---

## Common Prompt Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|-----|
| "A professional image" | No visual detail | Describe subject, setting, style, lighting |
| Long paragraph of text in image | Models can't render paragraphs | 3-5 words max; add text in post |
| "Make it look good" | Not actionable | Specify style: "commercial photography, bright" |
| 200+ word prompts | Models lose focus | 40-80 words, specific over comprehensive |
| No aspect ratio | Random output size | Always specify dimensions or ratio |
| "Logo in bottom right" | Unreliable placement | Add logos in post-processing |
| "Make it viral" | Not a visual instruction | Describe the aesthetic you want |
| Requesting UI screenshots | AI hallucinates interfaces | Capture real screenshots instead |

---

## Batch Generation Workflow

When you need multiple images with consistent style (e.g., a blog series or social campaign):

1. **Generate 3-4 test images** with different style prompts
2. **Pick the winning style** based on brand fit
3. **Save the exact prompt** as your template
4. **Use Flux multi-reference** — upload the winning image as a style reference
5. **Batch generate** variations with the same style, different subjects
6. **Post-process** — add text overlays, logos, crop to platform sizes

---

## Aspect Ratios Quick Reference

| Use Case | Ratio | Pixels | Notes |
|----------|-------|--------|-------|
| Blog hero / OG image | 1.91:1 | 1200x630 | Universal web standard |
| Full-width hero | 16:9 | 1920x1080 | Website headers |
| Instagram Feed | 1:1 | 1080x1080 | Square |
| Instagram Feed (tall) | 4:5 | 1080x1350 | More screen real estate |
| Stories / Reels | 9:16 | 1080x1920 | Vertical full screen |
| LinkedIn cover | 4:1 | 1584x396 | Personal profile |
| Twitter/X header | 3:1 | 1500x500 | Profile banner |
| Product Hunt gallery | 5:3 | 1270x760 | Launch page |
| GitHub social preview | 2:1 | 1280x640 | Repo link card |

---

## Cost Optimization

- **Iterate at low quality first** — use Flux Dev or Gemini Flash for drafts, upgrade for finals
- **Use references over long prompts** — Flux multi-reference produces more consistent results with fewer retries
- **Batch similar requests** — generate all blog headers in one session with the same style
- **Cache and reuse** — abstract backgrounds, patterns, and textures can be reused across multiple images
- **Post-process instead of re-generate** — crop, overlay text, and adjust color in code rather than generating new images

