'use client'
import { useMemo } from 'react'
import { SessionLog } from '@/types'
import { days } from '@/lib/data'

const XP_PER_LEVEL = 500

function getExpectedSets(dayIndex: number, exerciseName: string): number {
  const day = days[dayIndex]
  if (!day) return 0
  const ex = day.sections.flatMap(s => s.rows).find(e => e.name === exerciseName)
  return ex ? (parseInt(ex.sets) || 0) : 0
}

function computeLogXP(allLogs: SessionLog[]): number {
  const sorted = [...allLogs].sort((a, b) => a.date.localeCompare(b.date))
  const runningMax: Record<string, number> = {}
  let total = 0

  for (const log of sorted) {
    const day = days[log.dayIndex]
    const dayExes = day ? day.sections.flatMap(s => s.rows).filter(e => parseInt(e.sets) > 0) : []
    let exDoneCount = 0

    for (const [name, exLog] of Object.entries(log.exercises)) {
      const done = (exLog.sets || []).filter(s => s?.done)
      if (!done.length) continue

      total += done.length * 10

      const expected = getExpectedSets(log.dayIndex, name)
      if (expected > 0 && done.length >= expected) {
        total += 25
        exDoneCount++
      }

      const weights = done.map(s => parseFloat(s.weight)).filter(w => !isNaN(w) && w > 0)
      if (weights.length) {
        const maxW = Math.max(...weights)
        if (runningMax[name] !== undefined && maxW > runningMax[name]) total += 100
        if (runningMax[name] === undefined || maxW > runningMax[name]) runningMax[name] = maxW
      }
    }

    if (log.completed) total += 200
    if (dayExes.length && exDoneCount >= dayExes.length) total += 100
  }

  return total
}

function readHistQuestXP(): number {
  if (typeof window === 'undefined') return 0
  const today = new Date().toISOString().slice(0, 10)
  let total = 0
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith('quests_')) continue
      const date = key.slice(7)
      if (date === today) continue
      const val = JSON.parse(localStorage.getItem(key) || '{}')
      if (Array.isArray(val.completedIds)) total += val.completedIds.length * 150
    }
  } catch { /* ignore */ }
  return total
}

export function useXP(allLogs: SessionLog[], todayQuestXP = 0) {
  return useMemo(() => {
    const logXP = computeLogXP(allLogs)
    const histQuestXP = readHistQuestXP()
    const totalXP = logXP + histQuestXP + todayQuestXP
    const level = Math.floor(totalXP / XP_PER_LEVEL)
    const xpIntoLevel = totalXP % XP_PER_LEVEL
    const powerLevel = Math.round(totalXP / 100)
    return { totalXP, powerLevel, level, xpIntoLevel, xpToNextLevel: XP_PER_LEVEL }
  }, [allLogs, todayQuestXP])
}

// Pure function for VictoryScreen — XP for a single session (assumes completed)
export function computeSingleSessionXP(log: SessionLog, prevLogs: SessionLog[]): number {
  const day = days[log.dayIndex]
  const dayExes = day ? day.sections.flatMap(s => s.rows).filter(e => parseInt(e.sets) > 0) : []
  let xp = 0
  let exDoneCount = 0

  for (const [name, exLog] of Object.entries(log.exercises)) {
    const done = (exLog.sets || []).filter(s => s?.done)
    if (!done.length) continue

    xp += done.length * 10

    const expected = getExpectedSets(log.dayIndex, name)
    if (expected > 0 && done.length >= expected) { xp += 25; exDoneCount++ }

    const weights = done.map(s => parseFloat(s.weight)).filter(w => !isNaN(w) && w > 0)
    if (weights.length) {
      const maxW = Math.max(...weights)
      const prevWts = prevLogs
        .filter(l => l.date !== log.date && l.exercises[name])
        .flatMap(l => (l.exercises[name].sets || []).filter(s => s?.done).map(s => parseFloat(s.weight)))
        .filter(w => !isNaN(w) && w > 0)
      const hMax = prevWts.length ? Math.max(...prevWts) : 0
      if (maxW > hMax && hMax > 0) xp += 100
    }
  }

  xp += 200 // always add session-complete bonus
  if (dayExes.length && exDoneCount >= dayExes.length) xp += 100

  return xp
}
