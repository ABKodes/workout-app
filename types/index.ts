export interface Exercise {
  name: string
  note: string
  sets: string
  reps: string
  rpe: string
  rest: string
  restSeconds: number
}

export interface Section {
  head: string
  plyo?: boolean
  rows: Exercise[]
}

export type Badge = 'gym' | 'football' | 'cardio' | 'rest'

export interface Day {
  label: string
  emoji: string
  type: string
  badge: Badge
  title: string
  sub: string
  sections: Section[]
  tip: string
}

export interface SetLog {
  weight: string
  reps: string
  done: boolean
}

export interface ExerciseLog {
  sets: SetLog[]
}

export interface SessionLog {
  date: string
  dayIndex: number
  exercises: Record<string, ExerciseLog>
  sessionNote: string
  completed: boolean
  pendingSync: boolean
}

export interface BodyWeightEntry {
  date: string
  weight: number
  pendingSync: boolean
}
