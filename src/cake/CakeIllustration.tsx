import { candleLayout } from './candleLayout'

// back candles first, so the front ones overlap them
const candles = candleLayout().sort((a, b) => a.z - b.z)

const TOP = { cy: 78, rx: 62, ry: 14 }
const CANDLE = { width: 4, height: 18 }
const FLAME_HEIGHT = 9

function flamePath(x: number, tip: number) {
  const base = tip + FLAME_HEIGHT
  return `M${x} ${tip}Q${x + 4} ${base - 3} ${x} ${base}Q${x - 4} ${base - 3} ${x} ${tip}Z`
}

function CakeIllustration({ blown }: { blown: boolean }) {
  return (
    <svg
      aria-hidden="true"
      data-cake-illustration
      viewBox="-100 0 200 180"
      className="pointer-events-none h-auto w-full max-w-sm"
    >
      <ellipse cx="0" cy="164" rx="98" ry="12" className="fill-plum" />
      <path
        d="M-90 118V160A90 14 0 0 0 90 160V118Z"
        className="fill-tangerine"
      />
      <ellipse cx="0" cy="118" rx="90" ry="14" className="fill-ember" />
      <path d="M-62 78V118A62 14 0 0 0 62 118V78Z" className="fill-blush" />
      <ellipse
        cx="0"
        cy={TOP.cy}
        rx={TOP.rx}
        ry={TOP.ry}
        className="fill-cream"
      />
      {candles.map(({ x, z }, index) => {
        const cx = x * TOP.rx * 0.85
        const base = TOP.cy + z * TOP.ry * 0.85
        const top = base - CANDLE.height
        return (
          <g key={index} data-candle>
            <rect
              x={cx - CANDLE.width / 2}
              y={top}
              width={CANDLE.width}
              height={CANDLE.height}
              rx="1"
              className="fill-sun"
            />
            {!blown && (
              <path
                data-flame
                d={flamePath(cx, top - FLAME_HEIGHT - 1)}
                className="fill-ember"
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default CakeIllustration
