'use client'
import { useCallback, useState } from 'react'
import { useBodyWeight } from './useBodyWeight'

export interface BodyProfile {
  age: number
  heightCm: number
  sex: 'male' | 'female'
}

export interface Macros {
  calories: number
  protein: number
  carbs: number
  fat: number
}

const PROFILE_KEY = 'body_profile_v1'

function loadProfile(): BodyProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function calculate(weightKg: number, profile: BodyProfile): Macros {
  // Mifflin-St Jeor BMR
  const bmr = profile.sex === 'male'
    ? 10 * weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5
    : 10 * weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161

  // Very active multiplier: gym 3x + football 6hrs/week + sprint sessions
  const tdee = bmr * 1.725

  // 20% deficit → 0.5–0.7 kg/week fat loss
  const calories = Math.round(tdee * 0.80)

  const protein = Math.round(weightKg * 2.4)  // 2.4 g/kg — higher during cut to preserve muscle
  const fat     = Math.round(weightKg * 0.8)  // 0.8 g/kg (hormonal floor)
  const carbs   = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4))

  return { calories, protein, carbs, fat }
}

export function useMacros() {
  const { today, entries } = useBodyWeight()
  const [profile, setProfile] = useState<BodyProfile | null>(() => loadProfile())

  const weightKg = today?.weight
    ?? (entries.length > 0 ? entries[entries.length - 1].weight : null)

  const macros = weightKg && profile ? calculate(weightKg, profile) : null

  const saveProfile = useCallback((p: BodyProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
    setProfile(p)
  }, [])

  return { macros, profile, saveProfile, weightKg }
}