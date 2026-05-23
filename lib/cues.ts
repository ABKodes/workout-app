const CUES: Record<string, string> = {
  'DB Lateral Raise': 'Lead with your elbows, not your wrists',
  'Low Incline DB Press': 'Drive the dumbbells up and slightly together',
  'DB Flye w/ Integrated Partials': 'Feel the stretch at the bottom — don\'t rush it',
  'DB Skull Crusher': 'Keep your upper arms vertical throughout',
  'Close-Grip Assisted Dip': 'Lean slightly forward, elbows close to your body',
  'Plate-Weighted Crunch': 'Exhale fully at the top of every rep',
  'Overhand Lat Pulldown': 'Pull your elbows straight down — not back',
  'DB RDL': 'Push your hips back, keep the dumbbells close to your legs',
  'Helms Row': 'Pause at the top and squeeze your shoulder blade',
  'DB Lat Pullover': 'Keep a slight bend in your elbows throughout',
  'Hammer Curl': 'No swinging — initiate from the elbow only',
  'Bent-Over Reverse DB Flye': 'Lead with your pinkies, arms almost straight',
  'Hack Squat / Goblet Squat': 'Knees track over your toes, chest stays up',
  'Standing Calf Raise': 'Pause at the top and control the way down',
}

export function getCue(exerciseName: string): string | null {
  return CUES[exerciseName] ?? null
}