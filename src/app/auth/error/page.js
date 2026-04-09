'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Suspense } from 'react';

const ERROR_MESSAGES = {
  Configuration: "There's a problem with the server configuration. Please try again later.",
  AccessDenied: "Access denied. You may not have permission to sign in.",
  Verification: "The verification link has expired or has already been used.",
  OAuthSignin: "Could not start the sign-in process. Please try again.",
  OAuthCallback: "Something went wrong during sign-in. Please try again.",
  OAuthCreateAccount: "Could not create your account. Please try again.",
  EmailCreateAccount: "Could not create your account. Please try again.",
  Callback: "Something went wrong. Please try again.",
  OAuthAccountNotLinked: "This email is already associated with another sign-in method.",
  Default: "An unexpected error occurred. Please try again.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const message = ERROR_MESSAGES[error] || ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Sign-in Error</h1>
        <p className="text-white/50 mb-8 leading-relaxed">{message}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => signIn('google')}
            className="btn-primary text-sm px-6 py-2.5"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link href="/" className="btn-secondary text-sm px-6 py-2.5">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
