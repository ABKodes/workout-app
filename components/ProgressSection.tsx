'use client'
import { useState, useMemo } from 'react'
import { SessionLog } from '@/types'
import { useProgress } from '@/lib/useProgress'
import { days } from '@/lib/data'

interface Props {
  allLogs: SessionLog[]
  activeDayIndex: number
}

function MiniSpark({ points }: { points: { weight: number }[] }) {
  const last4 = points.slice(-4)
  if (last4.length === 0) return <span className="text-[10px] text-gray-700">No data yet</span>
  return (
    <div className="flex items-center gap-1 mt-0.5">
      {last4.map((p, i) => {
        const prev = last4[i - 1]
        let color = 'bg-gray-700'
        if (prev) {
          if (p.weight > prev.weight) color = 'bg-green-500'
          else if (p.weight < prev.weight) color = 'bg-red-500'
          else color = 'bg-gray-600'
        }
        return <div key={i} className={`w-2 h-2 rounded-full ${color}`} />
      })}
    </div>
  )
}

function ProgressChart({ points }: { points: { date: string; weight: number; isPR: boolean }[] }) {
  if (points.length === 0) {
    return (
      <div className="h-28 flex items-center justify-center text-gray-700 text-sm">
        No data yet — log some sets first
      </div>
    )
  }
  if (points.length === 1) {
    return (
      <div className="h-14 flex items-center justify-center text-gray-500 text-sm">
        {points[0].weight}kg — need more sessions for a chart
      </div>
    )
  }
  const W = 320, H = 110, PAD = 16
  const weights = points.map(p => p.weight)
  const min = Math.min(...weights) - 2.5
  const max = Math.max(...weights) + 2.5
  const toX = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2)
  const toY = (w: number) => H - PAD - ((w - min) / (max - min)) * (H - PAD * 2)
  const linePoints = points.map((p, i) => `${toX(i)},${toY(p.weight)}`).join(' ')
  const areaPoints = `${PAD},${H - PAD} ${linePoints} ${toX(points.length - 1)},${H - PAD}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 110 }}>
      <defs>
        <linearGradient id="progGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#progGrad2)" />
      <polyline points={linePoints} fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(p.weight)} r={p.isPR ? 5 : 3} fill={p.isPR ? '#fbbf24' : '#f97316'} />
          {p.isPR && <text x={toX(i)} y={toY(p.weight) - 8} textAnchor="middle" fontSize="10" fill="#fbbf24">★</text>}
        </g>
      ))}
    </svg>
  )
}

function ExerciseRow({ name, allLogs, open, onToggle }: {
  name: string
  allLogs: SessionLog[]
  open: boolean
  onToggle: () => void
}) {
  const { points, prWeight, prDate } = useProgress(name, allLogs)

  return (
    <div className="border-b border-[#1a1a1a] last:border-0">
      <button
        className="w-full px-4 py-3 flex items-center gap-3 text-left active:bg-[#181818] transition-colors"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-white truncate">{name}</p>
          <MiniSpark points={points} />
        </div>
        {prWeight > 0 && (
          <span className="text-[10px] font-bold text-yellow-400 shrink-0">★ {prWeight}kg</span>
        )}
        {points.length === 0 && (
          <span className="text-[10px] text-gray-700 shrink-0">—</span>
        )}
        <span className="text-gray-600 text-[10px] shrink-0 ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4">
          {prWeight > 0 && (
            <div className="bg-[#1a1400] border border-yellow-900/50 rounded-xl px-4 py-3 mb-3 flex items-center gap-3">
              <span className="text-xl">🏆</span>
              <div>
                <p className="text-sm font-black text-yellow-400">Best: {prWeight}kg</p>
                {prDate && <p className="text-[10px] text-gray-500 mt-0.5">{prDate}</p>}
              </div>
            </div>
          )}
          <div className="bg-[#0d0d0d] rounded-xl border border-[#1e1e1e] p-3 mb-3">
            <ProgressChart points={points} />
          </div>
          {points.length > 0 && (
            <div className="bg-[#0d0d0d] rounded-xl border border-[#1e1e1e] overflow-hidden">
              <div className="px-4 py-2 border-b border-[#1e1e1e]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Session history</p>
              </div>
              {[...points].reverse().slice(0, 6).map((p, i) => {
                const relWidth = prWeight > 0 ? (p.weight / prWeight) * 100 : 0
                return (
                  <div key={p.date} className="px-4 py-2.5 border-b border-[#1a1a1a] last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-gray-500">{p.date}</span>
                      <span className={`text-[12px] font-bold ${p.isPR ? 'text-yellow-400' : 'text-white'}`}>
                        {p.isPR ? '★ ' : ''}{p.weight}kg
                      </span>
                    </div>
                    <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${relWidth}%`, opacity: 0.4 + 0.6 * (1 - i * 0.1) }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ allLogs, gymExerciseNames }: { allLogs: SessionLog[]; gymExerciseNames: string[] }) {
  const { totalSessions, prCount, mostImproved } = useMemo(() => {
    const dates = new Set<string>()
    for (const log of allLogs) {
      if (Object.keys(log.exercises).length > 0) dates.add(log.date)
    }

    let prCount = 0
    let bestImprovement = 0
    let mostImproved = ''

    for (const name of gymExerciseNames) {
      const byDate: Record<string, number> = {}
      for (const log of allLogs) {
        const exLog = log.exercises[name]
        if (!exLog) continue
        const weights = exLog.sets
          .filter(s => s.done && s.weight !== '')
          .map(s => parseFloat(s.weight))
          .filter(w => !isNaN(w))
        if (weights.length === 0) continue
        const max = Math.max(...weights)
        if (!byDate[log.date] || max > byDate[log.date]) byDate[log.date] = max
      }

      const sorted = Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, w]) => w)

      if (sorted.length === 0) continue

      let runMax = 0
      for (const w of sorted) {
        if (w > runMax) { prCount++; runMax = w }
      }

      if (sorted.length >= 2 && sorted[0] > 0) {
        const improvement = (sorted[sorted.length - 1] - sorted[0]) / sorted[0]
        if (improvement > bestImprovement) {
          bestImprovement = improvement
          mostImproved = name
        }
      }
    }

    return { totalSessions: dates.size, prCount, mostImproved }
  }, [allLogs, gymExerciseNames])

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 mb-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">Performance Summary</p>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-2xl font-black text-orange-400">{totalSessions}</p>
          <p className="text-[10px] text-gray-600 mt-0.5 leading-tight">Sessions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-yellow-400">{prCount}</p>
          <p className="text-[10px] text-gray-600 mt-0.5 leading-tight">PRs hit</p>
        </div>
        <div className="text-center min-w-0">
          <p className="text-[11px] font-black text-green-400 leading-tight truncate">{mostImproved || '—'}</p>
          <p className="text-[10px] text-gray-600 mt-0.5 leading-tight">Most improved</p>
        </div>
      </div>
    </div>
  )
}

