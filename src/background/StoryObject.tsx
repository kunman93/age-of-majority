import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Points, ShaderMaterial } from 'three'
import { AdditiveBlending, Vector2 } from 'three'
import { createEdgePoints, createStoryParticles } from './storyParticles'

export const STORY_COUNT = 3000
const MAX_OPACITY = 0.9
const POINT_SIZE = 10
// the shapes span -1..1, so 0.35 fills about 70% of the shorter canvas side
const FIT = 0.35

const vertexShader = /* glsl */ `
  attribute vec3 aStage1;
  attribute vec3 aStage2;
  attribute float aOffset;
  attribute vec2 aEdge;
  uniform float uProgress;
  uniform float uEntry;
  uniform float uExit;
  uniform vec2 uExtent;
  uniform float uPixelRatio;
  uniform float uSize;
  varying float vVisible;

  void main() {
    float segment = min(floor(uProgress), 1.0);
    float local = clamp(uProgress - segment, 0.0, 1.0);
    float t = smoothstep(aOffset * 0.5, 0.5 + aOffset * 0.5, local);
    vec3 from = segment < 0.5 ? position : aStage1;
    vec3 to = segment < 0.5 ? aStage1 : aStage2;
    vec3 p = mix(from, to, t);

    // particles fly in from the canvas edge before the morph and out to it after
    vec3 edge = vec3(aEdge * uExtent, 0.0);
    float enter = smoothstep(aOffset * 0.5, 0.5 + aOffset * 0.5, uEntry);
    float leave = smoothstep(aOffset * 0.5, 0.5 + aOffset * 0.5, uExit);
    p = mix(edge, p, enter);
    p = mix(p, edge, leave);

    vVisible = (1.0 - 0.6 * sin(3.14159 * t)) * enter * (1.0 - leave);
    gl_PointSize = uSize * uPixelRatio;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying float vVisible;

  void main() {
    float glow = 1.0 - smoothstep(0.0, 0.5, length(gl_PointCoord - 0.5));
    vec3 warm = vec3(1.0, 0.55, 0.35);
    gl_FragColor = vec4(warm, glow * glow * vVisible * uOpacity);
  }
`

type Shared = { current: number }

function StoryObject({
  progress,
  entry,
  exit,
}: {
  progress: Shared
  entry: Shared
  exit: Shared
}) {
  const particles = useMemo(
    () => createStoryParticles(STORY_COUNT, Math.random),
    [],
  )
  const edge = useMemo(() => createEdgePoints(STORY_COUNT, Math.random), [])
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uPixelRatio: { value: 1 },
      uSize: { value: POINT_SIZE },
      uOpacity: { value: MAX_OPACITY },
      uEntry: { value: 0 },
      uExit: { value: 0 },
      uExtent: { value: new Vector2(1, 1) },
    }),
    [],
  )

  const points = useRef<Points>(null)
  const material = useRef<ShaderMaterial>(null)

  useFrame(({ viewport }) => {
    if (!points.current || !material.current) return
    const scale = FIT * Math.min(viewport.width, viewport.height)
    points.current.scale.setScalar(scale)
    const uniforms = material.current.uniforms
    uniforms.uProgress.value = progress.current
    uniforms.uEntry.value = entry.current
    uniforms.uExit.value = exit.current
    uniforms.uPixelRatio.value = viewport.dpr
    // the canvas edge, in the units of the object
    uniforms.uExtent.value.set(
      viewport.width / 2 / scale,
      viewport.height / 2 / scale,
    )
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions['17'], 3]}
        />
        <bufferAttribute
          attach="attributes-aStage1"
          args={[particles.positions['18'], 3]}
        />
        <bufferAttribute
          attach="attributes-aStage2"
          args={[particles.positions.key, 3]}
        />
        <bufferAttribute attach="attributes-aEdge" args={[edge, 2]} />
        <bufferAttribute
          attach="attributes-aOffset"
          args={[particles.offsets, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}

export default StoryObject
