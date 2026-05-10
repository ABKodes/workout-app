'use client'
import { useStreak } from '@/lib/useStreak'
import { SessionLog } from '@/types'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface Props { allLogs: SessionLog[] }

export default function StreakBar({ allLogs }: Props) {
  const { weekDots, weekStreak, sessionsThisWeek } = useStreak(allLogs)

  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex gap-1.5">
        {weekDots.map((dot, i) => (
          <div
            key={dot.date}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
              dot.completed ? 'bg-orange-500 text-black' : 'bg-[#1a1a1a] text-gray-600 border border-[#2a2a2a]'
            }`}
          >
            {DAY_LABELS[i]}
          </div>
        ))}
      </div>
      <div className="text-right ml-auto">
        <div className="text-sm font-bold text-orange-500">
          {weekStreak > 0 ? `🔥 ${weekStreak}wk` : `${sessionsThisWeek}/7`}
        </div>
        <div className="text-[9px] text-gray-600 leading-none">streak</div>
      </div>
    </div>
  )
}
