'use client'
import { useEffect, useState } from 'react'
import { ACHIEVEMENTS } from '@/lib/achievements'

interface Props {
  ids: string[]
  onDone: () => void
}

const TIER_COLORS = {
  bronze:  { bg: 'bg-amber-900/80',  border: 'border-amber-700/60',  text: 'text-amber-300'  },
  silver:  { bg: 'bg-slate-700/80',  border: 'border-slate-500/60',  text: 'text-slate-200'  },
  gold:    { bg: 'bg-yellow-900/80', border: 'border-yellow-600/60', text: 'text-yellow-300' },
  diamond: { bg: 'bg-violet-900/80', border: 'border-violet-500/60', text: 'text-violet-200' },
}

export default function AchievementToast({ ids, onDone }: Props) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const achievement = ACHIEVEMENTS.find(a => a.id === ids[index])

  useEffect(() => {
    if (!achievement) { onDone(); return }
    setVisible(true)
    const hide = setTimeout(() => setVisible(false), 3200)
    const next = setTimeout(() => {
      if (index + 1 < ids.length) {
        setIndex(i => i + 1)
      } else {
        onDone()
      }
    }, 3800)
    return () => { clearTimeout(hide); clearTimeout(next) }
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!achievement) return null

  const colors = TIER_COLORS[achievement.tier]

  return (
    <div
      className={`fixed top-4 left-0 right-0 z-[60] flex justify-center px-4 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl max-w-sm w-full ${colors.bg} ${colors.border}`}>
        <span className="text-3xl shrink-0">{achievement.emoji}</span>
        <div className="min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${colors.text}`}>
            Achievement unlocked
          </p>
          <p className="text-white font-black text-[15px] leading-tight">{achievement.name}</p>
          <p className="text-gray-400 text-[11px] leading-snug mt-0.5">{achievement.desc}</p>
        </div>
      </div>
    </div>
  )
}