'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

export function useTimer() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef<(() => void) | null>(null)

  const clear = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  useEffect(() => {
    if (!running) { clear(); return }
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clear()
          setRunning(false)
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
          onDoneRef.current?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return clear
  }, [running])

  const start = useCallback((secs: number, onDone?: () => void) => {
    onDoneRef.current = onDone ?? null
    setSeconds(secs)
    setRunning(true)
  }, [])

  const skip = useCallback(() => {
    clear()
    setRunning(false)
    setSeconds(0)
  }, [])

  const addTime = useCallback((secs: number) => {
    setSeconds(s => s + secs)
  }, [])

  const fmt = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

  return { seconds, running, fmt, start, skip, addTime }
}
