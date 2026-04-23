import { create } from 'zustand'
import type { Shape, ToolType } from '../types/geometry'

interface ToolState {
  activeTool: ToolType
  previewShape: Shape | null
  isDrawing: boolean
  drawPoints: number[]
  setActiveTool: (tool: ToolType) => void
  setPreviewShape: (shape: Shape | null) => void
  setIsDrawing: (v: boolean) => void
  setDrawPoints: (pts: number[]) => void
  resetDrawing: () => void
}

export const useToolStore = create<ToolState>()((set) => ({
  activeTool: 'select',
  previewShape: null,
  isDrawing: false,
  drawPoints: [],
  setActiveTool: (activeTool) =>
    set({ activeTool, previewShape: null, isDrawing: false, drawPoints: [] }),
  setPreviewShape: (previewShape) => set({ previewShape }),
  setIsDrawing: (isDrawing) => set({ isDrawing }),
  setDrawPoints: (drawPoints) => set({ drawPoints }),
  resetDrawing: () =>
    set({ previewShape: null, isDrawing: false, drawPoints: [] }),
}))
