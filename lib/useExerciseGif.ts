'use client'
import { useState } from 'react'

const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

const EXERCISE_IMAGES: Record<string, string> = {
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

export function useExerciseGif(exerciseName: string) {
  const url = EXERCISE_IMAGES[exerciseName] ?? null
  const [failed, setFailed] = useState(false)
  return {
    gifUrl: (!url || failed) ? null : url,
    loading: false,
    onError: () => setFailed(true),
  }
}