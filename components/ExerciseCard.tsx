'use client'
import { useState } from 'react'
import { Exercise, ExerciseLog, SessionLog } from '@/types'
import { useProgress } from '@/lib/useProgress'
import { useBodyWeight } from '@/lib/useBodyWeight'
import { getStartingWeight, getProgressionSuggestion } from '@/lib/suggestions'
import SetRow from './SetRow'
import PrCelebration from './PrCelebration'
import WarmupCalc from './WarmupCalc'
import ExerciseDemo from './ExerciseDemo'

interface Props {
  exercise: Exercise
  activeName: string
  todayLog: ExerciseLog | undefined
  prevLog: ExerciseLog | undefined
  allLogs: SessionLog[]
  isSwapped: boolean
  onSwap?: () => void
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
    return <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#12002a] text-violet-400 border border-violet-900 font-bold">First session</span>
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

function parseNote(note: string): { cleanNote: string; subName: string | null } {
  const match = note.match(/^(.*?)\.\s*Sub:\s*(.+)$/)
  if (match) return { cleanNote: match[1], subName: match[2].trim() }
  return { cleanNote: note, subName: null }
}

export default function ExerciseCard({
  exercise, activeName, todayLog, prevLog, allLogs,
  isSwapped, onSwap,
  onSetUpdate, onSetDone, onOpenOrm, onOpenPlates,
}: Props) {
  const [expanded, setExpanded] = useState(true)
  const [showWarmup, setShowWarmup] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [prWeight, setPrWeight] = useState<number | null>(null)

  const { prWeight: historicPR } = useProgress(activeName, allLogs)
  const { entries: bwEntries } = useBodyWeight()
  const numSets = setCount(exercise.sets)
  const isLoggable = numSets > 0

  const { cleanNote, subName } = parseNote(exercise.note)

  const todayStr = new Date().toISOString().slice(0, 10)
  const latestBW = bwEntries.length > 0 ? bwEntries[bwEntries.length - 1].weight : null
  const hasHistory = allLogs.some(l => l.date !== todayStr && l.exercises[activeName]?.sets.some(s => s.done))

  let suggestionWeight: string | undefined
  let suggestionBadge: 'up' | 'same' | 'start' | null = null

  if (hasHistory) {
    const prog = getProgressionSuggestion(activeName, allLogs, exercise.reps, todayStr)
    if (prog) {
      suggestionWeight = String(prog.weight)
      suggestionBadge = prog.badge === 'up' ? 'up' : prog.badge === 'same' ? 'same' : null
    }
  } else if (latestBW !== null) {
    const sw = getStartingWeight(activeName, latestBW)
    if (sw !== null) {
      suggestionWeight = String(sw)
      suggestionBadge = 'start'
    }
  }

  const firstSetDone = todayLog?.sets.some(s => s.done) ?? false
  const showBadge = !firstSetDone && suggestionBadge !== null

  const handleSetUpdate = (setIndex: number, data: { weight?: string; reps?: string; done?: boolean }) => {
    if (data.weight !== undefined) {
      const w = parseFloat(data.weight)
      if (!isNaN(w) && w > historicPR && historicPR > 0) {
        setPrWeight(w)
      }
    }
    onSetUpdate(setIndex, data)
  }

  const lastWeight = prevLog?.sets.find(s => s.weight)
    ? parseFloat(prevLog.sets.find(s => s.weight)!.weight)
    : 0

  return (
    <div className="bg-[#111] rounded-xl border border-[#1e1e1e] mb-3 overflow-hidden">
      {prWeight !== null && (
        <PrCelebration weight={prWeight} onDismiss={() => setPrWeight(null)} />
      )}
      {showWarmup && (
        <WarmupCalc defaultWeight={lastWeight} onClose={() => setShowWarmup(false)} />
      )}
      {showDemo && (
        <ExerciseDemo name={activeName} cleanNote={cleanNote} onClose={() => setShowDemo(false)} />
      )}

      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start gap-2">
          {/* Tapping name/note area collapses the card */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(e => !e)}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-bold text-white leading-snug">{activeName}</span>
              {showBadge && suggestionBadge === 'up' && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#0a2a12] text-green-400 border border-green-900 font-bold">↑ +2.5kg</span>
              )}
              {showBadge && suggestionBadge === 'same' && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-gray-500 border border-[#2a2a2a] font-bold">→ same weight</span>
              )}
              {showBadge && suggestionBadge === 'start' && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#12002a] text-violet-400 border border-violet-900 font-bold">💡 suggested</span>
              )}
              {!showBadge && <OverloadBadge today={todayLog} prev={prevLog} />}
            </div>
            <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{cleanNote}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <button
              onClick={() => setShowDemo(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#12002a] border border-violet-900/60 text-violet-400 text-[10px] font-bold active:bg-violet-900/40 transition-colors"
            >
              ▶ demo
            </button>
            <button onClick={() => setExpanded(e => !e)} className="text-gray-600 text-xs">
              {expanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        <div className="flex gap-1.5 mt-2 flex-wrap" onClick={() => setExpanded(e => !e)}>
          {exercise.sets !== '—' && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#12002a] text-violet-400 border border-violet-900/50 font-semibold">{exercise.sets} sets</span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#0f1520] text-slate-400 border border-slate-800 font-semibold">{exercise.reps}</span>
          {exercise.rpe !== '—' && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#150f20] text-violet-400 border border-violet-900/50 font-semibold">RPE {exercise.rpe}</span>
          )}
          {exercise.rest !== '—' && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#0a1a10] text-green-400 border border-green-900/50 font-semibold">{exercise.rest}</span>
          )}
        </div>
      </div>

      {subName && onSwap && (
        <div className="px-4 pb-2">
          <button
            onClick={e => { e.stopPropagation(); onSwap() }}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
              isSwapped
                ? 'bg-violet-900/30 border-violet-700/60 text-violet-400'
                : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-500 hover:border-violet-700/60 hover:text-violet-400'
            }`}
          >
            {isSwapped ? `↩ Back: ${exercise.name}` : `↔ Sub: ${subName}`}
          </button>
        </div>
      )}

      {expanded && isLoggable && (
        <div className="px-4 pb-3 border-t border-[#1e1e1e] pt-2">
          {(() => {
            const currentSetIndex = todayLog
              ? (todayLog.sets.findIndex(s => !s.done) === -1 ? numSets : todayLog.sets.findIndex(s => !s.done))
              : 0
            const allDone = currentSetIndex >= numSets
            return (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Sets</span>
                  {!allDone && (
                    <span className="text-[10px] font-bold text-violet-400">
                      → Set {currentSetIndex + 1} of {numSets}
                    </span>
                  )}
                  {allDone && (
                    <span className="text-[10px] font-bold text-green-400">✓ All sets done</span>
                  )}
                </div>
                {Array.from({ length: numSets }, (_, i) => (
                  <SetRow
                    key={i}
                    setIndex={i}
                    exercise={exercise}
                    setLog={todayLog?.sets[i]}
                    prevSet={prevLog?.sets[i]}
                    currentPrevSet={i > 0 ? todayLog?.sets[i - 1] : undefined}
                    isActive={i === currentSetIndex}
                    suggestionWeight={suggestionWeight}
                    onUpdate={data => handleSetUpdate(i, data)}
                    onDone={() => onSetDone(exercise.restSeconds)}
                  />
                ))}
              </>
            )
          })()}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onOpenOrm(exercise)}
              className="text-[10px] text-gray-600 hover:text-violet-400 transition-colors flex items-center gap-1"
            >
              🏋️ 1RM calc
            </button>
            <button
              onClick={() => onOpenPlates(exercise)}
              className="text-[10px] text-gray-600 hover:text-violet-400 transition-colors flex items-center gap-1"
            >
              🍽️ plates
            </button>
            {exercise.restSeconds > 0 && (
              <button
                onClick={() => setShowWarmup(true)}
                className="text-[10px] text-gray-600 hover:text-violet-400 transition-colors flex items-center gap-1"
              >
                🔥 warm-up
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
