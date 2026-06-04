'use client'
import { SessionLog } from '@/types'
import { ACHIEVEMENTS, RANKS, getRank, getNextRank, computeTotalVolume } from '@/lib/achievements'
import { computeUnlocked } from '@/lib/achievements'
import { useBodyWeight } from '@/lib/useBodyWeight'

const TIER_STYLE = {
  bronze:  { ring: 'ring-amber-700/60',  bg: 'bg-amber-900/20',  text: 'text-amber-400',  label: 'Bronze'  },
  silver:  { ring: 'ring-slate-500/60',  bg: 'bg-slate-700/20',  text: 'text-slate-300',  label: 'Silver'  },
  gold:    { ring: 'ring-yellow-600/60', bg: 'bg-yellow-900/20', text: 'text-yellow-400', label: 'Gold'    },
  diamond: { ring: 'ring-violet-500/60', bg: 'bg-violet-900/20', text: 'text-violet-400', label: 'Diamond' },
}

interface Props { allLogs: SessionLog[] }

export default function AchievementsScreen({ allLogs }: Props) {
  const { entries: bwEntries } = useBodyWeight()
  const unlocked = computeUnlocked(allLogs, bwEntries)

  const completed = allLogs.filter(l => l.completed)
  const sessions = completed.length
  const totalVolume = computeTotalVolume(allLogs)
  const rank = getRank(sessions)
  const nextRank = getNextRank(sessions)
  const progressToNext = nextRank
    ? (sessions - getRank(sessions).minSessions) / (nextRank.minSessions - getRank(sessions).minSessions)
    : 1

  const unlockedCount = ACHIEVEMENTS.filter(a => unlocked.has(a.id)).length

  return (
    <div className="pb-4 space-y-5">

      {/* Rank card */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">{rank.emoji}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: rank.color }}>Current rank</p>
            <p className="text-white font-black text-lg leading-tight">{rank.name}</p>
            <p className="text-[11px] text-gray-600 mt-0.5">{sessions} sessions completed</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-black text-violet-400">{unlockedCount}</p>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider">/ {ACHIEVEMENTS.length} badges</p>
          </div>
        </div>

        {nextRank && (
          <>
            <div className="flex items-center justify-between text-[10px] text-gray-600 mb-1.5">
              <span>{rank.name}</span>
              <span>{nextRank.name} in {nextRank.minSessions - sessions} sessions</span>
            </div>
            <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.round(progressToNext * 100)}%`, backgroundColor: rank.color }}
              />
            </div>
          </>
        )}
        {!nextRank && (
          <p className="text-[11px] text-yellow-400 font-bold text-center mt-1">🏆 Maximum rank reached</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { val: sessions.toString(),          label: 'Sessions',    color: 'text-violet-400' },
          { val: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`, label: 'Volume lifted', color: 'text-green-400' },
          { val: `${unlockedCount}/${ACHIEVEMENTS.length}`, label: 'Badges', color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-3 text-center">
            <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Rank ladder */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Rank ladder</p>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
          {RANKS.map((r, i) => {
            const isCurrentRank = r.name === rank.name
            return (
              <div
                key={r.name}
                className={`flex items-center gap-3 px-4 py-3 ${i < RANKS.length - 1 ? 'border-b border-[#1e1e1e]' : ''} ${isCurrentRank ? 'bg-[#1a1a2a]' : ''}`}
              >
                <span className="text-xl">{r.emoji}</span>
                <div className="flex-1">
                  <span className={`text-sm font-bold ${isCurrentRank ? 'text-white' : 'text-gray-500'}`}>{r.name}</span>
                  {isCurrentRank && <span className="ml-2 text-[9px] font-bold text-violet-400 bg-violet-900/30 px-1.5 py-0.5 rounded-full">YOU</span>}
                </div>
                <span className="text-[10px] text-gray-600">{r.minSessions}+ sessions</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Achievements grid */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Achievements</p>
        <div className="space-y-2">
          {ACHIEVEMENTS.map(a => {
            const done = unlocked.has(a.id)
            const ts = TIER_STYLE[a.tier]
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                  done
                    ? `${ts.bg} ${ts.ring} ring-1`
                    : 'bg-[#0d0d0d] border-[#1a1a1a] opacity-40'
                }`}
              >
                <span className={`text-2xl ${done ? '' : 'grayscale'}`}>{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-bold leading-tight ${done ? 'text-white' : 'text-gray-600'}`}>{a.name}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5 leading-snug">{a.desc}</p>
                </div>
                {done && (
                  <span className={`text-[9px] font-bold uppercase tracking-wider shrink-0 ${ts.text}`}>{ts.label}</span>
                )}
                {!done && (
                  <span className="text-[10px] text-gray-700">🔒</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}