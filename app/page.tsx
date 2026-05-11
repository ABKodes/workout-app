'use client'
import { useEffect, useState } from 'react'
import { days } from '@/lib/data'
import { useLog } from '@/lib/useLog'
import { useAuth } from '@/lib/useAuth'
import AuthGate from '@/components/AuthGate'
import TabBar from '@/components/TabBar'
import DayScreen from '@/components/DayScreen'
import StatsScreen from '@/components/StatsScreen'
import SyncIndicator from '@/components/SyncIndicator'

function todayIndex(): number {
  // JS: 0=Sun,1=Mon...6=Sat → remap to Mon=0...Sun=6
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
}

function AppContent() {
  // Initialize directly to today — no flash since this runs client-side only
  const [active, setActive] = useState<number>(() =>
    typeof window !== 'undefined' ? todayIndex() : 0
  )
  const [showStats, setShowStats] = useState(false)
  const { allLogs, syncing, offline } = useLog(active)
  const { signOut } = useAuth()

  // Register service worker + reschedule notification if previously enabled
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').then(async () => {
      const enabled = localStorage.getItem('notif_enabled_v1') === 'true'
      const time = localStorage.getItem('notif_time_v1') || '18:00'
      if (enabled && Notification.permission === 'granted') {
        const reg = await navigator.serviceWorker.ready
        reg.active?.postMessage({ type: 'SCHEDULE', time })
      }
    }).catch(() => {})
  }, [])

  const handleSelectDay = (i: number) => {
    setActive(i)
    setShowStats(false)
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d]">
      <SyncIndicator syncing={syncing} offline={offline} />
      <div className="max-w-lg mx-auto px-4 pt-6">
        {showStats
          ? <StatsScreen allLogs={allLogs} activeDayIndex={active} />
          : <DayScreen day={days[active]} dayIndex={active} allLogs={allLogs} />
        }
        {showStats && (
          <div className="pb-4 text-center">
            <button
              onClick={signOut}
              className="text-[11px] text-gray-700 hover:text-gray-500 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
      <TabBar
        days={days}
        active={active}
        onSelect={handleSelectDay}
        showStats={showStats}
        onStats={() => setShowStats(true)}
      />
    </main>
  )
}

export default function Home() {
  return (
    <AuthGate>
      <AppContent />
    </AuthGate>
  )
}
