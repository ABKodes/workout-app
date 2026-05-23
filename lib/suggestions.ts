import { SessionLog } from '@/types'

const RATIOS: Record<string, number> = {
  'DB Lateral Raise': 0.05,
  'Low Incline DB Press': 0.18,
  'DB Flye w/ Integrated Partials': 0.08,
  'DB Skull Crusher': 0.08,
  'Close-Grip Assisted Dip': 0.10,
  'Plate-Weighted Crunch': 0.06,
  'Overhand Lat Pulldown': 0.45,
  'DB RDL': 0.22,
  'Helms Row': 0.18,
  'DB Lat Pullover': 0.12,
  'Hammer Curl': 0.09,
  'Bent-Over Reverse DB Flye': 0.06,
  'Hack Squat / Goblet Squat': 0.30,
  'Standing Calf Raise': 0.55,
}

export function getStartingWeight(exerciseName: string, bodyweightKg: number): number | null {
  const ratio = RATIOS[exerciseName]
  if (ratio === undefined) return null
  return Math.round((bodyweightKg * ratio) / 2.5) * 2.5
}

export type ProgressionBadge = 'up' | 'same' | null

export interface ProgressionResult {
  weight: number
  badge: ProgressionBadge
}

export function getProgressionSuggestion(
  exerciseName: string,
  allLogs: SessionLog[],
  targetReps: string,
  excludeDate?: string
): ProgressionResult | null {
  const sessionsWithEx = [...allLogs]
    .filter(l => (!excludeDate || l.date !== excludeDate) && l.exercises[exerciseName])
    .sort((a, b) => b.date.localeCompare(a.date))

  if (sessionsWithEx.length === 0) return null

  const lastSession = sessionsWithEx[0]
  const exLog = lastSession.exercises[exerciseName]
  const doneSets = exLog.sets.filter(s => s.done)
  if (doneSets.length === 0) return null

  const weights = doneSets.map(s => parseFloat(s.weight)).filter(w => !isNaN(w) && w > 0)
  if (weights.length === 0) return null
  const lastWeight = Math.max(...weights)

  const nums = targetReps.match(/\d+/g)
  if (!nums) return null
  const upperReps = parseInt(nums[nums.length - 1])

  const anyNotDone = exLog.sets.some(s => !s.done)
  if (anyNotDone) {
    return { weight: lastWeight, badge: 'same' }
  }

  const allAtOrAboveTop = doneSets.every(s => parseInt(s.reps) >= upperReps)
  if (allAtOrAboveTop) {
    return { weight: Math.round((lastWeight + 2.5) / 2.5) * 2.5, badge: 'up' }
  }

  return { weight: lastWeight, badge: null }
}