import { describe, it, expect } from 'vitest'
import { exportDxf, exportJson, parseJson } from './dxfExporter'
import type { Layer } from '../types/layer'
import type { Shape } from '../types/geometry'

const LAYER: Layer = {
  id: 'ly1', name: '仮設', visible: true, locked: false,
  color: '#ff0000', lineStyle: 'solid', lineWidth: 1, order: 0,
}

const LINE: Shape = {
  id: 's1', type: 'line', layerId: 'ly1', locked: false,
  x1: 0, y1: 0, x2: 100, y2: 50,
}

const RECT: Shape = {
  id: 's2', type: 'rect', layerId: 'ly1', locked: false,
  x: 10, y: 20, width: 30, height: 40, rotation: 0,
}

const CIRCLE: Shape = {
  id: 's3', type: 'circle', layerId: 'ly1', locked: false,
  cx: 5, cy: 5, radius: 25,
}

describe('exportDxf', () => {
  it('produces DXF output containing ENTITIES section', () => {
    const dxf = exportDxf([LAYER], [LINE])
    expect(dxf).toContain('ENTITIES')
    expect(dxf).toContain('ENDSEC')
  })

  it('produces DXF with TABLES (layers) section', () => {
    const dxf = exportDxf([LAYER], [])
    expect(dxf).toContain('TABLES')
    expect(dxf).toContain('仮設')
  })

  it('handles line, rect, circle without throwing', () => {
    const dxf = exportDxf([LAYER], [LINE, RECT, CIRCLE])
    expect(dxf).toContain('LINE')
    expect(dxf).toContain('CIRCLE')
    expect(dxf.length).toBeGreaterThan(500)
  })

  it('produces units=Meters header', () => {
    const dxf = exportDxf([LAYER], [])
    expect(dxf).toContain('$INSUNITS')
  })
})

describe('exportDxf — complex shapes', () => {
  const POLYLINE: Shape = {
    id: 's4', type: 'polyline', layerId: 'ly1', locked: false,
    points: [0, 0, 10, 0, 10, 10, 0, 10], closed: true,
  }
  const TEXT: Shape = {
    id: 's5', type: 'text', layerId: 'ly1', locked: false,
    x: 5, y: 5, text: 'TEST', fontSize: 14, rotation: 0,
  }
  const DIM_H: Shape = {
    id: 's6', type: 'dimension', layerId: 'ly1', locked: false,
    x1: 0, y1: 0, x2: 100, y2: 0, orientation: 'horizontal',
    offset: 20, textHeight: 12, arrowSize: 8,
  }
  const DIM_V: Shape = {
    id: 's7', type: 'dimension', layerId: 'ly1', locked: false,
    x1: 0, y1: 0, x2: 0, y2: 50, orientation: 'vertical',
    offset: 20, textHeight: 12, arrowSize: 8,
  }
  const DIM_P: Shape = {
    id: 's8', type: 'dimension', layerId: 'ly1', locked: false,
    x1: 0, y1: 0, x2: 30, y2: 40, orientation: 'parallel',
    offset: 20, textHeight: 12, arrowSize: 8,
  }

  it('includes polyline in DXF output', () => {
    const dxf = exportDxf([LAYER], [POLYLINE])
    expect(dxf).toContain('POLYLINE')
  })

  it('includes text in DXF output', () => {
    const dxf = exportDxf([LAYER], [TEXT])
    expect(dxf).toContain('TEXT')
    expect(dxf).toContain('TEST')
  })

  it('renders horizontal / vertical / parallel dimensions as lines + text', () => {
    const dxf = exportDxf([LAYER], [DIM_H, DIM_V, DIM_P])
    // Each dimension decomposes into multiple LINE entities
    const lineCount = (dxf.match(/\nLINE\n/g) ?? []).length
    expect(lineCount).toBeGreaterThanOrEqual(3)
  })

  it('places shapes on the correct layer name', () => {
    const line: Shape = {
      id: 'ss', type: 'line', layerId: 'ly1', locked: false,
      x1: 0, y1: 0, x2: 1, y2: 1,
    }
    const dxf = exportDxf([LAYER], [line])
    expect(dxf).toContain('仮設')
  })

  it('falls back to layer "0" for unknown layerId', () => {
    const orphan: Shape = {
      id: 'orphan', type: 'line', layerId: 'nonexistent', locked: false,
      x1: 0, y1: 0, x2: 1, y2: 1,
    }
    const dxf = exportDxf([LAYER], [orphan])
    expect(dxf).toContain('LINE')
  })
})

describe('exportJson / parseJson', () => {
  it('round-trips through JSON', () => {
    const json = exportJson([LAYER], [LINE, RECT])
    const doc = parseJson(json)
    expect(doc.version).toBe('1.0')
    expect(doc.layers).toHaveLength(1)
    expect(doc.shapes).toHaveLength(2)
    expect(doc.shapes[0]).toEqual(LINE)
  })

  it('produces pretty-printed JSON', () => {
    const json = exportJson([LAYER], [])
    expect(json).toContain('\n')
    expect(json).toContain('"version"')
  })

  it('throws on invalid JSON', () => {
    expect(() => parseJson('not json')).toThrow()
  })
})
