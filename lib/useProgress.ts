'use client'
import { useMemo } from 'react'
import { SessionLog } from '@/types'

interface SessionPoint {
  date: string
  weight: number
  isPR: boolean
}

export function useProgress(exerciseName: string, allLogs: SessionLog[]) {
  const points = useMemo((): SessionPoint[] => {
    const byDate: Record<string, number> = {}

    for (const log of allLogs) {
      const exLog = log.exercises[exerciseName]
      if (!exLog) continue
      const weights = exLog.sets
        .filter(s => s.done && s.weight !== '')
        .map(s => parseFloat(s.weight))
        .filter(w => !isNaN(w))
      if (weights.length === 0) continue
      const max = Math.max(...weights)
      if (!byDate[log.date] || max > byDate[log.date]) {
        byDate[log.date] = max
      }
    }

    const sorted = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, weight]) => ({ date, weight, isPR: false }))

    let runningMax = 0
    for (const p of sorted) {
      if (p.weight > runningMax) {
        runningMax = p.weight
        p.isPR = true
      }
    }

    return sorted
  }, [exerciseName, allLogs])

  const prWeight = points.length > 0 ? Math.max(...points.map(p => p.weight)) : 0
  const prPoint = points.find(p => p.weight === prWeight && p.isPR)

  return { points, prWeight, prDate: prPoint?.date ?? null }
}
