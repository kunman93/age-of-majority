import { Canvas } from '@react-three/fiber'
import { useRef } from 'react'
import { usePageVisible } from '../background/usePageVisible'
import CakeScene from './CakeScene'
import type { Spin } from './dragRotation'
import { useInView } from './useInView'

// looks slightly down at the cake from the front, with room above for confetti
const CAMERA_POSITION: [number, number, number] = [0, 3.1, 8]
const LOOK_AT: [number, number, number] = [0, 1.5, 0]

/** Fills its parent, which sets the fixed aspect ratio */
function CakeCanvas({ blown, spin }: { blown: boolean; spin: Spin }) {
  const wrapper = useRef<HTMLSpanElement>(null)
  const inView = useInView(wrapper)
  const pageVisible = usePageVisible()

  return (
    <span
      ref={wrapper}
      aria-hidden="true"
      className="pointer-events-none block size-full [&_canvas]:size-full"
    >
      <Canvas
        style={{ pointerEvents: 'none' }}
        dpr={[1, 2]}
        frameloop={inView && pageVisible ? 'always' : 'never'}
        camera={{ position: CAMERA_POSITION, fov: 36 }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: 'low-power',
        }}
        onCreated={({ camera }) => camera.lookAt(...LOOK_AT)}
      >
        <CakeScene blown={blown} spin={spin} />
      </Canvas>
    </span>
  )
}

export default CakeCanvas
