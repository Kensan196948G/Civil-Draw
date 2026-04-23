import { describe, it, expect, beforeEach } from 'vitest'
import { useLayerStore } from './layerStore'
import type { LineShape, RectShape } from '../types/geometry'

function makeLine(id: string, layerId: string): LineShape {
  return { id, type: 'line', layerId, locked: false, x1: 0, y1: 0, x2: 10, y2: 10 }
}

function makeRect(id: string, layerId: string): RectShape {
  return { id, type: 'rect', layerId, locked: false, x: 0, y: 0, width: 5, height: 5, rotation: 0 }
}

beforeEach(() => {
  useLayerStore.getState().clearDocument()
  useLayerStore.setState({ clipboard: [] })
})

describe('layerStore — default layers', () => {
  it('initializes with 5 default layers', () => {
    const { layers } = useLayerStore.getState()
    expect(layers).toHaveLength(5)
    expect(layers.map((l) => l.name)).toEqual([
      '仮設構造物', '土工', '既存構造物', '寸法', '注記',
    ])
  })

  it('sets the first default layer as active', () => {
    const { layers, activeLayerId } = useLayerStore.getState()
    expect(activeLayerId).toBe(layers[0].id)
  })
})

describe('layerStore — shape CRUD', () => {
  it('adds a shape and updates history', () => {
    const { addShape, activeLayerId } = useLayerStore.getState()
    addShape(makeLine('s1', activeLayerId))
    const state = useLayerStore.getState()
    expect(state.shapes).toHaveLength(1)
    expect(state.history.length).toBeGreaterThan(1)
  })

  it('removes shapes by id', () => {
    const { addShape, removeShapes, activeLayerId } = useLayerStore.getState()
    addShape(makeLine('s1', activeLayerId))
    addShape(makeRect('s2', activeLayerId))
    removeShapes(['s1'])
    const { shapes } = useLayerStore.getState()
    expect(shapes).toHaveLength(1)
    expect(shapes[0].id).toBe('s2')
  })

  it('updates a shape by id', () => {
    const { addShape, updateShape, activeLayerId } = useLayerStore.getState()
    addShape(makeRect('s1', activeLayerId))
    updateShape('s1', { x: 100, y: 200 } as Partial<RectShape>)
    const shape = useLayerStore.getState().shapes[0] as RectShape
    expect(shape.x).toBe(100)
    expect(shape.y).toBe(200)
  })

  it('moves shapes by delta', () => {
    const { addShape, moveShapes, activeLayerId } = useLayerStore.getState()
    addShape(makeLine('s1', activeLayerId))
    moveShapes(['s1'], 5, 3)
    const line = useLayerStore.getState().shapes[0] as LineShape
    expect(line.x1).toBe(5); expect(line.y1).toBe(3)
    expect(line.x2).toBe(15); expect(line.y2).toBe(13)
  })
})

describe('layerStore — undo/redo', () => {
  it('undoes the last shape addition', () => {
    const { addShape, undo, activeLayerId } = useLayerStore.getState()
    addShape(makeLine('s1', activeLayerId))
    expect(useLayerStore.getState().shapes).toHaveLength(1)
    undo()
    expect(useLayerStore.getState().shapes).toHaveLength(0)
  })

  it('redoes an undone operation', () => {
    const { addShape, undo, redo, activeLayerId } = useLayerStore.getState()
    addShape(makeLine('s1', activeLayerId))
    undo()
    redo()
    expect(useLayerStore.getState().shapes).toHaveLength(1)
  })

  it('does not undo below the initial state', () => {
    const { undo } = useLayerStore.getState()
    undo(); undo(); undo()
    expect(useLayerStore.getState().shapes).toHaveLength(0)
  })
})

