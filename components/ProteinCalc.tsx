'use client'
import { useState } from 'react'
import { useBodyWeight } from '@/lib/useBodyWeight'

export default function ProteinCalc() {
  const { today, entries } = useBodyWeight()
  const [manualKg, setManualKg] = useState('')

  // Auto-read from weight log: today first, then most recent entry
  const loggedWeight = today?.weight
    ?? (entries.length > 0 ? entries[entries.length - 1].weight : null)

  const weightKg = loggedWeight ?? (parseFloat(manualKg) || null)

  const min    = weightKg ? Math.round(weightKg * 1.6) : null
  const target = weightKg ? Math.round(weightKg * 2.0) : null
  const upper  = weightKg ? Math.round(weightKg * 2.2) : null

  return (
    <div className="bg-[#111] rounded-xl border border-[#1e1e1e] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Protein Calculator</p>
        {loggedWeight && (
          <span className="text-[10px] text-gray-500 font-semibold">{loggedWeight} kg</span>
        )}
      </div>

      {!weightKg ? (
        <div>
          <p className="text-[12px] text-gray-500 mb-3 leading-relaxed">
            No weight logged yet. Enter your bodyweight to calculate protein targets.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 80"
              value={manualKg}
              onChange={e => setManualKg(e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:border-violet-500 focus:outline-none"
            />
            <span className="text-gray-500 text-sm font-semibold">kg</span>
          </div>
          <p className="text-[10px] text-gray-700 mt-2">Or log your weight in the Stats tab to auto-fill.</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-[#0d0d0d] rounded-xl p-3 text-center border border-[#1e1e1e]">
              <div className="text-xl font-black text-gray-300">{min}g</div>
              <div className="text-[10px] text-gray-600 mt-1">Minimum</div>
              <div className="text-[9px] text-gray-700 mt-0.5">1.6 g/kg</div>
            </div>
            <div className="bg-[#12002a] rounded-xl p-3 text-center border border-violet-900/50">
              <div className="text-xl font-black text-violet-400">{target}g</div>
              <div className="text-[10px] text-gray-300 mt-1">Target</div>
              <div className="text-[9px] text-violet-700 mt-0.5">2.0 g/kg</div>
            </div>
            <div className="bg-[#0d0d0d] rounded-xl p-3 text-center border border-[#1e1e1e]">
              <div className="text-xl font-black text-gray-300">{upper}g</div>
              <div className="text-[10px] text-gray-600 mt-1">Upper</div>
              <div className="text-[9px] text-gray-700 mt-0.5">2.2 g/kg</div>
            </div>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Aim for <span className="text-violet-400 font-bold">{target}g/day</span> — the evidence-based sweet spot for muscle growth at {loggedWeight ?? parseFloat(manualKg)} kg.
          </p>
        </div>
      )}
    </div>
  )
}