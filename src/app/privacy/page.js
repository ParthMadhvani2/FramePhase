import Link from 'next/link';

export const metadata = {
  title: "Privacy Policy — FramePhase",
};

export default function PrivacyPage() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose-invert">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-sm text-white/60 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. What We Collect</h2>
            <p>When you use FramePhase, we collect:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/50">
              <li>Your Google account name, email, and profile image (via Google OAuth)</li>
              <li>Videos you upload (stored temporarily on AWS S3 for transcription)</li>
              <li>Subscription and payment data (processed by Stripe — we never store card numbers)</li>
              <li>Basic usage data (videos processed count, plan type)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Data</h2>
            <p>Your data is used solely to provide the Service:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/50">
              <li>Videos are uploaded to AWS S3, transcribed via AWS Transcribe, then available for you to process</li>
              <li>Caption rendering happens entirely in your browser (client-side via FFmpeg WASM)</li>
              <li>We use your email for authentication and account management</li>
              <li>We do not sell, share, or rent your data to third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Video Data & Processing</h2>
            <p>
              Uploaded videos are stored on AWS S3. The actual caption-burning process runs
              entirely in your browser using WebAssembly — the processed video with captions
              never leaves your device. We do not analyze, view, or share your video content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/50">
              <li><strong className="text-white/70">Google OAuth</strong> — Authentication</li>
              <li><strong className="text-white/70">AWS S3 &amp; Transcribe</strong> — Video storage and transcription</li>
              <li><strong className="text-white/70">Stripe</strong> — Payment processing</li>
            </ul>
            <p className="mt-2">Each service has its own privacy policy governing their handling of your data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Data Retention</h2>
            <p>
              Your account data is retained as long as your account is active.
              Uploaded videos are stored on S3 for processing purposes. You can request
              deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Cookies</h2>
            <p>
              We use essential session cookies for authentication (NextAuth.js).
              We do not use tracking cookies, analytics cookies, or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/50">
              <li>Access the personal data we hold about you</li>
              <li>Request deletion of your account and data</li>
              <li>Export your transcription data (SRT/VTT files)</li>
              <li>Cancel your subscription at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Data Security</h2>
            <p>
              We use industry-standard encryption (TLS/SSL) for data in transit and at rest
              on AWS. Access to production systems is restricted and monitored. In the event
              of a data breach, we will notify affected users within 72 hours as required by
              applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. International Users (GDPR &amp; CCPA)</h2>
            <p>
              If you are located in the EU/EEA, you have rights under the General Data Protection
              Regulation (GDPR) including the right to access, rectify, delete, and port your data.
              If you are a California resident, you have rights under the California Consumer Privacy
              Act (CCPA) including the right to know, delete, and opt out of the sale of personal
              information. We do not sell your personal data. To exercise any of these rights,
              contact us at the email below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Children&apos;s Privacy</h2>
            <p>
              FramePhase is not intended for children under 13. We do not knowingly collect
              personal data from children. If we learn that we have collected data from a child
              under 13, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Contact</h2>
            <p>
              For privacy-related questions or data requests, contact us at{' '}
              <a href="mailto:madhvaniparth2@gmail.com" className="text-brand-400 hover:text-brand-300">
                madhvaniparth2@gmail.com
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <Link href="/" className="text-sm text-white/30 hover:text-white/60 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
