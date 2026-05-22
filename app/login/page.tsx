'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signInWithGoogle() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // On success, Supabase redirects the browser to Google.
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold mb-1">Sign in</h1>
        <p className="text-sm text-slate-500 mb-6">Welcome to your CRM.</p>

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          <GoogleIcon />
          {loading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        {error && (
          <p className="mt-4 text-sm text-rose-600">{error}</p>
        )}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#fff" d="M16.51 8.19c0-.6-.05-1.18-.15-1.74H9v3.29h4.21c-.18.97-.73 1.79-1.55 2.34v1.95h2.51c1.47-1.35 2.32-3.34 2.32-5.84z"/>
      <path fill="#fff" d="M9 17c2.1 0 3.86-.7 5.15-1.87l-2.51-1.95c-.7.47-1.59.74-2.64.74-2.03 0-3.74-1.37-4.36-3.21H2.05v2.02C3.34 15.31 5.95 17 9 17z"/>
      <path fill="#fff" d="M4.64 10.71c-.16-.47-.25-.97-.25-1.48s.09-1.01.25-1.48V5.73H2.05A8 8 0 0 0 1 9.23c0 1.29.31 2.5.85 3.5l2.79-2.02z"/>
      <path fill="#fff" d="M9 4.54c1.14 0 2.17.39 2.98 1.16l2.23-2.23C13.85 2.19 12.1 1.46 9 1.46 5.95 1.46 3.34 3.15 2.05 5.73l2.59 2.02C5.26 5.91 6.97 4.54 9 4.54z"/>
    </svg>
  )
}
