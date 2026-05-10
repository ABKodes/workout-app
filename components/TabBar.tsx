'use client'
import { Day } from '@/types'

interface Props {
  days: Day[]
  active: number
  onSelect: (i: number) => void
  showNutrition: boolean
  onNutrition: () => void
}

export default function TabBar({ days, active, onSelect, showNutrition, onNutrition }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-[#1e1e1e] flex">
      {days.map((d, i) => {
        const isActive = !showNutrition && active === i
        return (
          <button
            key={d.label}
            onClick={() => onSelect(i)}
            className={`flex-1 flex flex-col items-center py-1.5 px-0.5 transition-colors ${isActive ? 'bg-[#1a0800]' : ''}`}
          >
            <span className="text-lg leading-none">{d.emoji}</span>
            <span className={`text-[9px] font-bold mt-0.5 tracking-wide ${isActive ? 'text-orange-500' : 'text-gray-600'}`}>
              {d.label.toUpperCase()}
            </span>
            {isActive && <span className="w-1 h-1 rounded-full bg-orange-500 mt-0.5" />}
          </button>
        )
      })}
      <button
        onClick={onNutrition}
        className={`flex-1 flex flex-col items-center py-1.5 px-0.5 transition-colors ${showNutrition ? 'bg-[#1a0800]' : ''}`}
      >
        <span className="text-lg leading-none">🥗</span>
        <span className={`text-[9px] font-bold mt-0.5 tracking-wide ${showNutrition ? 'text-orange-500' : 'text-gray-600'}`}>
          NUT
        </span>
        {showNutrition && <span className="w-1 h-1 rounded-full bg-orange-500 mt-0.5" />}
      </button>
    </nav>
  )
}
