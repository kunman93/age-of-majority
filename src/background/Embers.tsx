import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { ShaderMaterial } from 'three'
import { CustomBlending, MaxEquation, OneFactor } from 'three'
import { createEmbers, EMBER_BOX } from './embers'

export const EMBER_COUNT = 120
const MAX_OPACITY = 0.3

// Max blending (not additive) keeps overlapping embers from adding up, so no
// background pixel is brighter than a single ember at MAX_OPACITY and the text
// contrast stays above 4.5:1 however the random embers overlap. The fragment
// colour is premultiplied because max blending ignores the blend factors.

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aSpeed;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uHeight;
  varying float vFade;

  void main() {
    float rise = mod(position.y + aSpeed * uTime, uHeight);
    float lifetime = rise / uHeight;
    vec3 p = position;
    p.y = rise - uHeight * 0.5;
    p.x += sin(uTime * 0.5 + aPhase) * 0.3;
    vFade = smoothstep(0.0, 0.15, lifetime) * (1.0 - smoothstep(0.85, 1.0, lifetime));
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying float vFade;

  void main() {
    float glow = 1.0 - smoothstep(0.0, 0.5, length(gl_PointCoord - 0.5));
    vec3 ember = vec3(1.0, 0.42, 0.36);
    float alpha = glow * glow * vFade * uOpacity;
    gl_FragColor = vec4(ember * alpha, alpha);
  }
`

function Embers() {
  const embers = useMemo(() => createEmbers(EMBER_COUNT, Math.random), [])
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uHeight: { value: EMBER_BOX.height },
      uOpacity: { value: MAX_OPACITY },
    }),
    [],
  )

  const material = useRef<ShaderMaterial>(null)

  useFrame(({ viewport }, delta) => {
    if (!material.current) return
    material.current.uniforms.uTime.value += delta
    material.current.uniforms.uPixelRatio.value = viewport.dpr
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[embers.positions, 3]}
        />
        <bufferAttribute attach="attributes-aSize" args={[embers.sizes, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[embers.speeds, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[embers.phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={CustomBlending}
        blendEquation={MaxEquation}
        blendSrc={OneFactor}
        blendDst={OneFactor}
      />
    </points>
  )
}

export default Embers
