import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  if (typeof window === 'undefined') {
    return new Proxy({} as ReturnType<typeof createBrowserClient>, {
      get() {
        throw new Error('Supabase browser client is unavailable during SSR')
      },
    })
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}