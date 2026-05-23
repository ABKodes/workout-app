'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BodyWeightEntry } from '@/types'
import { supabase } from './supabase'

const KEY = 'bwlog_v1'

function load(): BodyWeightEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

function save(entries: BodyWeightEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries))
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

async function upsertEntry(entry: BodyWeightEntry, userId: string) {
  await supabase.from('body_weight_entries').upsert({
    user_id: userId,
    date: entry.date,
    weight: entry.weight,
  }, { onConflict: 'user_id,date' })
}

export function useBodyWeight() {
  const [entries, setEntries] = useState<BodyWeightEntry[]>(() => load())
  const [syncing, setSyncing] = useState(false)
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    getUserId().then(id => { userIdRef.current = id })

    const handleOnline = () => syncPending()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const syncPending = useCallback(async () => {
    const userId = userIdRef.current
    if (!userId || !navigator.onLine) return
    const current = load()
    const pending = current.filter(e => e.pendingSync)
    if (pending.length === 0) return
    setSyncing(true)
    await Promise.all(pending.map(e => upsertEntry(e, userId)))
    const cleared = current.map(e => e.pendingSync ? { ...e, pendingSync: false } : e)
    save(cleared)
    setEntries(cleared)
    setSyncing(false)
  }, [])

  const logWeight = useCallback((weight: number) => {
    setEntries(prev => {
      const date = todayStr()
      const filtered = prev.filter(e => e.date !== date)
      const entry: BodyWeightEntry = { date, weight, pendingSync: true }
      const updated = [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date))
      save(updated)
      const userId = userIdRef.current
      if (userId && navigator.onLine) {
        setSyncing(true)
        upsertEntry(entry, userId).then(() => setSyncing(false))
      }
      return updated
    })
  }, [])

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const today = sorted.find(e => e.date === todayStr())
  const earliest = sorted[0]
  const latest = sorted[sorted.length - 1]

  const weeksElapsed = earliest && latest && earliest.date !== latest.date
    ? (new Date(latest.date).getTime() - new Date(earliest.date).getTime()) / (7 * 24 * 3600 * 1000)
    : 0

  const totalLost = earliest && latest ? earliest.weight - latest.weight : 0
  const ratePerWeek = weeksElapsed > 0 ? totalLost / weeksElapsed : 0

  const last5Weeks = sorted.filter(e => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 35)
    return new Date(e.date) >= cutoff
  })

  return { entries: sorted, logWeight, today, totalLost, ratePerWeek, last5Weeks, syncing }
}
