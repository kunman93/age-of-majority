import { Canvas } from '@react-three/fiber'
import Embers from './Embers'

function EmberCanvas({ paused }: { paused: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 [&_canvas]:size-full"
    >
      <Canvas
        style={{ pointerEvents: 'none' }}
        dpr={[1, 2]}
        frameloop={paused ? 'never' : 'always'}
        gl={{ antialias: false, powerPreference: 'low-power' }}
      >
        <Embers />
      </Canvas>
    </div>
  )
}

export default EmberCanvas
