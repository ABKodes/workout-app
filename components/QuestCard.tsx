'use client'
import { Quest } from '@/lib/useQuests'

interface Props {
  quests: Quest[]
}

export default function QuestCard({ quests }: Props) {
  const completedCount = quests.filter(q => q.complete).length

  return (
    <div className="flex items-center gap-2.5 bg-[#0f0d1a] border border-[#4c1d9550] rounded-full px-3 py-1.5 mb-3">
      <span className="text-[12px] leading-none">⚔️</span>
      <span className="text-[9px] font-bold uppercase tracking-[2px] text-[#a78bfa]">Quests</span>
      <div className="flex gap-1 ml-1">
        {quests.map(q => (
          <div
            key={q.id}
            className="w-2 h-2 rounded-full transition-colors duration-500"
            style={{ background: q.complete ? '#a78bfa' : '#2a2a2a' }}
          />
        ))}
      </div>
      <span className="text-[9px] font-bold text-[#7c3aed] ml-auto">{completedCount}/{quests.length}</span>
    </div>
  )
}
