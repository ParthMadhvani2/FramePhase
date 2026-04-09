# FramePhase — Product Strategy

*Last updated: April 2026*

---

## Competitive Landscape

### Direct Competitors & Their Pricing

| Tool | Free Tier | Starter | Pro | Key Weakness |
|------|-----------|---------|-----|-------------|
| **VEED** | 30 min/mo subtitles | $12/mo (12hr/mo) | $24/mo | Bloated editor, slow, expensive for what it does |
| **Kapwing** | 10 min subtitles, watermark | $16/mo | $50/mo | General-purpose — captions are a side feature |
| **Zubtitle** | 2 videos/mo, 720p, watermark | $19/mo (10 videos) | $49/mo (30 videos) | Outdated UI, limited customization |
| **Submagic** | None | $12/mo (15 videos, 2min max) | $23/mo (40 videos, 5min max) | Short-form only, hard 2-5min limits |
| **Captions AI** | Limited | ~$10/mo | ~$30/mo | iOS-first, buggy desktop, audio sync issues, poor support |
| **FramePhase** | 1 video/mo | $9/mo (15 videos) | $29/mo (50 videos) | New entrant, needs brand trust |

### Where Competitors Fail (Our Opportunity)

1. **Privacy concerns** — Every competitor uploads video to their servers for processing. FramePhase burns captions client-side via WebAssembly. This is a genuine differentiator for corporate, healthcare, legal, and education users.

2. **Captions AI complaints** — The market leader has persistent issues: audio sync problems after export, failed exports, slow loading, and unresponsive support. Their mobile-first approach leaves desktop users underserved.

3. **Submagic's hard limits** — 2-minute and 5-minute video length caps make it useless for anything beyond short-form social clips. FramePhase has no artificial length restrictions.

4. **VEED/Kapwing bloat** — These are general video editors where captions are one of 50 features. They're expensive, slow, and overwhelming for someone who just wants captions.

5. **Zubtitle's stale UI** — Hasn't had a meaningful design refresh in years. The interface feels dated compared to modern tools.

---

## FramePhase's Unique Position

### Core Differentiators

- **Client-side rendering**: Captions are burned in the browser. The processed video never touches a server. This is a real, meaningful privacy story.
- **Simplicity**: Three steps — upload, edit, download. No learning curve.
- **Competitive pricing**: $9/mo undercuts Zubtitle ($19), Kapwing ($16), and VEED ($12) while offering more videos.
- **Open source**: Trust through transparency. Enterprises can audit the code.

### Target Niche (Priority Order)

1. **Solo content creators** (YouTube, TikTok, Instagram) — Need fast, affordable captions at volume. Price-sensitive, evaluate tools weekly.
2. **Small marketing teams** (2-10 people) — Need branded captions for client videos. Value simplicity over feature bloat.
3. **Privacy-conscious organizations** — Legal, healthcare, education, government. Cannot upload sensitive video to third-party servers. Client-side processing is a compliance feature.
4. **Non-English creators** — AWS Transcribe supports 100+ languages. Multi-language creators need reliable auto-detection.

---

## Pricing Validation

### Current Pricing

| Plan | Price | Videos | Assessment |
|------|-------|--------|-----------|
| Free | $0 | 1/mo | Too restrictive. Increase to 3/mo to reduce friction and boost conversion |
| Starter | $9/mo | 15/mo | Well-positioned. Undercuts all competitors at this tier |
| Pro | $29/mo | 50/mo | Competitive. Feature set (4K, priority) justifies premium |
| Business | $79/mo | 200/mo | Reasonable for teams. Consider per-seat pricing for flexibility |

### Recommendations

- **Increase free tier to 3 videos/month**: 1 video doesn't give users enough time to build a habit. 3 lets them test it across a few projects and feel the value before hitting the wall.
- **Add annual pricing discount**: Already implemented (20% off). Good.
- **Consider a $5/mo "Lite" plan**: Bridge between free and Starter for hobbyist creators who make 5-8 videos/month. This captures users who churn from free but find $9 too much for casual use.

---

## Feature Roadmap

### Phase 1 — Ship Quality (Next 2 Weeks)

These are table-stakes features that close the gap with competitors:

- **Batch processing**: Upload multiple videos and queue them for transcription. Every competitor supports this.
- **SRT/VTT download on free tier**: Let free users export subtitle files (not burned-in video). This builds goodwill and drives word-of-mouth. Gate the burned-in video export instead.
- **Caption font selector**: Let users pick from 5-8 premium fonts beyond Poppins. Competitors offer 10+.
- **Video trimming**: Basic start/end trimming before captioning. Saves users a trip to another tool.
- **Auto-delete old videos**: S3 lifecycle policy to delete videos after 30 days. Reduces storage costs and is good privacy practice.

### Phase 2 — Differentiation (Weeks 3-6)

