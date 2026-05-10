'use client'
import { SetLog } from '@/types'

interface Props {
  setIndex: number
  exercise: { reps: string; restSeconds: number }
  setLog: SetLog | undefined
  prevSet: SetLog | undefined
  onUpdate: (data: Partial<SetLog>) => void
  onDone: () => void
}

function defaultReps(reps: string): string {
  const nums = reps.match(/\d+/g)
  return nums ? nums[0] : '8'
}

function step(value: string, delta: number, min: number, increment: number): string {
  const current = parseFloat(value) || 0
  const next = Math.max(min, current + delta * increment)
  return increment % 1 === 0 ? String(next) : String(Math.round(next * 10) / 10)
}

export default function SetRow({ setIndex, exercise, setLog, prevSet, onUpdate, onDone }: Props) {
  const done = setLog?.done ?? false

  const weight = setLog?.weight ?? prevSet?.weight ?? '20'
  const reps = setLog?.reps ?? prevSet?.reps ?? defaultReps(exercise.reps)

  const handleDone = () => {
    onUpdate({ done: !done, weight, reps })
    if (!done) onDone()
  }

  const handleSameAsLast = () => {
    if (!prevSet) return
    onUpdate({ weight: prevSet.weight, reps: prevSet.reps, done: true })
    onDone()
  }

  return (
    <div className={`py-2 transition-opacity ${done ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-600 w-5 shrink-0">S{setIndex + 1}</span>

        {/* Weight stepper */}
        <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-1 py-1">
          <button
            onClick={() => onUpdate({ weight: step(weight, -1, 0, 2.5) })}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-orange-400 font-bold text-sm"
          >−</button>
          <span className="text-[12px] text-white font-semibold w-14 text-center">{weight} kg</span>
          <button
            onClick={() => onUpdate({ weight: step(weight, 1, 0, 2.5) })}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-orange-400 font-bold text-sm"
          >+</button>
        </div>

        <span className="text-gray-700 text-[10px]">×</span>

        {/* Reps stepper */}
        <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-1 py-1">
          <button
            onClick={() => onUpdate({ reps: step(reps, -1, 1, 1) })}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-orange-400 font-bold text-sm"
          >−</button>
          <span className="text-[12px] text-white font-semibold w-8 text-center">{reps}</span>
          <button
            onClick={() => onUpdate({ reps: step(reps, 1, 1, 1) })}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-orange-400 font-bold text-sm"
          >+</button>
        </div>

        {/* Done button */}
        <button
          onClick={handleDone}
          className={`ml-auto w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
            done
              ? 'bg-orange-500 border-orange-500 text-black'
              : 'border-[#2a2a2a] text-gray-600 hover:border-orange-500'
          }`}
        >
          <span className="text-[11px] font-bold">✓</span>
        </button>
      </div>

      {/* Same as last time */}
      {prevSet && !done && (
        <button
          onClick={handleSameAsLast}
          className="mt-1.5 ml-7 text-[10px] text-orange-400 border border-orange-900/60 bg-[#1a0900] rounded-full px-2.5 py-0.5 hover:bg-orange-900/40 transition-colors"
        >
          Same as last time ({prevSet.weight}kg × {prevSet.reps})
        </button>
      )}
    </div>
  )
}