export default function ProgressSection({ allLogs, activeDayIndex }: Props) {
  const [openExercise, setOpenExercise] = useState<string | null>(null)

  const gymExerciseNames = useMemo(() =>
    Array.from(new Set(
      days
        .filter(d => d.badge === 'gym')
        .flatMap(d => d.sections.flatMap(s => s.rows))
        .filter(e => parseInt(e.sets) > 0)
        .map(e => e.name)
    )),
    []
  )

  const handleToggle = (name: string) => {
    setOpenExercise(prev => prev === name ? null : name)
  }

  // suppress unused warning — activeDayIndex reserved for future day-filtered view
  void activeDayIndex

  return (
    <div>
      <h2 className="text-lg font-black text-white mb-4">Strength Progress</h2>
      <SummaryCard allLogs={allLogs} gymExerciseNames={gymExerciseNames} />
      <div className="bg-[#111] rounded-xl border border-[#1e1e1e] overflow-hidden">
        <div className="px-4 py-2 border-b border-[#1e1e1e]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">All exercises</p>
        </div>
        {gymExerciseNames.map(name => (
          <ExerciseRow
            key={name}
            name={name}
            allLogs={allLogs}
            open={openExercise === name}
            onToggle={() => handleToggle(name)}
          />
        ))}
      </div>
    </div>
  )
}
