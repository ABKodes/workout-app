'use client'
import { useEffect, useState } from 'react'

const KEY = 'notif_time_v1'
const ENABLED_KEY = 'notif_enabled_v1'

async function getSW(): Promise<ServiceWorker | null> {
  if (!('serviceWorker' in navigator)) return null
  const reg = await navigator.serviceWorker.ready
  return reg.active
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [enabled, setEnabledState] = useState(false)
  const [time, setTimeState] = useState('18:00')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setPermission(Notification.permission)
    setEnabledState(localStorage.getItem(ENABLED_KEY) === 'true')
    setTimeState(localStorage.getItem(KEY) || '18:00')

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  // Re-schedule whenever enabled/time changes
  useEffect(() => {
    if (!enabled || permission !== 'granted') return
    getSW().then(sw => {
      sw?.postMessage({ type: 'SCHEDULE', time })
    })
  }, [enabled, time, permission])

  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  const setEnabled = async (val: boolean) => {
    if (val && permission !== 'granted') {
      const result = await requestPermission()
      if (result !== 'granted') return
    }
    localStorage.setItem(ENABLED_KEY, String(val))
    setEnabledState(val)
    if (!val) {
      getSW().then(sw => sw?.postMessage({ type: 'CANCEL' }))
    }
  }

  const setTime = (t: string) => {
    localStorage.setItem(KEY, t)
    setTimeState(t)
  }

  const testNotification = async () => {
    if (permission !== 'granted') {
      const result = await requestPermission()
      if (result !== 'granted') return
    }
    new Notification('Time to train 💪', { body: "Your workout is waiting. Let's get it." })
  }

  return { permission, enabled, time, setEnabled, setTime, testNotification }
}
