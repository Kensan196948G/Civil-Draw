import { create } from 'zustand'
import type { Shape, ToolType, Point, HatchPattern } from '../types/geometry'

export interface SelectionBox {
  start: Point
  current: Point
}

interface ToolState {
  activeTool: ToolType
  previewShape: Shape | null
  isDrawing: boolean
  drawPoints: number[]
  selectionBox: SelectionBox | null
  dragOrigin: Point | null
  hatchPattern: HatchPattern
  hatchSpacing: number
  hatchAngle: number
  selectedSymbolId: string | null
  setActiveTool: (tool: ToolType) => void
  setPreviewShape: (shape: Shape | null) => void
  setIsDrawing: (v: boolean) => void
  setDrawPoints: (pts: number[]) => void
  setSelectionBox: (box: SelectionBox | null) => void
  setDragOrigin: (p: Point | null) => void
  setHatchPattern: (p: HatchPattern) => void
  setHatchSpacing: (s: number) => void
  setHatchAngle: (a: number) => void
  setSelectedSymbolId: (id: string | null) => void
  resetDrawing: () => void
}

export const useToolStore = create<ToolState>()((set) => ({
  activeTool: 'select',
  previewShape: null,
  isDrawing: false,
  drawPoints: [],
  selectionBox: null,
  dragOrigin: null,
  hatchPattern: 'parallel',
  hatchSpacing: 20,
  hatchAngle: 45,
  selectedSymbolId: 'cone',
  setActiveTool: (activeTool) =>
    set({
      activeTool,
      previewShape: null,
      isDrawing: false,
      drawPoints: [],
      selectionBox: null,
      dragOrigin: null,
    }),
  setPreviewShape: (previewShape) => set({ previewShape }),
  setIsDrawing: (isDrawing) => set({ isDrawing }),
  setDrawPoints: (drawPoints) => set({ drawPoints }),
  setSelectionBox: (selectionBox) => set({ selectionBox }),
  setDragOrigin: (dragOrigin) => set({ dragOrigin }),
  setHatchPattern: (hatchPattern) => set({ hatchPattern }),
  setHatchSpacing: (hatchSpacing) => set({ hatchSpacing }),
  setHatchAngle: (hatchAngle) => set({ hatchAngle }),
  setSelectedSymbolId: (selectedSymbolId) => set({ selectedSymbolId }),
  resetDrawing: () =>
    set({
      previewShape: null,
      isDrawing: false,
      drawPoints: [],
      selectionBox: null,
      dragOrigin: null,
    }),
}))
