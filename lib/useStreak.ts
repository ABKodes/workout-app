'use client'
import { SessionLog } from '@/types'

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Monday = 0 in our scheme; JS getDay() Sunday=0, Mon=1...
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function useStreak(allLogs: SessionLog[]) {
  const now = new Date()
  const weekStart = startOfWeek(now)

  // 7 dots: Mon(0)...Sun(6) of current week
  const weekDots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const ds = dateStr(d)
    const completed = allLogs.some(l => l.date === ds && l.completed)
    return { date: ds, completed }
  })

  // Week streak: consecutive weeks with >= 3 completed sessions
  function countWeekStreak(): number {
    let streak = 0
    const w = new Date(weekStart)
    for (let attempt = 0; attempt < 52; attempt++) {
      const start = new Date(w)
      start.setDate(w.getDate() - attempt * 7)
      const end = new Date(start)
      end.setDate(start.getDate() + 7)
      const sds = dateStr(start)
      const eds = dateStr(end)
      const count = allLogs.filter(l => l.date >= sds && l.date < eds && l.completed).length
      if (count >= 3) streak++
      else if (attempt > 0) break
    }
    return streak
  }

  const weekStreak = countWeekStreak()
  const sessionsThisWeek = weekDots.filter(d => d.completed).length

  return { weekDots, weekStreak, sessionsThisWeek }
}
