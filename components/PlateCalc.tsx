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

// Plate colours — bold, gym-standard palette
const PLATE_COLOR: Record<number, { bg: string; border: string; text: string }> = {
  20:   { bg: '#c53030', border: '#9b2c2c', text: '#fff' },
  15:   { bg: '#2b6cb0', border: '#2c5282', text: '#fff' },
  10:   { bg: '#276749', border: '#22543d', text: '#fff' },
  5:    { bg: '#b7791f', border: '#975a16', text: '#fff' },
  2.5:  { bg: '#4a5568', border: '#2d3748', text: '#e2e8f0' },
  1.25: { bg: '#6b4226', border: '#4a2c17', text: '#f5e6d3' },
}

const PLATE_H: Record<number, number> = {
  20: 64, 15: 56, 10: 46, 5: 36, 2.5: 28, 1.25: 20,
}

interface Props { onClose?: () => void }

export default function PlateCalc({ onClose }: Props) {
  const [target, setTarget] = useState('')
  const [bar, setBar] = useState(20)

  const t = parseFloat(target)
  const valid = !isNaN(t) && t > bar
  const plates = valid ? calcPlates(t, bar) : []
  const allPlates = plates.flatMap(({ plate, count }) => Array(count).fill(plate))

  const inner = (
    <div
      className={onClose
        ? 'relative w-full max-w-sm bg-[#161616] border border-[#2a2a2a] rounded-2xl px-6 pt-5 pb-6 mx-4 shadow-2xl'
        : 'bg-[#111] rounded-xl border border-[#1e1e1e] p-4'}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">🍽️ Plate Calculator</p>
        {onClose && (
          <button onClick={onClose} className="text-gray-600 hover:text-white text-lg leading-none transition-colors">✕</button>
        )}
      </div>

      {/* Inputs */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1">
          <label className="text-[10px] text-gray-600 block mb-1">Target (kg)</label>
          <input
            type="number" inputMode="decimal" placeholder="80"
            value={target} onChange={e => setTarget(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-gray-600 block mb-1">Bar</label>
          <div className="flex gap-1">
            {BAR_OPTIONS.map(b => (
              <button
                key={b}
                onClick={() => setBar(b)}
                className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold border transition-colors ${
                  bar === b ? 'bg-violet-500 border-violet-500 text-black' : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-500'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {valid && plates.length > 0 && (
        <>
          {/* Barbell visualisation */}
          <div className="bg-[#0d0d0d] rounded-xl border border-[#1e1e1e] py-5 px-3 mb-4 overflow-hidden">
            <div className="flex items-center justify-center gap-0.5">
              {/* Left end cap */}
              <div className="w-1.5 h-12 bg-[#555] rounded-l-sm" />
              {/* Left plates — outermost first (reverse order) */}
              {[...allPlates].reverse().map((p, i) => {
                const c = PLATE_COLOR[p]
                return (
                  <div
                    key={i}
                    className="rounded-sm flex items-center justify-center shrink-0"
                    style={{ width: 14, height: PLATE_H[p], backgroundColor: c.bg, borderLeft: `2px solid ${c.border}`, borderRight: `2px solid ${c.border}` }}
                  >
                    {p >= 5 && (
                      <span className="text-[6px] font-black rotate-90 whitespace-nowrap" style={{ color: c.text }}>{p}</span>
                    )}
                  </div>
                )
              })}
              {/* Bar sleeve */}
              <div className="h-2.5 bg-gradient-to-b from-[#aaa] to-[#777] rounded-sm shrink-0" style={{ width: 36 }} />
              {/* Right plates — innermost first */}
              {allPlates.map((p, i) => {
                const c = PLATE_COLOR[p]
                return (
                  <div
                    key={i}
                    className="rounded-sm flex items-center justify-center shrink-0"
                    style={{ width: 14, height: PLATE_H[p], backgroundColor: c.bg, borderLeft: `2px solid ${c.border}`, borderRight: `2px solid ${c.border}` }}
                  >
                    {p >= 5 && (
                      <span className="text-[6px] font-black rotate-90 whitespace-nowrap" style={{ color: c.text }}>{p}</span>
                    )}
                  </div>
                )
              })}
              {/* Right end cap */}
              <div className="w-1.5 h-12 bg-[#555] rounded-r-sm" />
            </div>
            <p className="text-[10px] text-gray-600 text-center mt-3 font-semibold">
              {t} kg total · bar {bar} kg
            </p>
          </div>

          {/* Plate breakdown */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Each side</p>
          <div className="space-y-1.5">
            {plates.map(({ plate, count }) => {
              const c = PLATE_COLOR[plate]
              return (
                <div key={plate} className="flex items-center gap-3 bg-[#111] rounded-xl border border-[#1e1e1e] px-4 py-2.5">
                  <div
                    className="w-3 rounded-sm shrink-0"
                    style={{ height: 20, backgroundColor: c.bg, border: `1.5px solid ${c.border}` }}
                  />
                  <span className="text-sm font-bold text-white flex-1">{plate} kg</span>
                  <div className="flex gap-1">
                    {Array(count).fill(0).map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {plate}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-500 shrink-0">×{count}</span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {valid && plates.length === 0 && (
        <p className="text-[11px] text-yellow-500 text-center py-3">Can't make {t} kg with standard plates</p>
      )}
      {!valid && (
        <p className="text-[11px] text-gray-700 text-center py-4">Enter a weight greater than {bar} kg</p>
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