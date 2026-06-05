'use client'
import { SessionLog } from '@/types'
import { ACHIEVEMENTS, RANKS, getRank, computeUnlocked } from '@/lib/achievements'
import { useXP } from '@/lib/useXP'
import { useStats } from '@/lib/useStats'
import { useBodyWeight } from '@/lib/useBodyWeight'
import { useStreak } from '@/lib/useStreak'
import { useQuests } from '@/lib/useQuests'

const TIER_STYLE = {
  bronze:  { ring: 'ring-amber-700/60',  bg: 'bg-amber-900/20',  text: 'text-amber-400',  label: 'Bronze'  },
  silver:  { ring: 'ring-slate-500/60',  bg: 'bg-slate-700/20',  text: 'text-slate-300',  label: 'Silver'  },
  gold:    { ring: 'ring-yellow-600/60', bg: 'bg-yellow-900/20', text: 'text-yellow-400', label: 'Gold'    },
  diamond: { ring: 'ring-violet-500/60', bg: 'bg-violet-900/20', text: 'text-violet-400', label: 'Diamond' },
}

const STAT_CONFIG = [
  { key: 'strength'    as const, label: '⚡ STRENGTH',    color: '#f97316', from: '#c2410c', to: '#f97316' },
  { key: 'endurance'   as const, label: '🫁 ENDURANCE',   color: '#22c55e', from: '#15803d', to: '#22c55e' },
  { key: 'consistency' as const, label: '🔥 CONSISTENCY', color: '#a78bfa', from: '#4c1d95', to: '#a78bfa' },
  { key: 'power'       as const, label: '💥 POWER',       color: '#facc15', from: '#a16207', to: '#facc15' },
]

interface Props { allLogs: SessionLog[] }

export default function CharacterScreen({ allLogs }: Props) {
  const { entries: bwEntries } = useBodyWeight()
  const today = new Date().toISOString().slice(0, 10)
  const todayDayIndex = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1 })()
  const hasBWToday = bwEntries.some(e => e.date === today)

  const { questXP } = useQuests(todayDayIndex, null, allLogs, hasBWToday)
  const { powerLevel, level, xpIntoLevel, xpToNextLevel } = useXP(allLogs, questXP)
  const stats = useStats(allLogs)
  const { weekStreak } = useStreak(allLogs)

  const completed = allLogs.filter(l => l.completed)
  const rank = getRank(completed.length)
  const nextRank = RANKS.find(r => r.minSessions > completed.length) ?? null

  const bwForAchievements = bwEntries.map(e => ({ date: e.date, weight: e.weight }))
  const unlocked = computeUnlocked(allLogs, bwForAchievements)
  const unlockedCount = ACHIEVEMENTS.filter(a => unlocked.has(a.id)).length

  const xpBarPct = Math.min(100, Math.round((xpIntoLevel / xpToNextLevel) * 100))

  return (
    <div className="pb-4 space-y-4">

      {/* ── Character Hero Card ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f0d1a] to-[#1a1428] border border-[#7c3aed40] rounded-2xl p-5">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-900/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-indigo-900/8 rounded-full pointer-events-none" />

        {/* Avatar + Identity */}
        <div className="flex items-center gap-4 mb-5 relative">
          <div className="relative shrink-0">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
              style={{
                background: `linear-gradient(135deg, #4c1d95, #7c3aed)`,
                boxShadow: '0 0 24px #7c3aed50',
              }}
            >
              {rank.emoji}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#facc15] rounded-full flex items-center justify-center text-[10px] font-black text-[#0d0d0d] border-2 border-[#0d0d0d]">
              {level}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[3px] text-[#a78bfa] mb-0.5 truncate">
              {rank.name} · {stats.classTitle}
            </p>
            <p className="text-white font-black text-lg leading-tight">Your Character</p>
            <p className="text-[10px] text-gray-600 mt-0.5">Level {level}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-black text-white leading-none">{powerLevel.toLocaleString()}</p>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">Power</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-5">
          <div className="flex justify-between text-[9px] text-gray-600 mb-1.5">
            <span>Lv.{level}</span>
            <span className="text-[#a78bfa]">{xpIntoLevel} / {xpToNextLevel} XP → Lv.{level + 1}</span>
          </div>
          <div className="h-2 bg-[#1a1420] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full relative transition-all duration-1000"
              style={{
                width: `${xpBarPct}%`,
                background: 'linear-gradient(90deg, #4c1d95, #a78bfa)',
              }}
            >
              {xpBarPct > 2 && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#c084fc] rounded-full shadow-[0_0_6px_#c084fc]" />
              )}
            </div>
          </div>
        </div>

        {/* Stat Bars */}
        <div className="space-y-2.5">
          {STAT_CONFIG.map(cfg => {
            const val = stats[cfg.key]
            return (
              <div key={cfg.key}>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                  <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{val}</span>
                </div>
                <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${val}%`,
                      background: `linear-gradient(90deg, ${cfg.from}, ${cfg.to})`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { val: completed.length.toString(), label: 'Sessions', color: 'text-[#a78bfa]' },
          { val: unlockedCount.toString(),    label: 'Badges',   color: 'text-[#facc15]' },
          { val: weekStreak > 0 ? `${weekStreak}wk` : '—', label: 'Streak', color: 'text-[#22c55e]' },
        ].map(s => (
          <div key={s.label} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-3 text-center">
            <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Rank Ladder ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Rank Ladder</p>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
          {RANKS.map((r, i) => {
            const isCurrent = r.name === rank.name
            const isPast = completed.length >= r.minSessions
            return (
              <div
                key={r.name}
                className={`flex items-center gap-3 px-4 py-3 ${i < RANKS.length - 1 ? 'border-b border-[#1a1a1a]' : ''} ${
                  isCurrent ? 'bg-[#1a1428] border-l-[3px] border-l-[#7c3aed]' : ''
                }`}
              >
                <span className={`text-lg ${!isPast ? 'opacity-25' : ''}`}>{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className={`text-[12px] font-bold ${isCurrent ? 'text-white' : isPast ? 'text-gray-400' : 'text-gray-700'}`}>
                    {r.name}
                  </span>
                  {isCurrent && (
                    <span className="ml-2 text-[9px] font-bold text-[#a78bfa] bg-[#4c1d9530] px-1.5 py-0.5 rounded-full">
                      YOU
                    </span>
                  )}
                </div>
                {isCurrent && nextRank ? (
                  <span className="text-[9px] text-[#a78bfa] font-semibold shrink-0">
                    {nextRank.minSessions - completed.length} to go
                  </span>
                ) : (
                  <span className="text-[9px] text-gray-700 shrink-0">{r.minSessions}+ sessions</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Achievements ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">
          Badges · {unlockedCount} / {ACHIEVEMENTS.length}
        </p>
        <div className="space-y-2">
          {ACHIEVEMENTS.map(a => {
            const done = unlocked.has(a.id)
            const ts = TIER_STYLE[a.tier]
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                  done ? `${ts.bg} ${ts.ring} ring-1` : 'bg-[#0d0d0d] border-[#1a1a1a] opacity-40'
                }`}
              >
                <span className={`text-2xl ${done ? '' : 'grayscale'}`}>{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-bold leading-tight ${done ? 'text-white' : 'text-gray-600'}`}>{a.name}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5 leading-snug">{a.desc}</p>
                </div>
                {done
                  ? <span className={`text-[9px] font-bold uppercase tracking-wider shrink-0 ${ts.text}`}>{ts.label}</span>
                  : <span className="text-[10px] text-gray-700">🔒</span>
                }
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
