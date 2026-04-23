import { nanoid } from 'nanoid'
import type { Shape } from '../types/geometry'
import type { Layer } from '../types/layer'

export interface PerfShapeConfig {
  count: number
  layerId: string
  area: { width: number; height: number }
  seed?: number
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const KINDS: Shape['type'][] = ['line', 'rect', 'circle', 'polyline']

export function generatePerfShapes(config: PerfShapeConfig): Shape[] {
  const rng = mulberry32(config.seed ?? 42)
  const { count, layerId, area } = config
  const shapes: Shape[] = []

  for (let i = 0; i < count; i++) {
    const kind = KINDS[Math.floor(rng() * KINDS.length)]
    const x = rng() * area.width
    const y = rng() * area.height
    switch (kind) {
      case 'line':
        shapes.push({
          id: nanoid(), type: 'line', layerId, locked: false,
          x1: x, y1: y,
          x2: x + (rng() - 0.5) * 200, y2: y + (rng() - 0.5) * 200,
        })
        break
      case 'rect':
        shapes.push({
          id: nanoid(), type: 'rect', layerId, locked: false,
          x, y,
          width: 10 + rng() * 100, height: 10 + rng() * 100,
          rotation: 0,
        })
        break
      case 'circle':
        shapes.push({
          id: nanoid(), type: 'circle', layerId, locked: false,
          cx: x, cy: y, radius: 5 + rng() * 50,
        })
        break
      case 'polyline': {
        const n = 3 + Math.floor(rng() * 5)
        const points: number[] = []
        for (let j = 0; j < n; j++) {
          points.push(x + (rng() - 0.5) * 150)
          points.push(y + (rng() - 0.5) * 150)
        }
        shapes.push({
          id: nanoid(), type: 'polyline', layerId, locked: false,
          points, closed: rng() > 0.7,
        })
        break
      }
    }
  }

  return shapes
}

export function generatePerfLayers(): Layer[] {
  return [
    { id: nanoid(), name: 'Perf', visible: true, locked: false, color: '#1e90ff', lineStyle: 'solid', lineWidth: 1, order: 0 },
  ]
}

export interface BenchmarkResult {
  count: number
  elapsedMs: number
  opsPerSec: number
}

export async function runMicroBenchmark(
  fn: () => void,
  iterations = 100,
): Promise<BenchmarkResult> {
  const start = performance.now()
  for (let i = 0; i < iterations; i++) fn()
  const elapsedMs = performance.now() - start
  return {
    count: iterations,
    elapsedMs,
    opsPerSec: (iterations / elapsedMs) * 1000,
  }
}
