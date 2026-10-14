import ReactThreeTestRenderer from '@react-three/test-renderer'
import { expect, it, vi } from 'vitest'
import type { Points, ShaderMaterial } from 'three'
import StoryObject, { STORY_COUNT } from './StoryObject'

async function renderStoryObject(
  progress = { current: 0 },
  entry = { current: 0 },
  exit = { current: 0 },
) {
  const renderer = await ReactThreeTestRenderer.create(
    <StoryObject progress={progress} entry={entry} exit={exit} />,
  )
  const points = renderer.scene.children[0].instance as Points
  return { renderer, points, material: points.material as ShaderMaterial }
}

it('draws the story object as one set of points', async () => {
  const { renderer, points } = await renderStoryObject()

  expect(renderer.scene.children).toHaveLength(1)
  expect(points.type).toBe('Points')
})

it('has a position for every particle in every stage', async () => {
  const { points } = await renderStoryObject()

  for (const name of ['position', 'aStage1', 'aStage2']) {
    expect(points.geometry.getAttribute(name).count).toBe(STORY_COUNT)
  }
  expect(points.geometry.getAttribute('aOffset').count).toBe(STORY_COUNT)
  expect(points.geometry.getAttribute('aEdge').count).toBe(STORY_COUNT)
  expect(points.geometry.getAttribute('aEdge').itemSize).toBe(2)
  expect(points.geometry.getAttribute('aStage3')).toBeUndefined()
})

it('follows the shared progress after a frame', async () => {
  const progress = { current: 0 }
  const { renderer, material } = await renderStoryObject(progress)
  expect(material.uniforms.uProgress.value).toBe(0)

  progress.current = 1.5
  await renderer.advanceFrames(1, 0.016)

  expect(material.uniforms.uProgress.value).toBe(1.5)
})

it('follows the shared entry and exit after a frame', async () => {
  const entry = { current: 0 }
  const exit = { current: 0 }
  const { renderer, material } = await renderStoryObject(
    { current: 0 },
    entry,
    exit,
  )
  expect(material.uniforms.uEntry.value).toBe(0)
  expect(material.uniforms.uExit.value).toBe(0)

  entry.current = 0.4
  exit.current = 0.7
  await renderer.advanceFrames(1, 0.016)

  expect(material.uniforms.uEntry.value).toBe(0.4)
  expect(material.uniforms.uExit.value).toBe(0.7)
})

it('sets the extent to the canvas edges in the units of the object', async () => {
  const { renderer, points, material } = await renderStoryObject()

  await renderer.advanceFrames(1, 0.016)

  const extent = material.uniforms.uExtent.value
  expect(extent.x).toBeGreaterThan(0)
  expect(extent.y).toBeGreaterThan(0)
  // the object is as large as its scale, the canvas edge is half the viewport away
  expect(extent.x * points.scale.x).toBeGreaterThan(points.scale.x)
  expect(extent.y * points.scale.y).toBeGreaterThan(points.scale.y)
})

it('has no visibility uniform', async () => {
  const { material } = await renderStoryObject()

  expect(material.uniforms.uVisible).toBeUndefined()
})

it('has no time uniform', async () => {
  const { material } = await renderStoryObject()

  expect(material.uniforms.uTime).toBeUndefined()
})

it('disposes its geometry and material on unmount', async () => {
  const { renderer, points, material } = await renderStoryObject()
  const disposeGeometry = vi.spyOn(points.geometry, 'dispose')
  const disposeMaterial = vi.spyOn(material, 'dispose')

  await renderer.unmount()

  expect(disposeGeometry).toHaveBeenCalled()
  expect(disposeMaterial).toHaveBeenCalled()
})
