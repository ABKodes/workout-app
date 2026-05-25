'use client'
import { useCallback, useState } from 'react'
import { useNotifications } from '@/lib/useNotifications'
import { supabase } from '@/lib/supabase'

const PREGAME_ENABLED_KEY = 'pregame_notif_v1'
const PREGAME_THU_KEY = 'pregame_thu_time_v1'
const PREGAME_SAT_KEY = 'pregame_sat_time_v1'

function sendPregameSchedule(thuTime: string, satTime: string) {
  if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') return
  navigator.serviceWorker.ready.then(reg => {
    reg.active?.postMessage({ type: 'PREGAME_SCHEDULE', thuTime, satTime })
  })
}

function cancelPregame() {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.ready.then(reg => {
    reg.active?.postMessage({ type: 'PREGAME_CANCEL' })
  })
}

export default function NotificationSettings() {
  const { permission, enabled, time, setEnabled, setTime, testNotification } = useNotifications()
  const [resetting, setResetting] = useState(false)

  const [pregameEnabled, setPregameEnabledState] = useState(
    () => localStorage.getItem(PREGAME_ENABLED_KEY) === 'true'
  )
  const [thuTime, setThuTimeState] = useState(
    () => localStorage.getItem(PREGAME_THU_KEY) || '13:00'
  )
  const [satTime, setSatTimeState] = useState(
    () => localStorage.getItem(PREGAME_SAT_KEY) || '11:00'
  )

  const setPregameEnabled = useCallback((val: boolean) => {
    localStorage.setItem(PREGAME_ENABLED_KEY, String(val))
    setPregameEnabledState(val)
    if (val) sendPregameSchedule(thuTime, satTime)
    else cancelPregame()
  }, [thuTime, satTime])

  const setThuTime = useCallback((val: string) => {
    localStorage.setItem(PREGAME_THU_KEY, val)
    setThuTimeState(val)
    if (pregameEnabled) sendPregameSchedule(val, satTime)
  }, [pregameEnabled, satTime])

  const setSatTime = useCallback((val: string) => {
    localStorage.setItem(PREGAME_SAT_KEY, val)
    setSatTimeState(val)
    if (pregameEnabled) sendPregameSchedule(thuTime, val)
  }, [pregameEnabled, thuTime])
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  const handleReset = async () => {
    setResetting(true)
    // Clear localStorage
    localStorage.removeItem('wlog_v1')
    localStorage.removeItem('bwlog_v1')
    // Clear Supabase
    try {
      const { data } = await supabase.auth.getUser()
      const userId = data.user?.id
      if (userId) {
        await supabase.from('session_logs').delete().eq('user_id', userId)
        await supabase.from('body_weight_entries').delete().eq('user_id', userId)
      }
    } catch {}
    setResetting(false)
    setConfirmReset(false)
    setResetDone(true)
    setTimeout(() => window.location.reload(), 1200)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white mb-4">Settings</h2>

      {/* Notification section */}
      <div className="bg-[#111] rounded-xl border border-[#1e1e1e] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e1e1e]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Workout reminder</p>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Daily reminder</p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {permission === 'denied'
                  ? 'Blocked — enable in browser settings'
                  : 'Notify me when it\'s time to train'}
              </p>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              disabled={permission === 'denied'}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                enabled ? 'bg-violet-500' : 'bg-[#2a2a2a]'
              } ${permission === 'denied' ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {/* Time picker */}
          {enabled && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400 flex-1">Remind me at</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-violet-500 focus:outline-none"
              />
            </div>
          )}

          {/* Test button */}
          <button
            onClick={testNotification}
            className="w-full py-2.5 text-[12px] font-bold text-gray-400 border border-[#2a2a2a] bg-[#1a1a1a] rounded-xl hover:border-violet-500 hover:text-violet-400 transition-colors"
          >
            Send test notification
          </button>

          {enabled && (
            <p className="text-[10px] text-gray-700 text-center leading-relaxed">
              Notifications work best when the app is installed to your home screen
            </p>
          )}
        </div>
      </div>

      {/* Pre-game meal reminders */}
      <div className="bg-[#111] rounded-xl border border-[#1e1e1e] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e1e1e]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Pre-game meal reminder</p>
        </div>
        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Thu & Sat reminder</p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {permission === 'denied'
                  ? 'Blocked — enable in browser settings'
                  : 'Remind me to eat before game day'}
              </p>
            </div>
            <button
              onClick={() => setPregameEnabled(!pregameEnabled)}
              disabled={permission === 'denied'}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                pregameEnabled ? 'bg-violet-500' : 'bg-[#2a2a2a]'
              } ${permission === 'denied' ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${pregameEnabled ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {pregameEnabled && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-400 flex-1">Thursday at</label>
                <input
                  type="time"
                  value={thuTime}
                  onChange={e => setThuTime(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-400 flex-1">Saturday at</label>
                <input
                  type="time"
                  value={satTime}
                  onChange={e => setSatTime(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-violet-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-gray-700 leading-relaxed">
                Set ~3 hours before your game time so your meal digests in time.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reset section */}
      <div className="bg-[#111] rounded-xl border border-[#1e1e1e] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e1e1e]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Data</p>
        </div>

        <div className="px-4 py-4">
          {resetDone ? (
            <p className="text-center text-green-400 font-bold text-sm py-1">✓ All data cleared</p>
          ) : confirmReset ? (
            <div className="space-y-3">
              <p className="text-sm text-red-400 font-bold text-center">This will permanently delete all workout logs and body weight entries.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-3 bg-[#1a1a1a] text-gray-400 font-bold text-sm rounded-xl border border-[#2a2a2a]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="flex-1 py-3 bg-red-900/50 text-red-400 font-bold text-sm rounded-xl border border-red-900 disabled:opacity-50"
                >
                  {resetting ? 'Resetting...' : 'Yes, reset'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-3 text-sm font-bold text-red-500 border border-red-900/40 bg-red-900/10 rounded-xl hover:bg-red-900/20 transition-colors"
            >
              Reset all data
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
