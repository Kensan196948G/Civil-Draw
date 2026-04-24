import { describe, it, expect } from 'vitest'
import { computeCentroid, transformShape } from './shapeTransform'
import type { Shape } from '../types/geometry'

const BASE_LINE: Shape = {
  id: 'l1', layerId: 'layer1', locked: false,
  type: 'line', x1: 0, y1: 0, x2: 100, y2: 0,
}

const BASE_CIRCLE: Shape = {
  id: 'c1', layerId: 'layer1', locked: false,
  type: 'circle', cx: 50, cy: 50, radius: 20,
}

const BASE_POLYLINE: Shape = {
  id: 'p1', layerId: 'layer1', locked: false,
  type: 'polyline', points: [0, 0, 100, 0, 100, 100, 0, 100], closed: true,
}

const BASE_SYMBOL: Shape = {
  id: 's1', layerId: 'layer1', locked: false,
  type: 'symbol', symbolId: 'cone', x: 50, y: 50, rotation: 0, scale: 1,
}

describe('computeCentroid', () => {
  it('returns center of a horizontal line', () => {
    const { cx, cy } = computeCentroid([BASE_LINE])
    expect(cx).toBe(50)
    expect(cy).toBe(0)
  })

  it('returns center of a square polyline', () => {
    const { cx, cy } = computeCentroid([BASE_POLYLINE])
    expect(cx).toBe(50)
    expect(cy).toBe(50)
  })

  it('handles multiple shapes', () => {
    const { cx, cy } = computeCentroid([BASE_LINE, BASE_CIRCLE])
    expect(cx).toBe(50)
    expect(cy).toBe(35)
  })
})

describe('transformShape — rotateCW (90° visual clockwise in canvas Y-down)', () => {
  it('rotates a horizontal line into a vertical line through centroid', () => {
    const { cx, cy } = computeCentroid([BASE_LINE])
    const result = transformShape(BASE_LINE, cx, cy, 'rotateCW')
    expect(result.type).toBe('line')
    if (result.type === 'line') {
      expect(result.x1).toBeCloseTo(50)
      expect(result.y1).toBeCloseTo(-50)
      expect(result.x2).toBeCloseTo(50)
      expect(result.y2).toBeCloseTo(50)
    }
  })

  it('rotates symbol rotation angle by +90', () => {
    const result = transformShape(BASE_SYMBOL, 50, 50, 'rotateCW')
    expect(result.type).toBe('symbol')
    if (result.type === 'symbol') {
      expect(result.rotation).toBe(90)
    }
  })

  it('swaps rect width/height', () => {
    const rect: Shape = { id: 'r1', layerId: 'l', locked: false, type: 'rect', x: 0, y: 0, width: 100, height: 50, rotation: 0 }
    const result = transformShape(rect, 50, 25, 'rotateCW')
    expect(result.type).toBe('rect')
    if (result.type === 'rect') {
      expect(result.width).toBe(50)
      expect(result.height).toBe(100)
    }
  })
})

describe('transformShape — rotateCCW (90° counter-clockwise)', () => {
  it('rotates symbol rotation angle by -90', () => {
    const shape: Shape = { ...BASE_SYMBOL, rotation: 90 }
    const result = transformShape(shape, 50, 50, 'rotateCCW')
    if (result.type === 'symbol') {
      expect(result.rotation).toBe(0)
    }
  })

  it('rotateCW + rotateCCW = identity (position)', () => {
    const cw = transformShape(BASE_SYMBOL, 50, 50, 'rotateCW')
    const identity = transformShape(cw, 50, 50, 'rotateCCW')
    if (identity.type === 'symbol') {
      expect(identity.x).toBeCloseTo(BASE_SYMBOL.x)
      expect(identity.y).toBeCloseTo(BASE_SYMBOL.y)
    }
  })
})

describe('transformShape — mirrorH (flip left-right, X negated around centroid)', () => {
  it('mirrors line endpoints around vertical axis', () => {
    const result = transformShape(BASE_LINE, 50, 0, 'mirrorH')
    if (result.type === 'line') {
      expect(result.x1).toBeCloseTo(100)
      expect(result.x2).toBeCloseTo(0)
      expect(result.y1).toBeCloseTo(0)
      expect(result.y2).toBeCloseTo(0)
    }
  })

  it('circle center mirrors correctly', () => {
    const result = transformShape(BASE_CIRCLE, 50, 50, 'mirrorH')
    if (result.type === 'circle') {
      expect(result.cx).toBeCloseTo(50)
      expect(result.cy).toBeCloseTo(50)
      expect(result.radius).toBe(20)
    }
  })

  it('mirrorH twice returns original position', () => {
    const once = transformShape(BASE_LINE, 50, 0, 'mirrorH')
    const twice = transformShape(once, 50, 0, 'mirrorH')
    if (twice.type === 'line') {
      expect(twice.x1).toBeCloseTo(BASE_LINE.x1)
      expect(twice.x2).toBeCloseTo(BASE_LINE.x2)
    }
  })
})

describe('transformShape — mirrorV (flip up-down, Y negated around centroid)', () => {
  it('mirrors polyline points vertically', () => {
    const result = transformShape(BASE_POLYLINE, 50, 50, 'mirrorV')
    if (result.type === 'polyline') {
      expect(result.points[1]).toBeCloseTo(100) // (0,0) → (0,100)
      expect(result.points[3]).toBeCloseTo(100) // (100,0) → (100,100)
      expect(result.points[5]).toBeCloseTo(0)   // (100,100) → (100,0)
    }
  })

  it('mirrorV twice returns original position', () => {
    const once = transformShape(BASE_POLYLINE, 50, 50, 'mirrorV')
    const twice = transformShape(once, 50, 50, 'mirrorV')
    if (twice.type === 'polyline') {
      BASE_POLYLINE.points.forEach((v, i) => {
        expect(twice.points[i]).toBeCloseTo(v)
      })
    }
  })
})

describe('transformShape — hatch', () => {
  it('transforms hatch points like polyline', () => {
    const hatch: Shape = {
      id: 'h1', layerId: 'l', locked: false,
      type: 'hatch', points: [0, 0, 100, 0], pattern: 'parallel', angle: 0, spacing: 10,
    }
    const result = transformShape(hatch, 50, 0, 'mirrorH')
    if (result.type === 'hatch') {
      expect(result.points[0]).toBeCloseTo(100)
      expect(result.points[2]).toBeCloseTo(0)
    }
  })
})
