'use client'
import { useEffect, useState } from 'react'

const COLORS = ['#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#fbbf24']
const COUNT = 60

interface Piece {
  id: number
  x: number
  color: string
  size: number
  delay: number
  duration: number
  rotation: number
}

export default function Confetti({ onDone }: { onDone: () => void }) {
  const [pieces] = useState<Piece[]>(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.6,
      duration: 1.8 + Math.random() * 1.2,
      rotation: Math.random() * 720 - 360,
    }))
  )
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone() }, 2800)
    return () => clearTimeout(t)
  }, [onDone])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[55] pointer-events-none overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * (0.4 + Math.random() * 0.6),
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(var(--r, 360deg)); opacity: 0; }
        }
      `}</style>
    </div>
  )
}