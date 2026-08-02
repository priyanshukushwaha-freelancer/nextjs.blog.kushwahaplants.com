'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Leaf, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError('Invalid login credentials. Please try again.');
      } else {
        router.push('/cms');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-6 font-sans">
      <div className="w-full max-w-sm border border-[var(--border)] rounded-2xl bg-[var(--card)] p-8 space-y-6 shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-10 w-10 rounded-full flex items-center justify-center bg-[var(--ring)]/10 text-[var(--ring)]">
            <Leaf className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Access Editorial Console</h1>
          <p className="text-xs text-[var(--muted-foreground)]">Enter credentials to manage botanical databases.</p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/25 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)] tracking-wider block">
              Email Address
            </label>
            <div className="relative flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kushwahaplants.com"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-4 text-xs focus:border-[var(--ring)] focus:outline-none"
              />
              <Mail className="absolute left-3 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)] tracking-wider block">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-4 text-xs focus:border-[var(--ring)] focus:outline-none"
              />
              <Lock className="absolute left-3 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-full text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-[10px] text-[var(--muted-foreground)] border-t border-[var(--border)]/45 pt-4">
          <p>Demo accounts seeded automatically. Check seed files for roles.</p>
        </div>
      </div>
    </div>
  );
}
