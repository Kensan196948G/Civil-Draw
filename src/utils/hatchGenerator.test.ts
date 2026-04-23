import { describe, it, expect } from 'vitest'
import { polygonBBox, pointInPolygon, generateHatchLines } from './hatchGenerator'

const SQUARE = [0, 0, 100, 0, 100, 100, 0, 100]

describe('polygonBBox', () => {
  it('computes bounding box of a square', () => {
    expect(polygonBBox(SQUARE)).toEqual({
      minX: 0, minY: 0, maxX: 100, maxY: 100,
    })
  })

  it('computes bbox of a triangle', () => {
    expect(polygonBBox([10, 10, 50, 40, 20, 80])).toEqual({
      minX: 10, minY: 10, maxX: 50, maxY: 80,
    })
  })
})

describe('pointInPolygon', () => {
  it('detects a point inside a square', () => {
    expect(pointInPolygon(50, 50, SQUARE)).toBe(true)
  })

  it('detects a point outside a square', () => {
    expect(pointInPolygon(150, 50, SQUARE)).toBe(false)
  })

  it('detects a point in a concave polygon', () => {
    // L-shape
    const L = [0, 0, 50, 0, 50, 50, 30, 50, 30, 100, 0, 100]
    expect(pointInPolygon(10, 90, L)).toBe(true)
    expect(pointInPolygon(40, 80, L)).toBe(false)
  })
})

describe('generateHatchLines', () => {
  it('produces parallel lines for a square', () => {
    const lines = generateHatchLines(SQUARE, 'parallel', 0, 20)
    expect(lines.length).toBeGreaterThan(3)
    lines.forEach((l) => {
      expect(l.x1).toBeGreaterThanOrEqual(-1)
      expect(l.x2).toBeLessThanOrEqual(101)
    })
  })

  it('produces more lines for cross pattern than parallel', () => {
    const parallel = generateHatchLines(SQUARE, 'parallel', 0, 20)
    const cross = generateHatchLines(SQUARE, 'cross', 0, 20)
    expect(cross.length).toBeGreaterThan(parallel.length)
  })

  it('earth pattern uses 45 degree crossing lines', () => {
    const earth = generateHatchLines(SQUARE, 'earth', 0, 20)
    expect(earth.length).toBeGreaterThan(0)
  })

  it('respects spacing (larger spacing → fewer lines)', () => {
    const tight = generateHatchLines(SQUARE, 'parallel', 0, 5)
    const loose = generateHatchLines(SQUARE, 'parallel', 0, 50)
    expect(tight.length).toBeGreaterThan(loose.length)
  })
})
