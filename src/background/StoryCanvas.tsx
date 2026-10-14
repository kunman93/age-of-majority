import { Canvas } from '@react-three/fiber'
import { useRef } from 'react'
import StoryObject from './StoryObject'
import { useStoryScroll } from './useStoryScroll'

function StoryCanvas() {
  const wrapper = useRef<HTMLDivElement>(null)
  const progress = useStoryScroll(wrapper)

  return (
    <div
      ref={wrapper}
      aria-hidden="true"
      data-story-progress="0.00"
      className="pointer-events-none absolute inset-0 [&_canvas]:size-full"
    >
      <Canvas
        style={{ pointerEvents: 'none' }}
        dpr={[1, 2]}
        frameloop="demand"
        gl={{ antialias: false, powerPreference: 'low-power' }}
      >
        <StoryObject progress={progress} />
      </Canvas>
    </div>
  )
}

export default StoryCanvas
