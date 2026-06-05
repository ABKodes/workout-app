'use client'
import { SessionLog } from '@/types'
import { Quest } from '@/lib/useQuests'
import { useXP } from '@/lib/useXP'
import { useStats } from '@/lib/useStats'

const STAT_CONFIG = [
  { key: 'strength'    as const, label: '⚡ STR', color: '#f97316', from: '#c2410c', to: '#f97316' },
  { key: 'endurance'   as const, label: '🫁 END', color: '#22c55e', from: '#15803d', to: '#22c55e' },
  { key: 'consistency' as const, label: '🔥 CON', color: '#a78bfa', from: '#4c1d95', to: '#a78bfa' },
  { key: 'power'       as const, label: '💥 PWR', color: '#facc15', from: '#a16207', to: '#facc15' },
]

interface Props {
  allLogs: SessionLog[]
  quests: Quest[]
  questXP: number
  sessionXP: number
  volume: number
  prs: string[]
  durationMins: number
  onClose: () => void
}

export default function VictoryScreen({ allLogs, quests, questXP, sessionXP, volume, prs, durationMins, onClose }: Props) {
  const { powerLevel, level } = useXP(allLogs, questXP)
  const stats = useStats(allLogs)
  const totalSessionXP = sessionXP + questXP

  return (
    <div className="mt-3 space-y-3">
      {/* Heading */}
      <div className="text-center pt-2">
        <div className="text-4xl mb-2">⚔️</div>
        <p className="text-[10px] font-bold uppercase tracking-[4px] text-[#a78bfa] mb-1">Session Complete</p>
        <p className="text-white font-black text-2xl">Victory.</p>
      </div>

      {/* XP Card */}
      <div
        className="rounded-2xl p-4 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)' }}
      >
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 30%, #a78bfa20, transparent 60%)' }} />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#e9d5ff] mb-1">XP EARNED THIS SESSION</p>
          <p className="text-4xl font-black text-white leading-none">+{totalSessionXP.toLocaleString()}</p>
          <p className="text-[11px] text-[#c4b5fd] mt-1.5">
            Power Level {(powerLevel - Math.round(totalSessionXP / 100)).toLocaleString()} → {powerLevel.toLocaleString()} · Lv.{level}
          </p>
        </div>
      </div>

      {/* Stat bars */}
      <div className="bg-[#0f0d1a] border border-[#4c1d9540] rounded-2xl p-4">
        <p className="text-[9px] font-bold uppercase tracking-[2px] text-gray-600 mb-3">Character Stats</p>
        <div className="space-y-2.5">
          {STAT_CONFIG.map(cfg => {
            const val = stats[cfg.key]
            return (
              <div key={cfg.key} className="flex items-center gap-3">
                <span className="text-[10px] font-bold w-14 shrink-0" style={{ color: cfg.color }}>{cfg.label}</span>
                <div className="flex-1 bg-[#1a1a1a] rounded-full h-[6px] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${val}%`,
                      background: `linear-gradient(90deg, ${cfg.from}, ${cfg.to})`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold shrink-0" style={{ color: cfg.color }}>{val}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quests */}
      <div className="bg-[#14201a] border border-[#16a34a30] rounded-2xl p-4">
        <p className="text-[9px] font-bold uppercase tracking-[2px] text-[#4ade80] mb-3">Daily Quests</p>
        <div className="space-y-2">
          {quests.map(q => (
            <div key={q.id} className="flex items-center gap-2.5">
              <span className={`text-[13px] ${q.complete ? 'text-[#22c55e]' : 'text-gray-700'}`}>
                {q.complete ? '✓' : '✗'}
              </span>
              <span className={`text-[11px] font-semibold flex-1 leading-snug ${q.complete ? 'text-[#e2e8f0]' : 'text-gray-600'}`}>
                {q.label}
              </span>
              {q.complete && (
                <span className="text-[9px] text-[#4ade80] font-bold shrink-0">+{q.xp} XP</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Session stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { val: volume >= 1000 ? `${(volume / 1000).toFixed(1)}t` : `${volume}kg`, label: 'Volume', color: 'text-[#a78bfa]' },
          { val: String(prs.length), label: 'PRs hit', color: 'text-[#facc15]' },
          { val: durationMins > 0 ? `${durationMins}m` : '—', label: 'Duration', color: 'text-[#22c55e]' },
        ].map(s => (
          <div key={s.label} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-3 text-center">
            <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* PRs list */}
      {prs.length > 0 && (
        <div className="bg-[#1a1200] border border-yellow-900/50 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-600 mb-2">New PRs 🏆</p>
          <div className="space-y-1">
            {prs.map((pr, i) => (
              <p key={i} className="text-sm text-yellow-400 font-semibold">★ {pr}</p>
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={onClose}
        className="w-full py-3.5 font-black text-sm rounded-xl text-white transition-all active:scale-95"
        style={{ background: 'linear-gradient(90deg, #4c1d95, #7c3aed)' }}
      >
        BACK TO HOME
      </button>
    </div>
  )
}
