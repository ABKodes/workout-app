'use client'
import { useCallback, useMemo, useState } from 'react'
import { SessionLog } from '@/types'
import { computeUnlocked } from './achievements'
import { useBodyWeight } from './useBodyWeight'

const SEEN_KEY = 'achievements_seen_v1'

function loadSeen(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'))
  } catch { return new Set() }
}

export function useAchievements(allLogs: SessionLog[]) {
  const { entries: bwEntries } = useBodyWeight()
  const [seen, setSeen] = useState<Set<string>>(loadSeen)

  const unlocked = useMemo(
    () => computeUnlocked(allLogs, bwEntries),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allLogs.length, bwEntries.length]
  )

  // IDs that are unlocked but not yet shown to the user
  const newlyUnlocked = useMemo(
    () => [...unlocked].filter(id => !seen.has(id)),
    [unlocked, seen]
  )

  const markSeen = useCallback((ids: string[]) => {
    setSeen(prev => {
      const next = new Set([...prev, ...ids])
      localStorage.setItem(SEEN_KEY, JSON.stringify([...next]))
      return next
    })
  }, [])

  return { unlocked, newlyUnlocked, markSeen }
}