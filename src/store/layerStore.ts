import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { Shape } from '../types/geometry'
import type { Layer } from '../types/layer'
import { DEFAULT_LAYERS } from '../types/layer'

const HISTORY_LIMIT = 100

function createDefaultLayers(): Layer[] {
  return DEFAULT_LAYERS.map((l) => ({ ...l, id: nanoid() }))
}

interface LayerState {
  layers: Layer[]
  shapes: Shape[]
  selectedIds: string[]
  activeLayerId: string
  history: Shape[][]
  historyIndex: number
  clipboard: Shape[]

  addLayer: (layer?: Partial<Layer>) => void
  removeLayer: (id: string) => void
  updateLayer: (id: string, patch: Partial<Layer>) => void
  reorderLayer: (fromIndex: number, toIndex: number) => void
  setActiveLayer: (id: string) => void

  addShape: (shape: Shape) => void
  updateShape: (id: string, patch: Partial<Shape>) => void
  removeShapes: (ids: string[]) => void
  moveShapes: (ids: string[], dx: number, dy: number) => void
  setSelected: (ids: string[]) => void

  copySelection: () => void
  pasteClipboard: (dx?: number, dy?: number) => void
  duplicateSelection: () => void

  undo: () => void
  redo: () => void

  loadDocument: (layers: Layer[], shapes: Shape[]) => void
  clearDocument: () => void
}

function pushHistory(
  history: Shape[][],
  historyIndex: number,
  shapes: Shape[],
): { history: Shape[][]; historyIndex: number } {
  const newHistory = history.slice(0, historyIndex + 1)
  newHistory.push([...shapes])
  if (newHistory.length > HISTORY_LIMIT) newHistory.shift()
  return { history: newHistory, historyIndex: newHistory.length - 1 }
}

