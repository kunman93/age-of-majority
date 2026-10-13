import ReactThreeTestRenderer from '@react-three/test-renderer'
import { expect, it, vi } from 'vitest'
import type { Points, ShaderMaterial } from 'three'
import Embers, { EMBER_COUNT } from './Embers'

async function renderEmbers() {
  const renderer = await ReactThreeTestRenderer.create(<Embers />)
  const points = renderer.scene.children[0].instance as Points
  return { renderer, points, material: points.material as ShaderMaterial }
}

it('draws every ember as one set of points', async () => {
  const { renderer, points } = await renderEmbers()

  expect(renderer.scene.children).toHaveLength(1)
  expect(points.type).toBe('Points')
  expect(points.geometry.getAttribute('position').count).toBe(EMBER_COUNT)
})

it('advances the time uniform with every frame', async () => {
  const { renderer, material } = await renderEmbers()
  expect(material.uniforms.uTime.value).toBe(0)

  await renderer.advanceFrames(3, 0.5)

  expect(material.uniforms.uTime.value).toBeCloseTo(1.5)
})

it('disposes its geometry and material on unmount', async () => {
  const { renderer, points, material } = await renderEmbers()
  const disposeGeometry = vi.spyOn(points.geometry, 'dispose')
  const disposeMaterial = vi.spyOn(material, 'dispose')

  await renderer.unmount()

  expect(disposeGeometry).toHaveBeenCalled()
  expect(disposeMaterial).toHaveBeenCalled()
})
