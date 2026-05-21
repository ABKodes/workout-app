'use client'
import { Day } from '@/types'

interface Props {
  days: Day[]
  active: number
  onSelect: (i: number) => void
  showStats: boolean
  onStats: () => void
}

export default function TabBar({ days, active, onSelect, showStats, onStats }: Props) {
  const tabs = [
    ...days.map((d, i) => ({
      key: d.label,
      emoji: d.emoji,
      label: d.label.toUpperCase(),
      isActive: !showStats && active === i,
      onClick: () => onSelect(i),
    })),
    {
      key: 'stats',
      emoji: '📊',
      label: 'STATS',
      isActive: showStats,
      onClick: onStats,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-[#1e1e1e] flex" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={tab.onClick}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95"
          style={{ minHeight: 62, paddingTop: 10, paddingBottom: 10 }}
        >
          {/* Active top pill */}
          <div className={`w-6 h-0.5 rounded-full mb-1 transition-all duration-200 ${tab.isActive ? 'bg-violet-500' : 'bg-transparent'}`} />

          <span className={`leading-none transition-all duration-200 ${tab.isActive ? 'text-2xl' : 'text-xl'}`}>
            {tab.emoji}
          </span>
          <span className={`text-[9px] font-black tracking-widest mt-0.5 transition-colors duration-200 ${tab.isActive ? 'text-violet-500' : 'text-gray-600'}`}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
