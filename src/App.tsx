import { useId } from 'react'
import FamilySection from './FamilySection'
import { families } from './families'

function App() {
  const finaleHeadingId = useId()

  return (
    <main>
      <h1 className="text-3xl font-bold">Happy 18th Birthday, Sara!</h1>
      <p>
        Today you come of age. This card gathers wishes from your family, near
        and far, to celebrate you and everything ahead of you. Scroll on and
        read what they have to say.
      </p>
      {families.map((family, index) => (
        <FamilySection key={index} family={family} />
      ))}
      <section aria-labelledby={finaleHeadingId}>
        <h2 id={finaleHeadingId}>Here's to you, Sara!</h2>
        <p>
          Eighteen years of you, and the best is still ahead. Whatever you
          choose next, your family is cheering you on. Happy birthday!
        </p>
        <p>With love, your family</p>
      </section>
    </main>
  )
}

export default App
