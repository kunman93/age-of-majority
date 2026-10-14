import ReactThreeTestRenderer from '@react-three/test-renderer'
import { describe, expect, it, vi } from 'vitest'
import { createSpin, type Spin } from './dragRotation'
import type {
  BufferGeometry,
  InstancedMesh,
  Material,
  Points,
  ShaderMaterial,
} from 'three'
import CakeScene from './CakeScene'
import { CANDLE_COUNT } from './candleLayout'

async function renderScene(blown = false) {
  const renderer = await ReactThreeTestRenderer.create(
    <CakeScene blown={blown} spin={createSpin()} />,
  )
  const named = (name: string) => renderer.scene.instance.getObjectByName(name)!
  const flames = named('flames') as Points
  const confetti = named('confetti') as Points
  return {
    renderer,
    candles: named('candles') as InstancedMesh,
    flames,
    confetti,
    flameMaterial: flames.material as ShaderMaterial,
  }
}

it('draws the 18 candles as one instanced mesh', async () => {
  const { candles } = await renderScene()

  expect(candles.isInstancedMesh).toBe(true)
  expect(candles.count).toBe(CANDLE_COUNT)
})

it('draws one flame point per candle', async () => {
  const { flames } = await renderScene()

  expect(flames.type).toBe('Points')
  expect(flames.geometry.getAttribute('position').count).toBe(CANDLE_COUNT)
  expect(flames.geometry.getAttribute('aPhase').count).toBe(CANDLE_COUNT)
})

it('starts lit, without any confetti drawn', async () => {
  const { flameMaterial, confetti } = await renderScene()

  expect(flameMaterial.uniforms.uOut.value).toBe(0)
  expect(confetti.visible).toBe(false)
})

it('keeps the confetti hidden while the candles stay lit', async () => {
  const { renderer, flameMaterial, confetti } = await renderScene()

  await renderer.advanceFrames(10, 0.5)

  expect(flameMaterial.uniforms.uOut.value).toBe(0)
  expect(confetti.visible).toBe(false)
})

it('puts the flames out once blown, then bursts the confetti', async () => {
  const { renderer, flameMaterial, confetti } = await renderScene()

  await renderer.update(<CakeScene blown spin={createSpin()} />)
  await renderer.advanceFrames(1, 0.1)
  expect(confetti.visible).toBe(false)
  await renderer.advanceFrames(10, 0.1)

  expect(flameMaterial.uniforms.uOut.value).toBe(1)
  expect(confetti.visible).toBe(true)
})

it('stops drawing the confetti once the burst is over', async () => {
  const { renderer, confetti } = await renderScene(true)

  await renderer.advanceFrames(3, 1)
  expect(confetti.visible).toBe(true)
  await renderer.advanceFrames(10, 1)

  expect(confetti.visible).toBe(false)
})

it('relights everything at once on reset', async () => {
  const { renderer, flameMaterial, confetti } = await renderScene(true)
  await renderer.advanceFrames(10, 0.1)

  await renderer.update(<CakeScene blown={false} spin={createSpin()} />)
  await renderer.advanceFrames(1, 0.016)

  expect(flameMaterial.uniforms.uOut.value).toBe(0)
  expect(confetti.visible).toBe(false)
})

it('bursts again after a reset', async () => {
  const { renderer, flameMaterial, confetti } = await renderScene(true)
  await renderer.advanceFrames(10, 0.1)
  await renderer.update(<CakeScene blown={false} spin={createSpin()} />)
  await renderer.advanceFrames(1, 0.016)

  await renderer.update(<CakeScene blown spin={createSpin()} />)
  await renderer.advanceFrames(10, 0.1)

  expect(flameMaterial.uniforms.uOut.value).toBe(1)
  expect(confetti.visible).toBe(true)
})

describe('turntable spin', () => {
  const renderSpinning = async (spin: Spin) => {
    const renderer = await ReactThreeTestRenderer.create(
      <CakeScene blown={false} spin={spin} />,
    )
    // the candles sit directly in the turntable group
    const turntable =
      renderer.scene.instance.getObjectByName('candles')!.parent!
    return { renderer, turntable }
  }

  it('turns the cake to the dragged angle', async () => {
    const spin: Spin = { angle: 0, velocity: 0, dragging: true }
    const { renderer, turntable } = await renderSpinning(spin)

    spin.angle = 1.2
    await renderer.advanceFrames(1, 0.016)

    expect(turntable.rotation.y).toBe(1.2)
  })

  it('keeps turning after release while there is inertia', async () => {
    const spin: Spin = { angle: 0, velocity: 2, dragging: false }
    const { renderer, turntable } = await renderSpinning(spin)

    await renderer.advanceFrames(3, 0.016)

    expect(turntable.rotation.y).toBeGreaterThan(0)
    expect(turntable.rotation.y).toBe(spin.angle)
  })
})

it('disposes every geometry and material on unmount', async () => {
  const { renderer } = await renderScene()
  const geometries = new Set<BufferGeometry>()
  const materials = new Set<Material>()
  renderer.scene.instance.traverse((object) => {
    const { geometry, material } = object as Points
    if (geometry) geometries.add(geometry)
    if (material) [material].flat().forEach((m) => materials.add(m))
  })
  const disposers = [...geometries, ...materials].map((resource) =>
    vi.spyOn(resource, 'dispose'),
  )

  await renderer.unmount()

  expect(disposers.length).toBeGreaterThan(0)
  // R3F disposes on a deferred tick
  await vi.waitFor(() =>
    disposers.forEach((dispose) => expect(dispose).toHaveBeenCalled()),
  )
})
