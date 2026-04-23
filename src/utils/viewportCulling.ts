import type { Shape } from '../types/geometry'
import { getShapeBBox } from './selection'

export interface Viewport {
  zoom: number
  panX: number
  panY: number
  width: number
  height: number
}

/**
 * Returns true if the shape's bbox overlaps the visible viewport
 * in world coordinates. Used to skip rendering offscreen shapes
 * when the total count is large.
 */
export function isInViewport(shape: Shape, vp: Viewport, padding = 50): boolean {
  const worldMinX = -vp.panX / vp.zoom - padding
  const worldMinY = -vp.panY / vp.zoom - padding
  const worldMaxX = worldMinX + vp.width / vp.zoom + padding * 2
  const worldMaxY = worldMinY + vp.height / vp.zoom + padding * 2

  const bbox = getShapeBBox(shape)
  return !(
    bbox.maxX < worldMinX ||
    bbox.minX > worldMaxX ||
    bbox.maxY < worldMinY ||
    bbox.minY > worldMaxY
  )
}

/**
 * Culling is only worth the per-shape overhead when the shape count
 * is high and the current zoom reveals a small slice of the world.
 * Returns true when culling should be applied.
 */
export function shouldCull(shapeCount: number, threshold = 500): boolean {
  return shapeCount >= threshold
}
