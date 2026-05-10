'use client'
import { useState } from 'react'
import { SessionLog } from '@/types'
import { useProgress } from '@/lib/useProgress'
import { days } from '@/lib/data'

interface Props {
  allLogs: SessionLog[]
  activeDayIndex: number
}

function ProgressChart({ points }: { points: { date: string; weight: number; isPR: boolean }[] }) {
  if (points.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-700 text-sm">
        No data yet — log some sets first
      </div>
    )
  }

  if (points.length === 1) {
    return (
      <div className="h-16 flex items-center justify-center text-gray-500 text-sm">
        {points[0].weight}kg — need more sessions for a chart
      </div>
    )
  }

  const W = 320
  const H = 120
  const PAD = 16
  const weights = points.map(p => p.weight)
  const min = Math.min(...weights) - 2.5
  const max = Math.max(...weights) + 2.5

  const toX = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2)
  const toY = (w: number) => H - PAD - ((w - min) / (max - min)) * (H - PAD * 2)

  const linePoints = points.map((p, i) => `${toX(i)},${toY(p.weight)}`).join(' ')
  const areaPoints = `${PAD},${H - PAD} ${linePoints} ${toX(points.length - 1)},${H - PAD}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
      <defs>
        <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#progGrad)" />
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

function ExerciseStats({ exerciseName, allLogs, prWeight, prDate, points }: {
  exerciseName: string
  allLogs: SessionLog[]
  prWeight: number
  prDate: string | null
  points: { date: string; weight: number; isPR: boolean }[]
}) {
  return (
    <div>
      {prWeight > 0 && (
        <div className="bg-[#1a1400] border border-yellow-900/50 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-sm font-black text-yellow-400">Best: {prWeight}kg</p>
            {prDate && <p className="text-[10px] text-gray-500 mt-0.5">{prDate}</p>}
          </div>
        </div>
      )}

      <div className="bg-[#111] rounded-xl border border-[#1e1e1e] p-4 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">Progress</p>
        <ProgressChart points={points} />
      </div>

      {points.length > 0 && (
        <div className="bg-[#111] rounded-xl border border-[#1e1e1e] overflow-hidden">
          <div className="px-4 py-2 border-b border-[#1e1e1e]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Session history</p>
          </div>
          {[...points].reverse().slice(0, 8).map((p, i) => {
            const relWidth = prWeight > 0 ? (p.weight / prWeight) * 100 : 0
            return (
              <div key={p.date} className="px-4 py-3 border-b border-[#1a1a1a] last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-gray-500">{p.date}</span>
                  <span className={`text-[12px] font-bold ${p.isPR ? 'text-yellow-400' : 'text-white'}`}>
                    {p.isPR ? '★ ' : ''}{p.weight}kg
                  </span>
                </div>
                <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${relWidth}%`, opacity: 0.4 + (0.6 * (1 - i * 0.1)) }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ExercisePicker({ allLogs, activeDayIndex, selected, onSelect }: {
  allLogs: SessionLog[]
  activeDayIndex: number
  selected: string
  onSelect: (name: string) => void
}) {
  const gymExercises = days
    .filter(d => d.badge === 'gym')
    .flatMap(d => d.sections.flatMap(s => s.rows))
    .filter(e => parseInt(e.sets) > 0)
    .map(e => e.name)

  const unique = Array.from(new Set(gymExercises))

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
      {unique.map(name => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
            selected === name
              ? 'bg-orange-500 border-orange-500 text-black'
              : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  )
}

export default function ProgressSection({ allLogs, activeDayIndex }: Props) {
  const gymExercises = days
    .filter(d => d.badge === 'gym')
    .flatMap(d => d.sections.flatMap(s => s.rows))
    .filter(e => parseInt(e.sets) > 0)

  const dayExercises = days[activeDayIndex]?.badge === 'gym'
    ? days[activeDayIndex].sections.flatMap(s => s.rows).filter(e => parseInt(e.sets) > 0)
    : gymExercises

  const defaultExercise = dayExercises[0]?.name ?? gymExercises[0]?.name ?? ''
  const [selected, setSelected] = useState(defaultExercise)

  const { points, prWeight, prDate } = useProgress(selected, allLogs)

  return (
    <div>
      <h2 className="text-lg font-black text-white mb-4">Strength Progress</h2>
      <ExercisePicker
        allLogs={allLogs}
        activeDayIndex={activeDayIndex}
        selected={selected}
        onSelect={setSelected}
      />
      <ExerciseStats
        exerciseName={selected}
        allLogs={allLogs}
        prWeight={prWeight}
        prDate={prDate}
        points={points}
      />
    </div>
  )
}
