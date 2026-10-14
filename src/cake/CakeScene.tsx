import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import type {
  Group,
  InstancedMesh,
  PointLight,
  Points,
  ShaderMaterial,
} from 'three'
import { AdditiveBlending, Color, MathUtils, Object3D } from 'three'
import { cakeDecorations } from './decorations'
import { CANDLE_COUNT, candleLayout } from './candleLayout'
import { type Spin, stepSpin } from './dragRotation'
import {
  CONFETTI_DURATION,
  createConfetti,
  FLAME_OUT_DURATION,
} from './confetti'

const CONFETTI_COUNT = 160
const GRAVITY = 5
const BURST_ORIGIN = 2.1

const PLATE = { radius: 2.2, height: 0.1 }
const BOTTOM = { radius: 1.7, height: 0.85 }
const TOP = { radius: 1.1, height: 0.7 }
const TOP_Y = BOTTOM.height + TOP.height
const CANDLE = { radius: 0.035, height: 0.36 }
const FLAME_SIZE = 0.34
const FLAME_BASE_Y = TOP_Y + CANDLE.height
const LIGHT_INTENSITY = 7

const CAKE_COLORS = {
  plate: '#f4c9a8',
  bottom: '#ffb663',
  top: '#f4c9a8',
  frosting: '#fff4e6',
  candle: '#ff6b5b',
}

// both point sets are sized in world units: pixels = size * uScale / distance
const pointSize = /* glsl */ `
  float pixelSize(float size, float depth) {
    return size * uScale / depth;
  }
`

const flameVertexShader = /* glsl */ `
  attribute float aPhase;
  uniform float uTime;
  uniform float uOut;
  uniform float uScale;
  uniform float uSize;
  varying float vAlpha;
  ${pointSize}

  void main() {
    float flicker = 1.0
      + 0.14 * sin(uTime * 13.0 + aPhase * 6.2831)
      + 0.08 * sin(uTime * 23.0 + aPhase * 17.0)
      + 0.05 * sin(uTime * 41.0 + aPhase * 5.0);
    float alive = 1.0 - uOut;
    vec3 p = position;
    p.x += sin(uTime * 7.0 + aPhase * 9.0) * 0.012 * alive;
    p.y += uSize * 0.3;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vAlpha = alive * alive * clamp(flicker, 0.0, 1.3);
    gl_PointSize = pixelSize(uSize * flicker * alive, -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const flameFragmentShader = /* glsl */ `
  varying float vAlpha;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    // a teardrop: narrow towards the tip at the top
    float width = mix(1.0, 2.6, clamp(0.5 - p.y, 0.0, 1.0));
    float d = length(vec2(p.x * width, (p.y - 0.05) * 0.9)) * 2.0;
    float glow = 1.0 - smoothstep(0.0, 1.0, d);
    float core = 1.0 - smoothstep(0.0, 0.55, d);
    vec3 color = mix(vec3(1.0, 0.45, 0.18), vec3(1.0, 0.93, 0.7), core);
    float alpha = glow * glow * vAlpha;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`

const confettiVertexShader = /* glsl */ `
  attribute vec3 aVelocity;
  attribute vec3 aColor;
  attribute float aSpin;
  attribute float aDelay;
  uniform float uElapsed;
  uniform float uScale;
  uniform float uSize;
  uniform float uGravity;
  uniform float uDuration;
  uniform float uOriginY;
  uniform float uTopRadius;
  uniform float uTopHeight;
  uniform float uBottomRadius;
  uniform float uBottomHeight;
  uniform float uPlateRadius;
  varying vec3 vColor;
  varying float vAlpha;
  ${pointSize}

  void main() {
    float t = max(uElapsed - aDelay, 0.0);
    vec3 p = vec3(0.0, uOriginY, 0.0) + aVelocity * t;
    p.y -= 0.5 * uGravity * t * t;
    p.x += sin(t * aSpin) * 0.08;
    // paper flips as it falls, so the points narrow and widen
    float flip = 0.55 + 0.45 * abs(cos(t * aSpin * 0.7));
    float started = step(aDelay, uElapsed);
    // the cake is solid: a piece fades out just above the surface it would land on
    float r = length(p.xz);
    float surface = r < uTopRadius ? uTopHeight
      : r < uBottomRadius ? uBottomHeight
      : r < uPlateRadius ? 0.0
      : -100.0;
    float clearance = smoothstep(0.02, 0.3, p.y - surface);
    vAlpha = started
      * clearance
      * smoothstep(0.0, 0.05, t)
      * (1.0 - smoothstep(uDuration - 1.0, uDuration - 0.1, uElapsed));
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = pixelSize(uSize * flip, -mv.z) * started * step(0.001, clearance);
    gl_Position = projectionMatrix * mv;
  }
