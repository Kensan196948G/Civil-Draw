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

  it('snaps to rect corners as endpoints', () => {
    const rect: Shape = {
      id: 'r1', type: 'rect', layerId: 'ly1', locked: false,
      x: 0, y: 0, width: 50, height: 30, rotation: 0,
    }
    const result = computeSnap({ x: 52, y: 31 }, [rect], 10, ALL_ON)
    expect(result.type).toBe('endpoint')
    expect(result.point.x).toBe(50)
    expect(result.point.y).toBe(30)
  })

  it('snaps to circle cardinal points', () => {
    const circle: Shape = {
      id: 'c1', type: 'circle', layerId: 'ly1', locked: false,
      cx: 0, cy: 0, radius: 100,
    }
    const result = computeSnap({ x: 1, y: -99 }, [circle], 10, ALL_ON)
    expect(result.type).toBe('endpoint')
    expect(result.point.x).toBe(0)
    expect(result.point.y).toBe(-100)
  })

  it('snaps to polyline vertices and midpoints', () => {
    const poly: Shape = {
      id: 'p1', type: 'polyline', layerId: 'ly1', locked: false,
      points: [0, 0, 20, 0, 20, 20],
      closed: false,
    }
    const vertex = computeSnap({ x: 21, y: 1 }, [poly], 10, ALL_ON)
    expect(vertex.type).toBe('endpoint')
    expect(vertex.point.x).toBe(20); expect(vertex.point.y).toBe(0)
    // Midpoint of first segment
    const mid = computeSnap({ x: 10, y: 1 }, [poly], 10, ALL_ON)
    expect(mid.type).toBe('midpoint')
    expect(mid.point.x).toBe(10); expect(mid.point.y).toBe(0)
  })

  it('returns cursor unchanged when nothing snaps (far point, snapGrid off)', () => {
    const result = computeSnap(
      { x: 999, y: 999 }, [], 10,
      { snapGrid: false, snapEndpoint: true, snapMidpoint: true, snapIntersection: true },
    )
    expect(result.type).toBe('none')
    expect(result.point).toEqual({ x: 999, y: 999 })
  })
})
