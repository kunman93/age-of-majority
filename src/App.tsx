import { useId } from 'react'
import FamilySection from './FamilySection'
import { families } from './families'

function App() {
  const finaleHeadingId = useId()

  return (
    <main className="mx-auto max-w-[720px] space-y-12 px-5 py-12 sm:space-y-16 sm:px-8 sm:py-16 lg:py-24">
      <h1 className="text-sun text-4xl leading-tight font-bold break-words sm:text-5xl lg:text-6xl">
        Happy 18th Birthday, Sara!
      </h1>
      <p className="text-lg leading-relaxed sm:text-xl">
        Today you come of age. This card gathers wishes from your family, near
        and far, to celebrate you and everything ahead of you. Scroll on and
        read what they have to say.
      </p>
      {families.map((family, index) => (
        <FamilySection key={index} family={family} />
      ))}
      <section aria-labelledby={finaleHeadingId} className="space-y-4">
        <h2
          id={finaleHeadingId}
          className="text-sun text-3xl font-bold break-words sm:text-4xl"
        >
          Here's to you, Sara!
        </h2>
        <p className="text-lg leading-relaxed sm:text-xl">
          Eighteen years of you, and the best is still ahead. Whatever you
          choose next, your family is cheering you on. Happy birthday!
        </p>
        <p className="text-blush text-lg sm:text-xl">With love, your family</p>
      </section>
    </main>
  )
}

export default App
