'use client'
import { useEffect, useState } from 'react'
import { days } from '@/lib/data'
import { useLog } from '@/lib/useLog'
import TabBar from '@/components/TabBar'
import DayScreen from '@/components/DayScreen'
import NutritionScreen from '@/components/NutritionScreen'

function todayIndex(): number {
  // JS: 0=Sun,1=Mon...6=Sat → remap to Mon=0...Sun=6
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
}

export default function Home() {
  const [active, setActive] = useState(0)
  const [showNutrition, setShowNutrition] = useState(false)
  const { allLogs } = useLog(active)

  useEffect(() => {
    setActive(todayIndex())
  }, [])

  const handleSelectDay = (i: number) => {
    setActive(i)
    setShowNutrition(false)
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d]">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {showNutrition
          ? <NutritionScreen />
          : <DayScreen day={days[active]} dayIndex={active} allLogs={allLogs} />
        }
      </div>
      <TabBar
        days={days}
        active={active}
        onSelect={handleSelectDay}
        showNutrition={showNutrition}
        onNutrition={() => setShowNutrition(true)}
      />
    </main>
  )
}
