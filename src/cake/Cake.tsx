import { useRef, useState } from 'react'
import type { SceneMode } from '../background/useSceneMode'
import { ScrollTrigger, useGSAP } from '../gsap'
import CakeIllustration from './CakeIllustration'

const LIT_HINT = 'Tap the cake to blow out the candles'
const BLOWN_HINT = 'Make a wish!'

// the 3D cake joins in a later task, so both modes show the illustration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Cake(_props: { mode: SceneMode; onSceneError: () => void }) {
  const [blown, setBlown] = useState(false)
  const button = useRef<HTMLButtonElement>(null)

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: button.current,
      start: 'top bottom',
      onLeaveBack: () => setBlown(false),
    })
  })

  return (
    <button
      ref={button}
      type="button"
      data-cake-state={blown ? 'blown' : 'lit'}
      aria-disabled={blown || undefined}
      onClick={() => setBlown(true)}
      className="focus-visible:outline-sun flex w-full cursor-pointer flex-col items-center gap-4 rounded-2xl p-4 focus-visible:outline-4 focus-visible:outline-offset-4"
    >
      <CakeIllustration blown={blown} />
      <span className="text-blush text-lg sm:text-xl">
        {blown ? BLOWN_HINT : LIT_HINT}
      </span>
    </button>
  )
}

export default Cake
