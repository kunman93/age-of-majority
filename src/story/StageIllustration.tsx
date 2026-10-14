import { stageShapes, type Point, type Stage } from './stageShapes'

const toSubpath = (polygon: Point[]) =>
  `M${polygon.map(([x, y]) => `${x} ${-y}`).join('L')}Z`

function StageIllustration({ stage }: { stage: Stage }) {
  return (
    <svg
      aria-hidden="true"
      data-stage-illustration={stage}
      viewBox="-1 -1 2 2"
      className="text-sun size-24 sm:size-28"
    >
      {stageShapes[stage].map(({ outline, holes }, index) => (
        <path
          key={index}
          fillRule="evenodd"
          fill="currentColor"
          d={[outline, ...holes].map(toSubpath).join('')}
        />
      ))}
    </svg>
  )
}

export default StageIllustration
