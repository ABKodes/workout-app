'use client'
import { useState, useCallback } from 'react'
import { Day, Exercise, ExerciseLog, SessionLog, SetLog } from '@/types'
import { useTimer } from '@/lib/useTimer'
import { useProgress } from '@/lib/useProgress'
import { useSubstitutions } from '@/lib/useSubstitutions'
import { useBodyWeight } from '@/lib/useBodyWeight'
import { getStartingWeight, getProgressionSuggestion } from '@/lib/suggestions'
import PrCelebration from './PrCelebration'
import DrumPicker from './DrumPicker'
import ExerciseDemo from './ExerciseDemo'

const WEIGHTS = Array.from({ length: 81 }, (_, i) => String(Math.round(i * 2.5 * 10) / 10))
const REPS = Array.from({ length: 30 }, (_, i) => String(i + 1))
function nearest(values: string[], val: string): string {
  const n = parseFloat(val)
  if (isNaN(n)) return values[0]
  return values.reduce((best, v) => Math.abs(parseFloat(v) - n) < Math.abs(parseFloat(best) - n) ? v : best)
}

interface Props {
  day: Day
  dayIndex: number
  todayLog: SessionLog | undefined
  prevLog: SessionLog | undefined
  allLogs: SessionLog[]
  onLogSet: (exerciseName: string, setIndex: number, data: Partial<SetLog>) => void
  onSetNote: (note: string) => void
  onFinish: () => void
  onExit: () => void
}

function defaultReps(reps: string): string {
  const nums = reps.match(/\d+/g)
  return nums ? nums[0] : '8'
}

function upperReps(reps: string): number {
  const nums = reps.match(/\d+/g)
  if (!nums) return 0
  return parseInt(nums[nums.length - 1])
}

function parseNote(note: string): { cleanNote: string; subName: string | null } {
  const match = note.match(/^(.*?)\.\s*Sub:\s*(.+)$/)
  if (match) return { cleanNote: match[1], subName: match[2].trim() }
  return { cleanNote: note, subName: null }
}

function RestCountdown({ seconds, onDone, nextLabel }: {
  seconds: number
  onDone: () => void
  nextLabel: string
}) {
  const { fmt, running, start, skip, addTime } = useTimer()

  useState(() => {
    start(seconds, onDone)
  })

  const circumference = 2 * Math.PI * 44
  const remaining = parseInt(fmt.split(':')[0]) * 60 + parseInt(fmt.split(':')[1])
  const progress = seconds > 0 ? (seconds - remaining) / seconds : 1

  return (
    <div className="flex flex-col items-center flex-1 justify-center gap-4">
      <p className="text-[11px] text-gray-600 uppercase tracking-widest font-bold">Rest</p>
      <div className="relative">
        <svg width="108" height="108" className="-rotate-90">
          <circle cx="54" cy="54" r="44" fill="none" stroke="#1e1e1e" strokeWidth="6" />
          <circle
            cx="54" cy="54" r="44" fill="none"
            stroke="#8b5cf6" strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black text-white">{running ? fmt : '✓'}</span>
        </div>
      </div>
      <p className="text-[11px] text-gray-500">Next: {nextLabel}</p>
      <div className="flex gap-3">
        <button
          onClick={() => addTime(30)}
          className="px-5 py-2 rounded-xl bg-[#1a1a1a] text-gray-400 text-sm font-semibold border border-[#2a2a2a]"
        >+30s</button>
        <button
          onClick={() => { skip(); onDone() }}
          className="px-5 py-2 rounded-xl bg-[#12002a] text-violet-400 text-sm font-semibold border border-violet-900"
        >Skip</button>
      </div>
    </div>
  )
}

function PRDetector({ exerciseName, weight, allLogs }: {
  exerciseName: string
  weight: string
  allLogs: SessionLog[]
}) {
  const { prWeight } = useProgress(exerciseName, allLogs)
  const [shown, setShown] = useState(false)
  const w = parseFloat(weight)
  if (!shown && !isNaN(w) && w > prWeight && prWeight > 0) {
    setShown(true)
    return <PrCelebration weight={w} onDismiss={() => setShown(false)} />
  }
  return null
}

