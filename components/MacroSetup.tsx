'use client'
import { useState } from 'react'
import { BodyProfile } from '@/lib/useMacros'

interface Props {
  onSave: (profile: BodyProfile) => void
}

export default function MacroSetup({ onSave }: Props) {
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [sex, setSex] = useState<'male' | 'female'>('male')

  const valid = parseInt(age) > 0 && parseInt(height) > 100

  return (
    <div className="bg-[#12002a] border border-violet-900/50 rounded-xl p-4 mb-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-1">One-time setup</p>
      <p className="text-[12px] text-gray-400 mb-4 leading-relaxed">
        Enter once — macros auto-update every time you log your weight.
      </p>

      <div className="space-y-3">
        <div className="flex gap-2">
          {(['male', 'female'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSex(s)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors capitalize ${
                sex === s
                  ? 'bg-violet-500 border-violet-500 text-black'
                  : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Age"
            value={age}
            onChange={e => setAge(e.target.value)}
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:border-violet-500 focus:outline-none"
          />
          <span className="text-gray-500 text-sm font-semibold w-8">yrs</span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Height"
            value={height}
            onChange={e => setHeight(e.target.value)}
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:border-violet-500 focus:outline-none"
          />
          <span className="text-gray-500 text-sm font-semibold w-8">cm</span>
        </div>

        <button
          onClick={() => valid && onSave({ age: parseInt(age), heightCm: parseInt(height), sex })}
          disabled={!valid}
          className="w-full py-3 bg-violet-500 disabled:bg-[#1a1a1a] disabled:text-gray-700 text-black font-black text-sm rounded-xl transition-colors"
        >
          Calculate my macros
        </button>
      </div>
    </div>
  )
}