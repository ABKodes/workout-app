'use client'
import { useState } from 'react'
import { BodyProfile } from '@/lib/useMacros'

const PROFILE_KEY = 'body_profile_v1'
const ONBOARDING_KEY = 'onboarding_done_v1'

interface Props {
  onDone: () => void
}

type Step = 'profile' | 'weight'

export function needsOnboarding(): boolean {
  if (typeof window === 'undefined') return false
  return !localStorage.getItem(ONBOARDING_KEY)
}

export default function OnboardingScreen({ onDone }: Props) {
  const [step, setStep] = useState<Step>('profile')
  const [sex, setSex] = useState<'male' | 'female'>('male')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const profileValid = parseInt(age) > 0 && parseInt(height) > 100
  const weightValid = parseFloat(weight) >= 30 && parseFloat(weight) <= 250

  const handleProfileNext = () => {
    if (!profileValid) return
    const profile: BodyProfile = { age: parseInt(age), heightCm: parseInt(height), sex }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    setStep('weight')
  }

  const handleWeightDone = () => {
    if (weightValid) {
      const today = new Date().toISOString().slice(0, 10)
      const existing = JSON.parse(localStorage.getItem('bwlog_v1') || '[]')
      const filtered = existing.filter((e: { date: string }) => e.date !== today)
      const updated = [...filtered, { date: today, weight: parseFloat(weight), pendingSync: true }]
        .sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date))
      localStorage.setItem('bwlog_v1', JSON.stringify(updated))
    }
    localStorage.setItem(ONBOARDING_KEY, '1')
    onDone()
  }

  const handleSkipWeight = () => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    onDone()
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {step === 'profile' && (
          <>
            <div className="mb-8">
              <div className="text-4xl mb-4">💪</div>
              <h1 className="text-2xl font-black text-white mb-2">Welcome</h1>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Quick setup — takes 30 seconds. Your macros auto-calculate every time you log your weight.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                {(['male', 'female'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSex(s)}
                    className={`flex-1 py-3 rounded-xl text-sm font-black border transition-colors capitalize ${
                      sex === s
                        ? 'bg-violet-500 border-violet-500 text-black'
                        : 'bg-[#111] border-[#1e1e1e] text-gray-500'
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
                  className="flex-1 bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:border-violet-500 focus:outline-none"
                />
                <span className="text-gray-600 text-sm font-semibold w-8">yrs</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Height"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  className="flex-1 bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:border-violet-500 focus:outline-none"
                />
                <span className="text-gray-600 text-sm font-semibold w-8">cm</span>
              </div>

              <button
                onClick={handleProfileNext}
                disabled={!profileValid}
                className="w-full py-3.5 bg-violet-500 disabled:bg-[#1a1a1a] disabled:text-gray-700 text-black font-black text-sm rounded-xl transition-colors mt-2"
              >
                Continue →
              </button>
            </div>

            <p className="text-[10px] text-gray-700 text-center mt-4">
              Used only to calculate your TDEE — never shared.
            </p>
          </>
        )}

        {step === 'weight' && (
          <>
            <div className="mb-8">
              <div className="text-4xl mb-4">⚖️</div>
              <h1 className="text-2xl font-black text-white mb-2">Current weight</h1>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Log today's weight and your macros are ready. You can update it any time from the workout screen.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 74.5"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  autoFocus
                  className="flex-1 bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:border-violet-500 focus:outline-none"
                />
                <span className="text-gray-600 text-sm font-semibold w-8">kg</span>
              </div>

              <button
                onClick={handleWeightDone}
                disabled={!weightValid}
                className="w-full py-3.5 bg-violet-500 disabled:bg-[#1a1a1a] disabled:text-gray-700 text-black font-black text-sm rounded-xl transition-colors"
              >
                Done — show my macros
              </button>

              <button
                onClick={handleSkipWeight}
                className="w-full py-2 text-[12px] text-gray-600 hover:text-gray-400 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}