import { useId } from 'react'
import type { Family } from './families'

function FamilySection({ family }: { family: Family }) {
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
        <figure
          data-reveal
          key={index}
          className="bg-plum border-ember space-y-3 rounded-lg border-l-4 p-5 sm:p-6"
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
      ))}
    </section>
  )
}

export default FamilySection
