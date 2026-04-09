# FramePhase — Complete Setup Guide

## Step 1: Create `.env` file

Copy the example and fill in your values:

```bash
cp .env.example .env
```

---

## Step 2: Database (Prisma + SQLite)

For local development, SQLite works out of the box:

```bash
# Your .env already has:
# DATABASE_URL="file:./dev.db"

# Initialize the database
npx prisma db push

# (Optional) View your data with Prisma Studio
npx prisma studio
```

**For production (PostgreSQL):**
1. Create a Postgres database (e.g. on [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app))
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Update `.env`:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/framephase"
   ```
4. Run `npx prisma db push`

---

## Step 3: Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or use existing)
3. Go to **OAuth consent screen** → Configure (External, add your email as test user)
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. **Authorized JavaScript origins:**
   - `http://localhost:3000` (for local dev)
   - `https://your-production-domain.com` (for production)
7. **Authorized redirect URIs:**
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
   - `https://your-production-domain.com/api/auth/callback/google` (for production)
8. Click **Create** and copy the Client ID and Client Secret
9. Add to `.env`:
   ```
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```
Copy the output to `NEXTAUTH_SECRET` in `.env`.

---

## Step 4: AWS (S3 + Transcribe)

### 4a: Create an IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create user**
3. Name: `framephase-app`
4. Click **Next** → **Attach policies directly**
5. Attach these two policies:
   - `AmazonS3FullAccess`
   - `AmazonTranscribeFullAccess`
6. Click **Create user**
7. Go to the user → **Security credentials** → **Create access key**
8. Choose **Application running outside AWS**
9. Copy the **Access Key ID** and **Secret Access Key**
10. Add to `.env`:
    ```
    AWS_ACCESS_KEY1="AKIA..."
    AWS_SECRET_ACCESS_KEY1="your-secret-key"
    ```

### 4b: Create an S3 Bucket

1. Go to [S3 Console](https://s3.console.aws.amazon.com/s3/)
2. Click **Create bucket**
3. Bucket name: `frame-phase` (or your preferred name)
4. Region: `us-east-1`
5. **Uncheck** "Block all public access" (videos need public read for playback)
6. Acknowledge the warning and create
7. Go to the bucket → **Permissions** → **Bucket Policy**, add:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::frame-phase/*"
       }
     ]
   }
   ```
8. Go to **Permissions** → **CORS**, add:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```
9. Update `.env`:
   ```
   BUCKET_NAME="frame-phase"
   ```

### 4c: Verify AWS Transcribe

No extra setup needed — AWS Transcribe is a managed service. Just make sure your IAM user has `AmazonTranscribeFullAccess` and the region matches (`us-east-1`).

---

## Step 5: Stripe (Payments)

### 5a: Create Products & Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Make sure you're in **Test mode** (toggle at top)
3. Go to **Products** → **Add product**:

   **Product 1: Starter**
   - Name: `FramePhase Starter`
   - Price: $9/month (recurring)
   - Copy the Price ID (starts with `price_`)

   **Product 2: Pro**
   - Name: `FramePhase Pro`
   - Price: $29/month (recurring)
   - Copy the Price ID

   **Product 3: Business**
   - Name: `FramePhase Business`
   - Price: $79/month (recurring)
   - Copy the Price ID

4. Add to `.env`:
   ```
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_PRICE_STARTER="price_..."
   STRIPE_PRICE_PRO="price_..."
   STRIPE_PRICE_BUSINESS="price_..."
   ```

### 5b: Set Up Webhooks (Local Dev)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Copy the webhook signing secret (starts with `whsec_`)
4. Add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

### 5c: Set Up Webhooks (Production)

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. **Add endpoint**: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
4. Copy the signing secret to your production env vars

---

## Step 6: AI Summarization (Optional — Works Out of the Box)

FramePhase uses a **two-tier summarization approach** with zero required setup:

### Tier 1: Hugging Face Inference API (Primary)

Uses [`facebook/bart-large-cnn`](https://huggingface.co/facebook/bart-large-cnn) — one of the best open-source summarization models. Works **without any API key** for moderate usage.

**Optional: Add a free HF token for higher rate limits**

1. Go to [Hugging Face Tokens](https://huggingface.co/settings/tokens)
2. Sign up (free) and create a new token with **Read** access
3. Add to `.env`:
   ```
   HF_TOKEN="hf_..."
   ```

### Tier 2: Extractive Fallback (Built-in)

If Hugging Face is unavailable or rate-limited, FramePhase automatically falls back to a built-in extractive summarizer that runs server-side with **zero external dependencies**. It scores sentences by word frequency (skipping stop words) and picks the top 3 most information-dense ones in original order. Your users always get summaries, even if HF is down.

> **Note:** If you previously had `RAPIDAPI_KEY` in your `.env`, you can remove it — the old TLDR This RapidAPI is no longer used.

---

## Step 7: Admin Account

Add your email to the `ADMIN_EMAILS` env var to get unlimited access without purchasing a plan:

```
ADMIN_EMAILS="madhvaniparth4@gmail.com"
```

Multiple admins: `ADMIN_EMAILS="email1@example.com,email2@example.com"`

---

## Step 8: Run the App

```bash
# Install dependencies
npm install

# Initialize database
npx prisma db push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Production Deployment Checklist

- [ ] Switch `DATABASE_URL` to PostgreSQL
- [ ] Update `prisma/schema.prisma` provider to `postgresql`
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Add production URLs to Google OAuth (origins + redirect URIs)
- [ ] Add production URL to S3 CORS
- [ ] Create Stripe webhook for production URL
- [ ] Switch Stripe to live mode (change keys from `sk_test_` to `sk_live_`)
- [ ] Set all env vars in your hosting platform (Vercel/Netlify)
- [ ] Run `npx prisma db push` against production database
- [ ] Verify all API routes work end-to-end
