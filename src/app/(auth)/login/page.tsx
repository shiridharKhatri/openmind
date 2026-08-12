'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/chat');
        router.refresh();
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      {/* Card */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-8 shadow-[var(--shadow-card)]">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
          Welcome back
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)] mb-6">
          Sign in to your account to continue
        </p>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[13px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-lavender-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-lavender-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-lavender-400 text-white font-medium text-[14px] hover:bg-lavender-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sign in
          </button>
        </form>

        {/* Google OAuth */}
        <div className="mt-4">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-color)]" />
            </div>
            <div className="relative flex justify-center text-[12px]">
              <span className="bg-[var(--bg-card)] px-3 text-[var(--text-muted)]">
                or
              </span>
            </div>
          </div>

          <button
            onClick={() => signIn('google', { callbackUrl: '/chat' })}
            className="w-full py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] font-medium text-[14px] hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      {/* Sign up link */}
      <p className="text-center text-[13px] text-[var(--text-muted)] mt-5">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-lavender-500 hover:text-lavender-600 font-medium"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
