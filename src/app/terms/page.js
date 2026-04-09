import Link from 'next/link';

export const metadata = {
  title: "Terms of Service — FramePhase",
};

export default function TermsPage() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose-invert">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-sm text-white/60 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using FramePhase (&quot;the Service&quot;), you agree to be bound by these
              Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
            <p>
              FramePhase is an AI-powered video captioning tool. You upload videos, we transcribe
              them using AI, and you can edit and burn captions into the video. Caption rendering
              happens in your browser via WebAssembly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. User Accounts</h2>
            <p>
              You must sign in with a Google account to use the Service. You are responsible for
              all activity under your account. You must not share your account or use the Service
              for any illegal purpose.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Subscriptions & Payments</h2>
            <p>
              Paid plans are billed monthly via Stripe. You can cancel at any time from your
              dashboard. Cancellation takes effect at the end of your current billing period.
              Refunds are handled on a case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Content & Ownership</h2>
            <p>
              You retain full ownership of all videos you upload and captions you create.
              We do not claim any rights to your content. Uploaded videos are stored temporarily
              on AWS S3 for processing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Acceptable Use</h2>
            <p>
              You agree not to upload content that is illegal, infringes on intellectual property
              rights, contains malware, or violates the rights of others. We reserve the right
              to remove content and suspend accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Limitation of Liability</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind. We are not liable
              for any damages arising from your use of the Service, including loss of data or
              service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Age Requirement</h2>
            <p>
              You must be at least 13 years old to use the Service. By using FramePhase, you
              represent that you meet this age requirement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Service Availability</h2>
            <p>
              We strive for high uptime but do not guarantee uninterrupted access. We may
              perform maintenance, updates, or temporarily suspend the Service. Paid users on
              the Business plan are covered by a 99.9% uptime SLA as outlined in their agreement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these
              Terms. You may delete your account at any time by contacting us. Upon termination,
              your data will be deleted in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the Service after
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">12. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the jurisdiction in which the operator
              resides, without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">13. Contact</h2>
            <p>
              Questions about these terms? Email us at{' '}
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
