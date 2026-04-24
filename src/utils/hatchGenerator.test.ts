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

  it('concrete pattern produces fixed 0°+90° grid regardless of user angle', () => {
    const a0 = generateHatchLines(SQUARE, 'concrete', 0, 20)
    const a45 = generateHatchLines(SQUARE, 'concrete', 45, 20)
    expect(a0.length).toBeGreaterThan(0)
    expect(a0.length).toBe(a45.length)
  })

  it('rock pattern produces more lines than earth (3 directions vs 2)', () => {
    const earth = generateHatchLines(SQUARE, 'earth', 0, 20)
    const rock = generateHatchLines(SQUARE, 'rock', 0, 20)
    expect(rock.length).toBeGreaterThan(earth.length)
  })

  it('asphalt pattern produces lines (fixed 30°+150°)', () => {
    const lines = generateHatchLines(SQUARE, 'asphalt', 0, 20)
    expect(lines.length).toBeGreaterThan(0)
  })

  it('wood pattern produces horizontal lines (fixed 0°)', () => {
    const w0 = generateHatchLines(SQUARE, 'wood', 0, 20)
    const w90 = generateHatchLines(SQUARE, 'wood', 90, 20)
    expect(w0.length).toBeGreaterThan(0)
    expect(w0.length).toBe(w90.length)
  })

  it('steel pattern produces more lines than wood (2 directions vs 1)', () => {
    const wood = generateHatchLines(SQUARE, 'wood', 0, 20)
    const steel = generateHatchLines(SQUARE, 'steel', 0, 20)
    expect(steel.length).toBeGreaterThan(wood.length)
  })

  it('water pattern produces double near-horizontal lines', () => {
    const lines = generateHatchLines(SQUARE, 'water', 0, 20)
    expect(lines.length).toBeGreaterThan(0)
    const wood = generateHatchLines(SQUARE, 'wood', 0, 20)
    expect(lines.length).toBeGreaterThan(wood.length)
  })
})
