import { describe, it, expect } from 'vitest'
import { importDxf } from './dxfImporter'
import { exportDxf } from './dxfExporter'
import type { Layer } from '../types/layer'
import type { Shape } from '../types/geometry'

const LAYER: Layer = {
  id: 'ly1', name: 'TEST', visible: true, locked: false,
  color: '#ff0000', lineStyle: 'solid', lineWidth: 1, order: 0,
}

describe('importDxf — round-trip', () => {
  it('round-trips a LINE through export → import', () => {
    const line: Shape = {
      id: 's1', type: 'line', layerId: 'ly1', locked: false,
      x1: 0, y1: 0, x2: 100, y2: 50,
    }
    const dxf = exportDxf([LAYER], [line])
    const result = importDxf(dxf)
    const imported = result.shapes.find((s) => s.type === 'line')
    expect(imported).toBeDefined()
    if (imported?.type === 'line') {
      expect(imported.x1).toBeCloseTo(0)
      expect(imported.y1).toBeCloseTo(0)
      expect(imported.x2).toBeCloseTo(100)
      expect(imported.y2).toBeCloseTo(50)
    }
  })

  it('round-trips a CIRCLE', () => {
    const circle: Shape = {
      id: 's2', type: 'circle', layerId: 'ly1', locked: false,
      cx: 25, cy: 25, radius: 15,
    }
    const dxf = exportDxf([LAYER], [circle])
    const result = importDxf(dxf)
    const imported = result.shapes.find((s) => s.type === 'circle')
    expect(imported).toBeDefined()
    if (imported?.type === 'circle') {
      expect(imported.cx).toBeCloseTo(25)
      expect(imported.cy).toBeCloseTo(25)
      expect(imported.radius).toBeCloseTo(15)
    }
  })

  it('round-trips a POLYLINE', () => {
    const poly: Shape = {
      id: 's3', type: 'polyline', layerId: 'ly1', locked: false,
      points: [0, 0, 10, 0, 10, 10, 0, 10], closed: true,
    }
    const dxf = exportDxf([LAYER], [poly])
    const result = importDxf(dxf)
    const imported = result.shapes.find((s) => s.type === 'polyline')
    expect(imported).toBeDefined()
    if (imported?.type === 'polyline') {
      expect(imported.points.length).toBe(8)
    }
  })

  it('imports the layer from DXF', () => {
    const line: Shape = {
      id: 's1', type: 'line', layerId: 'ly1', locked: false,
      x1: 0, y1: 0, x2: 1, y2: 1,
    }
    const dxf = exportDxf([LAYER], [line])
    const result = importDxf(dxf)
    const hasTest = result.layers.some((l) => l.name === 'TEST')
    expect(hasTest).toBe(true)
  })

  it('returns warnings on unsupported entities', () => {
    // Construct a minimal DXF with a SPLINE (unsupported)
    const splineDxf = `0
SECTION
2
ENTITIES
0
SPLINE
8
0
0
ENDSEC
0
EOF
`
    const result = importDxf(splineDxf)
    expect(result.warnings.some((w) => w.includes('SPLINE'))).toBe(true)
  })

  it('throws on invalid DXF input', () => {
    expect(() => importDxf('')).toThrow()
  })
})
