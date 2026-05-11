'use client'
import { SetLog } from '@/types'
import DrumPicker from './DrumPicker'

interface Props {
  setIndex: number
  exercise: { reps: string; restSeconds: number }
  setLog: SetLog | undefined
  prevSet: SetLog | undefined
  currentPrevSet: SetLog | undefined
  isActive: boolean
  onUpdate: (data: Partial<SetLog>) => void
  onDone: () => void
}

function defaultReps(reps: string): string {
  const nums = reps.match(/\d+/g)
  return nums ? nums[0] : '8'
}

// 0 to 200 in steps of 2.5
const WEIGHTS = Array.from({ length: 81 }, (_, i) => String(Math.round(i * 2.5 * 10) / 10))
// 1 to 30
const REPS = Array.from({ length: 30 }, (_, i) => String(i + 1))

function nearest(values: string[], val: string): string {
  const n = parseFloat(val)
  if (isNaN(n)) return values[0]
  return values.reduce((best, v) => Math.abs(parseFloat(v) - n) < Math.abs(parseFloat(best) - n) ? v : best)
}

export default function SetRow({ setIndex, exercise, setLog, prevSet, currentPrevSet, isActive, onUpdate, onDone }: Props) {
  const done = setLog?.done ?? false

  // Source for "same as" — prefer current session's previous set if it's done
  const sameSource = currentPrevSet?.done ? currentPrevSet : (prevSet ?? null)
  const sameLabel = currentPrevSet?.done ? `S${setIndex}` : 'Last time'

  const weight = nearest(WEIGHTS, setLog?.weight ?? sameSource?.weight ?? '20')
  const reps = nearest(REPS, setLog?.reps ?? sameSource?.reps ?? defaultReps(exercise.reps))

  const handleDone = () => {
    onUpdate({ done: !done, weight, reps })
    if (!done) onDone()
  }

  const handleSameAs = () => {
    if (!sameSource) return
    onUpdate({ weight: sameSource.weight, reps: sameSource.reps, done: true })
    onDone()
  }

  return (
    <div className={`py-2 transition-opacity ${done ? 'opacity-40' : ''}`}>
      <div className="flex items-center gap-1 mb-1.5">
        <span className={`text-[10px] w-5 shrink-0 font-bold ${isActive ? 'text-orange-400' : 'text-gray-600'}`}>S{setIndex + 1}</span>

        <div className="flex items-center gap-2 flex-1">
          <DrumPicker
            values={WEIGHTS}
            selected={weight}
            onChange={w => onUpdate({ weight: w })}
            label="kg"
            width={72}
          />
          <span className="text-gray-700 text-sm font-bold">×</span>
          <DrumPicker
            values={REPS}
            selected={reps}
            onChange={r => onUpdate({ reps: r })}
            label="reps"
            width={56}
          />
        </div>

        <button
          onClick={handleDone}
          className={`ml-auto w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
            done
              ? 'bg-orange-500 border-orange-500 text-black'
              : 'border-[#2a2a2a] text-gray-600 hover:border-orange-500'
          }`}
        >
          <span className="text-[12px] font-bold">✓</span>
        </button>
      </div>

      {sameSource && !done && (
        <button
          onClick={handleSameAs}
          className="ml-6 text-[10px] text-orange-400 border border-orange-900/60 bg-[#1a0900] rounded-full px-2.5 py-0.5 hover:bg-orange-900/40 transition-colors"
        >
          ↩ {sameLabel} · {sameSource.weight}kg × {sameSource.reps}
        </button>
      )}
    </div>
  )
}
