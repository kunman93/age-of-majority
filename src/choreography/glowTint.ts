// The stops leave room for the brightest ember composited over the glow
type Rgb = readonly [number, number, number]

const DARK_YELLOW: Rgb = [58, 45, 8]
const DARK_ORANGE: Rgb = [70, 38, 18]
const DARK_RED: Rgb = [74, 28, 24]

const mix = (from: Rgb, to: Rgb, amount: number) =>
  from.map((channel, i) => channel + (to[i] - channel) * amount)

export function glowTint(progress: number): string {
  const clamped = Math.min(Math.max(progress, 0), 1)
  const channels =
    clamped <= 0.5
      ? mix(DARK_YELLOW, DARK_ORANGE, clamped * 2)
      : mix(DARK_ORANGE, DARK_RED, (clamped - 0.5) * 2)
  return `rgb(${channels.map(Math.round).join(', ')})`
}
