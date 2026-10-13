import { useId } from 'react'
import type { Family } from './families'

function FamilySection({ family }: { family: Family }) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>{family.name}</h2>
      {family.messages.map((message, index) => (
        <figure key={index}>
          <blockquote>
            <p>{message.text}</p>
          </blockquote>
          <figcaption>{message.author}</figcaption>
        </figure>
      ))}
    </section>
  )
}

export default FamilySection
