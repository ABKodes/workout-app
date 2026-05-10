'use client'
import { useState } from 'react'
import { Exercise, ExerciseLog } from '@/types'
import SetRow from './SetRow'

interface Props {
  exercise: Exercise
  todayLog: ExerciseLog | undefined
  prevLog: ExerciseLog | undefined
  onSetUpdate: (setIndex: number, data: { weight?: string; reps?: string; done?: boolean }) => void
  onSetDone: (restSeconds: number) => void
  onOpenOrm: (exercise: Exercise) => void
  onOpenPlates: (exercise: Exercise) => void
}

function OverloadBadge({ today, prev }: { today: ExerciseLog | undefined; prev: ExerciseLog | undefined }) {
  if (!today) return null
  const todayWeight = parseFloat(today.sets.find(s => s.weight)?.weight ?? '')
  const prevWeight = parseFloat(prev?.sets.find(s => s.weight)?.weight ?? '')
  if (isNaN(todayWeight)) return null

  if (isNaN(prevWeight)) {
    return <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1a0900] text-orange-400 border border-orange-900 font-bold">First session</span>
  }
  const diff = todayWeight - prevWeight
  if (diff > 0) return <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#0a2a12] text-green-400 border border-green-900 font-bold">↑ +{diff}kg PR!</span>
  if (diff < 0) return <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1a0505] text-red-400 border border-red-900 font-bold">↓ {diff}kg</span>
  return <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-gray-500 border border-[#2a2a2a] font-bold">= Same</span>
}

const setCount = (s: string): number => {
  const n = parseInt(s)
  return isNaN(n) ? 0 : n
}

export default function ExerciseCard({ exercise, todayLog, prevLog, onSetUpdate, onSetDone, onOpenOrm, onOpenPlates }: Props) {
  const [expanded, setExpanded] = useState(true)
  const numSets = setCount(exercise.sets)
  const isLoggable = numSets > 0

  return (
    <div className="bg-[#111] rounded-xl border border-[#1e1e1e] mb-3 overflow-hidden">
      <button
        className="w-full text-left px-4 pt-3 pb-2"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-bold text-white leading-snug">{exercise.name}</span>
              <OverloadBadge today={todayLog} prev={prevLog} />
            </div>
            <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{exercise.note}</p>
          </div>
          <span className="text-gray-600 text-xs mt-0.5 shrink-0">{expanded ? '▲' : '▼'}</span>
        </div>

        <div className="flex gap-1.5 mt-2 flex-wrap">
          {exercise.sets !== '—' && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#1a0900] text-orange-400 border border-orange-900/50 font-semibold">{exercise.sets} sets</span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#0f1520] text-slate-400 border border-slate-800 font-semibold">{exercise.reps}</span>
          {exercise.rpe !== '—' && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#150f20] text-violet-400 border border-violet-900/50 font-semibold">RPE {exercise.rpe}</span>
          )}
          {exercise.rest !== '—' && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#0a1a10] text-green-400 border border-green-900/50 font-semibold">{exercise.rest}</span>
          )}
        </div>
      </button>

      {expanded && isLoggable && (
        <div className="px-4 pb-3 border-t border-[#1e1e1e] pt-2">
          {Array.from({ length: numSets }, (_, i) => (
            <SetRow
              key={i}
              setIndex={i}
              setLog={todayLog?.sets[i]}
              prevSet={prevLog?.sets[i]}
              onUpdate={data => onSetUpdate(i, data)}
              onDone={() => onSetDone(exercise.restSeconds)}
            />
          ))}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onOpenOrm(exercise)}
              className="text-[10px] text-gray-600 hover:text-orange-400 transition-colors flex items-center gap-1"
            >
              🏋️ 1RM calc
            </button>
            <button
              onClick={() => onOpenPlates(exercise)}
              className="text-[10px] text-gray-600 hover:text-orange-400 transition-colors flex items-center gap-1"
            >
              🍽️ plates
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
