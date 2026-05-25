'use client'
import { useState } from 'react'
import { useBodyWeight } from '@/lib/useBodyWeight'

export default function QuickWeightLog() {
  const { today, logWeight } = useBodyWeight()
  const [input, setInput] = useState('')
  const [editing, setEditing] = useState(false)
  const [justLogged, setJustLogged] = useState(false)

  const handleLog = () => {
    const w = parseFloat(input)
    if (isNaN(w) || w < 30 || w > 250) return
    logWeight(w)
    setJustLogged(true)
    setEditing(false)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLog()
  }

  if (today && !editing) {
    return (
      <div className={`flex items-center gap-3 mb-4 rounded-xl px-4 py-3 border transition-all ${
        justLogged
          ? 'bg-[#0a2a12] border-green-900'
          : 'bg-[#111] border-[#1e1e1e]'
      }`}>
        <span className="text-base">⚖️</span>
        <div className="flex-1 min-w-0">
          <span className="text-[12px] text-gray-500">Today's weight · </span>
          <span className={`text-[13px] font-black ${justLogged ? 'text-green-400' : 'text-white'}`}>
            {today.weight} kg
          </span>
          {justLogged && <span className="text-[11px] text-green-500 ml-1">✓ logged</span>}
        </div>
        <button
          onClick={() => { setEditing(true); setJustLogged(false) }}
          className="text-[10px] text-gray-600 hover:text-violet-400 transition-colors shrink-0"
        >
          edit
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 mb-4 bg-[#111] border border-violet-900/40 rounded-xl px-4 py-3">
      <span className="text-base">⚖️</span>
      <input
        type="number"
        inputMode="decimal"
        placeholder={today ? String(today.weight) : 'Log weight (kg)'}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus={editing}
        className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
      />
      <div className="flex items-center gap-2 shrink-0">
        {editing && (
          <button
            onClick={() => setEditing(false)}
            className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
          >
            cancel
          </button>
        )}
        <button
          onClick={handleLog}
          disabled={!input}
          className="text-[11px] font-bold text-violet-400 border border-violet-900/60 bg-[#12002a] rounded-full px-3 py-1 disabled:opacity-30 hover:bg-violet-900/40 transition-colors"
        >
          Log
        </button>
      </div>
    </div>
  )
}