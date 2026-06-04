import { SessionLog } from '@/types'

export interface Achievement {
  id: string
  emoji: string
  name: string
  desc: string
  tier: 'bronze' | 'silver' | 'gold' | 'diamond'
}

export const ACHIEVEMENTS: Achievement[] = [
  // Sessions
  { id: 'first_session',  emoji: '🎯', name: 'First Rep',        desc: 'Log your very first workout',            tier: 'bronze'  },
  { id: 'sessions_10',    emoji: '💪', name: '10 Sessions',       desc: 'Complete 10 training sessions',          tier: 'bronze'  },
  { id: 'sessions_25',    emoji: '🏋️', name: '25 Sessions',       desc: 'Complete 25 training sessions',          tier: 'silver'  },
  { id: 'sessions_50',    emoji: '🦾', name: '50 Sessions',       desc: 'Complete 50 training sessions',          tier: 'gold'    },
  { id: 'sessions_100',   emoji: '🏆', name: 'Century',           desc: 'Complete 100 training sessions',         tier: 'diamond' },
  // Streaks
  { id: 'streak_3',       emoji: '🔥', name: 'On Fire',           desc: '3 active weeks in a row',                tier: 'bronze'  },
  { id: 'streak_5',       emoji: '⚡', name: 'Unstoppable',       desc: '5 active weeks in a row',                tier: 'silver'  },
  { id: 'streak_10',      emoji: '💎', name: 'Iron Will',         desc: '10 active weeks in a row',               tier: 'gold'    },
  // Volume
  { id: 'volume_10k',     emoji: '📦', name: '10K Club',          desc: 'Lift 10,000 kg of total volume',         tier: 'bronze'  },
  { id: 'volume_50k',     emoji: '🚀', name: '50K Club',          desc: 'Lift 50,000 kg of total volume',         tier: 'silver'  },
  { id: 'volume_100k',    emoji: '🌕', name: '100K Club',         desc: 'Lift 100,000 kg of total volume',        tier: 'gold'    },
  // PRs
  { id: 'first_pr',       emoji: '⭐', name: 'First PR',          desc: 'Hit your first personal record',         tier: 'bronze'  },
  { id: 'prs_10',         emoji: '🌟', name: 'PR Machine',        desc: 'Hit 10 personal records total',          tier: 'silver'  },
  { id: 'prs_25',         emoji: '💫', name: 'PR Legend',         desc: 'Hit 25 personal records total',          tier: 'gold'    },
  // Football
  { id: 'first_football', emoji: '⚽', name: 'On the Pitch',     desc: 'Log a football session',                  tier: 'bronze'  },
  { id: 'football_10',    emoji: '🏃', name: 'Striker',           desc: 'Log 10 football sessions',               tier: 'silver'  },
  // Hat trick
  { id: 'hat_trick',      emoji: '🎩', name: 'Hat Trick',         desc: '3 gym sessions in a single week',        tier: 'bronze'  },
  // Weight loss
  { id: 'lost_1kg',       emoji: '📉', name: 'First Kilo',        desc: 'Lose your first kilogram',               tier: 'bronze'  },
  { id: 'lost_5kg',       emoji: '🔽', name: '5 Kilos Down',      desc: 'Lose 5 kg since you started',            tier: 'silver'  },
]

// ── Rank system ────────────────────────────────────────────────────────
export const RANKS = [
  { name: 'Youth Player', minSessions: 0,   emoji: '🌱', color: '#6b7280' },
  { name: 'Semi-Pro',     minSessions: 5,   emoji: '⚡', color: '#f59e0b' },
  { name: 'Pro',          minSessions: 15,  emoji: '🔥', color: '#f97316' },
  { name: 'First Team',   minSessions: 30,  emoji: '💪', color: '#8b5cf6' },
  { name: 'Captain',      minSessions: 50,  emoji: '🦾', color: '#3b82f6' },
  { name: 'Legend',       minSessions: 100, emoji: '🏆', color: '#fbbf24' },
]

export function getRank(sessions: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (sessions >= RANKS[i].minSessions) return RANKS[i]
  }
  return RANKS[0]
}

export function getNextRank(sessions: number) {
  return RANKS.find(r => r.minSessions > sessions) ?? null
}

