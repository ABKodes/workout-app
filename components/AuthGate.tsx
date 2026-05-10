'use client'
import { useAuth } from '@/lib/useAuth'
import SignInScreen from './SignInScreen'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!session) return <SignInScreen />

  return <>{children}</>
}
