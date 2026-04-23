import { describe, it, expect, beforeEach } from 'vitest'
import { useToolStore } from './toolStore'
import type { LineShape } from '../types/geometry'

beforeEach(() => {
  useToolStore.getState().resetDrawing()
  useToolStore.getState().setActiveTool('select')
})

describe('toolStore', () => {
  it('starts with select as active tool', () => {
    expect(useToolStore.getState().activeTool).toBe('select')
  })

  it('switches the active tool and resets drawing state', () => {
    const preview: LineShape = {
      id: '__p', type: 'line', layerId: 'l', locked: false,
      x1: 0, y1: 0, x2: 10, y2: 10,
    }
    useToolStore.getState().setPreviewShape(preview)
    useToolStore.getState().setIsDrawing(true)
    useToolStore.getState().setDrawPoints([1, 2, 3, 4])
    useToolStore.getState().setActiveTool('rect')
    const state = useToolStore.getState()
    expect(state.activeTool).toBe('rect')
    expect(state.previewShape).toBeNull()
    expect(state.isDrawing).toBe(false)
    expect(state.drawPoints).toEqual([])
  })

  it('resets the drawing buffer', () => {
    useToolStore.getState().setDrawPoints([1, 2])
    useToolStore.getState().setIsDrawing(true)
    useToolStore.getState().resetDrawing()
    const state = useToolStore.getState()
    expect(state.isDrawing).toBe(false)
    expect(state.drawPoints).toEqual([])
    expect(state.previewShape).toBeNull()
  })

  it('stores drawPoints as a coordinate list', () => {
    useToolStore.getState().setDrawPoints([10, 20, 30, 40])
    expect(useToolStore.getState().drawPoints).toEqual([10, 20, 30, 40])
  })
})
