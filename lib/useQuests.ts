'use client'
import { useMemo, useEffect } from 'react'
import { SessionLog } from '@/types'
import { days } from '@/lib/data'

export interface Quest {
  id: string
  label: string
  xp: number
  complete: boolean
}

const GYM_DAYS    = [0, 1, 4]
const FOOTBALL_DAYS = [3, 5]

const QUEST_LABELS: Record<string, string> = {
  finish_session:    "Complete today's gym session",
  complete_football: 'Log a football session today',
  hit_pr:            'Hit a personal record today',
  no_skip:           'Complete every exercise',
  four_sets:         'Log 4+ sets on any exercise',
  bodyweight:        'Log your body weight today',
  maintain_streak:   'Have 2+ sessions this week',
}

const GYM_POOL      = ['finish_session', 'hit_pr', 'no_skip', 'four_sets', 'bodyweight']
const FOOTBALL_POOL = ['complete_football', 'bodyweight', 'maintain_streak']
const REST_POOL     = ['bodyweight', 'maintain_streak', 'finish_session']

function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 0
  for (const c of seed) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    h = (Math.imul(1664525, h) + 1013904223) | 0
    const j = Math.abs(h) % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function checkQuest(
  id: string,
  dayIndex: number,
  todayLog: SessionLog | null,
  allLogs: SessionLog[],
  hasBWToday: boolean,
): boolean {
  switch (id) {
    case 'finish_session':
    case 'complete_football':
      return todayLog?.completed ?? false

    case 'hit_pr': {
      if (!todayLog) return false
      for (const [name, exLog] of Object.entries(todayLog.exercises)) {
        const done = (exLog.sets || []).filter(s => s?.done)
        const todayWts = done.map(s => parseFloat(s.weight)).filter(w => !isNaN(w) && w > 0)
        if (!todayWts.length) continue
        const todayMax = Math.max(...todayWts)
        const prevWts = allLogs
          .filter(l => l.date !== todayLog.date && l.exercises[name])
          .flatMap(l => (l.exercises[name].sets || []).filter(s => s?.done).map(s => parseFloat(s.weight)))
          .filter(w => !isNaN(w) && w > 0)
        const hMax = prevWts.length ? Math.max(...prevWts) : 0
        if (todayMax > hMax && hMax > 0) return true
      }
      return false
    }

    case 'no_skip': {
      if (!todayLog) return false
      const day = days[dayIndex]
      if (!day) return false
      return day.sections.flatMap(s => s.rows)
        .filter(e => parseInt(e.sets) > 0)
        .every(e => {
          const exLog = todayLog.exercises[e.name]
          return exLog && (exLog.sets || []).filter(s => s?.done).length >= parseInt(e.sets)
        })
    }

    case 'four_sets':
      if (!todayLog) return false
      return Object.values(todayLog.exercises).some(
        exLog => (exLog.sets || []).filter(s => s?.done).length >= 4
      )

    case 'bodyweight':
      return hasBWToday

    case 'maintain_streak': {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - diff)
      const weekStartStr = weekStart.toISOString().slice(0, 10)
      return allLogs.filter(l => l.completed && l.date >= weekStartStr).length >= 2
    }

    default:
      return false
  }
}

interface QuestStorage { questIds: string[]; completedIds: string[] }

function loadStored(date: string): QuestStorage {
  try {
    const raw = localStorage.getItem(`quests_${date}`)
    return raw ? JSON.parse(raw) : { questIds: [], completedIds: [] }
  } catch { return { questIds: [], completedIds: [] } }
}

function saveStored(date: string, data: QuestStorage): void {
  try { localStorage.setItem(`quests_${date}`, JSON.stringify(data)) } catch { /* ignore */ }
}

export function useQuests(
  dayIndex: number,
  todayLog: SessionLog | null,
  allLogs: SessionLog[],
  hasBWToday = false,
) {
  const today = new Date().toISOString().slice(0, 10)

  const pool = GYM_DAYS.includes(dayIndex) ? GYM_POOL
    : FOOTBALL_DAYS.includes(dayIndex) ? FOOTBALL_POOL
    : REST_POOL

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questIds = useMemo<string[]>(() => {
    if (typeof window === 'undefined') return pool.slice(0, 3)
    const stored = loadStored(today)
    if (stored.questIds?.length === 3) return stored.questIds
    const selected = seededShuffle(pool, today + dayIndex).slice(0, 3)
    saveStored(today, { questIds: selected, completedIds: [] })
    return selected
  }, [today, dayIndex]) // pool changes with dayIndex, which is in deps

  const quests: Quest[] = useMemo(() => questIds.map(id => ({
    id,
    label: QUEST_LABELS[id] ?? id,
    xp: 150,
    complete: checkQuest(id, dayIndex, todayLog, allLogs, hasBWToday),
  })), [questIds, dayIndex, todayLog, allLogs, hasBWToday])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const completedIds = quests.filter(q => q.complete).map(q => q.id)
    const stored = loadStored(today)
    saveStored(today, { ...stored, questIds, completedIds })
  }, [quests, questIds, today])

  const questXP = quests.filter(q => q.complete).length * 150

  return { quests, questXP }
}
