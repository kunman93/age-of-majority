export type Decoration = {
  position: [number, number, number]
  /** rotation around y so a box faces away from the cake's axis */
  facing: number
  /** sphere radius, or box width, height and depth */
  size: [number, number, number]
  color: string
}

type Tiers = {
  bottomRadius: number
  bottomHeight: number
  topRadius: number
  topHeight: number
}

// the card's cream, sun, tangerine, ember and blush
const CREAM = '#fff4e6'
const SUN = '#ffd166'
const TANGERINE = '#ffb663'
const EMBER = '#ff6b5b'
const BLUSH = '#f4c9a8'

// short patterns whose length does not divide the slot count, so the colours
// never repeat evenly around the cake and a turn is easy to see
const BOTTOM_PEARLS = [CREAM, EMBER, CREAM, SUN, SUN, EMBER, CREAM]
const TOP_PEARLS = [EMBER, CREAM, SUN, CREAM, CREAM, TANGERINE]
const STRIPES = [EMBER, SUN, null, CREAM, EMBER, null, null, SUN]
const DOTS = [EMBER, SUN, EMBER, CREAM, TANGERINE]
const BERRIES: { angle: number; radius: number; color: string }[] = [
  { angle: 0.35, radius: 0.93, color: EMBER },
  { angle: 1.1, radius: 0.9, color: SUN },
  { angle: 1.55, radius: 0.97, color: EMBER },
  { angle: 3.2, radius: 0.92, color: SUN },
  { angle: 4.1, radius: 0.96, color: EMBER },
  { angle: 5.3, radius: 0.9, color: BLUSH },
]

const around = (count: number, i: number) => (i / count) * Math.PI * 2

function ring(
  count: number,
  radius: number,
  y: number,
  pick: (i: number) => string | null,
  size: [number, number, number],
) {
  return Array.from({ length: count }, (_, i): Decoration | null => {
    const color = pick(i)
    if (!color) return null
    const angle = around(count, i)
    return {
      position: [Math.sin(angle) * radius, y, Math.cos(angle) * radius],
      facing: angle,
      size,
      color,
    }
  }).filter((item): item is Decoration => item !== null)
}

/** Piped pearls, a dot band, stripes and berries. Rotationally uneven. */
export function cakeDecorations({
  bottomRadius,
  bottomHeight,
  topRadius,
  topHeight,
}: Tiers) {
  const topY = bottomHeight + topHeight
  const pick = (colors: (string | null)[]) => (i: number) =>
    colors[i % colors.length]
  const ball = (r: number): [number, number, number] => [r, r, r]

  const spheres: Decoration[] = [
    // pearls on the rims, resting on the icing rings
    ...ring(
      32,
      bottomRadius - 0.04,
      bottomHeight + 0.1,
      pick(BOTTOM_PEARLS),
      ball(0.075),
    ),
    ...ring(22, topRadius - 0.03, topY + 0.08, pick(TOP_PEARLS), ball(0.06)),
    // a band of dots on the top tier's side
    ...ring(
      15,
      topRadius,
      bottomHeight + topHeight * 0.45,
      pick(DOTS),
      ball(0.06),
    ),
    // berries scattered on the top, beyond the candles
    ...BERRIES.map(({ angle, radius, color }) => ({
      position: [
        Math.sin(angle) * radius,
        topY + 0.07,
        Math.cos(angle) * radius,
      ] as [number, number, number],
      facing: angle,
      size: [0.085, 0.085, 0.085] as [number, number, number],
      color,
    })),
  ]

  const boxes = ring(23, bottomRadius, bottomHeight * 0.45, pick(STRIPES), [
    0.13,
    bottomHeight * 0.55,
    0.06,
  ])

  return { spheres, boxes }
}
