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

  const inner = (
    <div
      className={onClose
        ? 'relative w-full max-w-sm bg-[#161616] border border-[#2a2a2a] rounded-2xl px-6 pt-5 pb-6 mx-4 max-h-[85vh] overflow-y-auto shadow-2xl'
        : 'bg-[#111] rounded-xl border border-[#1e1e1e] p-4'}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">🏋️ 1RM Calculator</p>
        {onClose && (
          <button onClick={onClose} className="text-gray-600 hover:text-white text-lg leading-none transition-colors">✕</button>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="text-[10px] text-gray-600 block mb-1">Weight (kg)</label>
          <input
            type="number" inputMode="decimal" placeholder="60"
            value={weight} onChange={e => setWeight(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-gray-600 block mb-1">Reps done</label>
          <input
            type="number" inputMode="numeric" placeholder="8"
            value={reps} onChange={e => setReps(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
          />
        </div>
      </div>

      {orm ? (
        <>
          <div className="flex items-center justify-between mb-4 bg-[#12002a] border border-violet-900/50 rounded-xl px-4 py-3">
            <span className="text-sm text-gray-400">Estimated 1RM</span>
            <span className="text-2xl font-black text-violet-400">{orm} kg</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Working weights</p>
          <div className="bg-[#111] rounded-xl border border-[#1e1e1e] overflow-hidden">
            {REP_TARGETS.filter(t => t !== r).map((t, i, arr) => {
              const load = Math.round(orm / (1 + t / 30))
              const pct = Math.round((load / orm) * 100)
              return (
                <div key={t} className={`flex items-center justify-between px-4 py-2.5 ${i < arr.length - 1 ? 'border-b border-[#1e1e1e]' : ''}`}>
                  <span className="text-[11px] text-gray-500">{t} rep{t > 1 ? 's' : ''}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-700">{pct}%</span>
                    <span className="text-[13px] font-bold text-white w-16 text-right">{load} kg</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <p className="text-[11px] text-gray-700 text-center py-4">Enter weight and reps above</p>
      )}
    </div>
  )

  if (!onClose) return inner

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      {inner}
    </div>
  )
}