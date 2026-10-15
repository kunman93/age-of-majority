import { dustSpecks } from './dust'
import { PALETTE } from './palette'

const COUNT = 46

/** Fine gold specks that thin out along a sweep */
function Dust({ seed }: { seed: number }) {
  return (
    <svg
      viewBox="0 0 200 300"
      data-ornament="dust"
      data-ornament-layer="dust"
      className="block h-auto w-full"
      fill={PALETTE.sun}
    >
      {dustSpecks(COUNT, seed).map(({ x, y, radius, opacity }, index) => (
        <circle key={index} cx={x} cy={y} r={radius} opacity={opacity} />
      ))}
    </svg>
  )
}

export default Dust
