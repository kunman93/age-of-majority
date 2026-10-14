import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Points, ShaderMaterial } from 'three'
import { AdditiveBlending } from 'three'
import { createStoryParticles } from './storyParticles'

export const STORY_COUNT = 3000
const MAX_OPACITY = 0.9
const POINT_SIZE = 10
// the shapes span -1..1, so 0.35 fills about 70% of the shorter canvas side
const FIT = 0.35

const vertexShader = /* glsl */ `
  attribute vec3 aStage1;
  attribute vec3 aStage2;
  attribute float aOffset;
  uniform float uProgress;
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

    vVisible = 1.0 - 0.6 * sin(3.14159 * t);
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

function StoryObject({ progress }: { progress: { current: number } }) {
  const particles = useMemo(
    () => createStoryParticles(STORY_COUNT, Math.random),
    [],
  )
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uPixelRatio: { value: 1 },
      uSize: { value: POINT_SIZE },
      uOpacity: { value: MAX_OPACITY },
    }),
    [],
  )

  const points = useRef<Points>(null)
  const material = useRef<ShaderMaterial>(null)

  useFrame(({ viewport }) => {
    if (!points.current || !material.current) return
    points.current.scale.setScalar(
      FIT * Math.min(viewport.width, viewport.height),
    )
    const uniforms = material.current.uniforms
    uniforms.uProgress.value = progress.current
    uniforms.uPixelRatio.value = viewport.dpr
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
