import { describe, it, expect, beforeEach } from 'vitest'
import { useCanvasStore, getPaperSizePx } from './canvasStore'

beforeEach(() => {
  useCanvasStore.getState().resetView()
  useCanvasStore.getState().setScale(100)
  useCanvasStore.getState().setPaperSize('A3')
  useCanvasStore.getState().setPaperOrientation('landscape')
  useCanvasStore.getState().setGridVisible(true)
  useCanvasStore.getState().setGridSnap(true)
})

describe('canvasStore — zoom', () => {
  it('clamps zoom to MIN_ZOOM', () => {
    useCanvasStore.getState().setZoom(0.01)
    expect(useCanvasStore.getState().zoom).toBe(0.1)
  })

  it('clamps zoom to MAX_ZOOM', () => {
    useCanvasStore.getState().setZoom(9999)
    expect(useCanvasStore.getState().zoom).toBe(50)
  })

  it('accepts valid zoom values', () => {
    useCanvasStore.getState().setZoom(2.5)
    expect(useCanvasStore.getState().zoom).toBe(2.5)
  })
})

describe('canvasStore — pan and view', () => {
  it('stores pan coordinates', () => {
    useCanvasStore.getState().setPan(100, -50)
    const { panX, panY } = useCanvasStore.getState()
    expect(panX).toBe(100)
    expect(panY).toBe(-50)
  })

  it('resets the view', () => {
    useCanvasStore.getState().setZoom(3)
    useCanvasStore.getState().setPan(77, 33)
    useCanvasStore.getState().resetView()
    const { zoom, panX, panY } = useCanvasStore.getState()
    expect(zoom).toBe(1); expect(panX).toBe(0); expect(panY).toBe(0)
  })

  it('updates cursor position', () => {
    useCanvasStore.getState().setCursor(12.3, 45.6)
    const { cursorX, cursorY } = useCanvasStore.getState()
    expect(cursorX).toBe(12.3); expect(cursorY).toBe(45.6)
  })
})

describe('getPaperSizePx', () => {
  it('returns A4 portrait dimensions at 96 DPI', () => {
    const { w, h } = getPaperSizePx('A4', 'portrait', 96)
    // A4 = 210 × 297 mm at 96 DPI
    expect(Math.round(w)).toBe(794)
    expect(Math.round(h)).toBe(1123)
  })

  it('swaps width and height for landscape', () => {
    const p = getPaperSizePx('A4', 'portrait', 96)
    const l = getPaperSizePx('A4', 'landscape', 96)
    expect(l.w).toBeCloseTo(p.h)
    expect(l.h).toBeCloseTo(p.w)
  })

  it('handles A0 which is 16x A4 area', () => {
    const a4 = getPaperSizePx('A4', 'portrait', 96)
    const a0 = getPaperSizePx('A0', 'portrait', 96)
    const a4Area = a4.w * a4.h
    const a0Area = a0.w * a0.h
    expect(a0Area / a4Area).toBeCloseTo(16, 0)
  })
})
