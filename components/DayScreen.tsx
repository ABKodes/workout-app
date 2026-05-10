'use client'
import { useState } from 'react'
import { Day, Exercise, SessionLog } from '@/types'
import { useLog } from '@/lib/useLog'
import ExerciseCard from './ExerciseCard'
import StreakBar from './StreakBar'
import AlertBanner from './AlertBanner'
import SectionHead from './SectionHead'
import TipBlock from './TipBlock'
import RestTimer from './RestTimer'
import OneRMCalc from './OneRMCalc'
import PlateCalc from './PlateCalc'

interface Props {
  day: Day
  dayIndex: number
  allLogs: SessionLog[]
}

export default function DayScreen({ day, dayIndex, allLogs }: Props) {
  const { todayLog, prevLog, logSet, setNote, finishSession } = useLog(dayIndex)
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null)
  const [ormExercise, setOrmExercise] = useState<Exercise | null>(null)
  const [platesExercise, setPlatesExercise] = useState<Exercise | null>(null)
  const [finished, setFinished] = useState(false)

  const isGym = day.badge === 'gym'
  const allExercises = day.sections.flatMap(s => s.rows).filter(e => parseInt(e.sets) > 0)
  const doneCount = allExercises.filter(e => {
    const n = parseInt(e.sets)
    const log = todayLog?.exercises[e.name]
    return log && log.sets.filter(s => s.done).length >= n
  }).length

  const handleFinish = () => {
    finishSession()
    setFinished(true)
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
          <div className="mt-2 inline-flex items-center gap-2 bg-[#1a1a1a] rounded-full px-3 py-1 border border-[#2a2a2a]">
            <div className="flex gap-0.5">
              {allExercises.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < doneCount ? 'bg-orange-500' : 'bg-[#333]'}`} />
              ))}
            </div>
            <span className="text-[11px] text-gray-400 font-semibold">{doneCount} / {allExercises.length} done</span>
          </div>
        )}
      </div>

      {dayIndex === 4 && <AlertBanner />}

      {/* Sections */}
      {day.sections.map((section, si) => (
        <div key={si} className="mb-5">
          {day.sections.length > 1 && <SectionHead head={section.head} plyo={section.plyo} />}

          {isGym ? (
            section.rows.map(exercise => (
              <ExerciseCard
                key={exercise.name}
                exercise={exercise}
                todayLog={todayLog?.exercises[exercise.name]}
                prevLog={prevLog?.exercises[exercise.name]}
                onSetUpdate={(si2, data) => logSet(exercise.name, si2, data)}
                onSetDone={secs => secs > 0 && setTimerSeconds(secs)}
                onOpenOrm={() => setOrmExercise(exercise)}
                onOpenPlates={() => setPlatesExercise(exercise)}
              />
            ))
          ) : (
            <div className="bg-[#111] rounded-xl border border-[#1e1e1e] overflow-hidden">
              <div className="grid grid-cols-[1fr_auto] text-[10px] font-bold uppercase tracking-widest text-gray-600 px-4 py-2 border-b border-[#1e1e1e]">
                <span>Activity</span>
                <span>Duration</span>
              </div>
              {section.rows.map((ex, ei) => (
                <div key={ei} className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 border-b border-[#1e1e1e] last:border-0">
                  <div>
                    <div className="text-[13px] font-bold text-white leading-snug">{ex.name}</div>
                    <div className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{ex.note}</div>
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium whitespace-nowrap pt-0.5">{ex.reps}</div>
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
            className="w-full bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:border-orange-500 focus:outline-none resize-none leading-relaxed"
          />
          {!finished ? (
            <button
              onClick={handleFinish}
              className="mt-3 w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-black text-sm rounded-xl transition-colors"
            >
              ✓ Finish session
            </button>
          ) : (
            <div className="mt-3 w-full py-3 bg-[#0a2a12] border border-green-900 text-green-400 font-bold text-sm rounded-xl text-center">
              🔥 Session logged — great work!
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
    </div>
  )
}
