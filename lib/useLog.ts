'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SessionLog, SetLog } from '@/types'
import { supabase } from './supabase'

const KEY = 'wlog_v1'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function load(): SessionLog[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

function save(logs: SessionLog[]) {
  localStorage.setItem(KEY, JSON.stringify(logs))
}

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

async function upsertSession(log: SessionLog, userId: string) {
  await supabase.from('session_logs').upsert({
    user_id: userId,
    date: log.date,
    day_index: log.dayIndex,
    exercises: log.exercises,
    session_note: log.sessionNote,
    completed: log.completed,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,date,day_index' })
}

export function useLog(dayIndex: number) {
  const [logs, setLogs] = useState<SessionLog[]>([])
  const [syncing, setSyncing] = useState(false)
  const [offline, setOffline] = useState(false)
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    const stored = load()
    setLogs(stored)
    setOffline(!navigator.onLine)

    getUserId().then(id => { userIdRef.current = id })

    const handleOnline = () => {
      setOffline(false)
      syncPending()
    }
    const handleOffline = () => setOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const syncPending = useCallback(async () => {
    const userId = userIdRef.current
    if (!userId || !navigator.onLine) return
    const current = load()
    const pending = current.filter(l => l.pendingSync)
    if (pending.length === 0) return
    setSyncing(true)
    await Promise.all(pending.map(l => upsertSession(l, userId)))
    const cleared = current.map(l => l.pendingSync ? { ...l, pendingSync: false } : l)
    save(cleared)
    setLogs(cleared)
    setSyncing(false)
  }, [])

  const todayLog = logs.find(l => l.date === today() && l.dayIndex === dayIndex)

  const prevLog = logs
    .filter(l => l.dayIndex === dayIndex && l.date !== today())
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  const ensureSession = useCallback((current: SessionLog[]): { updated: SessionLog[]; idx: number } => {
    const i = current.findIndex(l => l.date === today() && l.dayIndex === dayIndex)
    if (i >= 0) return { updated: current, idx: i }
    const fresh: SessionLog = {
      date: today(),
      dayIndex,
      exercises: {},
      sessionNote: '',
      completed: false,
      pendingSync: false,
    }
    const updated = [...current, fresh]
    return { updated, idx: updated.length - 1 }
  }, [dayIndex])

  const afterWrite = useCallback(async (session: SessionLog) => {
    const userId = userIdRef.current
    if (!userId || !navigator.onLine) return
    setSyncing(true)
    await upsertSession(session, userId)
    setSyncing(false)
  }, [])

  const logSet = useCallback((exerciseName: string, setIndex: number, data: Partial<SetLog>) => {
    setLogs(prev => {
      const { updated, idx } = ensureSession(prev)
      const session = { ...updated[idx] }
      const exLog = session.exercises[exerciseName] ?? { sets: [] }
      const sets = [...exLog.sets]
      const existing = sets[setIndex] ?? { weight: '', reps: '', done: false }
      sets[setIndex] = { ...existing, ...data }
      session.exercises = { ...session.exercises, [exerciseName]: { sets } }
      session.pendingSync = true
      updated[idx] = session
      save(updated)
      afterWrite(session)
      return [...updated]
    })
  }, [ensureSession, afterWrite])

  const setNote = useCallback((note: string) => {
    setLogs(prev => {
      const { updated, idx } = ensureSession(prev)
      updated[idx] = { ...updated[idx], sessionNote: note, pendingSync: true }
      save(updated)
      afterWrite(updated[idx])
      return [...updated]
    })
  }, [ensureSession, afterWrite])

  const finishSession = useCallback(() => {
    setLogs(prev => {
      const { updated, idx } = ensureSession(prev)
      updated[idx] = { ...updated[idx], completed: true, pendingSync: true }
      save(updated)
      afterWrite(updated[idx])
      return [...updated]
    })
  }, [ensureSession, afterWrite])

  return { todayLog, prevLog, logSet, setNote, finishSession, allLogs: logs, syncing, offline }
}