Features that pull ahead of competitors:

- **Word-level highlight captions**: Animated captions that highlight each word as it's spoken (like Submagic/CapCut). This is the #1 requested caption style for short-form content.
- **Caption templates/themes**: Pre-built animated caption styles (podcast style, news ticker, karaoke, etc.). Save custom styles as templates.
- **Multi-language support UI**: Language selector with auto-detect default. Show supported languages prominently — many competitors hide this.
- **Keyboard shortcuts**: j/k/l for video scrubbing, arrow keys for word navigation in editor, Enter to split/merge segments. Power users will love this.
- **Embed/share link**: Generate a shareable link to the captioned video (stored for 7 days). Useful for review/approval workflows.

### Phase 3 — Moat Building (Months 2-3)

Features that create switching costs and long-term value:

- **API access** (Business plan): REST API for programmatic video captioning. Agencies and platforms can integrate FramePhase into their workflows.
- **Brand kit**: Save brand colors, fonts, logo watermark position as a reusable preset. Teams apply consistent branding across all videos.
- **Translation**: One-click translate captions to another language. Use the existing transcription + a translation API. Massive value for global creators.
- **Chrome extension**: Right-click any video on the web → "Caption with FramePhase". Reduces friction to zero.
- **Zapier/Make integration**: Trigger captioning when a video is uploaded to Google Drive, Dropbox, or a CMS.

### Phase 4 — Platform Play (Months 3-6)

- **Direct publish**: Connect YouTube/TikTok/Instagram accounts and publish captioned videos directly.
- **Team workspaces**: Shared video library, role-based access, approval workflows.
- **Analytics**: Track which videos were captioned, processing time, language distribution. Useful data for teams.
- **White-label**: Let agencies reskin FramePhase for their clients (Enterprise tier).

---

## Go-To-Market Strategy

### Launch Channels

1. **Product Hunt**: Target a Tuesday launch. Emphasize the "privacy-first" and "runs in your browser" angles. These are unique and memorable.
2. **Reddit**: Post in r/content_creation, r/youtube, r/videography, r/SideProject. Be authentic — show the before/after, explain the architecture.
3. **Twitter/X**: Build in public. Share dev updates, architecture decisions, user feedback. Tag YC founders who care about developer tools.
4. **YouTube SEO**: Create "How to add captions to video for free" tutorials. This is a high-intent search query with decent volume.

### Positioning Statement

> "FramePhase is the fastest way to add captions to any video. AI transcribes, you edit, and captions are burned in — all in your browser. Your video never leaves your device."

### Key Messaging Angles

- **For creators**: "Caption any video in 60 seconds. No learning curve."
- **For privacy-conscious orgs**: "The only captioning tool where your video never leaves your device."
- **For budget-conscious teams**: "Professional captions at half the price of VEED or Kapwing."
- **For developers**: "Open source. Self-host if you want. We have nothing to hide."

---

## Investor Lens (YC-Style Questions)

**What's the market?** Video captioning and subtitling tools — estimated $5B+ market growing 15-20% annually driven by accessibility regulations, social media growth, and global content creation.

**Why now?** Browser-based WASM processing is finally fast enough for real-time video manipulation. AWS Transcribe accuracy has hit 95-99%. Accessibility laws (ADA, EAA) are creating mandatory demand.

**What's the unfair advantage?** Client-side processing means zero GPU/server costs for the most expensive part of the pipeline (video rendering). Competitors pay for cloud rendering at scale — FramePhase doesn't.

**What's the 10x improvement?** Privacy. Every other tool requires uploading your full video to their servers. FramePhase only sends audio for transcription — the video processing happens locally. For regulated industries, this isn't a nice-to-have, it's a requirement.

**Unit economics?** Near-zero marginal cost per user for video processing (runs on their hardware). Main costs are AWS Transcribe (~$0.024/min audio) and S3 storage (temporary). A $9/mo user processing 15 videos of ~3 min average = ~$1.08 in AWS costs = 88% gross margin.

---

## Metrics to Track

- **Activation rate**: % of signups who complete their first video
- **Time to first caption**: Minutes from signup to first captioned video downloaded
- **Conversion rate**: Free → Paid within 30 days
- **Monthly video volume**: Videos processed per active user
- **Churn rate**: Monthly cancellation rate by plan
- **NPS**: Net Promoter Score from in-app survey after 5th video

---

## Immediate Action Items

1. Increase free tier from 1 to 3 videos/month
2. Add word-level highlight captions (biggest competitive feature gap)
3. Launch on Product Hunt with privacy-first positioning
4. Create 3 YouTube SEO tutorials targeting "add captions to video"
5. Set up basic analytics (Plausible or PostHog — privacy-friendly)
6. Add S3 lifecycle policy for auto-deletion after 30 days
7. Build a simple landing page A/B test for conversion optimization
