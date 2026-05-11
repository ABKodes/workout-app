'use client'
import { useState, useCallback } from 'react'

const KEY = 'subs_v1'

type SubsMap = Record<string, string> // originalName → subName

function load(dayIndex: number): SubsMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const all = JSON.parse(raw) as Record<string, SubsMap>
    return all[dayIndex] ?? {}
  } catch {
    return {}
  }
}

function save(dayIndex: number, subs: SubsMap) {
  try {
    const raw = localStorage.getItem(KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, SubsMap>) : {}
    all[dayIndex] = subs
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {}
}

export function useSubstitutions(dayIndex: number) {
  const [subs, setSubs] = useState<SubsMap>(() => load(dayIndex))

  const getActiveName = useCallback(
    (originalName: string): string => subs[originalName] ?? originalName,
    [subs]
  )

  const isSwapped = useCallback(
    (originalName: string): boolean => originalName in subs,
    [subs]
  )

  const toggleSwap = useCallback(
    (originalName: string, subName: string) => {
      setSubs(prev => {
        const next = { ...prev }
        if (next[originalName]) {
          delete next[originalName]
        } else {
          next[originalName] = subName
        }
        save(dayIndex, next)
        return next
      })
    },
    [dayIndex]
  )

  return { getActiveName, isSwapped, toggleSwap }
}
