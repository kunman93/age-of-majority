import { lazy, Suspense, useRef, useState } from 'react'
import SceneErrorBoundary from '../background/SceneErrorBoundary'
import type { SceneMode } from '../background/useSceneMode'
import { ScrollTrigger, useGSAP } from '../gsap'
import CakeIllustration from './CakeIllustration'
import { createDragTracker, createSpin } from './dragRotation'

const CakeCanvas = lazy(() => import('./CakeCanvas'))

// the canvas fills this frame; the fallback keeps the same size so nothing jumps
const FRAME = 'block aspect-[5/4] w-full max-w-2xl'

const LIT_HINT = 'Tap the cake to blow out the candles'
const BLOWN_HINT = 'Make a wish!'

function Cake({
  mode,
  onSceneError,
}: {
  mode: SceneMode
  onSceneError: () => void
}) {
  const [blown, setBlown] = useState(false)
  const [invited, setInvited] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const [spin] = useState(createSpin)
  const [drag] = useState(() => createDragTracker(spin))

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: button.current,
      start: 'top bottom',
      onEnter: () => setInvited(true),
      onLeaveBack: () => {
        setBlown(false)
        setInvited(false)
      },
    })
  })

  // the fade-in waits for the cake to scroll into view; reduced motion shows it at once
  const hintMotion = blown
    ? ''
    : invited
      ? 'motion-safe:animate-hint-in'
      : 'opacity-0 motion-reduce:opacity-100'

  return (
    <button
      ref={button}
      type="button"
      data-cake-state={blown ? 'blown' : 'lit'}
      aria-disabled={blown || undefined}
      onPointerDown={(event) => {
        drag.start(event.pointerId, event.clientX, event.timeStamp)
      }}
      onPointerMove={(event) => {
        if (
          mode === 'scene' &&
          drag.move(event.pointerId, event.clientX, event.timeStamp)
        ) {
          event.currentTarget.setPointerCapture(event.pointerId)
        }
      }}
      onPointerUp={(event) => drag.end(event.pointerId, event.timeStamp)}
      onPointerCancel={(event) => drag.end(event.pointerId, event.timeStamp)}
      onClick={(event) => {
        // the click that ends a drag must not blow out the candles; keyboard
        // and assistive-tech clicks (detail 0) have no pointer gesture
        const endsDrag = event.detail !== 0 && drag.wasDrag
        drag.clear()
        if (endsDrag) return
        setBlown(true)
      }}
      className="focus-visible:outline-sun flex touch-pan-y w-full cursor-pointer flex-col items-center gap-4 rounded-2xl p-4 focus-visible:outline-4 focus-visible:outline-offset-4"
    >
      <span className="relative flex w-full max-w-2xl justify-center">
        {blown ? null : (
          <span
            aria-hidden="true"
            data-cake-halo
            className="from-sun/35 via-tangerine/15 pointer-events-none absolute -inset-[8%] rounded-full bg-radial to-transparent to-70% opacity-60 motion-safe:animate-halo-pulse"
          />
        )}
        <span className="relative flex w-full justify-center">
          {mode === 'scene' ? (
            <SceneErrorBoundary onError={onSceneError}>
              <Suspense
                fallback={<span aria-hidden="true" className={FRAME} />}
              >
                <span className={FRAME}>
                  <CakeCanvas blown={blown} spin={spin} />
                </span>
              </Suspense>
            </SceneErrorBoundary>
          ) : (
            <CakeIllustration blown={blown} />
          )}
        </span>
      </span>
      <span className={`text-blush text-lg sm:text-xl ${hintMotion}`}>
        {blown ? BLOWN_HINT : LIT_HINT}
      </span>
    </button>
  )
}

export default Cake
