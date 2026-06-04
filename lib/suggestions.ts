import { SessionLog } from '@/types'

const RATIOS: Record<string, number> = {
  // Push
  'DB Lateral Raise':               0.12,  // 74kg → ~9kg
  'Low Incline DB Press':           0.28,  // 74kg → ~20kg
  'DB Flye w/ Integrated Partials': 0.14,  // 74kg → ~10kg
  'DB Skull Crusher':               0.14,  // 74kg → ~10kg
  'Close-Grip Assisted Dip':        0.14,  // assistance counterweight
  'Plate-Weighted Crunch':          0.08,  // 74kg → ~6kg plate
  // Pull
  'Overhand Lat Pulldown':          0.50,  // 74kg → ~37kg
  'DB RDL':                         0.32,  // 74kg → ~24kg
  'Helms Row':                      0.24,  // 74kg → ~18kg
  'DB Lat Pullover':                0.18,  // 74kg → ~13kg
  'Hammer Curl':                    0.16,  // 74kg → ~12kg
  'Bent-Over Reverse DB Flye':      0.10,  // 74kg → ~7.5kg
  // Legs
  'Hack Squat / Goblet Squat':      0.35,  // 74kg → ~26kg
  'Standing Calf Raise':            0.55,  // 74kg → ~40kg
  'Nordic Ham Curl':                0,     // bodyweight
  'Copenhagen Hip Adduction':       0,     // bodyweight
  'Reverse Nordic':                 0,     // bodyweight
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
  const doneSets = (exLog.sets || []).filter(s => s?.done)
  if (doneSets.length === 0) return null

  const weights = doneSets.map(s => parseFloat(s.weight)).filter(w => !isNaN(w) && w > 0)
  if (weights.length === 0) return null
  const lastWeight = Math.max(...weights)

  const nums = targetReps.match(/\d+/g)
  if (!nums) return null
  const upperReps = parseInt(nums[nums.length - 1])

  const anyNotDone = (exLog.sets || []).some(s => !s?.done)
  if (anyNotDone) {
    return { weight: lastWeight, badge: 'same' }
  }

  const allAtOrAboveTop = doneSets.every(s => parseInt(s.reps) >= upperReps)
  if (allAtOrAboveTop) {
    return { weight: Math.round((lastWeight + 2.5) / 2.5) * 2.5, badge: 'up' }
  }

  return { weight: lastWeight, badge: null }
}