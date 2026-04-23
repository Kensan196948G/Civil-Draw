import { create } from 'zustand'

export type Scale = 50 | 100 | 200 | 500 | 1000
export type PaperSize = 'A4' | 'A3' | 'A2' | 'A1' | 'A0'
export type PaperOrientation = 'portrait' | 'landscape'

const PAPER_SIZES_MM: Record<PaperSize, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  A3: { w: 297, h: 420 },
  A2: { w: 420, h: 594 },
  A1: { w: 594, h: 841 },
  A0: { w: 841, h: 1189 },
}

export function getPaperSizePx(
  size: PaperSize,
  orientation: PaperOrientation,
  dpi = 96,
): { w: number; h: number } {
  const mm = PAPER_SIZES_MM[size]
  const ratio = dpi / 25.4
  const w = mm.w * ratio
  const h = mm.h * ratio
  return orientation === 'landscape' ? { w: h, h: w } : { w, h }
}

interface CanvasState {
  zoom: number
  panX: number
  panY: number
  scale: Scale
  paperSize: PaperSize
  paperOrientation: PaperOrientation
  gridVisible: boolean
  gridSnap: boolean
  cursorX: number
  cursorY: number
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  setScale: (scale: Scale) => void
  setPaperSize: (size: PaperSize) => void
  setPaperOrientation: (o: PaperOrientation) => void
  setGridVisible: (v: boolean) => void
  setGridSnap: (v: boolean) => void
  setCursor: (x: number, y: number) => void
  resetView: () => void
}

export const useCanvasStore = create<CanvasState>()((set) => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  scale: 100,
  paperSize: 'A3',
  paperOrientation: 'landscape',
  gridVisible: true,
  gridSnap: true,
  cursorX: 0,
  cursorY: 0,
  setZoom: (zoom) => set({ zoom: Math.min(50, Math.max(0.1, zoom)) }),
  setPan: (panX, panY) => set({ panX, panY }),
  setScale: (scale) => set({ scale }),
  setPaperSize: (paperSize) => set({ paperSize }),
  setPaperOrientation: (paperOrientation) => set({ paperOrientation }),
  setGridVisible: (gridVisible) => set({ gridVisible }),
  setGridSnap: (gridSnap) => set({ gridSnap }),
  setCursor: (cursorX, cursorY) => set({ cursorX, cursorY }),
  resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),
}))
