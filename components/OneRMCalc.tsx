'use client'
import { useState } from 'react'

const REP_TARGETS = [1, 3, 5, 6, 8, 10, 12, 15]

function epley(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

interface Props { onClose?: () => void }

export default function OneRMCalc({ onClose }: Props) {
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')

  const w = parseFloat(weight)
  const r = parseInt(reps)
  const valid = !isNaN(w) && !isNaN(r) && w > 0 && r > 0

  const orm = valid ? epley(w, r) : null

  return (
    <div className={onClose ? 'fixed inset-0 z-50 flex items-end justify-center' : ''} onClick={onClose}>
      {onClose && <div className="absolute inset-0 bg-black/60" />}
      <div
        className={onClose
          ? 'relative w-full max-w-sm bg-[#111] rounded-t-3xl border-t border-[#2a2a2a] px-6 pt-6 pb-10'
          : 'bg-[#111] rounded-xl border border-[#1e1e1e] p-4'}
        onClick={e => e.stopPropagation()}
      >
        {onClose && <div className="w-10 h-1 bg-[#333] rounded-full mx-auto mb-5" />}
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4">🏋️ 1RM Calculator</p>

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="text-[10px] text-gray-600 block mb-1">Weight (kg)</label>
            <input
              type="number" inputMode="decimal" placeholder="60"
              value={weight} onChange={e => setWeight(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-gray-600 block mb-1">Reps done</label>
            <input
              type="number" inputMode="numeric" placeholder="8"
              value={reps} onChange={e => setReps(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>

        {orm && (
          <>
            <div className="flex items-center justify-between mb-3 bg-[#12002a] border border-violet-900/50 rounded-xl px-4 py-2.5">
              <span className="text-sm text-gray-400">Estimated 1RM</span>
              <span className="text-xl font-black text-violet-400">{orm} kg</span>
            </div>
            <div className="space-y-1">
              {REP_TARGETS.filter(t => t !== r).map(t => {
                const load = Math.round(orm / (1 + t / 30))
                return (
                  <div key={t} className="flex items-center justify-between py-1 border-b border-[#1e1e1e] last:border-0">
                    <span className="text-[11px] text-gray-500">For {t} rep{t > 1 ? 's' : ''}</span>
                    <span className="text-[11px] font-semibold text-white">{load} kg</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
        {!valid && <p className="text-[11px] text-gray-700 text-center py-3">Enter weight and reps above</p>}
      </div>
    </div>
  )
}
