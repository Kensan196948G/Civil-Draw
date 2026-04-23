import { useCallback } from 'react'
import { useCanvasStore } from '../store/canvasStore'
import { useLayerStore } from '../store/layerStore'
import { computeSnap } from '../utils/snapEngine'
import type { Point, Shape } from '../types/geometry'
import type { SnapResult } from '../utils/snapEngine'

const GRID_UNIT = 1000

export function useSnap() {
  const scale = useCanvasStore((s) => s.scale)
  const gridSnap = useCanvasStore((s) => s.gridSnap)
  const snapEndpoint = useCanvasStore((s) => s.snapEndpoint)
  const snapMidpoint = useCanvasStore((s) => s.snapMidpoint)
  const snapIntersection = useCanvasStore((s) => s.snapIntersection)
  const shapes = useLayerStore((s) => s.shapes)

  const snap = useCallback(
    (cursor: Point, extraShapes: Shape[] = []): SnapResult => {
      const gridSize = GRID_UNIT / scale
      return computeSnap(
        cursor,
        [...shapes, ...extraShapes],
        gridSize,
        { snapGrid: gridSnap, snapEndpoint, snapMidpoint, snapIntersection },
      )
    },
    [shapes, gridSnap, snapEndpoint, snapMidpoint, snapIntersection, scale],
  )

  return { snap }
}
