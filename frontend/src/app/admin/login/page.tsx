'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { adminLoginRequest } from '@/lib/adminApi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your administrative email and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await adminLoginRequest(email.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      router.replace('/admin');
    } else {
      setErrorMessage(res.message || 'Invalid administrative credentials');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Public Marketplace
          </Link>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-navy-800 bg-navy-900/90 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col items-center text-center mb-8">
            <Image
              src="/logo.jpg"
              alt="Property in Lahore"
              width={2400}
              height={1792}
              priority
              sizes="(max-width: 640px) 60vw, 220px"
              className="mb-4 h-auto w-[min(60vw,220px)] rounded-lg shadow-[0_0_30px_rgba(0,168,45,0.18)]"
            />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Administrator Login
            </h1>
            <p className="mt-1 text-xs text-navy-400">
              Lahore Property Hub Management & Moderation
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-300 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lahorepropertyhub.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-navy-700 bg-navy-950 py-2.5 pl-10 pr-3 text-xs text-white placeholder-navy-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-300 mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-navy-700 bg-navy-950 py-2.5 pl-10 pr-3 text-xs text-white placeholder-navy-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-brand-700 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-navy-800 pt-6 text-center text-[11px] text-navy-500">
            Strictly restricted to authorized staff. All login attempts and IP addresses are monitored.
          </div>
        </div>
      </div>
    </div>
  );
}
