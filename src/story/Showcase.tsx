import { lazy, Suspense } from 'react'
import SceneErrorBoundary from '../background/SceneErrorBoundary'
import type { SceneMode } from '../background/useSceneMode'
import Ornaments from '../ornaments/Ornaments'
import StageIllustration from './StageIllustration'
import { STAGES } from './stageShapes'

const StoryCanvas = lazy(() => import('../background/StoryCanvas'))

/** Decorative and textless: the 3D story object is drawn by the story canvas in its sticky part */
function Showcase({
  mode,
  onSceneError,
}: {
  mode: SceneMode
  onSceneError: () => void
}) {
  if (mode === 'scene') {
    return (
      <div
        data-showcase
        aria-hidden="true"
        className="mx-auto h-[300svh] max-w-[720px]"
      >
        <div className="sticky top-0 h-svh">
          <Ornaments placement="showcase" />
          <SceneErrorBoundary onError={onSceneError}>
            <Suspense fallback={null}>
              <StoryCanvas />
            </Suspense>
          </SceneErrorBoundary>
        </div>
      </div>
    )
  }

  return (
    <div
      data-showcase
      aria-hidden="true"
      className="relative mx-auto grid max-w-[720px] grid-cols-3 place-items-center gap-4 [&_svg]:h-auto [&_svg]:max-w-full"
    >
      <Ornaments placement="showcase" />
      {STAGES.map((stage) => (
        <StageIllustration key={stage} stage={stage} />
      ))}
    </div>
  )
}

export default Showcase
