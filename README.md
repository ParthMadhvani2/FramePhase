# FramePhase

AI-powered video caption generator that runs in your browser. Upload a video, get an AI transcription, edit the text, pick a style, and download with captions burned in — no server-side video processing.

**Live:** [framephase.app](https://frame-phase.netlify.app)

## How it works

1. **Upload** — Drag and drop a video (MP4, MOV, AVI, WebM, MKV up to 500MB)
2. **Transcribe** — AWS Transcribe auto-detects language and returns timestamped text
3. **Edit** — Fix any word in the inline editor, summarize with AI
4. **Style** — Choose from caption presets (Classic, Yellow, Bold Red, Neon, Soft)
5. **Download** — Captions are burned into the video client-side via FFmpeg WASM. Export SRT/VTT subtitle files on paid plans.

The actual caption-rendering runs entirely in the browser using WebAssembly. The processed video never leaves your device.

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Auth:** NextAuth.js v4 + Google OAuth + Prisma Adapter
- **Database:** Prisma ORM (SQLite dev, Postgres production-ready)
- **Payments:** Stripe Subscriptions (checkout, webhooks, usage gating)
- **Transcription:** AWS Transcribe
- **Storage:** AWS S3
- **Video processing:** FFmpeg WASM (client-side)
- **UI:** Tailwind CSS, Framer Motion, Lucide icons
- **Deployment:** Vercel / Netlify

## Getting started

### Prerequisites

- Node.js 18+
- npm or yarn
- AWS account (S3 + Transcribe)
- Google Cloud Console project (OAuth credentials)
- Stripe account

### Setup

```bash
git clone https://github.com/ParthMadhvani2/FramePhase.git
cd FramePhase
npm install
```

Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Prisma connection string (`file:./dev.db` for local SQLite) |
| `NEXTAUTH_URL` | App URL (`http://localhost:3000` for dev) |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `AWS_ACCESS_KEY1` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY1` | AWS IAM secret key |
| `BUCKET_NAME` | S3 bucket name |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_STARTER` | Stripe Price ID for Starter plan |
| `STRIPE_PRICE_PRO` | Stripe Price ID for Pro plan |
| `STRIPE_PRICE_BUSINESS` | Stripe Price ID for Business plan |
| `RAPIDAPI_KEY` | RapidAPI key for text summarization |
| `NEXT_PUBLIC_APP_URL` | Public app URL |

Initialize the database and run:

```bash
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Stripe webhooks (local dev)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

## Pricing tiers

| | Free | Starter ($9/mo) | Pro ($29/mo) | Business ($79/mo) |
|---|---|---|---|---|
| Videos/month | 1 | 15 | 50 | 200 |
| Export quality | 720p | 1080p | 4K | 4K |
| Subtitle export | — | SRT, VTT | SRT, VTT, ASS | SRT, VTT, ASS |
| AI summarization | — | — | Yes | Yes |
| Watermark | Yes | No | No | No |
| Team seats | — | — | — | 5 |
| API access | — | — | — | Yes |

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── stripe/checkout/   # Creates Stripe checkout sessions
│   │   ├── stripe/webhook/    # Handles Stripe lifecycle events
│   │   ├── upload/            # Auth + S3 upload + usage tracking
│   │   ├── transcribe/        # AWS Transcribe job management
│   │   └── summarize/         # Server-side text summarization
│   ├── auth/signin/           # Google OAuth sign-in page
│   ├── dashboard/             # User dashboard with usage stats
│   ├── pricing/               # Pricing page with 4 tiers
│   └── [filename]/            # Video editor (transcription + captions)
├── components/                # UI components
├── libs/
│   ├── auth.js                # NextAuth configuration
│   ├── prisma.js              # Prisma client singleton
│   ├── stripe.js              # Stripe client + plan definitions
│   └── rate-limit.js          # In-memory API rate limiting
```

## Security

- All Stripe price IDs are server-side only (client sends plan name, server maps to price ID)
- API keys (RapidAPI, AWS) never exposed to the client
- Auth required on all API routes (upload, transcribe, summarize, checkout)
- Rate limiting on all API endpoints
- Input validation and filename sanitization
- Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- COEP/COOP scoped only to the video editor (FFmpeg WASM needs SharedArrayBuffer)

## License

[MIT](https://github.com/ParthMadhvani2/FramePhase/blob/main/LICENSE)
