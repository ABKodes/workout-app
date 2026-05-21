'use client'
import { useState } from 'react'
import { useBodyWeight } from '@/lib/useBodyWeight'
import { BodyWeightEntry } from '@/types'

function LineChart({ entries }: { entries: BodyWeightEntry[] }) {
  if (entries.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-700 text-sm">
        Log at least 2 entries to see the chart
      </div>
    )
  }

  const W = 320
  const H = 120
  const PAD = 16
  const weights = entries.map(e => e.weight)
  const min = Math.min(...weights) - 1
  const max = Math.max(...weights) + 1

  const toX = (i: number) => PAD + (i / (entries.length - 1)) * (W - PAD * 2)
  const toY = (w: number) => H - PAD - ((w - min) / (max - min)) * (H - PAD * 2)

  const points = entries.map((e, i) => `${toX(i)},${toY(e.weight)}`).join(' ')
  const areaPoints = `${PAD},${H - PAD} ${points} ${toX(entries.length - 1)},${H - PAD}`

  // Target line: -0.6kg/week from first entry
  const startDate = new Date(entries[0].date).getTime()
  const targetPoints = entries.map((e, i) => {
    const weeks = (new Date(e.date).getTime() - startDate) / (7 * 24 * 3600 * 1000)
    const target = entries[0].weight - 0.6 * weeks
    return `${toX(i)},${toY(target)}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
      <defs>
        <linearGradient id="bwGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#bwGrad)" />
      <polyline points={points} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={targetPoints} fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
      {entries.map((e, i) => (
        <circle key={i} cx={toX(i)} cy={toY(e.weight)} r="3" fill="#4ade80" />
      ))}
    </svg>
  )
}

export default function BodyWeightSection() {
  const { entries, logWeight, today, totalLost, ratePerWeek, last5Weeks } = useBodyWeight()
  const [inputWeight, setInputWeight] = useState('')
  const [logging, setLogging] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleLog = () => {
    const w = parseFloat(inputWeight)
    if (isNaN(w) || w <= 0) return
    logWeight(w)
    setInputWeight('')
    setLogging(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h2 className="text-lg font-black text-white mb-4">Body Weight</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#111] rounded-xl border border-[#1e1e1e] p-3 text-center">
          <div className="text-xl font-black text-white">{today?.weight ?? '—'}</div>
          <div className="text-[10px] text-gray-600 mt-1">Today kg</div>
        </div>
        <div className="bg-[#111] rounded-xl border border-[#1e1e1e] p-3 text-center">
          <div className={`text-xl font-black ${totalLost > 0 ? 'text-green-400' : 'text-white'}`}>
            {totalLost > 0 ? `-${totalLost.toFixed(1)}` : totalLost.toFixed(1)}
          </div>
          <div className="text-[10px] text-gray-600 mt-1">Total lost</div>
        </div>
        <div className="bg-[#111] rounded-xl border border-[#1e1e1e] p-3 text-center">
          <div className="text-xl font-black text-violet-400">
            {ratePerWeek !== 0 ? ratePerWeek.toFixed(2) : '—'}
          </div>
          <div className="text-[10px] text-gray-600 mt-1">kg/week</div>
        </div>
      </div>

      {/* Chart */}
      {last5Weeks.length > 0 && (
        <div className="bg-[#111] rounded-xl border border-[#1e1e1e] p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Last 5 weeks</p>
            <div className="flex gap-3 text-[9px]">
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-green-400 inline-block" /> Actual</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-violet-400 inline-block" style={{ borderTop: '1.5px dashed #8b5cf6' }} /> Target</span>
            </div>
          </div>
          <LineChart entries={last5Weeks} />
        </div>
      )}

      {/* Log today */}
      <div className="bg-[#111] rounded-xl border border-[#1e1e1e] p-4 mb-4">
        {saved ? (
          <p className="text-sm text-green-400 text-center font-bold">✓ Weight logged!</p>
        ) : logging ? (
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 82.5"
              value={inputWeight}
              onChange={e => setInputWeight(e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:border-violet-500 focus:outline-none"
              autoFocus
            />
            <span className="flex items-center text-gray-500 text-sm font-semibold">kg</span>
            <button
              onClick={handleLog}
              className="px-4 py-2.5 bg-violet-500 text-black font-bold text-sm rounded-xl"
            >Save</button>
            <button
              onClick={() => setLogging(false)}
              className="px-3 py-2.5 bg-[#1a1a1a] text-gray-500 text-sm rounded-xl border border-[#2a2a2a]"
            >✕</button>
          </div>
        ) : (
          <button
            onClick={() => setLogging(true)}
            className="w-full py-2.5 text-sm font-bold text-violet-400 border border-violet-900/60 bg-[#12002a] rounded-xl hover:bg-violet-900/30 transition-colors"
          >
            + Log today's weight
          </button>
        )}
      </div>

      {/* Recent entries */}
      {entries.length > 0 && (
        <div className="bg-[#111] rounded-xl border border-[#1e1e1e] overflow-hidden">
          <div className="px-4 py-2 border-b border-[#1e1e1e]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Recent entries</p>
          </div>
          {[...entries].reverse().slice(0, 10).map((e, i, arr) => {
            const prev = arr[i + 1]
            const delta = prev ? e.weight - prev.weight : null
            return (
              <div key={e.date} className="flex items-center px-4 py-3 border-b border-[#1a1a1a] last:border-0">
                <span className="text-[12px] text-gray-500 flex-1">{e.date}</span>
                <span className="text-[13px] font-bold text-white mr-3">{e.weight} kg</span>
                {delta !== null && (
                  <span className={`text-[11px] font-bold ${delta < 0 ? 'text-green-400' : delta > 0 ? 'text-red-400' : 'text-gray-600'}`}>
                    {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
