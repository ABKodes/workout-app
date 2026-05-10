'use client'
import { useState, useCallback } from 'react'
import { Day, Exercise, ExerciseLog, SessionLog, SetLog } from '@/types'
import { useTimer } from '@/lib/useTimer'
import { useProgress } from '@/lib/useProgress'
import PrCelebration from './PrCelebration'

interface Props {
  day: Day
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

function stepVal(value: string, delta: number, min: number, inc: number): string {
  const current = parseFloat(value) || 0
  const next = Math.max(min, current + delta * inc)
  return inc % 1 === 0 ? String(next) : String(Math.round(next * 10) / 10)
}

function upperReps(reps: string): number {
  const nums = reps.match(/\d+/g)
  if (!nums) return 0
  return parseInt(nums[nums.length - 1])
}

function RestCountdown({
  seconds,
  onDone,
  nextLabel,
}: {
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
            stroke="#f97316" strokeWidth="6"
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
          className="px-5 py-2 rounded-xl bg-[#1a0800] text-orange-400 text-sm font-semibold border border-orange-900"
        >Skip</button>
      </div>
    </div>
  )
}

function PRDetector({
  exerciseName,
  weight,
  allLogs,
}: {
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

export default function GuidedSession({ day, todayLog, prevLog, allLogs, onLogSet, onSetNote, onFinish, onExit }: Props) {
  const exercises = day.sections.flatMap(s => s.rows).filter(e => parseInt(e.sets) > 0)
  const totalSets = exercises.reduce((sum, e) => sum + parseInt(e.sets), 0)

  const [exIdx, setExIdx] = useState(0)
  const [setIdx, setSetIdx] = useState(0)
  const [resting, setResting] = useState(false)
  const [done, setDone] = useState(false)
  const [note, setNote] = useState(todayLog?.sessionNote ?? '')
  const [prWeight, setPrWeight] = useState<number | null>(null)

  const ex: Exercise = exercises[exIdx]
  const numSets = ex ? parseInt(ex.sets) : 0

  const exLog: ExerciseLog | undefined = todayLog?.exercises[ex?.name]
  const prevExLog: ExerciseLog | undefined = prevLog?.exercises[ex?.name]
  const prevSet: SetLog | undefined = prevExLog?.sets[setIdx]
  const currentSet: SetLog | undefined = exLog?.sets[setIdx]

  const [localWeight, setLocalWeight] = useState(
    currentSet?.weight ?? prevSet?.weight ?? '20'
  )
  const [localReps, setLocalReps] = useState(
    currentSet?.reps ?? prevSet?.reps ?? defaultReps(ex?.reps ?? '8')
  )

  const doneSets = exercises.reduce((sum, e) => {
    const log = todayLog?.exercises[e.name]
    return sum + (log?.sets.filter(s => s.done).length ?? 0)
  }, 0)

  const nextLabel = useCallback((): string => {
    if (setIdx < numSets - 1) return `Set ${setIdx + 2} of ${ex.name}`
    if (exIdx < exercises.length - 1) return exercises[exIdx + 1].name
    return 'Session complete!'
  }, [setIdx, numSets, exIdx, exercises, ex])

  const advanceNext = useCallback(() => {
    setResting(false)
    if (setIdx < numSets - 1) {
      setSetIdx(s => s + 1)
      const nextSet = exLog?.sets[setIdx + 1]
      const nextPrev = prevExLog?.sets[setIdx + 1]
      setLocalWeight(nextSet?.weight ?? nextPrev?.weight ?? localWeight)
      setLocalReps(nextSet?.reps ?? nextPrev?.reps ?? defaultReps(ex.reps))
    } else if (exIdx < exercises.length - 1) {
      const nextEx = exercises[exIdx + 1]
      const nextExLog = todayLog?.exercises[nextEx.name]
      const nextPrevLog = prevLog?.exercises[nextEx.name]
      setExIdx(i => i + 1)
      setSetIdx(0)
      setLocalWeight(nextExLog?.sets[0]?.weight ?? nextPrevLog?.sets[0]?.weight ?? '20')
      setLocalReps(nextExLog?.sets[0]?.reps ?? nextPrevLog?.sets[0]?.reps ?? defaultReps(nextEx.reps))
    } else {
      setDone(true)
    }
  }, [setIdx, numSets, exIdx, exercises, exLog, prevExLog, todayLog, prevLog, localWeight, ex])

  const handleDone = useCallback(() => {
    onLogSet(ex.name, setIdx, { weight: localWeight, reps: localReps, done: true })

    // PR check
    const allExLogs = allLogs.flatMap(l => {
      const el = l.exercises[ex.name]
      return el ? el.sets.filter(s => s.done && s.weight !== '').map(s => parseFloat(s.weight)) : []
    }).filter(w => !isNaN(w))
    const histMax = allExLogs.length > 0 ? Math.max(...allExLogs) : 0
    const newW = parseFloat(localWeight)
    if (!isNaN(newW) && newW > histMax && histMax > 0) {
      setPrWeight(newW)
    }

    if (ex.restSeconds > 0) {
      setResting(true)
    } else {
      advanceNext()
    }
  }, [ex, setIdx, localWeight, localReps, onLogSet, allLogs, advanceNext])

  const handleSameAsLast = useCallback(() => {
    if (!prevSet) return
    setLocalWeight(prevSet.weight)
    setLocalReps(prevSet.reps)
    onLogSet(ex.name, setIdx, { weight: prevSet.weight, reps: prevSet.reps, done: true })
    if (ex.restSeconds > 0) {
      setResting(true)
    } else {
      advanceNext()
    }
  }, [prevSet, ex, setIdx, onLogSet, advanceNext])

  const handleFinish = () => {
    onSetNote(note)
    onFinish()
  }

  // Auto-progression tips
  const tips = done ? exercises.flatMap(e => {
    const log = todayLog?.exercises[e.name]
    if (!log) return []
    const upper = upperReps(e.reps)
    const allHit = log.sets.filter(s => s.done).every(s => parseInt(s.reps) >= upper)
    if (!allHit || log.sets.filter(s => s.done).length === 0) return []
    const maxW = Math.max(...log.sets.filter(s => s.done).map(s => parseFloat(s.weight)).filter(w => !isNaN(w)))
    if (isNaN(maxW)) return []
    return [`💡 ${e.name} — you hit all reps. Try ${maxW + 2.5}kg next session.`]
  }) : []

  if (!ex) return null

  const progress = totalSets > 0 ? doneSets / totalSets : 0

  return (
    <div className="fixed inset-0 z-[60] bg-[#0d0d0d] flex flex-col">
      {prWeight !== null && (
        <PrCelebration weight={prWeight} onDismiss={() => setPrWeight(null)} />
      )}

      {/* Top bar */}
      <div className="px-4 pt-4 pb-3 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 bg-[#1a1a1a] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <button onClick={onExit} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="text-[10px] text-gray-600 font-bold">{doneSets} / {totalSets} sets done</div>
      </div>

      {done ? (
        /* Session complete screen */
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
                {tips.map((t, i) => (
                  <p key={i} className="text-sm text-gray-300 leading-relaxed">{t}</p>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Session notes</p>
          <textarea
            rows={3}
            placeholder="How did it feel? What to beat next time?"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:border-orange-500 focus:outline-none resize-none leading-relaxed mb-4"
          />

          <button
            onClick={handleFinish}
            className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black text-sm rounded-xl transition-colors"
          >
            ✓ Finish &amp; save
          </button>
        </div>
      ) : resting ? (
        /* Rest timer */
        <div className="flex-1 flex flex-col px-4 py-6">
          <RestCountdown
            seconds={ex.restSeconds}
            onDone={advanceNext}
            nextLabel={nextLabel()}
          />
        </div>
      ) : (
        /* Active set screen */
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {/* Exercise context */}
          <div className="mb-5">
            <p className="text-[11px] text-gray-600 mb-1">
              Exercise {exIdx + 1} of {exercises.length}
            </p>
            <h2 className="text-2xl font-black text-white leading-tight">{ex.name}</h2>
            {ex.note && <p className="text-[12px] text-gray-500 mt-1">{ex.note}</p>}
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
                      ? 'bg-orange-900/40 border-orange-500 text-orange-400'
                      : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-600'
                  }`}
                >
                  S{i + 1}
                </div>
              )
            })}
          </div>

          {/* Big steppers */}
          <div className="flex gap-4 justify-center mb-4">
            {/* Weight */}
            <div className="flex flex-col items-center">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Weight</p>
              <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-3 py-3">
                <button
                  onClick={() => setLocalWeight(stepVal(localWeight, -1, 0, 2.5))}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-orange-400 font-black text-2xl"
                >−</button>
                <span className="text-xl font-black text-white w-20 text-center">{localWeight} kg</span>
                <button
                  onClick={() => setLocalWeight(stepVal(localWeight, 1, 0, 2.5))}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-orange-400 font-black text-2xl"
                >+</button>
              </div>
            </div>

            {/* Reps */}
            <div className="flex flex-col items-center">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Reps</p>
              <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-3 py-3">
                <button
                  onClick={() => setLocalReps(stepVal(localReps, -1, 1, 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-orange-400 font-black text-2xl"
                >−</button>
                <span className="text-xl font-black text-white w-10 text-center">{localReps}</span>
                <button
                  onClick={() => setLocalReps(stepVal(localReps, 1, 1, 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-orange-400 font-black text-2xl"
                >+</button>
              </div>
            </div>
          </div>

          {/* Same as last time */}
          {prevSet && (
            <div className="flex justify-center mb-5">
              <button
                onClick={handleSameAsLast}
                className="text-[12px] text-orange-400 border border-orange-900/60 bg-[#1a0900] rounded-full px-4 py-1.5 hover:bg-orange-900/40 transition-colors"
              >
                Same as last time ({prevSet.weight}kg × {prevSet.reps})
              </button>
            </div>
          )}

          {/* Done button */}
          <button
            onClick={handleDone}
            className="w-full py-4 bg-orange-500 hover:bg-orange-400 active:scale-95 text-black font-black text-base rounded-2xl transition-all"
          >
            ✓ Done — start rest timer
          </button>

          {/* What's next */}
          <p className="text-center text-[11px] text-gray-600 mt-3">After rest: {nextLabel()}</p>
        </div>
      )}
    </div>
  )
}
