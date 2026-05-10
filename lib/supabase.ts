import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    _client = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder')
  }
  return _client
}

export const supabase = {
  auth: {
    getSession: () => getSupabase().auth.getSession(),
    getUser: () => getSupabase().auth.getUser(),
    onAuthStateChange: (...args: Parameters<SupabaseClient['auth']['onAuthStateChange']>) =>
      getSupabase().auth.onAuthStateChange(...args),
    signInWithOAuth: (...args: Parameters<SupabaseClient['auth']['signInWithOAuth']>) =>
      getSupabase().auth.signInWithOAuth(...args),
    signOut: () => getSupabase().auth.signOut(),
  },
  from: (table: string) => getSupabase().from(table),
}