describe('layerStore — layer management', () => {
  it('adds a new layer', () => {
    useLayerStore.getState().addLayer({ name: 'テスト' })
    expect(useLayerStore.getState().layers).toHaveLength(6)
  })

  it('refuses to remove the last layer', () => {
    const { layers, removeLayer } = useLayerStore.getState()
    for (let i = 1; i < layers.length; i++) {
      removeLayer(useLayerStore.getState().layers[0].id)
    }
    expect(useLayerStore.getState().layers).toHaveLength(1)
    const lastId = useLayerStore.getState().layers[0].id
    removeLayer(lastId)
    expect(useLayerStore.getState().layers).toHaveLength(1)
  })

  it('updates layer properties', () => {
    const { layers, updateLayer } = useLayerStore.getState()
    const id = layers[0].id
    updateLayer(id, { visible: false, locked: true })
    const layer = useLayerStore.getState().layers.find((l) => l.id === id)!
    expect(layer.visible).toBe(false)
    expect(layer.locked).toBe(true)
  })

  it('removes shapes when their layer is removed', () => {
    const { layers, addShape, removeLayer } = useLayerStore.getState()
    const targetLayer = layers[1]
    addShape(makeLine('s1', targetLayer.id))
    addShape(makeLine('s2', layers[0].id))
    removeLayer(targetLayer.id)
    const { shapes } = useLayerStore.getState()
    expect(shapes).toHaveLength(1)
    expect(shapes[0].id).toBe('s2')
  })
})

describe('layerStore — clipboard / duplicate', () => {
  it('copies selected shapes to clipboard', () => {
    const { addShape, setSelected, copySelection, activeLayerId } = useLayerStore.getState()
    addShape(makeLine('s1', activeLayerId))
    setSelected(['s1'])
    copySelection()
    expect(useLayerStore.getState().clipboard).toHaveLength(1)
  })

  it('pastes from clipboard with offset', () => {
    const { addShape, setSelected, copySelection, pasteClipboard, activeLayerId } = useLayerStore.getState()
    addShape(makeLine('s1', activeLayerId))
    setSelected(['s1'])
    copySelection()
    pasteClipboard()
    const shapes = useLayerStore.getState().shapes
    expect(shapes).toHaveLength(2)
    const pasted = shapes.find((s) => s.id !== 's1') as LineShape
    expect(pasted.x1).toBe(20) // 0 + 20 offset
  })

  it('duplicates selection in-place with offset', () => {
    const { addShape, setSelected, duplicateSelection, activeLayerId } = useLayerStore.getState()
    addShape(makeRect('r1', activeLayerId))
    setSelected(['r1'])
    duplicateSelection()
    const state = useLayerStore.getState()
    expect(state.shapes).toHaveLength(2)
    expect(state.selectedIds).toHaveLength(1)
    expect(state.selectedIds[0]).not.toBe('r1')
  })

  it('no-op when clipboard is empty', () => {
    const { pasteClipboard } = useLayerStore.getState()
    pasteClipboard()
    expect(useLayerStore.getState().shapes).toHaveLength(0)
  })
})

describe('layerStore — document load/clear', () => {
  it('loads a full document, replacing state', () => {
    const { loadDocument } = useLayerStore.getState()
    const layers = [{
      id: 'l1', name: 'Single', visible: true, locked: false,
      color: '#ff0000', lineStyle: 'solid' as const, lineWidth: 1, order: 0,
    }]
    const shapes = [makeLine('s1', 'l1')]
    loadDocument(layers, shapes)
    const state = useLayerStore.getState()
    expect(state.layers).toHaveLength(1)
    expect(state.shapes).toHaveLength(1)
    expect(state.activeLayerId).toBe('l1')
  })

  it('resets to defaults on clearDocument', () => {
    const { addShape, activeLayerId, clearDocument } = useLayerStore.getState()
    addShape(makeLine('s1', activeLayerId))
    clearDocument()
    const state = useLayerStore.getState()
    expect(state.layers).toHaveLength(5)
    expect(state.shapes).toHaveLength(0)
  })
})
