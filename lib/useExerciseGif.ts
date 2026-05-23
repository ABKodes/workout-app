'use client'
import { useEffect, useState } from 'react'

// Maps app exercise names to ExerciseDB search terms
const SEARCH_TERMS: Record<string, string> = {
  'DB Lateral Raise': 'dumbbell lateral raise',
  'Low Incline DB Press': 'incline dumbbell press',
  'DB Flye w/ Integrated Partials': 'dumbbell fly',
  'DB Skull Crusher': 'skull crusher',
  'Close-Grip Assisted Dip': 'dips',
  'Plate-Weighted Crunch': 'weighted crunch',
  'Overhand Lat Pulldown': 'lat pulldown',
  'DB RDL': 'romanian deadlift',
  'Helms Row': 'dumbbell row',
  'DB Lat Pullover': 'dumbbell pullover',
  'Hammer Curl': 'hammer curl',
  'Bent-Over Reverse DB Flye': 'reverse fly',
  'Hack Squat / Goblet Squat': 'goblet squat',
  'Standing Calf Raise': 'standing calf raise',
  'Nordic Ham Curl': 'nordic hamstring curl',
  'Copenhagen Hip Adduction': 'hip adduction',
  'Reverse Nordic': 'reverse nordic',
  'Depth Jumps': 'depth jump',
  'Split Squat Jumps': 'jump squat',
  'Box Jumps': 'box jump',
  'Single-Leg Lateral Hops': 'lateral hop',
  'Broad Jumps': 'broad jump',
}

const CACHE_KEY = 'exercise_gif_cache_v1'

function loadCache(): Record<string, string | null> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveToCache(name: string, url: string | null) {
  const cache = loadCache()
  cache[name] = url
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
}

export function useExerciseGif(exerciseName: string) {
  const [gifUrl, setGifUrl] = useState<string | null | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const searchTerm = SEARCH_TERMS[exerciseName]
    if (!searchTerm) {
      setGifUrl(null)
      return
    }

    // Check cache first
    const cache = loadCache()
    if (exerciseName in cache) {
      setGifUrl(cache[exerciseName])
      return
    }

    const key = process.env.NEXT_PUBLIC_EXERCISEDB_KEY
    if (!key) {
      setGifUrl(null)
      return
    }

    setLoading(true)
    fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(searchTerm)}?limit=1&offset=0`,
      {
        headers: {
          'x-rapidapi-key': key,
          'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
        },
      }
    )
      .then(r => r.json())
      .then((data: { gifUrl?: string }[]) => {
        const url = data?.[0]?.gifUrl ?? null
        saveToCache(exerciseName, url)
        setGifUrl(url)
      })
      .catch(() => {
        saveToCache(exerciseName, null)
        setGifUrl(null)
      })
      .finally(() => setLoading(false))
  }, [exerciseName])

  return { gifUrl, loading }
}