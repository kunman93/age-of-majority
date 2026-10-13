export type Rgba = { r: number; g: number; b: number; a: number }

const RGB_PATTERN =
  /^rgba?\(\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)(?:,\s*(\d*\.?\d+))?\s*\)$/

export function parseRgb(color: string): Rgba {
  const match = RGB_PATTERN.exec(color.trim())
  if (!match)
    throw new Error(`Expected an rgb() or rgba() color, got: ${color}`)
  const [, r, g, b, a] = match
  return { r: Number(r), g: Number(g), b: Number(b), a: a ? Number(a) : 1 }
}

const linear = (channel: number) => {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance({ r, g, b }: Rgba): number {
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

export function contrastRatio(first: Rgba, second: Rgba): number {
  const [lighter, darker] = [
    relativeLuminance(first),
    relativeLuminance(second),
  ].sort((x, y) => y - x)
  return (lighter + 0.05) / (darker + 0.05)
}

export function hue({ r, g, b }: Rgba): number {
  const [red, green, blue] = [r, g, b].map((c) => c / 255)
  const max = Math.max(red, green, blue)
  const delta = max - Math.min(red, green, blue)
  if (delta === 0) return 0
  const sector =
    max === red
      ? ((green - blue) / delta) % 6
      : max === green
        ? (blue - red) / delta + 2
        : (red - green) / delta + 4
  return (sector * 60 + 360) % 360
}

export function saturation({ r, g, b }: Rgba): number {
  const [red, green, blue] = [r, g, b].map((c) => c / 255)
  const max = Math.max(red, green, blue)
  return max === 0 ? 0 : (max - Math.min(red, green, blue)) / max
}
