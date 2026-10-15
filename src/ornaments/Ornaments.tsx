import { ornamentLayout, type Ornament, type Placement } from './ornamentLayout'

const SHAPES: Record<Ornament['kind'], React.ReactNode> = {
  sparkle: (
    <path d="M50 0C54 32 68 46 100 50C68 54 54 68 50 100C46 68 32 54 0 50C32 46 46 32 50 0Z" />
  ),
  star: (
    <path d="M50 4L62 36L96 38L69 59L79 92L50 73L21 92L31 59L4 38L38 36Z" />
  ),
  confetti: (
    <rect
      x="30"
      y="8"
      width="40"
      height="84"
      rx="8"
      transform="rotate(35 50 50)"
    />
  ),
}

// Fills the positioned parent. mb-0 keeps a parent's space-y margin from
// shrinking the layer, so the percentages stay relative to the parent's box
/** Decorative sparkles, stars and confetti in the margins of the parent */
function Ornaments({
  placement,
  className = '',
}: {
  placement: Placement
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      data-ornaments
      className={`pointer-events-none absolute inset-0 mb-0 ${className}`}
    >
      {ornamentLayout[placement].map(
        ({ kind, left, top, size, color, drift }, index) => (
          <svg
            key={index}
            data-ornament={kind}
            data-drift={drift}
            viewBox="0 0 100 100"
            fill="currentColor"
            width={size}
            height={size}
            className={`absolute ${color}`}
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            {SHAPES[kind]}
          </svg>
        ),
      )}
    </div>
  )
}

export default Ornaments
