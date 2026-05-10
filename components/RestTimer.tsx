'use client'
import { useTimer } from '@/lib/useTimer'
import { useEffect } from 'react'

interface Props {
  seconds: number
  onClose: () => void
}

export default function RestTimer({ seconds, onClose }: Props) {
  const { fmt, running, start, skip, addTime } = useTimer()

  useEffect(() => {
    start(seconds, onClose)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const total = seconds
  const remaining = parseInt(fmt.split(':')[0]) * 60 + parseInt(fmt.split(':')[1])
  const progress = total > 0 ? (total - remaining) / total : 1
  const circumference = 2 * Math.PI * 44

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-sm bg-[#111] rounded-t-3xl border-t border-[#2a2a2a] px-6 pt-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-[#333] rounded-full mx-auto mb-6" />

        <p className="text-center text-[11px] text-gray-600 uppercase tracking-widest font-bold mb-4">Rest timer</p>

        {/* Ring */}
        <div className="flex justify-center mb-5">
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
          <div className="absolute flex items-center justify-center" style={{ width: 108, height: 108, marginTop: 0 }}>
            <span className="text-3xl font-black text-white mt-1">{running ? fmt : '✓'}</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => addTime(30)}
            className="px-5 py-2 rounded-xl bg-[#1a1a1a] text-gray-400 text-sm font-semibold border border-[#2a2a2a] hover:border-orange-500 transition-colors"
          >
            +30s
          </button>
          <button
            onClick={() => { skip(); onClose() }}
            className="px-5 py-2 rounded-xl bg-[#1a0800] text-orange-400 text-sm font-semibold border border-orange-900 hover:bg-orange-500 hover:text-black transition-colors"
          >
            Skip
          </button>
        </div>
        <p className="text-center text-[11px] text-gray-700 mt-4">Tap outside to dismiss</p>
      </div>
    </div>
  )
}
