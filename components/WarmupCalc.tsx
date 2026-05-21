'use client'
import { useState } from 'react'

interface Props {
  defaultWeight?: number
  onClose: () => void
}

function round25(kg: number): number {
  return Math.round(kg / 2.5) * 2.5
}

export default function WarmupCalc({ defaultWeight = 0, onClose }: Props) {
  const [weight, setWeight] = useState(String(defaultWeight || ''))

  const working = parseFloat(weight) || 0

  const sets = working > 0
    ? [
        { pct: 50, reps: 8 },
        { pct: 70, reps: 5 },
        { pct: 85, reps: 3 },
      ].map(s => ({ ...s, kg: round25(working * s.pct / 100) }))
    : []

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-sm bg-[#111] rounded-t-3xl border-t border-[#2a2a2a] px-6 pt-5 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-[#333] rounded-full mx-auto mb-5" />
        <p className="text-center text-[11px] text-gray-600 uppercase tracking-widest font-bold mb-4">🔥 Warm-up sets</p>

        <div className="flex items-center gap-2 mb-5">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Working weight (kg)"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:border-violet-500 focus:outline-none"
          />
          <span className="text-gray-500 text-sm font-semibold">kg</span>
        </div>

        {sets.length > 0 ? (
          <div className="bg-[#0a0a0a] rounded-xl overflow-hidden border border-[#1e1e1e]">
            <div className="grid grid-cols-4 text-[9px] font-bold uppercase tracking-widest text-gray-600 px-4 py-2">
              <span>Set</span><span>%</span><span>Weight</span><span>Reps</span>
            </div>
            {sets.map((s, i) => (
              <div key={i} className="grid grid-cols-4 px-4 py-3 border-t border-[#1a1a1a] items-center">
                <span className="text-sm text-white font-bold">{i + 1}</span>
                <span className="text-sm text-gray-400">{s.pct}%</span>
                <span className="text-sm text-violet-400 font-bold">{s.kg} kg</span>
                <span className="text-sm text-gray-400">{s.reps}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 text-sm">Enter your working weight above</p>
        )}
      </div>
    </div>
  )
}
