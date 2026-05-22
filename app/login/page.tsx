'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold mb-1">Sign in</h1>
        <p className="text-sm text-slate-500 mb-6">
          {sent ? 'Check your inbox.' : 'Enter your email — we’ll send you a sign-in link.'}
        </p>

        {sent ? (
          <div className="text-sm text-slate-700 bg-emerald-50 border border-emerald-200 rounded-md p-3">
            We sent a sign-in link to <span className="font-medium">{email}</span>.
            Click it from this device to continue.
          </div>
        ) : (
          <form onSubmit={sendMagicLink} className="space-y-4">
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send sign-in link'}
            </button>
          </form>
        )}

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      </div>
    </div>
  )
}
