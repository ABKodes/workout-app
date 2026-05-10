'use client'
import { useEffect } from 'react'

interface Props {
  weight: number
  onDismiss: () => void
}

export default function PrCelebration({ weight, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 cursor-pointer"
      onClick={onDismiss}
    >
      <div className="text-center animate-[prBurst_0.4s_ease-out]">
        <div className="text-7xl mb-3">🏆</div>
        <div className="text-3xl font-black text-white mb-1">New PR!</div>
        <div className="text-xl text-orange-400 font-bold">{weight}kg</div>
      </div>
      <style>{`
        @keyframes prBurst {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
