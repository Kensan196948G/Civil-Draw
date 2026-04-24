import { useCallback, useState } from 'react'
import { nanoid } from 'nanoid'
import type { KonvaEventObject } from 'konva/lib/Node'
import { useToolStore } from '../store/toolStore'
import { useLayerStore } from '../store/layerStore'
import { useSnap } from './useSnap'
import type { Shape, Point } from '../types/geometry'
import type { SnapResult } from '../utils/snapEngine'
import {
  findShapeAtPoint,
  findShapesInRect,
  rectFromPoints,
} from '../utils/selection'

export function useTool(stageToWorld: (x: number, y: number) => Point) {
  const activeTool = useToolStore((s) => s.activeTool)
  const isDrawing = useToolStore((s) => s.isDrawing)
  const drawPoints = useToolStore((s) => s.drawPoints)
  const previewShape = useToolStore((s) => s.previewShape)
  const selectionBox = useToolStore((s) => s.selectionBox)
  const dragOrigin = useToolStore((s) => s.dragOrigin)
  const setPreviewShape = useToolStore((s) => s.setPreviewShape)
  const setIsDrawing = useToolStore((s) => s.setIsDrawing)
  const setDrawPoints = useToolStore((s) => s.setDrawPoints)
  const setSelectionBox = useToolStore((s) => s.setSelectionBox)
  const setDragOrigin = useToolStore((s) => s.setDragOrigin)
  const resetDrawing = useToolStore((s) => s.resetDrawing)

  const addShape = useLayerStore((s) => s.addShape)
  const activeLayerId = useLayerStore((s) => s.activeLayerId)
  const setSelected = useLayerStore((s) => s.setSelected)

  const { snap } = useSnap()
  const [lastSnap, setLastSnap] = useState<SnapResult | null>(null)

  const getWorld = useCallback(
    (e: KonvaEventObject<MouseEvent>): Point => {
      const stage = e.target.getStage()
      const pos = stage?.getPointerPosition()
      if (!pos) return { x: 0, y: 0 }
      return stageToWorld(pos.x, pos.y)
    },
    [stageToWorld],
  )

  const getSnappedWorld = useCallback(
    (e: KonvaEventObject<MouseEvent>): Point => {
      const result = snap(getWorld(e))
      setLastSnap(result)
      return result.point
    },
    [getWorld, snap],
  )

  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return

      if (activeTool === 'select') {
        const world = getWorld(e)
        const { shapes, selectedIds } = useLayerStore.getState()
        const hit = findShapeAtPoint(shapes, world, 5)
        if (hit) {
          if (!selectedIds.includes(hit)) {
            setSelected(e.evt.shiftKey ? [...selectedIds, hit] : [hit])
          }
          setDragOrigin(world)
        } else {
          if (!e.evt.shiftKey) setSelected([])
          setSelectionBox({ start: world, current: world })
        }
        return
      }

      const p = getSnappedWorld(e)

      if (activeTool === 'line') {
        if (!isDrawing) {
          setIsDrawing(true)
          setDrawPoints([p.x, p.y])
        } else {
          const [x1, y1] = drawPoints
          const shape: Shape = {
            id: nanoid(), type: 'line', layerId: activeLayerId, locked: false,
            x1, y1, x2: p.x, y2: p.y,
          }
          addShape(shape)
          resetDrawing()
        }
        return
      }

      if (activeTool === 'rect') {
        if (!isDrawing) {
          setIsDrawing(true)
          setDrawPoints([p.x, p.y])
        } else {
          const [x1, y1] = drawPoints
          const shape: Shape = {
            id: nanoid(), type: 'rect', layerId: activeLayerId, locked: false,
            x: Math.min(x1, p.x), y: Math.min(y1, p.y),
            width: Math.abs(p.x - x1), height: Math.abs(p.y - y1),
            rotation: 0,
          }
          addShape(shape)
          resetDrawing()
        }
        return
      }

      if (activeTool === 'circle') {
        if (!isDrawing) {
          setIsDrawing(true)
          setDrawPoints([p.x, p.y])
        } else {
          const [cx, cy] = drawPoints
          const radius = Math.hypot(p.x - cx, p.y - cy)
          const shape: Shape = {
            id: nanoid(), type: 'circle', layerId: activeLayerId, locked: false,
            cx, cy, radius,
          }
          addShape(shape)
          resetDrawing()
        }
        return
      }

      if (activeTool === 'polyline') {
        if (!isDrawing) {
          setIsDrawing(true)
          setDrawPoints([p.x, p.y])
        } else {
          setDrawPoints([...drawPoints, p.x, p.y])
        }
        return
      }

      if (activeTool === 'text') {
        const text = window.prompt('テキストを入力してください', '')
        if (text == null) return
        const shape: Shape = {
          id: nanoid(), type: 'text', layerId: activeLayerId, locked: false,
          x: p.x, y: p.y, text, fontSize: 14, rotation: 0,
        }
        addShape(shape)
        return
      }

      if (activeTool === 'hatch') {
        if (!isDrawing) {
          setIsDrawing(true)
          setDrawPoints([p.x, p.y])
        } else {
          setDrawPoints([...drawPoints, p.x, p.y])
        }
        return
      }

      if (activeTool === 'symbol') {
        const symbolId = useToolStore.getState().selectedSymbolId ?? 'cone'
        const shape: Shape = {
          id: nanoid(), type: 'symbol', layerId: activeLayerId, locked: false,
          symbolId, x: p.x, y: p.y, rotation: 0, scale: 1,
        }
        addShape(shape)
        return
      }

      if (activeTool === 'dimension') {
        if (!isDrawing) {
          setIsDrawing(true)
          setDrawPoints([p.x, p.y])
        } else {
          const [x1, y1] = drawPoints
          const dx = Math.abs(p.x - x1)
          const dy = Math.abs(p.y - y1)
          const orientation = dx >= dy ? 'horizontal' : 'vertical'
          const shape: Shape = {
            id: nanoid(), type: 'dimension', layerId: activeLayerId, locked: false,
            x1, y1, x2: p.x, y2: p.y, orientation,
            offset: 30, textHeight: 12, arrowSize: 8,
          }
          addShape(shape)
          resetDrawing()
        }
        return
      }
    },
    [activeTool, isDrawing, drawPoints, activeLayerId, getWorld, getSnappedWorld, addShape, setIsDrawing, setDrawPoints, resetDrawing, setSelected, setDragOrigin, setSelectionBox],
  )

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (activeTool === 'select') {
        if (selectionBox) {
          const world = getWorld(e)
          setSelectionBox({ start: selectionBox.start, current: world })
          const rect = rectFromPoints(selectionBox.start, world)
          const ids = findShapesInRect(useLayerStore.getState().shapes, rect)
          setSelected(ids)
        } else if (dragOrigin) {
          const world = getWorld(e)
          const dx = world.x - dragOrigin.x
          const dy = world.y - dragOrigin.y
          if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
            const { selectedIds, moveShapes } = useLayerStore.getState()
            moveShapes(selectedIds, dx, dy)
            setDragOrigin(world)
          }
        }
        return
      }

      if (!isDrawing) return
      const p = getSnappedWorld(e)

      if (activeTool === 'line' && drawPoints.length >= 2) {
        setPreviewShape({
          id: '__preview', type: 'line', layerId: activeLayerId, locked: false,
          x1: drawPoints[0], y1: drawPoints[1], x2: p.x, y2: p.y,
        })
      }
      if (activeTool === 'rect' && drawPoints.length >= 2) {
        const [x1, y1] = drawPoints
        setPreviewShape({
          id: '__preview', type: 'rect', layerId: activeLayerId, locked: false,
          x: Math.min(x1, p.x), y: Math.min(y1, p.y),
          width: Math.abs(p.x - x1), height: Math.abs(p.y - y1),
          rotation: 0,
        })
      }
      if (activeTool === 'circle' && drawPoints.length >= 2) {
        const [cx, cy] = drawPoints
        setPreviewShape({
          id: '__preview', type: 'circle', layerId: activeLayerId, locked: false,
          cx, cy, radius: Math.hypot(p.x - cx, p.y - cy),
        })
      }
      if (activeTool === 'polyline' && drawPoints.length >= 2) {
        setPreviewShape({
          id: '__preview', type: 'polyline', layerId: activeLayerId, locked: false,
          points: [...drawPoints, p.x, p.y], closed: false,
        })
      }
      if (activeTool === 'dimension' && drawPoints.length >= 2) {
        const [x1, y1] = drawPoints
        const dx = Math.abs(p.x - x1)
        const dy = Math.abs(p.y - y1)
        setPreviewShape({
          id: '__preview', type: 'dimension', layerId: activeLayerId, locked: false,
          x1, y1, x2: p.x, y2: p.y,
          orientation: dx >= dy ? 'horizontal' : 'vertical',
          offset: 30, textHeight: 12, arrowSize: 8,
        })
      }
    },
    [activeTool, isDrawing, drawPoints, activeLayerId, selectionBox, dragOrigin, getWorld, getSnappedWorld, setPreviewShape, setSelectionBox, setSelected, setDragOrigin],
  )

  const handleMouseUp = useCallback(() => {
    if (activeTool === 'select') {
      setSelectionBox(null)
      setDragOrigin(null)
    }
  }, [activeTool, setSelectionBox, setDragOrigin])

  const handleDoubleClick = useCallback(
    () => {
      if (activeTool === 'polyline' && isDrawing && drawPoints.length >= 4) {
        const shape: Shape = {
          id: nanoid(), type: 'polyline', layerId: activeLayerId, locked: false,
          points: drawPoints, closed: false,
        }
        addShape(shape)
        resetDrawing()
      }
      if (activeTool === 'hatch' && isDrawing && drawPoints.length >= 6) {
        const { hatchPattern, hatchSpacing, hatchAngle } = useToolStore.getState()
        const shape: Shape = {
          id: nanoid(), type: 'hatch', layerId: activeLayerId, locked: false,
          points: drawPoints,
          pattern: hatchPattern,
          angle: hatchAngle,
          spacing: hatchSpacing,
        }
        addShape(shape)
        resetDrawing()
      }
    },
    [activeTool, isDrawing, drawPoints, activeLayerId, addShape, resetDrawing],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetDrawing()
        setSelected([])
      }
      if (e.key === 'Enter' && activeTool === 'polyline' && isDrawing && drawPoints.length >= 4) {
        const shape: Shape = {
          id: nanoid(), type: 'polyline', layerId: activeLayerId, locked: false,
          points: drawPoints, closed: false,
        }
        addShape(shape)
        resetDrawing()
      }
    },
    [activeTool, isDrawing, drawPoints, activeLayerId, addShape, resetDrawing, setSelected],
  )

  return {
    previewShape,
    selectionBox,
    lastSnap,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleKeyDown,
  }
}
