import { describe, it, expect, beforeEach } from 'vitest'
import { useLayerStore } from '../store/layerStore'
import { TEMPLATE_CATALOG } from './templateCatalog'
import type { LineShape, SymbolShape, RectShape, DimensionShape } from '../types/geometry'

beforeEach(() => {
  useLayerStore.getState().clearDocument()
})

describe('TEMPLATE_CATALOG', () => {
  it('has 4 templates', () => {
    expect(TEMPLATE_CATALOG).toHaveLength(4)
  })

  it('every template has at least one shape', () => {
    TEMPLATE_CATALOG.forEach((t) => {
      expect(t.shapes.length).toBeGreaterThan(0)
    })
  })

  it('all template shapes have a type field', () => {
    TEMPLATE_CATALOG.forEach((t) => {
      t.shapes.forEach((s) => {
        expect(s.type).toBeDefined()
      })
    })
  })
})

describe('insertTemplate — construction-zone', () => {
  it('inserts 6 shapes into active layer', () => {
    const { insertTemplate } = useLayerStore.getState()
    insertTemplate('construction-zone', 0, 0)
    const { shapes } = useLayerStore.getState()
    expect(shapes).toHaveLength(6)
  })

  it('applies cx/cy offset to each symbol', () => {
    const { insertTemplate } = useLayerStore.getState()
    insertTemplate('construction-zone', 200, 300)
    const { shapes } = useLayerStore.getState()
    const symbols = shapes as SymbolShape[]
    expect(symbols[0].x).toBe(-100 + 200)
    expect(symbols[0].y).toBe(-100 + 300)
  })

  it('selects inserted shapes', () => {
    const { insertTemplate } = useLayerStore.getState()
    insertTemplate('construction-zone', 0, 0)
    const { selectedIds, shapes } = useLayerStore.getState()
    expect(selectedIds).toHaveLength(shapes.length)
  })

  it('assigns activeLayerId to all shapes', () => {
    const { insertTemplate, activeLayerId } = useLayerStore.getState()
    insertTemplate('construction-zone', 0, 0)
    const { shapes } = useLayerStore.getState()
    expect(shapes.every((s) => s.layerId === activeLayerId)).toBe(true)
  })

  it('pushes to history (undo removes inserted shapes)', () => {
    const { insertTemplate, undo } = useLayerStore.getState()
    insertTemplate('construction-zone', 0, 0)
    expect(useLayerStore.getState().shapes).toHaveLength(6)
    undo()
    expect(useLayerStore.getState().shapes).toHaveLength(0)
  })
})

describe('insertTemplate — earthwork-section', () => {
  it('inserts expected number of shapes', () => {
    const { insertTemplate } = useLayerStore.getState()
    insertTemplate('earthwork-section', 0, 0)
    const { shapes } = useLayerStore.getState()
    expect(shapes).toHaveLength(4)
  })

  it('shifts line endpoints by offset', () => {
    const { insertTemplate } = useLayerStore.getState()
    insertTemplate('earthwork-section', 50, 100)
    const line = useLayerStore.getState().shapes.find((s) => s.type === 'line') as LineShape
    expect(line.x1).toBe(-200 + 50)
    expect(line.y1).toBe(0 + 100)
    expect(line.x2).toBe(200 + 50)
    expect(line.y2).toBe(0 + 100)
  })
})

describe('insertTemplate — paving', () => {
  it('inserts 6 shapes (3 rects + 3 hatches)', () => {
    const { insertTemplate } = useLayerStore.getState()
    insertTemplate('paving', 0, 0)
    const { shapes } = useLayerStore.getState()
    expect(shapes).toHaveLength(6)
    expect(shapes.filter((s) => s.type === 'rect')).toHaveLength(3)
    expect(shapes.filter((s) => s.type === 'hatch')).toHaveLength(3)
  })

  it('shifts rect position by offset', () => {
    const { insertTemplate } = useLayerStore.getState()
    insertTemplate('paving', 10, 20)
    const rects = useLayerStore.getState().shapes.filter((s) => s.type === 'rect') as RectShape[]
    expect(rects[0].x).toBe(-100 + 10)
    expect(rects[0].y).toBe(-10 + 20)
  })
})

describe('insertTemplate — survey-layout', () => {
  it('inserts 5 shapes (3 bm + 2 dimensions)', () => {
    const { insertTemplate } = useLayerStore.getState()
    insertTemplate('survey-layout', 0, 0)
    const { shapes } = useLayerStore.getState()
    expect(shapes).toHaveLength(5)
    expect(shapes.filter((s) => s.type === 'symbol')).toHaveLength(3)
    expect(shapes.filter((s) => s.type === 'dimension')).toHaveLength(2)
  })

  it('shifts dimension endpoints by offset', () => {
    const { insertTemplate } = useLayerStore.getState()
    insertTemplate('survey-layout', 100, 50)
    const dims = useLayerStore.getState().shapes.filter((s) => s.type === 'dimension') as DimensionShape[]
    expect(dims[0].x1).toBe(-150 + 100)
    expect(dims[0].y1).toBe(0 + 50)
  })
})

describe('insertTemplate — unknown id', () => {
  it('does nothing for unknown templateId', () => {
    const { insertTemplate } = useLayerStore.getState()
    insertTemplate('nonexistent', 0, 0)
    expect(useLayerStore.getState().shapes).toHaveLength(0)
  })
})
