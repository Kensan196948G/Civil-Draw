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
    // POINT entity: parsed by dxf-parser but not handled in our importer switch → warning
    const pointDxf = `0
SECTION
2
ENTITIES
0
POINT
8
0
10
0
20
0
30
0
0
ENDSEC
0
EOF
`
    const result = importDxf(pointDxf)
    expect(result.warnings.some((w) => w.includes('POINT'))).toBe(true)
  })

  it('throws on invalid DXF input', () => {
    expect(() => importDxf('')).toThrow()
  })

  it('imports SPLINE via fitPoints as polyline', () => {
    // SPLINE with 3 fit points at (0,0), (10,20), (20,0)
    const splineDxf = `0
SECTION
2
ENTITIES
0
SPLINE
8
0
11
0
21
0
31
0
11
10
21
20
31
0
11
20
21
0
31
0
0
ENDSEC
0
EOF
`
    const result = importDxf(splineDxf)
    const imported = result.shapes.find((s) => s.type === 'polyline')
    expect(imported).toBeDefined()
    if (imported?.type === 'polyline') {
      expect(imported.points.length).toBe(6)
      expect(imported.points[0]).toBeCloseTo(0)
      expect(imported.points[1]).toBeCloseTo(0)
      expect(imported.points[2]).toBeCloseTo(10)
      expect(imported.points[3]).toBeCloseTo(20)
      expect(imported.points[4]).toBeCloseTo(20)
      expect(imported.points[5]).toBeCloseTo(0)
      expect(imported.closed).toBe(false)
    }
  })

  it('imports full ELLIPSE as closed polyline (64 segments)', () => {
    // Full ellipse centered at (10,20), major axis vector (5,0), axisRatio=1 (circle)
    const ellipseDxf = `0
SECTION
2
ENTITIES
0
ELLIPSE
8
0
10
10
20
20
30
0
11
5
21
0
31
0
40
1
41
0
42
6.283185307179586
0
ENDSEC
0
EOF
`
    const result = importDxf(ellipseDxf)
    const imported = result.shapes.find((s) => s.type === 'polyline')
    expect(imported).toBeDefined()
    if (imported?.type === 'polyline') {
      // 64 segments → 65 points → 130 coordinate values
      expect(imported.points.length).toBe(130)
      expect(imported.closed).toBe(true)
      // First point at angle 0: center + (5, 0) = (15, 20)
      expect(imported.points[0]).toBeCloseTo(15)
      expect(imported.points[1]).toBeCloseTo(20)
    }
  })

  it('imports ELLIPSE arc (half) as open polyline', () => {
    // Half ellipse arc 0..π, center (0,0), major axis (10,0), ratio 0.5
    const arcDxf = `0
SECTION
2
ENTITIES
0
ELLIPSE
8
0
10
0
20
0
30
0
11
10
21
0
31
0
40
0.5
41
0
42
3.141592653589793
0
ENDSEC
0
EOF
`
    const result = importDxf(arcDxf)
    const imported = result.shapes.find((s) => s.type === 'polyline')
    expect(imported).toBeDefined()
    if (imported?.type === 'polyline') {
      expect(imported.points.length).toBe(130)
      expect(imported.closed).toBe(false)
      // First point (t=0): (cos0 * 10, cos0 * 0) = (10, 0)
      expect(imported.points[0]).toBeCloseTo(10)
      expect(imported.points[1]).toBeCloseTo(0)
      // Last point (t=π): (cosπ * 10, cosπ * 0) = (-10, 0)
      expect(imported.points[imported.points.length - 2]).toBeCloseTo(-10)
      expect(imported.points[imported.points.length - 1]).toBeCloseTo(0)
    }
  })
})
