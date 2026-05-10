'use client'
import { useCallback, useEffect, useState } from 'react'
import { SessionLog, SetLog } from '@/types'

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

export function useLog(dayIndex: number) {
  const [logs, setLogs] = useState<SessionLog[]>([])

  useEffect(() => {
    setLogs(load())
  }, [])

  const todayLog = logs.find(l => l.date === today() && l.dayIndex === dayIndex)

  const prevLog = logs
    .filter(l => l.dayIndex === dayIndex && l.date !== today())
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  const ensureSession = useCallback((current: SessionLog[]): { updated: SessionLog[]; idx: number } => {
    const i = current.findIndex(l => l.date === today() && l.dayIndex === dayIndex)
    if (i >= 0) return { updated: current, idx: i }
    const fresh: SessionLog = { date: today(), dayIndex, exercises: {}, sessionNote: '', completed: false }
    const updated = [...current, fresh]
    return { updated, idx: updated.length - 1 }
  }, [dayIndex])

  const logSet = useCallback((exerciseName: string, setIndex: number, data: Partial<SetLog>) => {
    setLogs(prev => {
      const { updated, idx } = ensureSession(prev)
      const session = { ...updated[idx] }
      const exLog = session.exercises[exerciseName] ?? { sets: [] }
      const sets = [...exLog.sets]
      const existing = sets[setIndex] ?? { weight: '', reps: '', done: false }
      sets[setIndex] = { ...existing, ...data }
      session.exercises = { ...session.exercises, [exerciseName]: { sets } }
      updated[idx] = session
      save(updated)
      return [...updated]
    })
  }, [ensureSession])

  const setNote = useCallback((note: string) => {
    setLogs(prev => {
      const { updated, idx } = ensureSession(prev)
      updated[idx] = { ...updated[idx], sessionNote: note }
      save(updated)
      return [...updated]
    })
  }, [ensureSession])

  const finishSession = useCallback(() => {
    setLogs(prev => {
      const { updated, idx } = ensureSession(prev)
      updated[idx] = { ...updated[idx], completed: true }
      save(updated)
      return [...updated]
    })
  }, [ensureSession])

  return { todayLog, prevLog, logSet, setNote, finishSession, allLogs: logs }
}
