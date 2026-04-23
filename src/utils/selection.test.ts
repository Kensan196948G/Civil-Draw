import { describe, it, expect } from 'vitest'
import {
  getShapeBBox,
  rectFromPoints,
  bboxIntersects,
  findShapesInRect,
  findShapeAtPoint,
} from './selection'
import type { Shape } from '../types/geometry'

const LINE: Shape = {
  id: 'l1', type: 'line', layerId: 'ly', locked: false,
  x1: 0, y1: 0, x2: 10, y2: 20,
}
const RECT: Shape = {
  id: 'r1', type: 'rect', layerId: 'ly', locked: false,
  x: 50, y: 50, width: 30, height: 20, rotation: 0,
}
const CIRCLE: Shape = {
  id: 'c1', type: 'circle', layerId: 'ly', locked: false,
  cx: 100, cy: 100, radius: 15,
}

describe('getShapeBBox', () => {
  it('computes bbox for a line (normalized)', () => {
    const reversed: Shape = { ...LINE, x1: 10, y1: 20, x2: 0, y2: 0 }
    expect(getShapeBBox(reversed)).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 20 })
  })

  it('computes bbox for a circle using the bounding square', () => {
    expect(getShapeBBox(CIRCLE)).toEqual({
      minX: 85, minY: 85, maxX: 115, maxY: 115,
    })
  })

  it('computes bbox for a rect', () => {
    expect(getShapeBBox(RECT)).toEqual({ minX: 50, minY: 50, maxX: 80, maxY: 70 })
  })

  it('computes bbox for polyline vertices', () => {
    const poly: Shape = {
      id: 'p1', type: 'polyline', layerId: 'ly', locked: false,
      points: [0, 0, 100, 50, 50, 100], closed: false,
    }
    expect(getShapeBBox(poly)).toEqual({ minX: 0, minY: 0, maxX: 100, maxY: 100 })
  })
})

describe('rectFromPoints', () => {
  it('normalizes regardless of drag direction', () => {
    const r1 = rectFromPoints({ x: 10, y: 20 }, { x: 5, y: 5 })
    const r2 = rectFromPoints({ x: 5, y: 5 }, { x: 10, y: 20 })
    expect(r1).toEqual(r2)
  })
})

describe('bboxIntersects', () => {
  it('detects overlap', () => {
    expect(bboxIntersects(
      { minX: 0, minY: 0, maxX: 10, maxY: 10 },
      { minX: 5, minY: 5, maxX: 15, maxY: 15 },
    )).toBe(true)
  })

  it('detects non-overlap', () => {
    expect(bboxIntersects(
      { minX: 0, minY: 0, maxX: 10, maxY: 10 },
      { minX: 20, minY: 20, maxX: 30, maxY: 30 },
    )).toBe(false)
  })
})

describe('findShapesInRect', () => {
  it('finds shapes intersecting a selection rect', () => {
    const rect = rectFromPoints({ x: -5, y: -5 }, { x: 15, y: 25 })
    const ids = findShapesInRect([LINE, RECT, CIRCLE], rect)
    expect(ids).toEqual(['l1'])
  })

  it('returns multiple shapes when rect spans them', () => {
    const rect = rectFromPoints({ x: 0, y: 0 }, { x: 200, y: 200 })
    const ids = findShapesInRect([LINE, RECT, CIRCLE], rect)
    expect(ids).toHaveLength(3)
  })
})

describe('findShapeAtPoint', () => {
  it('returns the topmost shape under a point', () => {
    const id = findShapeAtPoint([LINE, RECT, CIRCLE], { x: 55, y: 55 })
    expect(id).toBe('r1')
  })

  it('returns null if no shape is under the point', () => {
    const id = findShapeAtPoint([LINE, RECT], { x: 500, y: 500 })
    expect(id).toBeNull()
  })

  it('uses tolerance for near-miss hits', () => {
    const id = findShapeAtPoint([LINE], { x: 12, y: 22 }, 5)
    expect(id).toBe('l1')
  })
})
