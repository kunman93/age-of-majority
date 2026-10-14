const HOLD = 0.2
const MORPH = 0.2
const LAST_STAGE = 2

/** Maps the showcase's scroll progress (0..1) to a stage position (0..2), holding each stage before it morphs on */
export function showcaseStage(t: number) {
  const clamped = Math.min(Math.max(t, 0), 1)
  const afterFirstHold = clamped - HOLD
  if (afterFirstHold <= 0) return 0
  const stage = Math.floor(afterFirstHold / (MORPH + HOLD))
  if (stage >= LAST_STAGE) return LAST_STAGE
  const intoMorph = afterFirstHold - stage * (MORPH + HOLD)
  return stage + Math.min(intoMorph / MORPH, 1)
}
