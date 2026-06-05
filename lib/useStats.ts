'use client'
import { useMemo } from 'react'
import { SessionLog } from '@/types'
import { GYM_DAYS, FOOTBALL_DAYS } from '@/lib/constants'

function gymVolume(allLogs: SessionLog[]): number {
  let vol = 0
  allLogs.filter(l => GYM_DAYS.includes(l.dayIndex)).forEach(log => {
    Object.values(log.exercises).forEach(exLog => {
      ;(exLog.sets || []).filter(s => s?.done).forEach(s => {
        const w = parseFloat(s.weight)
        const r = parseInt(s.reps)
        if (!isNaN(w) && !isNaN(r) && w > 0) vol += w * r
      })
    })
  })
  return vol
}

function logScale(val: number, maxVal: number): number {
  if (val <= 0) return 0
  return Math.min(100, (Math.log10(val + 1) / Math.log10(maxVal + 1)) * 100)
}

function getConsistency(allLogs: SessionLog[]): number {
  const now = new Date()
  const weekCounts: Record<number, number> = {}
  allLogs.filter(l => l.completed && GYM_DAYS.includes(l.dayIndex)).forEach(log => {
    const d = new Date(log.date)
    const weeksAgo = Math.round((now.getTime() - d.getTime()) / (7 * 24 * 3600 * 1000))
    if (weeksAgo > 12) return
    weekCounts[weeksAgo] = (weekCounts[weeksAgo] || 0) + 1
  })
  const total = Object.values(weekCounts).reduce((a, b) => a + b, 0)
  return Math.min(100, (total / 12 / 3) * 100)
}

export interface Stats {
  strength: number
  endurance: number
  consistency: number
  power: number
  classTitle: string
}

export function computeStats(allLogs: SessionLog[]): Stats {
  const vol = gymVolume(allLogs)
  const strength = Math.round(logScale(vol, 100000))

  const footballSessions = allLogs.filter(l => l.completed && FOOTBALL_DAYS.includes(l.dayIndex)).length
  const endurance = Math.round(Math.min(100, (footballSessions / 50) * 100))

  const consistency = Math.round(getConsistency(allLogs))

  const power = Math.round(strength * 0.4 + endurance * 0.2 + consistency * 0.4)

  let classTitle = 'All-Rounder'
  if (strength >= endurance + 10 && strength >= consistency + 10) classTitle = 'Iron Warrior'
  else if (endurance >= strength + 10 && endurance >= consistency + 10) classTitle = 'Field Commander'
  else if (consistency >= strength + 10 && consistency >= endurance + 10) classTitle = 'Iron Will Guardian'

  return { strength, endurance, consistency, power, classTitle }
}

export function useStats(allLogs: SessionLog[]): Stats {
  return useMemo(() => computeStats(allLogs), [allLogs])
}
