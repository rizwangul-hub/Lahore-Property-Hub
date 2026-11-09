'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Container } from '@/components/common/Container';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or error-monitoring service
    console.error('[Application ErrorBoundary]:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 bg-navy-50/50">
      <Container className="max-w-xl">
        <div className="rounded-3xl border border-navy-100 bg-white p-8 sm:p-10 text-center shadow-card space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-navy-950">
              Something went wrong
            </h1>
            <p className="text-xs sm:text-sm text-navy-600 max-w-md mx-auto leading-relaxed">
              We encountered an unexpected error while loading this page. Our technical team has been notified.
            </p>
          </div>

          {error?.digest && (
            <div className="text-[10px] font-mono text-navy-400 bg-navy-50 py-1.5 px-3 rounded-lg inline-block">
              Error Digest: {error.digest}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 text-xs font-bold shadow-sm transition active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-800 px-5 py-3 text-xs font-bold transition shadow-subtle"
            >
              <Home className="h-4 w-4 text-brand-600" />
              <span>Back to Homepage</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
