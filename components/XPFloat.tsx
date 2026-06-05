'use client'

export interface XPFloatItem {
  id: number
  xp: number
  isPR: boolean
  isQuest: boolean
}

interface Props {
  items: XPFloatItem[]
}

export default function XPFloat({ items }: Props) {
  if (!items.length) return null
  return (
    <>
      <style>{`
        @keyframes xpFloatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          70%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-52px) scale(1.15); }
        }
        .xp-float-anim { animation: xpFloatUp 1s ease-out forwards; }
      `}</style>
      <div className="fixed bottom-24 right-4 z-50 pointer-events-none flex flex-col-reverse gap-1.5" aria-hidden="true">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="xp-float-anim text-[13px] font-black drop-shadow-lg whitespace-nowrap"
            style={{
              animationDelay: `${idx * 100}ms`,
              color: item.isQuest ? '#4ade80' : item.isPR ? '#facc15' : '#a78bfa',
              textShadow: item.isQuest
                ? '0 0 12px #22c55e'
                : item.isPR
                ? '0 0 14px #facc15'
                : '0 0 10px #7c3aed',
            }}
          >
            {item.isQuest
              ? `⚔️ +${item.xp} XP`
              : item.isPR
              ? `★ +${item.xp} XP`
              : `+${item.xp} XP`}
          </div>
        ))}
      </div>
    </>
  )
}