`

const confettiFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
  }
`

const decorations = cakeDecorations({
  bottomRadius: BOTTOM.radius,
  bottomHeight: BOTTOM.height,
  topRadius: TOP.radius,
  topHeight: TOP.height,
})

const candlePlacement = candleLayout().map(({ x, z }) => ({
  x: x * TOP.radius * 0.85,
  z: z * TOP.radius * 0.85,
}))

const flamePositions = new Float32Array(CANDLE_COUNT * 3)
candlePlacement.forEach(({ x, z }, i) =>
  flamePositions.set([x, FLAME_BASE_Y, z], i * 3),
)

const createPhases = (random: () => number) =>
  Float32Array.from({ length: CANDLE_COUNT }, random)

const easeOut = (t: number) => 1 - (1 - t) * (1 - t)

function CakeScene({ blown, spin }: { blown: boolean; spin: Spin }) {
  const turntable = useRef<Group>(null)
  const flamePhases = useMemo(() => createPhases(Math.random), [])
  const confetti = useMemo(
    () => createConfetti(CONFETTI_COUNT, Math.random),
    [],
  )
  const confettiPositions = useMemo(
    () => new Float32Array(CONFETTI_COUNT * 3),
    [],
  )

  const flameUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOut: { value: 0 },
      uScale: { value: 1 },
      uSize: { value: FLAME_SIZE },
    }),
    [],
  )
  const confettiUniforms = useMemo(
    () => ({
      uElapsed: { value: 0 },
      uScale: { value: 1 },
      uSize: { value: 0.1 },
      uGravity: { value: GRAVITY },
      uDuration: { value: CONFETTI_DURATION },
      uOriginY: { value: BURST_ORIGIN },
      uTopRadius: { value: TOP.radius + 0.1 },
      uTopHeight: { value: TOP_Y + 0.08 },
      uBottomRadius: { value: BOTTOM.radius + 0.1 },
      uBottomHeight: { value: BOTTOM.height + 0.1 },
      uPlateRadius: { value: PLATE.radius },
    }),
    [],
  )

  const candles = useRef<InstancedMesh>(null)
  const beads = useRef<InstancedMesh>(null)
  const stripes = useRef<InstancedMesh>(null)
  const flames = useRef<ShaderMaterial>(null)
  const confettiPoints = useRef<Points>(null)
  const confettiMaterial = useRef<ShaderMaterial>(null)
  const light = useRef<PointLight>(null)
  const blownNow = useRef(blown)
  const clock = useRef({ out: 0, burst: -1 })

  useLayoutEffect(() => {
    blownNow.current = blown
  }, [blown])

  useLayoutEffect(() => {
    const dummy = new Object3D()
    candlePlacement.forEach(({ x, z }, i) => {
      dummy.position.set(x, TOP_Y + CANDLE.height / 2, z)
      dummy.updateMatrix()
      candles.current!.setMatrixAt(i, dummy.matrix)
    })
    candles.current!.instanceMatrix.needsUpdate = true

    const color = new Color()
    const place = (mesh: InstancedMesh, items: typeof decorations.spheres) =>
      items.forEach(({ position, facing, size, color: hex }, i) => {
        dummy.position.set(...position)
        dummy.rotation.set(0, facing, 0)
        dummy.scale.set(...size)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        mesh.setColorAt(i, color.set(hex))
      })
    place(beads.current!, decorations.spheres)
    place(stripes.current!, decorations.boxes)
    for (const mesh of [beads.current!, stripes.current!]) {
      mesh.instanceMatrix.needsUpdate = true
      mesh.instanceColor!.needsUpdate = true
    }
  }, [])

  useFrame(({ size, viewport, camera }, delta) => {
    if (turntable.current) {
      stepSpin(spin, delta)
      turntable.current.rotation.y = spin.angle
    }
    const flame = flames.current
    const burst = confettiMaterial.current
    const points = confettiPoints.current
    if (!flame || !burst || !points) return

    const state = clock.current
    const fov = 'fov' in camera ? (camera.fov as number) : 50
    const scale =
      (size.height * viewport.dpr) / (2 * Math.tan(MathUtils.degToRad(fov / 2)))
    flame.uniforms.uScale.value = scale
    burst.uniforms.uScale.value = scale
    flame.uniforms.uTime.value += delta

    if (blownNow.current) {
      state.out = Math.min(state.out + delta, FLAME_OUT_DURATION)
      if (state.out >= FLAME_OUT_DURATION && state.burst < 0) state.burst = 0
      else if (state.burst >= 0) state.burst += delta
    } else {
      state.out = 0
      state.burst = -1
    }

    const out = easeOut(state.out / FLAME_OUT_DURATION)
    flame.uniforms.uOut.value = out
    burst.uniforms.uElapsed.value = Math.max(state.burst, 0)
    points.visible = state.burst >= 0 && state.burst < CONFETTI_DURATION

    if (light.current) {
      const time = flame.uniforms.uTime.value
      const flicker =
        1 + 0.08 * Math.sin(time * 13) + 0.05 * Math.sin(time * 29)
      light.current.intensity = LIGHT_INTENSITY * (1 - out) * flicker
    }
  })

  return (
    <>
      <ambientLight color="#ffd9b8" intensity={0.55} />
      <group ref={turntable}>
        <pointLight
          ref={light}
          color="#ffb663"
          intensity={LIGHT_INTENSITY}
          position={[0, FLAME_BASE_Y + 0.4, 0]}
          decay={1.2}
        />

        <mesh position={[0, -PLATE.height / 2, 0]}>
          <cylinderGeometry
            args={[PLATE.radius, PLATE.radius, PLATE.height, 64]}
          />
          <meshStandardMaterial color={CAKE_COLORS.plate} roughness={0.5} />
        </mesh>
        <mesh position={[0, BOTTOM.height / 2, 0]}>
          <cylinderGeometry
            args={[BOTTOM.radius, BOTTOM.radius, BOTTOM.height, 64]}
          />
          <meshStandardMaterial color={CAKE_COLORS.bottom} roughness={0.8} />
        </mesh>
        <mesh position={[0, BOTTOM.height, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[BOTTOM.radius - 0.04, 0.1, 16, 64]} />
          <meshStandardMaterial color={CAKE_COLORS.frosting} roughness={0.6} />
        </mesh>
        <mesh position={[0, BOTTOM.height + TOP.height / 2, 0]}>
          <cylinderGeometry args={[TOP.radius, TOP.radius, TOP.height, 64]} />
          <meshStandardMaterial color={CAKE_COLORS.top} roughness={0.8} />
        </mesh>
        <mesh position={[0, TOP_Y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[TOP.radius - 0.03, 0.08, 16, 64]} />
          <meshStandardMaterial color={CAKE_COLORS.frosting} roughness={0.6} />
        </mesh>
        <mesh position={[0, TOP_Y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[TOP.radius - 0.05, 64]} />
          <meshStandardMaterial color={CAKE_COLORS.frosting} roughness={0.6} />
        </mesh>

        <instancedMesh
          ref={candles}
          name="candles"
          args={[undefined, undefined, CANDLE_COUNT]}
        >
          <cylinderGeometry
            args={[CANDLE.radius, CANDLE.radius, CANDLE.height, 10]}
          />
          <meshStandardMaterial color={CAKE_COLORS.candle} roughness={0.7} />
        </instancedMesh>

        <instancedMesh
          ref={beads}
          name="beads"
          args={[undefined, undefined, decorations.spheres.length]}
        >
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial roughness={0.45} />
        </instancedMesh>
        <instancedMesh
          ref={stripes}
          name="stripes"
          args={[undefined, undefined, decorations.boxes.length]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial roughness={0.6} />
        </instancedMesh>

        <points name="flames" frustumCulled={false} renderOrder={2}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[flamePositions, 3]}
            />
            <bufferAttribute
              attach="attributes-aPhase"
              args={[flamePhases, 1]}
            />
          </bufferGeometry>
          <shaderMaterial
            ref={flames}
            vertexShader={flameVertexShader}
            fragmentShader={flameFragmentShader}
            uniforms={flameUniforms}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </points>

        <points
          ref={confettiPoints}
          name="confetti"
          visible={false}
          frustumCulled={false}
          renderOrder={3}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[confettiPositions, 3]}
            />
            <bufferAttribute
              attach="attributes-aVelocity"
              args={[confetti.velocities, 3]}
            />
            <bufferAttribute
              attach="attributes-aColor"
              args={[confetti.colors, 3]}
            />
            <bufferAttribute
              attach="attributes-aSpin"
              args={[confetti.spins, 1]}
            />
            <bufferAttribute
              attach="attributes-aDelay"
              args={[confetti.delays, 1]}
            />
          </bufferGeometry>
          <shaderMaterial
            ref={confettiMaterial}
            vertexShader={confettiVertexShader}
            fragmentShader={confettiFragmentShader}
            uniforms={confettiUniforms}
            transparent
            depthWrite={false}
          />
        </points>
      </group>
    </>
  )
}

export default CakeScene
