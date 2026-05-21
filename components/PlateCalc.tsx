'use client'
import { useState } from 'react'

const PLATES = [20, 15, 10, 5, 2.5, 1.25]
const BAR_OPTIONS = [20, 15, 10]

function calcPlates(target: number, bar: number): { plate: number; count: number }[] {
  let remaining = (target - bar) / 2
  const result: { plate: number; count: number }[] = []
  for (const p of PLATES) {
    if (remaining <= 0) break
    const count = Math.floor(remaining / p)
    if (count > 0) {
      result.push({ plate: p, count })
      remaining -= count * p
      remaining = Math.round(remaining * 1000) / 1000
    }
  }
  return result
}

const PLATE_COLORS: Record<number, string> = {
  20: '#e53e3e', 15: '#3182ce', 10: '#38a169', 5: '#d69e2e', 2.5: '#718096', 1.25: '#b7791f',
}
const PLATE_HEIGHT: Record<number, number> = {
  20: 52, 15: 46, 10: 40, 5: 32, 2.5: 26, 1.25: 20,
}

interface Props { onClose?: () => void }

export default function PlateCalc({ onClose }: Props) {
  const [target, setTarget] = useState('')
  const [bar, setBar] = useState(20)

  const t = parseFloat(target)
  const valid = !isNaN(t) && t > bar
  const plates = valid ? calcPlates(t, bar) : []

  const allPlatesExpanded = plates.flatMap(({ plate, count }) => Array(count).fill(plate))

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
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4">🍽️ Plate Calculator</p>

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="text-[10px] text-gray-600 block mb-1">Target weight (kg)</label>
            <input
              type="number" inputMode="decimal" placeholder="80"
              value={target} onChange={e => setTarget(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-gray-600 block mb-1">Bar weight</label>
            <div className="flex gap-1">
              {BAR_OPTIONS.map(b => (
                <button
                  key={b}
                  onClick={() => setBar(b)}
                  className={`flex-1 py-2 rounded-lg text-[11px] font-bold border transition-colors ${
                    bar === b ? 'bg-violet-500 border-violet-500 text-black' : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-500'
                  }`}
                >
                  {b}kg
                </button>
              ))}
            </div>
          </div>
        </div>

        {valid && plates.length > 0 && (
          <>
            {/* Visual bar */}
            <div className="flex items-center justify-center gap-1 mb-4 h-16">
              {/* Left collar */}
              <div className="w-2 h-10 bg-gray-500 rounded-sm" />
              {/* Left plates */}
              {[...allPlatesExpanded].reverse().map((p, i) => (
                <div key={i} className="w-3 rounded-sm flex items-center justify-center"
                  style={{ height: PLATE_HEIGHT[p], backgroundColor: PLATE_COLORS[p] }}>
                  {p >= 5 && <span className="text-[7px] font-black text-white rotate-90">{p}</span>}
                </div>
              ))}
              {/* Bar */}
              <div className="h-2 bg-gray-400 rounded-sm" style={{ width: 48 }} />
              {/* Right plates */}
              {allPlatesExpanded.map((p, i) => (
                <div key={i} className="w-3 rounded-sm flex items-center justify-center"
                  style={{ height: PLATE_HEIGHT[p], backgroundColor: PLATE_COLORS[p] }}>
                  {p >= 5 && <span className="text-[7px] font-black text-white rotate-90">{p}</span>}
                </div>
              ))}
              {/* Right collar */}
              <div className="w-2 h-10 bg-gray-500 rounded-sm" />
            </div>

            <div className="text-[11px] text-gray-500 text-center mb-3">
              Each side: {plates.map(p => `${p.count}×${p.plate}kg`).join(' + ')}
            </div>
          </>
        )}
        {valid && plates.length === 0 && (
          <p className="text-[11px] text-yellow-500 text-center py-3">Cannot make {t}kg with standard plates</p>
        )}
        {!valid && <p className="text-[11px] text-gray-700 text-center py-3">Enter a target weight above {bar}kg</p>}
      </div>
    </div>
  )
}
