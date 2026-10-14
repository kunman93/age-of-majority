import { lazy, Suspense } from 'react'
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

  return (
    <>
      <div
        data-testid="background-glow"
        aria-hidden="true"
        className="from-glow to-night pointer-events-none fixed inset-0 -z-10 bg-radial-[at_50%_30%] to-70%"
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
