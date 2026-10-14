import { useId } from 'react'
import type { Family } from './families'

// A pinned note swings to the opposite tilt on hover, like a pendulum
const TILTS = [
  'rotate-[-1.2deg] motion-safe:hover:rotate-[1.2deg]',
  'rotate-[1.2deg] motion-safe:hover:rotate-[-1.2deg]',
]

// The +2px centers tape and pin on the card's border box, which the 4px left
// border makes wider than the padding box they are positioned against
const TAPE =
  'before:absolute before:-top-3 before:left-[calc(50%-2.5rem+2px)] before:h-6 before:w-20 before:-rotate-2 before:bg-[rgb(244_201_168/0.55)]'

const PIN =
  'after:absolute after:-top-2 after:left-[calc(50%-0.5rem+2px)] after:size-4 after:rounded-full after:bg-[radial-gradient(circle_at_35%_30%,#ff9a8c,#ff6b5b_45%,#9c2b20)] after:shadow-sm after:shadow-black/50'

const SWING =
  'origin-[50%_0] motion-safe:transition-[rotate,box-shadow] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:hover:shadow-2xl'

function FamilySection({
  family,
  firstCardIndex,
}: {
  family: Family
  firstCardIndex: number
}) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className="space-y-6">
      <h3
        data-reveal
        id={headingId}
        className="text-tangerine text-center text-2xl font-bold break-words sm:text-3xl"
      >
        {family.name}
      </h3>
      <div className="flex flex-col items-center gap-10 sm:flex-row sm:flex-wrap sm:items-start sm:justify-center">
        {family.messages.map((message, index) => (
          // GSAP folds a CSS rotate into its transform, so the reveal moves a
          // wrapper and the card keeps its tilt
          <div key={index} data-reveal="card" className="w-full sm:w-[28rem]">
            <figure
              className={`bg-plum border-ember relative space-y-3 rounded-lg border-l-4 p-5 shadow-lg shadow-black/30 sm:p-6 ${TAPE} ${PIN} ${SWING} ${TILTS[(firstCardIndex + index) % TILTS.length]}`}
            >
              <blockquote>
                <p className="text-base leading-relaxed break-words sm:text-lg">
                  {message.text}
                </p>
              </blockquote>
              <figcaption className="text-blush text-base font-semibold break-words">
                {message.author}
              </figcaption>
            </figure>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FamilySection
