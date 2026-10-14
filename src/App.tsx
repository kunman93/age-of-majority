import { useId, useRef } from 'react'
import TypedIntro from './choreography/TypedIntro'
import { useChoreography } from './choreography/useChoreography'
import Background from './background/Background'
import { useSceneMode } from './background/useSceneMode'
import FamilySection from './FamilySection'
import { families } from './families'
import Showcase from './story/Showcase'

const INTRO =
  'Today you come of age. This card gathers wishes from your family, near and far, to celebrate you and everything ahead of you. Scroll on and read what they have to say.'

const firstCardIndexes = families.map((_, index) =>
  families
    .slice(0, index)
    .reduce((count, family) => count + family.messages.length, 0),
)

function App() {
  const wishesHeadingId = useId()
  const finaleHeadingId = useId()
  const { mode, fallBackToStatic } = useSceneMode()
  const main = useRef<HTMLElement>(null)
  useChoreography(main, mode)

  return (
    <>
      <Background mode={mode} onSceneError={fallBackToStatic} />
      <main
        ref={main}
        className="space-y-12 px-5 pb-12 sm:space-y-16 sm:px-8 sm:pb-16 lg:pb-24"
      >
        <header
          data-opening
          className="mx-auto flex min-h-svh max-w-[720px] flex-col justify-center space-y-12 py-12 sm:space-y-16 sm:py-16 lg:py-24 short:space-y-4 short:py-4"
        >
          <h1 className="text-sun text-left text-4xl leading-tight font-bold break-words sm:text-5xl lg:text-6xl">
            Happy 18th Birthday, Sara!
          </h1>
          <TypedIntro text={INTRO} />
        </header>
        <Showcase mode={mode} onSceneError={fallBackToStatic} />
        <section
          aria-labelledby={wishesHeadingId}
          className="mx-auto max-w-6xl space-y-12 sm:space-y-16"
        >
          <div className="space-y-3 text-center">
            <p className="text-blush text-base font-semibold tracking-[0.2em] uppercase">
              From your family
            </p>
            <h2
              id={wishesHeadingId}
              className="text-sun text-3xl font-bold break-words sm:text-4xl"
            >
              Birthday wishes
            </h2>
          </div>
          <div
            data-board
            className="bg-cork border-cork-frame space-y-12 overflow-x-clip rounded-2xl border-4 bg-[radial-gradient(rgb(255_214_170/0.1)_1.5px,transparent_2px),radial-gradient(rgb(0_0_0/0.25)_1px,transparent_1.5px)] bg-[length:14px_14px,9px_9px] bg-[position:0_0,5px_4px] p-4 shadow-[inset_0_2px_14px_rgb(0_0_0/0.6)] sm:space-y-16 sm:border-8 sm:p-8"
          >
            {families.map((family, index) => (
              <FamilySection
                key={index}
                family={family}
                firstCardIndex={firstCardIndexes[index]}
              />
            ))}
          </div>
        </section>
        <section
          data-reveal
          aria-labelledby={finaleHeadingId}
          className="mx-auto max-w-[720px] space-y-4"
        >
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
          <p className="text-blush text-lg sm:text-xl">
            With love, your family
          </p>
        </section>
      </main>
    </>
  )
}

export default App
