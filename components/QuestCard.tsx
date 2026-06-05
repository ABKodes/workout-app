'use client'
import { Quest } from '@/lib/useQuests'

interface Props {
  quests: Quest[]
}

export default function QuestCard({ quests }: Props) {
  const completedCount = quests.filter(q => q.complete).length

  return (
    <div className="bg-[#0f0d1a] border border-[#4c1d9550] rounded-2xl p-4 mb-4 relative overflow-hidden">
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-violet-900/10 rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[14px]">⚔️</span>
          <span className="text-[10px] font-bold tracking-[2px] text-[#a78bfa] uppercase">Daily Quests</span>
        </div>
        <div className="bg-[#1a1420] border border-[#7c3aed40] rounded-full px-2.5 py-0.5">
          <span className="text-[9px] text-[#a78bfa] font-bold">{completedCount} / 3</span>
        </div>
      </div>

      {/* Quest rows */}
      <div className="space-y-1.5">
        {quests.map((q, i) => (
          <div
            key={q.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
              q.complete
                ? 'bg-[#14201a] border-[#16a34a40]'
                : 'bg-[#0f0d1a] border-[#7c3aed25]'
            }`}
          >
            <div
              className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 ${
                q.complete
                  ? 'bg-[#16a34a]'
                  : 'border border-[#7c3aed50] text-gray-700'
              }`}
            >
              {q.complete
                ? <span className="text-[10px] text-black font-bold leading-none">✓</span>
                : <span className="text-[9px] leading-none">{i + 1}</span>
              }
            </div>
            <span
              className={`text-[11px] font-semibold flex-1 leading-snug ${
                q.complete ? 'text-[#4ade80] line-through opacity-60' : 'text-white'
              }`}
            >
              {q.label}
            </span>
            <span
              className={`text-[9px] font-bold shrink-0 ${
                q.complete ? 'text-[#16a34a]' : 'text-gray-700'
              }`}
            >
              +{q.xp} XP
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-[3px] bg-[#1a1420] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] transition-all duration-700"
          style={{ width: `${Math.round((completedCount / 3) * 100)}%` }}
        />
      </div>
    </div>
  )
}
