import { describe, it, expect } from 'vitest'
import { generatePerfShapes, generatePerfLayers, runMicroBenchmark } from './perfHarness'

describe('generatePerfShapes', () => {
  it('produces the requested count', () => {
    const shapes = generatePerfShapes({
      count: 100, layerId: 'l1',
      area: { width: 1000, height: 1000 }, seed: 1,
    })
    expect(shapes).toHaveLength(100)
  })

  it('is deterministic given the same seed', () => {
    const a = generatePerfShapes({ count: 50, layerId: 'l1', area: { width: 500, height: 500 }, seed: 7 })
    const b = generatePerfShapes({ count: 50, layerId: 'l1', area: { width: 500, height: 500 }, seed: 7 })
    expect(a.length).toBe(b.length)
    expect(a[0].type).toBe(b[0].type)
  })

  it('produces different output for different seeds', () => {
    const a = generatePerfShapes({ count: 50, layerId: 'l1', area: { width: 500, height: 500 }, seed: 1 })
    const b = generatePerfShapes({ count: 50, layerId: 'l1', area: { width: 500, height: 500 }, seed: 2 })
    // First few shapes should differ (by type, id, or coords)
    const aKey = a.slice(0, 3).map((s) => s.type).join(',')
    const bKey = b.slice(0, 3).map((s) => s.type).join(',')
    const aIds = a.slice(0, 3).map((s) => s.id).join(',')
    const bIds = b.slice(0, 3).map((s) => s.id).join(',')
    expect(aKey !== bKey || aIds !== bIds).toBe(true)
  })

  it('generates only supported kinds', () => {
    const shapes = generatePerfShapes({
      count: 200, layerId: 'l1', area: { width: 1000, height: 1000 }, seed: 3,
    })
    const kinds = new Set(shapes.map((s) => s.type))
    for (const kind of kinds) {
      expect(['line', 'rect', 'circle', 'polyline']).toContain(kind)
    }
  })

  it('assigns the provided layerId to every shape', () => {
    const shapes = generatePerfShapes({
      count: 50, layerId: 'target',
      area: { width: 500, height: 500 }, seed: 9,
    })
    for (const s of shapes) expect(s.layerId).toBe('target')
  })
})

describe('generatePerfLayers', () => {
  it('returns a single Perf layer', () => {
    const layers = generatePerfLayers()
    expect(layers).toHaveLength(1)
    expect(layers[0].name).toBe('Perf')
  })
})

describe('runMicroBenchmark', () => {
  it('records elapsed time and ops/sec', async () => {
    const result = await runMicroBenchmark(() => {
      let x = 0
      for (let i = 0; i < 10; i++) x += i
    }, 20)
    expect(result.count).toBe(20)
    expect(result.elapsedMs).toBeGreaterThanOrEqual(0)
    expect(result.opsPerSec).toBeGreaterThan(0)
  })
})