export const useLayerStore = create<LayerState>()((set, get) => {
  const defaultLayers = createDefaultLayers()
  return {
    layers: defaultLayers,
    shapes: [],
    selectedIds: [],
    activeLayerId: defaultLayers[0].id,
    history: [[]],
    historyIndex: 0,
    clipboard: [],

    addLayer: (patch = {}) => {
      const layer: Layer = {
        id: nanoid(),
        name: '新規レイヤー',
        visible: true,
        locked: false,
        color: '#000000',
        lineStyle: 'solid',
        lineWidth: 1,
        order: get().layers.length,
        ...patch,
      }
      set((s) => ({ layers: [...s.layers, layer] }))
    },

    removeLayer: (id) => {
      const { layers, shapes, activeLayerId } = get()
      if (layers.length <= 1) return
      const remaining = layers.filter((l) => l.id !== id)
      const newShapes = shapes.filter((sh) => sh.layerId !== id)
      const h = pushHistory(get().history, get().historyIndex, newShapes)
      set({
        layers: remaining,
        shapes: newShapes,
        activeLayerId: activeLayerId === id ? remaining[0].id : activeLayerId,
        ...h,
      })
    },

    updateLayer: (id, patch) =>
      set((s) => ({
        layers: s.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      })),

    reorderLayer: (fromIndex, toIndex) => {
      const layers = [...get().layers]
      const [moved] = layers.splice(fromIndex, 1)
      layers.splice(toIndex, 0, moved)
      set({ layers: layers.map((l, i) => ({ ...l, order: i })) })
    },

    setActiveLayer: (activeLayerId) => set({ activeLayerId }),

    addShape: (shape) => {
      const shapes = [...get().shapes, shape]
      const h = pushHistory(get().history, get().historyIndex, shapes)
      set({ shapes, ...h })
    },

    updateShape: (id, patch) => {
      const shapes = get().shapes.map((s) =>
        s.id === id ? ({ ...s, ...patch } as Shape) : s,
      )
      const h = pushHistory(get().history, get().historyIndex, shapes)
      set({ shapes, ...h })
    },

    removeShapes: (ids) => {
      const shapes = get().shapes.filter((s) => !ids.includes(s.id))
      const h = pushHistory(get().history, get().historyIndex, shapes)
      set({ shapes, selectedIds: [], ...h })
    },

    moveShapes: (ids, dx, dy) => {
      const shapes = get().shapes.map((s) => {
        if (!ids.includes(s.id)) return s
        switch (s.type) {
          case 'line':
            return { ...s, x1: s.x1 + dx, y1: s.y1 + dy, x2: s.x2 + dx, y2: s.y2 + dy }
          case 'rect':
            return { ...s, x: s.x + dx, y: s.y + dy }
          case 'circle':
            return { ...s, cx: s.cx + dx, cy: s.cy + dy }
          case 'polyline':
            return {
              ...s,
              points: s.points.map((v, i) => (i % 2 === 0 ? v + dx : v + dy)),
            }
          case 'text':
            return { ...s, x: s.x + dx, y: s.y + dy }
          case 'dimension':
            return { ...s, x1: s.x1 + dx, y1: s.y1 + dy, x2: s.x2 + dx, y2: s.y2 + dy }
          case 'hatch':
            return {
              ...s,
              points: s.points.map((v, i) => (i % 2 === 0 ? v + dx : v + dy)),
            }
          case 'symbol':
            return { ...s, x: s.x + dx, y: s.y + dy }
        }
      })
      const h = pushHistory(get().history, get().historyIndex, shapes)
      set({ shapes, ...h })
    },

    setSelected: (selectedIds) => set({ selectedIds }),

    copySelection: () => {
      const { shapes, selectedIds } = get()
      const copied = shapes.filter((s) => selectedIds.includes(s.id))
      set({ clipboard: copied })
    },

    pasteClipboard: (dx = 20, dy = 20) => {
      const { clipboard } = get()
      if (clipboard.length === 0) return
      const newShapes: Shape[] = clipboard.map((s) => {
        const fresh = { ...s, id: nanoid() } as Shape
        switch (fresh.type) {
          case 'line':
          case 'dimension':
            return { ...fresh, x1: fresh.x1 + dx, y1: fresh.y1 + dy, x2: fresh.x2 + dx, y2: fresh.y2 + dy }
          case 'rect':
          case 'text':
          case 'symbol':
            return { ...fresh, x: fresh.x + dx, y: fresh.y + dy }
          case 'circle':
            return { ...fresh, cx: fresh.cx + dx, cy: fresh.cy + dy }
          case 'polyline':
          case 'hatch':
            return {
              ...fresh,
              points: fresh.points.map((v, i) => (i % 2 === 0 ? v + dx : v + dy)),
            }
        }
      })
      const shapes = [...get().shapes, ...newShapes]
      const h = pushHistory(get().history, get().historyIndex, shapes)
      set({
        shapes,
        selectedIds: newShapes.map((s) => s.id),
        ...h,
      })
    },

    duplicateSelection: () => {
      const { shapes, selectedIds } = get()
      const toCopy = shapes.filter((s) => selectedIds.includes(s.id))
      if (toCopy.length === 0) return
      const dx = 20, dy = 20
      const dups: Shape[] = toCopy.map((s) => {
        const fresh = { ...s, id: nanoid() } as Shape
        switch (fresh.type) {
          case 'line':
          case 'dimension':
            return { ...fresh, x1: fresh.x1 + dx, y1: fresh.y1 + dy, x2: fresh.x2 + dx, y2: fresh.y2 + dy }
          case 'rect':
          case 'text':
          case 'symbol':
            return { ...fresh, x: fresh.x + dx, y: fresh.y + dy }
          case 'circle':
            return { ...fresh, cx: fresh.cx + dx, cy: fresh.cy + dy }
          case 'polyline':
          case 'hatch':
            return {
              ...fresh,
              points: fresh.points.map((v, i) => (i % 2 === 0 ? v + dx : v + dy)),
            }
        }
      })
      const newShapes = [...shapes, ...dups]
      const h = pushHistory(get().history, get().historyIndex, newShapes)
      set({
        shapes: newShapes,
        selectedIds: dups.map((s) => s.id),
        ...h,
      })
    },

    undo: () => {
      const { historyIndex, history } = get()
      if (historyIndex <= 0) return
      const newIndex = historyIndex - 1
      set({ shapes: [...history[newIndex]], historyIndex: newIndex })
    },

    redo: () => {
      const { historyIndex, history } = get()
      if (historyIndex >= history.length - 1) return
      const newIndex = historyIndex + 1
      set({ shapes: [...history[newIndex]], historyIndex: newIndex })
    },

    loadDocument: (layers, shapes) => {
      set({
        layers,
        shapes,
        selectedIds: [],
        activeLayerId: layers[0]?.id ?? '',
        history: [shapes],
        historyIndex: 0,
      })
    },

    clearDocument: () => {
      const defaultLayers = createDefaultLayers()
      set({
        layers: defaultLayers,
        shapes: [],
        selectedIds: [],
        activeLayerId: defaultLayers[0].id,
        history: [[]],
        historyIndex: 0,
      })
    },
  }
})
