'use client'
import { useEffect, useState } from 'react'

// GIPHY search terms — exercises without a Jeff Nippard embedded video use these
const GIPHY_TERMS: Record<string, string> = {
  'DB Lateral Raise': 'jeff nippard lateral raise',
  'Low Incline DB Press': 'jeff nippard incline dumbbell press',
  'DB Flye w/ Integrated Partials': 'jeff nippard chest fly',
  'DB Skull Crusher': 'jeff nippard skull crusher',
  'Close-Grip Assisted Dip': 'jeff nippard dips',
  'Plate-Weighted Crunch': 'weighted crunch gym exercise',
  'Overhand Lat Pulldown': 'jeff nippard lat pulldown',
  'DB RDL': 'jeff nippard romanian deadlift',
  'Helms Row': 'jeff nippard dumbbell row',
  'DB Lat Pullover': 'dumbbell pullover gym form',
  'Hammer Curl': 'jeff nippard hammer curl',
  'Bent-Over Reverse DB Flye': 'jeff nippard rear delt fly',
  'Hack Squat / Goblet Squat': 'jeff nippard goblet squat',
  'Standing Calf Raise': 'jeff nippard calf raise',
  'Nordic Ham Curl': 'nordic hamstring curl gym',
  'Copenhagen Hip Adduction': 'hip adduction exercise gym',
  'Reverse Nordic': 'reverse nordic curl exercise',
  'Depth Jumps': 'depth jump plyometric training',
  'Split Squat Jumps': 'split squat jump exercise',
  'Box Jumps': 'box jump exercise gym',
  'Single-Leg Lateral Hops': 'lateral hop exercise',
  'Broad Jumps': 'broad jump exercise',
}

// Static fallback images — instant, no API needed (free-exercise-db)
const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'
const STATIC_IMAGES: Record<string, string> = {
  'DB Lateral Raise': `${BASE}/Side_Lateral_Raise/0.jpg`,
  'Low Incline DB Press': `${BASE}/Incline_Dumbbell_Press/0.jpg`,
  'DB Flye w/ Integrated Partials': `${BASE}/Dumbbell_Flyes/0.jpg`,
  'DB Skull Crusher': `${BASE}/EZ-Bar_Skullcrusher/0.jpg`,
  'Close-Grip Assisted Dip': `${BASE}/Dips_-_Triceps_Version/0.jpg`,
  'Plate-Weighted Crunch': `${BASE}/Weighted_Crunches/0.jpg`,
  'Overhand Lat Pulldown': `${BASE}/Wide-Grip_Lat_Pulldown/0.jpg`,
  'DB RDL': `${BASE}/Romanian_Deadlift/0.jpg`,
  'Helms Row': `${BASE}/Dumbbell_Incline_Row/0.jpg`,
  'DB Lat Pullover': `${BASE}/Bent-Arm_Dumbbell_Pullover/0.jpg`,
  'Hammer Curl': `${BASE}/Hammer_Curls/0.jpg`,
  'Bent-Over Reverse DB Flye': `${BASE}/Reverse_Flyes/0.jpg`,
  'Hack Squat / Goblet Squat': `${BASE}/Goblet_Squat/0.jpg`,
  'Standing Calf Raise': `${BASE}/Standing_Dumbbell_Calf_Raise/0.jpg`,
  'Copenhagen Hip Adduction': `${BASE}/Cable_Hip_Adduction/0.jpg`,
  'Depth Jumps': `${BASE}/Linear_Depth_Jump/0.jpg`,
  'Split Squat Jumps': `${BASE}/Freehand_Jump_Squat/0.jpg`,
  'Box Jumps': `${BASE}/Front_Box_Jump/0.jpg`,
  'Single-Leg Lateral Hops': `${BASE}/Single-Leg_Lateral_Hop/0.jpg`,
  'Broad Jumps': `${BASE}/Depth_Jump_Leap/0.jpg`,
}

const CACHE_KEY = 'exercise_gif_giphy_v1'
const GIPHY_KEY = process.env.NEXT_PUBLIC_GIPHY_KEY

function loadCache(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') } catch { return {} }
}
function saveCache(name: string, url: string) {
  const c = loadCache(); c[name] = url
  localStorage.setItem(CACHE_KEY, JSON.stringify(c))
}

export function useExerciseGif(exerciseName: string) {
  const staticUrl = STATIC_IMAGES[exerciseName] ?? null
  const [gifUrl, setGifUrl] = useState<string | null>(staticUrl)
  const [loading, setLoading] = useState(!!GIPHY_KEY && !!GIPHY_TERMS[exerciseName])
  const [staticFailed, setStaticFailed] = useState(false)

  useEffect(() => {
    if (!GIPHY_KEY || !GIPHY_TERMS[exerciseName]) return

    const cache = loadCache()
    if (cache[exerciseName]) {
      setGifUrl(cache[exerciseName])
      setLoading(false)
      return
    }

    const term = encodeURIComponent(GIPHY_TERMS[exerciseName])
    fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${term}&limit=1&rating=g&lang=en`)
      .then(r => r.json())
      .then((d: { data?: { images?: { original?: { url?: string } } }[] }) => {
        const url = d?.data?.[0]?.images?.original?.url ?? null
        if (url) { saveCache(exerciseName, url); setGifUrl(url) }
      })
      .catch(() => {/* keep static image */})
      .finally(() => setLoading(false))
  }, [exerciseName])

  return {
    gifUrl: staticFailed ? null : gifUrl,
    loading,
    onError: () => { setStaticFailed(true); setGifUrl(null) },
  }
}