// ── Compute which achievements are unlocked from raw log data ──────────
export function computeUnlocked(
  allLogs: SessionLog[],
  bwEntries: { date: string; weight: number }[] = [],
): Set<string> {
  const unlocked = new Set<string>()
  const completed = allLogs.filter(l => l.completed)

  // Sessions
  const gymDays = [0, 1, 4]       // Mon, Tue, Fri
  const footballDays = [3, 5]     // Thu, Sat
  const gymSessions = completed.filter(l => gymDays.includes(l.dayIndex))
  const footballSessions = completed.filter(l => footballDays.includes(l.dayIndex))

  if (completed.length >= 1)   unlocked.add('first_session')
  if (completed.length >= 10)  unlocked.add('sessions_10')
  if (completed.length >= 25)  unlocked.add('sessions_25')
  if (completed.length >= 50)  unlocked.add('sessions_50')
  if (completed.length >= 100) unlocked.add('sessions_100')

  // Football
  if (footballSessions.length >= 1)  unlocked.add('first_football')
  if (footballSessions.length >= 10) unlocked.add('football_10')

  // Hat trick — 3 gym sessions in one week
  const gymByWeek: Record<string, number> = {}
  gymSessions.forEach(log => {
    const d = new Date(log.date)
    const day = d.getDay()
    const diff = day === 0 ? 6 : day - 1
    d.setDate(d.getDate() - diff)
    const weekKey = d.toISOString().slice(0, 10)
    gymByWeek[weekKey] = (gymByWeek[weekKey] || 0) + 1
  })
  if (Object.values(gymByWeek).some(c => c >= 3)) unlocked.add('hat_trick')

  // Volume
  let totalVolume = 0
  allLogs.forEach(log => {
    Object.values(log.exercises).forEach(exLog => {
      ;(exLog.sets || []).filter(s => s?.done).forEach(s => {
        const w = parseFloat(s.weight)
        const r = parseInt(s.reps)
        if (!isNaN(w) && !isNaN(r) && w > 0) totalVolume += w * r
      })
    })
  })
  if (totalVolume >= 10000)  unlocked.add('volume_10k')
  if (totalVolume >= 50000)  unlocked.add('volume_50k')
  if (totalVolume >= 100000) unlocked.add('volume_100k')

  // PRs — go through logs in date order, track running max per exercise
  const runningMax: Record<string, number> = {}
  let totalPRs = 0
  const sorted = [...allLogs].sort((a, b) => a.date.localeCompare(b.date))
  sorted.forEach(log => {
    Object.entries(log.exercises).forEach(([name, exLog]) => {
      const weights = (exLog.sets || [])
        .filter(s => s?.done)
        .map(s => parseFloat(s.weight))
        .filter(w => !isNaN(w) && w > 0)
      if (weights.length === 0) return
      const sessionMax = Math.max(...weights)
      if (runningMax[name] !== undefined && sessionMax > runningMax[name]) {
        totalPRs++
      }
      if (runningMax[name] === undefined || sessionMax > runningMax[name]) {
        runningMax[name] = sessionMax
      }
    })
  })
  if (totalPRs >= 1)  unlocked.add('first_pr')
  if (totalPRs >= 10) unlocked.add('prs_10')
  if (totalPRs >= 25) unlocked.add('prs_25')

  // Streaks (week-based: weeks with >= 3 sessions)
  const weekStreak = computeMaxWeekStreak(allLogs)
  if (weekStreak >= 3)  unlocked.add('streak_3')
  if (weekStreak >= 5)  unlocked.add('streak_5')
  if (weekStreak >= 10) unlocked.add('streak_10')

  // Weight loss
  if (bwEntries.length >= 2) {
    const sorted2 = [...bwEntries].sort((a, b) => a.date.localeCompare(b.date))
    const lost = sorted2[0].weight - sorted2[sorted2.length - 1].weight
    if (lost >= 1) unlocked.add('lost_1kg')
    if (lost >= 5) unlocked.add('lost_5kg')
  }

  return unlocked
}

function computeMaxWeekStreak(allLogs: SessionLog[]): number {
  // Build a set of week-start dates that have >= 3 completed sessions
  const weekCounts: Record<string, number> = {}
  allLogs.filter(l => l.completed).forEach(log => {
    const d = new Date(log.date)
    const day = d.getDay()
    const diff = day === 0 ? 6 : day - 1
    d.setDate(d.getDate() - diff)
    const key = d.toISOString().slice(0, 10)
    weekCounts[key] = (weekCounts[key] || 0) + 1
  })

  const activeWeeks = new Set(
    Object.entries(weekCounts).filter(([, c]) => c >= 3).map(([k]) => k)
  )
  if (activeWeeks.size === 0) return 0

  // Find max consecutive-week run
  const dates = [...activeWeeks].sort()
  let max = 1, cur = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (curr.getTime() - prev.getTime()) / (7 * 24 * 3600 * 1000)
    if (Math.round(diff) === 1) { cur++; max = Math.max(max, cur) }
    else cur = 1
  }
  return max
}

// Compute total volume from logs (used for display)
export function computeTotalVolume(allLogs: SessionLog[]): number {
  let total = 0
  allLogs.forEach(log => {
    Object.values(log.exercises).forEach(exLog => {
      ;(exLog.sets || []).filter(s => s?.done).forEach(s => {
        const w = parseFloat(s.weight)
        const r = parseInt(s.reps)
        if (!isNaN(w) && !isNaN(r) && w > 0) total += w * r
      })
    })
  })
  return Math.round(total)
}