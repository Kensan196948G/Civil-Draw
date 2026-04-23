import { describe, it, expect } from 'vitest'
import { computeSnap } from './snapEngine'
import type { Shape } from '../types/geometry'

const LINE: Shape = {
  id: 'l1', type: 'line', layerId: 'ly1', locked: false,
  x1: 0, y1: 0, x2: 100, y2: 0,
}

const ALL_ON = {
  snapGrid: true,
  snapEndpoint: true,
  snapMidpoint: true,
  snapIntersection: true,
}

describe('computeSnap', () => {
  it('snaps to endpoint within radius', () => {
    const result = computeSnap({ x: 3, y: 2 }, [LINE], 10, ALL_ON)
    expect(result.type).toBe('endpoint')
    expect(result.point.x).toBe(0)
    expect(result.point.y).toBe(0)
  })

  it('snaps to midpoint within radius', () => {
    const result = computeSnap({ x: 51, y: 3 }, [LINE], 10, ALL_ON)
    expect(result.type).toBe('midpoint')
    expect(result.point.x).toBe(50)
    expect(result.point.y).toBe(0)
  })

  it('falls back to grid snap when no geometry nearby', () => {
    const result = computeSnap({ x: 23, y: 17 }, [], 10, ALL_ON)
    expect(result.type).toBe('grid')
    expect(result.point.x).toBe(20)
    expect(result.point.y).toBe(20)
  })

  it('returns none when all snaps disabled', () => {
    const result = computeSnap(
      { x: 23, y: 17 }, [LINE], 10,
      { snapGrid: false, snapEndpoint: false, snapMidpoint: false, snapIntersection: false },
    )
    expect(result.type).toBe('none')
    expect(result.point.x).toBe(23)
  })

  it('snaps to intersection of two lines', () => {
    // LINE is (0,0)→(100,0). Use a second line crossing at x=70 to avoid
    // coinciding with LINE's midpoint (50,0).
    // line2 midpoint is at (70, 5) — not coincident with the intersection at (70, 0)
    const line2: Shape = {
      id: 'l2', type: 'line', layerId: 'ly1', locked: false,
      x1: 70, y1: -30, x2: 70, y2: 40,
    }
    const result = computeSnap({ x: 69, y: 1 }, [LINE, line2], 10, ALL_ON)
    expect(result.type).toBe('intersection')
    expect(result.point.x).toBe(70)
    expect(result.point.y).toBe(0)
  })

  it('prefers endpoint over grid', () => {
    const result = computeSnap({ x: 2, y: 1 }, [LINE], 10, ALL_ON)
    expect(result.type).toBe('endpoint')
  })
})
