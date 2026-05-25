'use client'
import { useState } from 'react'

// All GIFs are local — downloaded once to public/demos/
// No API calls, instant load, works offline
const LOCAL_GIFS: Record<string, string> = {
  'DB Lateral Raise':               '/demos/DB_Lateral_Raise.gif',
  'Low Incline DB Press':           '/demos/Low_Incline_DB_Press.gif',
  'DB Flye w/ Integrated Partials': '/demos/DB_Flye.gif',
  'DB Skull Crusher':               '/demos/DB_Skull_Crusher.gif',
  'Close-Grip Assisted Dip':        '/demos/Close_Grip_Dip.gif',
  'Plate-Weighted Crunch':          '/demos/Plate_Weighted_Crunch.gif',
  'Overhand Lat Pulldown':          '/demos/Overhand_Lat_Pulldown.gif',
  'DB RDL':                         '/demos/DB_RDL.gif',
  'Helms Row':                      '/demos/Helms_Row.gif',
  'DB Lat Pullover':                '/demos/DB_Lat_Pullover.gif',
  'Hammer Curl':                    '/demos/Hammer_Curl.gif',
  'Bent-Over Reverse DB Flye':      '/demos/Reverse_DB_Flye.gif',
  'Hack Squat / Goblet Squat':      '/demos/Goblet_Squat.gif',
  'Standing Calf Raise':            '/demos/Standing_Calf_Raise.gif',
  'Nordic Ham Curl':                '/demos/Nordic_Ham_Curl.gif',
  'Copenhagen Hip Adduction':       '/demos/Copenhagen_Hip_Adduction.gif',
  'Reverse Nordic':                 '/demos/Reverse_Nordic.gif',
  'Depth Jumps':                    '/demos/Depth_Jumps.gif',
  'Split Squat Jumps':              '/demos/Split_Squat_Jumps.gif',
  'Box Jumps':                      '/demos/Box_Jumps.gif',
  'Single-Leg Lateral Hops':        '/demos/Single_Leg_Lateral_Hops.gif',
  'Broad Jumps':                    '/demos/Broad_Jumps.gif',
}

export function useExerciseGif(exerciseName: string) {
  const url = LOCAL_GIFS[exerciseName] ?? null
  const [failed, setFailed] = useState(false)
  return {
    gifUrl: url && !failed ? url : null,
    loading: false,
    onError: () => setFailed(true),
  }
}