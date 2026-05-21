'use client'
import { useState } from 'react'
import { SessionLog } from '@/types'
import NutritionScreen from './NutritionScreen'
import BodyWeightSection from './BodyWeightSection'
import ProgressSection from './ProgressSection'
import NotificationSettings from './NotificationSettings'

type Tab = 'progress' | 'bodyweight' | 'nutrition' | 'settings'

interface Props {
  allLogs: SessionLog[]
  activeDayIndex: number
}

export default function StatsScreen({ allLogs, activeDayIndex }: Props) {
  const [tab, setTab] = useState<Tab>('progress')

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'progress', label: 'Progress', icon: '📈' },
    { id: 'bodyweight', label: 'Weight', icon: '⚖️' },
    { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="pb-28">
      <div className="mb-4">
        <h1 className="text-xl font-black text-white mb-0.5">Stats</h1>
        <p className="text-[12px] text-gray-500">Track your progress over time</p>
      </div>

      {/* Pill sub-nav */}
      <div className="flex gap-1 mb-5 bg-[#111] border border-[#1e1e1e] rounded-2xl p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 ${
              tab === t.id ? 'bg-violet-500 text-black' : 'text-gray-500'
            }`}
          >
            <span className="text-base leading-none">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'nutrition' && <NutritionScreen />}
      {tab === 'bodyweight' && <BodyWeightSection />}
      {tab === 'progress' && <ProgressSection allLogs={allLogs} activeDayIndex={activeDayIndex} />}
      {tab === 'settings' && <NotificationSettings />}
    </div>
  )
}
