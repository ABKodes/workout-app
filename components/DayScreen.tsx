'use client'
import { useState } from 'react'
import { Day, Exercise, SessionLog } from '@/types'
import { useLog } from '@/lib/useLog'
import { useSubstitutions } from '@/lib/useSubstitutions'
import ExerciseCard from './ExerciseCard'
import StreakBar from './StreakBar'
import AlertBanner from './AlertBanner'
import SectionHead from './SectionHead'
import TipBlock from './TipBlock'
import RestTimer from './RestTimer'
import OneRMCalc from './OneRMCalc'
import PlateCalc from './PlateCalc'
import GuidedSession from './GuidedSession'
import ExerciseDemo from './ExerciseDemo'
import QuickWeightLog from './QuickWeightLog'

interface Props {
  day: Day
  dayIndex: number
  allLogs: SessionLog[]
}

function upperReps(reps: string): number {
  const nums = reps.match(/\d+/g)
  if (!nums) return 0
  return parseInt(nums[nums.length - 1])
}

export default function DayScreen({ day, dayIndex, allLogs }: Props) {
  const { todayLog, prevLog, logSet, setNote, finishSession } = useLog(dayIndex)
  const { getActiveName, isSwapped, toggleSwap } = useSubstitutions(dayIndex)
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null)
  const [ormExercise, setOrmExercise] = useState<Exercise | null>(null)
  const [platesExercise, setPlatesExercise] = useState<Exercise | null>(null)
  const [demoExercise, setDemoExercise] = useState<{ name: string; note: string } | null>(null)
  const [finished, setFinished] = useState(false)
  const [guided, setGuided] = useState(false)

  const isGym = day.badge === 'gym'
  const allExercises = day.sections.flatMap(s => s.rows).filter(e => parseInt(e.sets) > 0)
  const doneCount = allExercises.filter(e => {
    const n = parseInt(e.sets)
    const activeName = getActiveName(e.name)
    const log = todayLog?.exercises[activeName]
    return log && (log.sets || []).filter(s => s?.done).length >= n
  }).length

  const handleFinish = () => {
    finishSession()
    setFinished(true)
  }

  // Session summary stats — computed once on finish
  const sessionSummary = finished && todayLog ? (() => {
    let totalVolume = 0
    const prs: string[] = []
    const progressTipsList: string[] = []

    allExercises.forEach(e => {
      const activeName = getActiveName(e.name)
      const log = todayLog.exercises[activeName]
      if (!log) return
      const done = (log.sets || []).filter(s => s?.done)
      if (done.length === 0) return

      // Volume
      done.forEach(s => {
        const w = parseFloat(s.weight)
        const r = parseInt(s.reps)
        if (!isNaN(w) && !isNaN(r)) totalVolume += w * r
      })

      // PR detection — compare today's max weight vs all previous logs
      const todayMax = Math.max(...done.map(s => parseFloat(s.weight)).filter(w => !isNaN(w)))
      const prevMax = allLogs
        .filter(l => l.date !== todayLog.date && l.exercises[activeName])
        .flatMap(l => (l.exercises[activeName].sets || []).filter(s => s?.done).map(s => parseFloat(s.weight)))
        .filter(w => !isNaN(w))
      const historicMax = prevMax.length > 0 ? Math.max(...prevMax) : 0
      if (!isNaN(todayMax) && todayMax > historicMax && historicMax > 0) {
        prs.push(`${activeName} — ${todayMax}kg`)
      }

      // Progression tips
      const upper = upperReps(e.reps)
      if (done.every(s => parseInt(s.reps) >= upper) && !isNaN(todayMax)) {
        progressTipsList.push(`${activeName}: try ${todayMax + 2.5}kg next session`)
      }
    })

    return { totalVolume: Math.round(totalVolume), prs, progressTipsList }
  })() : null

  if (guided) {
    return (
      <GuidedSession
        day={day}
        dayIndex={dayIndex}
        todayLog={todayLog}
        prevLog={prevLog ?? undefined}
        allLogs={allLogs}
        onLogSet={logSet}
        onSetNote={setNote}
        onFinish={() => { finishSession(); setGuided(false); setFinished(true) }}
        onExit={() => setGuided(false)}
      />
    )
  }

  return (
    <div className="pb-28">
      <StreakBar allLogs={allLogs} />

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{day.emoji}</span>
          <div>
            <h1 className="text-xl font-black text-white leading-tight">{day.title}</h1>
            <p className="text-[12px] text-gray-500 mt-0.5">{day.sub}</p>
          </div>
        </div>
        {isGym && allExercises.length > 0 && (
          <div className="mt-2 flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-[#1a1a1a] rounded-full px-3 py-1 border border-[#2a2a2a]">
              <div className="flex gap-0.5">
                {allExercises.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < doneCount ? 'bg-violet-500' : 'bg-[#333]'}`} />
                ))}
              </div>
              <span className="text-[11px] text-gray-400 font-semibold">{doneCount} / {allExercises.length} done</span>
            </div>
            <button
              onClick={() => setGuided(true)}
              className="text-[11px] font-bold text-violet-400 border border-violet-900/60 bg-[#12002a] rounded-full px-3 py-1 hover:bg-violet-900/40 transition-colors"
            >
              🎯 Guided session
            </button>
          </div>
        )}
      </div>

      {isGym && <QuickWeightLog />}

      {dayIndex === 4 && <AlertBanner />}

      {/* Sections */}
      {day.sections.map((section, si) => (
        <div key={si} className="mb-5">
          {day.sections.length > 1 && <SectionHead head={section.head} plyo={section.plyo} />}

          {isGym ? (
            section.rows.map(exercise => {
              const activeName = getActiveName(exercise.name)
              const subMatch = exercise.note.match(/\.\s*Sub:\s*(.+)$/)
              const subName = subMatch ? subMatch[1].trim() : undefined
              return (
                <ExerciseCard
                  key={exercise.name}
                  exercise={exercise}
                  activeName={activeName}
                  todayLog={todayLog?.exercises[activeName]}
                  prevLog={prevLog?.exercises[activeName]}
                  allLogs={allLogs}
                  isSwapped={isSwapped(exercise.name)}
                  onSwap={subName ? () => toggleSwap(exercise.name, subName) : undefined}
                  onSetUpdate={(si2, data) => logSet(activeName, si2, data)}
                  onSetDone={secs => secs > 0 && setTimerSeconds(secs)}
                  onOpenOrm={() => setOrmExercise(exercise)}
                  onOpenPlates={() => setPlatesExercise(exercise)}
                />
              )
            })
          ) : (
            <div className="bg-[#111] rounded-xl border border-[#1e1e1e] overflow-hidden">
              <div className="grid grid-cols-[1fr_auto] text-[10px] font-bold uppercase tracking-widest text-gray-600 px-4 py-2 border-b border-[#1e1e1e]">
                <span>Activity</span>
                <span>Duration</span>
              </div>
              {section.rows.map((ex, ei) => (
                <div key={ei} className="px-4 py-3 border-b border-[#1e1e1e] last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-white leading-snug">{ex.name}</div>
                      <div className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{ex.note}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      <button
                        onClick={() => setDemoExercise({ name: ex.name, note: ex.note })}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#12002a] border border-violet-900/60 text-violet-400 text-[10px] font-bold active:bg-violet-900/40 transition-colors"
                      >
                        ▶ demo
                      </button>
                      <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">{ex.reps}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Session note + finish (gym days only) */}
      {isGym && (
        <div className="mt-2 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Session notes</p>
          <textarea
            rows={3}
            placeholder="How did it feel? What to beat next time?"
            defaultValue={todayLog?.sessionNote ?? ''}
            onBlur={e => setNote(e.target.value)}
            className="w-full bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:border-violet-500 focus:outline-none resize-none leading-relaxed"
          />
          {!finished ? (
            <button
              onClick={handleFinish}
              className="mt-3 w-full py-3 bg-violet-500 hover:bg-violet-400 text-black font-black text-sm rounded-xl transition-colors"
            >
              ✓ Finish session
            </button>
          ) : (
            <div className="mt-3 space-y-3">
              {/* Summary header */}
              <div className="w-full py-3 bg-[#0a2a12] border border-green-900 text-green-400 font-bold text-sm rounded-xl text-center">
                🔥 Session logged — great work!
              </div>

              {/* Stats row */}
              {sessionSummary && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-3 text-center">
                    <div className="text-lg font-black text-white">{doneCount}</div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">exercises</div>
                  </div>
                  <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-3 text-center">
                    <div className="text-lg font-black text-violet-400">
                      {sessionSummary.totalVolume >= 1000
                        ? `${(sessionSummary.totalVolume / 1000).toFixed(1)}t`
                        : `${sessionSummary.totalVolume}kg`}
                    </div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">volume</div>
                  </div>
                  <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-3 text-center">
                    <div className="text-lg font-black text-yellow-400">{sessionSummary.prs.length}</div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">PRs</div>
                  </div>
                </div>
              )}

              {/* PRs hit */}
              {sessionSummary && sessionSummary.prs.length > 0 && (
                <div className="bg-[#1a1200] border border-yellow-900/50 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-600 mb-2">New PRs</p>
                  <div className="space-y-1">
                    {sessionSummary.prs.map((pr, i) => (
                      <p key={i} className="text-sm text-yellow-400 font-semibold">★ {pr}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Progression tips */}
              {sessionSummary && sessionSummary.progressTipsList.length > 0 && (
                <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Next session</p>
                  <div className="space-y-1.5">
                    {sessionSummary.progressTipsList.map((t, i) => (
                      <p key={i} className="text-[12px] text-gray-400 leading-relaxed">💡 {t}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <TipBlock tip={day.tip} />

      {/* Modals */}
      {timerSeconds !== null && (
        <RestTimer seconds={timerSeconds} onClose={() => setTimerSeconds(null)} />
      )}
      {ormExercise && <OneRMCalc onClose={() => setOrmExercise(null)} />}
      {platesExercise && <PlateCalc onClose={() => setPlatesExercise(null)} />}
      {demoExercise && (
        <ExerciseDemo name={demoExercise.name} cleanNote={demoExercise.note} onClose={() => setDemoExercise(null)} />
      )}
    </div>
  )
}
