'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

export default function SignInPage() {
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      
      // If email confirmation is required, session will be null
      if (!data.session) {
        setError("Please check your email to confirm your account before continuing.")
        setLoading(false)
        return
      }
      
      router.push('/onboarding')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      // Check if onboarding is complete
      const { data: userData } = await supabase
        .from('users')
        .select('onboarded_at')
        .eq('id', data.user.id)
        .single()

      if (!userData?.onboarded_at) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? t('createAccountTitle') : t('signInTitle')}
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('emailLabel')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black animate-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('passwordLabel')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black animate-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            {loading ? t('pleaseWait') : isSignUp ? t('signUpButton') : t('signInButton')}
          </button>

          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
            className="w-full text-sm text-gray-600 hover:underline cursor-pointer"
          >
            {isSignUp ? t('alreadyHaveAccount') : t('createAccount')}
          </button>
        </div>

        <p className="text-xs text-center text-gray-400 mt-6">
          {tCommon('disclaimer')}
        </p>
      </div>
    </div>
  )
}