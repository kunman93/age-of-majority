import { lazy, Suspense, useRef } from 'react'
import { glowTint } from '../choreography/glowTint'
import { ScrollTrigger, useGSAP } from '../gsap'
import SceneErrorBoundary from './SceneErrorBoundary'
import { usePageVisible } from './usePageVisible'
import type { SceneMode } from './useSceneMode'

const EmberCanvas = lazy(() => import('./EmberCanvas'))

function Background({
  mode,
  onSceneError,
}: {
  mode: SceneMode
  onSceneError: () => void
}) {
  const pageVisible = usePageVisible()
  const glow = useRef<HTMLDivElement>(null)

  // a color change, not movement, so it also runs with reduced motion
  useGSAP(() => {
    const writeTint = (progress: number) =>
      glow.current?.style.setProperty('--glow-tint', glowTint(progress))
    writeTint(0)
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => writeTint(self.progress),
      onRefresh: (self) => writeTint(self.progress),
    })
  })

  return (
    <>
      <div
        ref={glow}
        data-testid="background-glow"
        aria-hidden="true"
        className="from-(--glow-tint) to-night pointer-events-none fixed inset-0 -z-10 bg-radial-[at_50%_30%] to-70%"
      />
      {mode === 'scene' && (
        <SceneErrorBoundary onError={onSceneError}>
          <Suspense fallback={null}>
            <EmberCanvas paused={!pageVisible} />
          </Suspense>
        </SceneErrorBoundary>
      )}
    </>
  )
}

export default Background
