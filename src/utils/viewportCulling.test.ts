import { describe, it, expect } from 'vitest'
import { isInViewport, shouldCull, type Viewport } from './viewportCulling'
import type { Shape } from '../types/geometry'

const VP: Viewport = { zoom: 1, panX: 0, panY: 0, width: 800, height: 600 }

function line(x1: number, y1: number, x2: number, y2: number): Shape {
  return {
    id: Math.random().toString(),
    type: 'line', layerId: 'l', locked: false,
    x1, y1, x2, y2,
  }
}

describe('isInViewport', () => {
  it('includes shapes inside the visible world', () => {
    expect(isInViewport(line(100, 100, 200, 200), VP)).toBe(true)
  })

  it('excludes shapes fully to the left of viewport', () => {
    expect(isInViewport(line(-1000, 100, -900, 200), VP)).toBe(false)
  })

  it('excludes shapes fully below viewport', () => {
    expect(isInViewport(line(100, 5000, 200, 5100), VP)).toBe(false)
  })

  it('includes shapes straddling the viewport edge', () => {
    expect(isInViewport(line(-10, 100, 50, 100), VP)).toBe(true)
  })

  it('respects pan offset', () => {
    const panned: Viewport = { ...VP, panX: -500, panY: 0 }
    // World visible region shifted: x from 500 to 1300
    expect(isInViewport(line(100, 100, 200, 200), panned)).toBe(false)
    expect(isInViewport(line(600, 100, 700, 200), panned)).toBe(true)
  })

  it('respects zoom (smaller zoom → larger world visible)', () => {
    const zoomedOut: Viewport = { ...VP, zoom: 0.1 }
    // With zoom=0.1, viewport 800x600 reveals 8000x6000 world
    expect(isInViewport(line(5000, 3000, 5100, 3100), zoomedOut)).toBe(true)
  })
})

describe('shouldCull', () => {
  it('is false for small counts', () => {
    expect(shouldCull(100)).toBe(false)
  })

  it('is true for large counts', () => {
    expect(shouldCull(1000)).toBe(true)
  })

  it('respects custom threshold', () => {
    expect(shouldCull(50, 100)).toBe(false)
    expect(shouldCull(150, 100)).toBe(true)
  })
})
