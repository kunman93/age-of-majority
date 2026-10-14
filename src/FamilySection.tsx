import { useId } from 'react'
import type { Family } from './families'

const TILTS = ['rotate-[-1.2deg]', 'rotate-[1.2deg]']

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
      <h2
        data-reveal
        id={headingId}
        className="text-tangerine text-2xl font-bold break-words sm:text-3xl"
      >
        {family.name}
      </h2>
      {family.messages.map((message, index) => (
        // GSAP folds a CSS rotate into its transform, so the reveal moves a
        // wrapper and the card keeps its tilt
        <div key={index} data-reveal>
          <figure
            className={`bg-plum border-ember relative space-y-3 rounded-lg border-l-4 p-5 shadow-lg shadow-black/30 before:absolute before:-top-3 before:left-1/2 before:h-6 before:w-20 before:-translate-x-1/2 before:-rotate-2 before:bg-[rgb(244_201_168/0.55)] sm:p-6 ${TILTS[(firstCardIndex + index) % TILTS.length]}`}
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
    </section>
  )
}

export default FamilySection
