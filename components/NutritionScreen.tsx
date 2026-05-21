'use client'
import { useState } from 'react'
import { nutrition } from '@/lib/data'
import OneRMCalc from './OneRMCalc'
import PlateCalc from './PlateCalc'

export default function NutritionScreen() {
  const [showOrm, setShowOrm] = useState(false)
  const [showPlates, setShowPlates] = useState(false)

  const macros = [
    { val: nutrition.calories, label: 'Calories', highlight: true },
    { val: nutrition.protein, label: 'Protein', highlight: true },
    { val: nutrition.carbs, label: 'Carbs', highlight: false },
    { val: nutrition.fat, label: 'Fat', highlight: false },
  ]

  return (
    <div className="pb-28">
      <h1 className="text-xl font-black text-white mb-0.5">Nutrition</h1>
      <p className="text-[12px] text-gray-500 mb-5">Daily targets · Cut phase</p>

      {/* Macros */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Daily macros</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {macros.map(m => (
          <div
            key={m.label}
            className={`rounded-xl p-4 text-center border ${
              m.highlight
                ? 'bg-[#12002a] border-violet-900/50'
                : 'bg-[#111] border-[#1e1e1e]'
            }`}
          >
            <div className={`text-2xl font-black ${m.highlight ? 'text-violet-400' : 'text-white'}`}>{m.val}</div>
            <div className="text-[11px] text-gray-600 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="border-l-[3px] border-violet-500 bg-[#111] rounded-r-xl px-4 py-3 text-sm text-gray-400 leading-relaxed mb-6">
        {nutrition.tip.split('Creatine 5g').map((part, i) =>
          i === 0 ? part : (
            <span key={i}>
              <strong className="text-white font-semibold">Creatine 5g</strong>{part}
            </span>
          )
        )}
      </div>

      {/* Supplements */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Supplements</p>
      <div className="space-y-2 mb-6">
        {nutrition.supplements.map(s => (
          <div key={s.name} className="bg-[#111] rounded-xl border border-[#1e1e1e] p-4 flex gap-3 items-start">
            <span className="text-xl">{s.icon}</span>
            <div>
              <div className="text-[13px] font-bold text-white mb-0.5">{s.name}</div>
              <div className="text-[11px] text-gray-600 leading-relaxed">{s.dose}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Calculators */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Calculators</p>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowOrm(v => !v)}
          className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-colors ${
            showOrm ? 'bg-violet-500 border-violet-500 text-black' : 'bg-[#111] border-[#1e1e1e] text-gray-400'
          }`}
        >
          🏋️ 1RM Calculator
        </button>
        <button
          onClick={() => setShowPlates(v => !v)}
          className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-colors ${
            showPlates ? 'bg-violet-500 border-violet-500 text-black' : 'bg-[#111] border-[#1e1e1e] text-gray-400'
          }`}
        >
          🍽️ Plates
        </button>
      </div>
      {showOrm && <div className="mb-4"><OneRMCalc /></div>}
      {showPlates && <div className="mb-4"><PlateCalc /></div>}
    </div>
  )
}
