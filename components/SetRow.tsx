'use client'
import { SetLog } from '@/types'

interface Props {
  setIndex: number
  setLog: SetLog | undefined
  prevSet: SetLog | undefined
  onUpdate: (data: Partial<SetLog>) => void
  onDone: () => void
}

export default function SetRow({ setIndex, setLog, prevSet, onUpdate, onDone }: Props) {
  const done = setLog?.done ?? false

  const handleDone = () => {
    onUpdate({ done: !done })
    if (!done) onDone()
  }

  return (
    <div className={`flex items-center gap-2 py-1.5 transition-opacity ${done ? 'opacity-50' : ''}`}>
      <span className="text-[10px] text-gray-600 w-5 shrink-0">S{setIndex + 1}</span>
      <input
        type="text"
        inputMode="decimal"
        placeholder={prevSet?.weight || 'kg'}
        value={setLog?.weight ?? ''}
        onChange={e => onUpdate({ weight: e.target.value })}
        className="w-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-2 py-1 text-[11px] text-white text-center placeholder-gray-700 focus:border-orange-500 focus:outline-none"
      />
      <span className="text-gray-700 text-[10px]">×</span>
      <input
        type="text"
        inputMode="numeric"
        placeholder={prevSet?.reps || 'reps'}
        value={setLog?.reps ?? ''}
        onChange={e => onUpdate({ reps: e.target.value })}
        className="w-14 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-2 py-1 text-[11px] text-white text-center placeholder-gray-700 focus:border-orange-500 focus:outline-none"
      />
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
  )
}