export default function GuidedSession({ day, dayIndex, todayLog, prevLog, allLogs, onLogSet, onSetNote, onFinish, onExit }: Props) {
  const exercises = day.sections.flatMap(s => s.rows).filter(e => parseInt(e.sets) > 0)
  const { getActiveName, isSwapped, toggleSwap } = useSubstitutions(dayIndex)
  const { entries: bwEntries } = useBodyWeight()

  const todayStr = new Date().toISOString().slice(0, 10)
  const latestBW = bwEntries.length > 0 ? bwEntries[bwEntries.length - 1].weight : null

  const getSuggestionWeight = useCallback((name: string, reps: string): string => {
    const hasHistory = allLogs.some(l => l.date !== todayStr && l.exercises[name]?.sets.some(s => s.done))
    if (hasHistory) {
      const prog = getProgressionSuggestion(name, allLogs, reps, todayStr)
      if (prog) return String(prog.weight)
    } else if (latestBW !== null) {
      const sw = getStartingWeight(name, latestBW)
      if (sw !== null) return String(sw)
    }
    return '20'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestBW])

  const totalSets = exercises.reduce((sum, e) => sum + parseInt(e.sets), 0)

  const [exIdx, setExIdx] = useState(0)
  const [setIdx, setSetIdx] = useState(0)
  const [resting, setResting] = useState(false)
  const [done, setDone] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [note, setNote] = useState(todayLog?.sessionNote ?? '')
  const [prWeight, setPrWeight] = useState<number | null>(null)

  const ex: Exercise = exercises[exIdx]
  const numSets = ex ? parseInt(ex.sets) : 0
  const activeName = ex ? getActiveName(ex.name) : ''
  const { cleanNote, subName } = ex ? parseNote(ex.note) : { cleanNote: '', subName: null }

  const exLog: ExerciseLog | undefined = todayLog?.exercises[activeName]
  const prevExLog: ExerciseLog | undefined = prevLog?.exercises[activeName]
  const prevSet: SetLog | undefined = prevExLog?.sets[setIdx]
  const currentSet: SetLog | undefined = exLog?.sets[setIdx]
  // Prefer current session's previous set for "same as" — fall back to last session
  const currentPrevSet: SetLog | undefined = setIdx > 0 ? exLog?.sets[setIdx - 1] : undefined
  const sameSource = currentPrevSet?.done ? currentPrevSet : (prevSet ?? null)
  const sameLabel = currentPrevSet?.done ? `S${setIdx}` : 'Last time'

  const [localWeight, setLocalWeight] = useState(
    currentSet?.weight ?? sameSource?.weight ?? getSuggestionWeight(activeName, ex?.reps ?? '8')
  )

  // Suggestion badge for the current exercise (hides once any set is logged today)
  const anySetDoneToday = exLog?.sets.some(s => s.done) ?? false
  const suggBadge = (() => {
    if (anySetDoneToday) return null
    const hasHistory = allLogs.some(l => l.date !== todayStr && l.exercises[activeName]?.sets.some(s => s.done))
    if (hasHistory) {
      const prog = getProgressionSuggestion(activeName, allLogs, ex?.reps ?? '8', todayStr)
      return prog?.badge === 'up' ? 'up' : prog?.badge === 'same' ? 'same' : null
    }
    if (latestBW !== null && getStartingWeight(activeName, latestBW) !== null) return 'start'
    return null
  })()
  const [localReps, setLocalReps] = useState(
    currentSet?.reps ?? sameSource?.reps ?? defaultReps(ex?.reps ?? '8')
  )

  const doneSets = exercises.reduce((sum, e) => {
    const log = todayLog?.exercises[getActiveName(e.name)]
    return sum + (log?.sets.filter(s => s.done).length ?? 0)
  }, 0)

  const nextLabel = useCallback((): string => {
    if (setIdx < numSets - 1) return `Set ${setIdx + 2} of ${activeName}`
    if (exIdx < exercises.length - 1) return getActiveName(exercises[exIdx + 1].name)
    return 'Session complete!'
  }, [setIdx, numSets, exIdx, exercises, activeName, getActiveName])

  const advanceNext = useCallback(() => {
    setResting(false)
    if (setIdx < numSets - 1) {
      const nextSetIdx = setIdx + 1
      setSetIdx(nextSetIdx)
      const nextSet = exLog?.sets[nextSetIdx]
      const nextPrev = prevExLog?.sets[nextSetIdx]
      // Prefer current session's previous set for next set's default weight
      const nextCurrentPrev = exLog?.sets[nextSetIdx - 1]
      const nextSameSource = nextCurrentPrev?.done ? nextCurrentPrev : (nextPrev ?? null)
      setLocalWeight(nextSet?.weight ?? nextSameSource?.weight ?? localWeight)
      setLocalReps(nextSet?.reps ?? nextSameSource?.reps ?? defaultReps(ex.reps))
    } else if (exIdx < exercises.length - 1) {
      const nextEx = exercises[exIdx + 1]
      const nextActiveName = getActiveName(nextEx.name)
      const nextExLog = todayLog?.exercises[nextActiveName]
      const nextPrevLog = prevLog?.exercises[nextActiveName]
      setExIdx(i => i + 1)
      setSetIdx(0)
      setLocalWeight(nextExLog?.sets[0]?.weight ?? nextPrevLog?.sets[0]?.weight ?? getSuggestionWeight(nextActiveName, nextEx.reps))
      setLocalReps(nextExLog?.sets[0]?.reps ?? nextPrevLog?.sets[0]?.reps ?? defaultReps(nextEx.reps))
    } else {
      setDone(true)
    }
  }, [setIdx, numSets, exIdx, exercises, exLog, prevExLog, todayLog, prevLog, localWeight, ex, getActiveName, getSuggestionWeight])

  const handleDone = useCallback(() => {
    onLogSet(activeName, setIdx, { weight: localWeight, reps: localReps, done: true })

    // PR check
    const allExLogs = allLogs.flatMap(l => {
      const el = l.exercises[activeName]
      return el ? el.sets.filter(s => s.done && s.weight !== '').map(s => parseFloat(s.weight)) : []
    }).filter(w => !isNaN(w))
    const histMax = allExLogs.length > 0 ? Math.max(...allExLogs) : 0
    const newW = parseFloat(localWeight)
    if (!isNaN(newW) && newW > histMax && histMax > 0) setPrWeight(newW)

    if (ex.restSeconds > 0) setResting(true)
    else advanceNext()
  }, [activeName, setIdx, localWeight, localReps, onLogSet, allLogs, advanceNext, ex])

  const handleSameAs = useCallback(() => {
    if (!sameSource) return
    setLocalWeight(sameSource.weight)
    setLocalReps(sameSource.reps)
    onLogSet(activeName, setIdx, { weight: sameSource.weight, reps: sameSource.reps, done: true })
    if (ex.restSeconds > 0) setResting(true)
    else advanceNext()
  }, [sameSource, activeName, setIdx, onLogSet, advanceNext, ex])

  const handleFinish = () => {
    onSetNote(note)
    onFinish()
  }

  // Auto-progression tips
  const tips = done ? exercises.flatMap(e => {
    const eName = getActiveName(e.name)
    const log = todayLog?.exercises[eName]
    if (!log) return []
    const upper = upperReps(e.reps)
    const allHit = log.sets.filter(s => s.done).every(s => parseInt(s.reps) >= upper)
    if (!allHit || log.sets.filter(s => s.done).length === 0) return []
    const maxW = Math.max(...log.sets.filter(s => s.done).map(s => parseFloat(s.weight)).filter(w => !isNaN(w)))
    if (isNaN(maxW)) return []
    return [`💡 ${eName} — you hit all reps. Try ${maxW + 2.5}kg next session.`]
  }) : []

  if (!ex) return null

  const progress = totalSets > 0 ? doneSets / totalSets : 0

  return (
    <div className="fixed inset-0 z-[60] bg-[#0d0d0d] flex flex-col">
      {prWeight !== null && (
        <PrCelebration weight={prWeight} onDismiss={() => setPrWeight(null)} />
      )}
      {showDemo && (
        <ExerciseDemo name={activeName} cleanNote={cleanNote} onClose={() => setShowDemo(false)} />
      )}

      {/* Top bar */}
      <div className="px-4 pt-4 pb-3 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 bg-[#1a1a1a] rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${progress * 100}%` }} />
          </div>
          <button onClick={onExit} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="text-[10px] text-gray-600 font-bold">{doneSets} / {totalSets} sets done</div>
      </div>

      {done ? (
        /* Session complete */
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔥</div>
            <h2 className="text-2xl font-black text-white">Session complete!</h2>
            <p className="text-gray-500 text-sm mt-1">{doneSets} sets logged</p>
          </div>

          {tips.length > 0 && (
            <div className="bg-[#111] rounded-xl border border-[#1e1e1e] p-4 mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">Progression tips</p>
              <div className="space-y-2">
                {tips.map((t, i) => <p key={i} className="text-sm text-gray-300 leading-relaxed">{t}</p>)}
              </div>
            </div>
          )}

          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Session notes</p>
          <textarea
            rows={3}
            placeholder="How did it feel? What to beat next time?"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:border-violet-500 focus:outline-none resize-none leading-relaxed mb-4"
          />
          <button
            onClick={handleFinish}
            className="w-full py-4 bg-violet-500 hover:bg-violet-400 text-black font-black text-sm rounded-xl transition-colors"
          >
            ✓ Finish &amp; save
          </button>
        </div>
      ) : resting ? (
        /* Rest timer */
        <div className="flex-1 flex flex-col px-4 py-6">
          <RestCountdown seconds={ex.restSeconds} onDone={advanceNext} nextLabel={nextLabel()} />
        </div>
      ) : (
        /* Active set */
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {/* Exercise context */}
          <div className="mb-5">
            <p className="text-[11px] text-gray-600 mb-1">
              Exercise {exIdx + 1} of {exercises.length}
            </p>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-2xl font-black text-white leading-tight flex-1">{activeName}</h2>
              <button
                onClick={() => setShowDemo(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#12002a] border border-violet-900/60 text-violet-400 text-[10px] font-bold active:bg-violet-900/40 transition-colors shrink-0 mt-1"
              >
                ▶ demo
              </button>
            </div>
            {suggBadge === 'up' && (
              <span className="mt-1 inline-block text-[9px] px-2 py-0.5 rounded-full bg-[#0a2a12] text-green-400 border border-green-900 font-bold">↑ +2.5kg</span>
            )}
            {suggBadge === 'same' && (
              <span className="mt-1 inline-block text-[9px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-gray-500 border border-[#2a2a2a] font-bold">→ same weight</span>
            )}
            {suggBadge === 'start' && (
              <span className="mt-1 inline-block text-[9px] px-2 py-0.5 rounded-full bg-[#12002a] text-violet-400 border border-violet-900 font-bold">💡 suggested</span>
            )}
            {cleanNote && <p className="text-[12px] text-gray-500 mt-1">{cleanNote}</p>}
            {subName && (
              <button
                onClick={() => toggleSwap(ex.name, subName)}
                className={`mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                  isSwapped(ex.name)
                    ? 'bg-violet-900/30 border-violet-700/60 text-violet-400'
                    : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-500 hover:border-violet-700/60 hover:text-violet-400'
                }`}
              >
                {isSwapped(ex.name) ? `↩ Back: ${ex.name}` : `↔ Sub: ${subName}`}
              </button>
            )}
          </div>

          {/* Set pills */}
          <div className="flex gap-1.5 mb-6 flex-wrap">
            {Array.from({ length: numSets }, (_, i) => {
              const s = exLog?.sets[i]
              const isDone = s?.done
              const isCurrent = i === setIdx
              return (
                <div
                  key={i}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                    isDone
                      ? 'bg-green-900/40 border-green-700 text-green-400'
                      : isCurrent
                      ? 'bg-violet-900/40 border-violet-500 text-violet-400'
                      : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-600'
                  }`}
                >
                  S{i + 1}
                </div>
              )
            })}
          </div>

          {/* Drum pickers */}
          <div className="flex gap-6 justify-center mb-4">
            <DrumPicker
              values={WEIGHTS}
              selected={nearest(WEIGHTS, localWeight)}
              onChange={w => setLocalWeight(w)}
              label="kg"
              width={100}
            />
            <DrumPicker
              values={REPS}
              selected={nearest(REPS, localReps)}
              onChange={r => setLocalReps(r)}
              label="reps"
              width={80}
            />
          </div>

          {/* Same as button */}
          {sameSource && (
            <div className="flex justify-center mb-5">
              <button
                onClick={handleSameAs}
                className="text-[12px] text-violet-400 border border-violet-900/60 bg-[#12002a] rounded-full px-4 py-1.5 hover:bg-violet-900/40 transition-colors"
              >
                ↩ {sameLabel} · {sameSource.weight}kg × {sameSource.reps}
              </button>
            </div>
          )}

          {/* Done button */}
          <button
            onClick={handleDone}
            className="w-full py-4 bg-violet-500 hover:bg-violet-400 active:scale-95 text-black font-black text-base rounded-2xl transition-all"
          >
            ✓ Done — start rest timer
          </button>

          <p className="text-center text-[11px] text-gray-600 mt-3">After rest: {nextLabel()}</p>
        </div>
      )}
    </div>
  )
}
