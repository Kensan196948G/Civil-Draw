import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import { nanoid } from 'nanoid'
import { Stage, Layer, Rect } from 'react-konva'
import { useCanvasStore } from '../../store/canvasStore'
import { useLayerStore } from '../../store/layerStore'
import { useToolStore } from '../../store/toolStore'
import { useCanvas } from '../../hooks/useCanvas'
import { useTool } from '../../hooks/useTool'
import { renderGrid } from '../../utils/gridRenderer'
import { ShapeRenderer } from './ShapeRenderer'
import { SnapMarker } from './SnapMarker'
import { rectFromPoints } from '../../utils/selection'
import { isInViewport, shouldCull } from '../../utils/viewportCulling'
import type { Shape } from '../../types/geometry'
import type Konva from 'konva'

const GRID_UNIT = 1000

export function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gridLayerRef = useRef<Konva.Layer>(null)
  const stageRef = useRef<Konva.Stage>(null)

  const zoom = useCanvasStore((s) => s.zoom)
  const panX = useCanvasStore((s) => s.panX)
  const panY = useCanvasStore((s) => s.panY)
  const gridVisible = useCanvasStore((s) => s.gridVisible)
  const scale = useCanvasStore((s) => s.scale)
  const setPan = useCanvasStore((s) => s.setPan)
  const registerExportFn = useCanvasStore((s) => s.registerExportFn)

  const layers = useLayerStore((s) => s.layers)
  const shapes = useLayerStore((s) => s.shapes)
  const selectedIds = useLayerStore((s) => s.selectedIds)
  const setSelected = useLayerStore((s) => s.setSelected)

  const {
    handleWheel,
    handleMiddleMouseDown,
    handleMouseMove: handleCanvasMouseMove,
    handleMouseUp: handleCanvasMouseUp,
    stageToWorld,
  } = useCanvas()

  const {
    previewShape,
    selectionBox,
    lastSnap,
    handleMouseDown,
    handleMouseMove: handleToolMouseMove,
    handleMouseUp: handleToolMouseUp,
    handleDoubleClick,
    handleKeyDown,
  } = useTool(stageToWorld)

  const activeTool = useToolStore((s) => s.activeTool)
  const pendingCoord = useToolStore((s) => s.pendingCoord)

  const isSpacePanning = useRef(false)
  const lastPanPos = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)

  const [size, setSize] = useState({ w: 800, h: 600 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setSize({ w: el.offsetWidth, h: el.offsetHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Register high-DPI export function so Toolbar can trigger canvas capture
  useEffect(() => {
    registerExportFn((pixelRatio = 3) => {
      return stageRef.current?.toDataURL({ pixelRatio }) ?? ''
    })
  }, [registerExportFn])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePanning.current) {
        isSpacePanning.current = true
        if (containerRef.current) containerRef.current.style.cursor = 'grab'
      }
      handleKeyDown(e)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePanning.current = false
        if (containerRef.current) containerRef.current.style.cursor = 'default'
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [handleKeyDown])

  useEffect(() => {
    if (!gridLayerRef.current || !containerRef.current || !gridVisible) {
      gridLayerRef.current?.destroyChildren()
      gridLayerRef.current?.batchDraw()
      return
    }
    const { offsetWidth: w, offsetHeight: h } = containerRef.current
    renderGrid(gridLayerRef.current, {
      width: w, height: h,
      gridSize: GRID_UNIT / scale,
      zoom, panX, panY,
    })
  }, [zoom, panX, panY, gridVisible, scale])

  // Inject keyboard-entered coordinates into the drawing pipeline
  useEffect(() => {
    if (!pendingCoord) return
    const p = pendingCoord
    const ts = useToolStore.getState()
    const ls = useLayerStore.getState()
    const { activeTool, isDrawing, drawPoints, setIsDrawing, setDrawPoints, resetDrawing, setPendingCoord } = ts
    const { activeLayerId, addShape } = ls

    const finish = () => setPendingCoord(null)

    if (activeTool === 'line') {
      if (!isDrawing) {
        setIsDrawing(true)
        setDrawPoints([p.x, p.y])
      } else {
        const [x1, y1] = drawPoints
        addShape({ id: nanoid(), type: 'line', layerId: activeLayerId, locked: false, x1, y1, x2: p.x, y2: p.y } as Shape)
        resetDrawing()
      }
      finish()
      return
    }
    if (activeTool === 'rect') {
      if (!isDrawing) {
        setIsDrawing(true)
        setDrawPoints([p.x, p.y])
      } else {
        const [x1, y1] = drawPoints
        addShape({ id: nanoid(), type: 'rect', layerId: activeLayerId, locked: false, x: Math.min(x1, p.x), y: Math.min(y1, p.y), width: Math.abs(p.x - x1), height: Math.abs(p.y - y1), rotation: 0 } as Shape)
        resetDrawing()
      }
      finish()
      return
    }
    if (activeTool === 'circle') {
      if (!isDrawing) {
        setIsDrawing(true)
        setDrawPoints([p.x, p.y])
      } else {
        const [cx, cy] = drawPoints
        addShape({ id: nanoid(), type: 'circle', layerId: activeLayerId, locked: false, cx, cy, radius: Math.hypot(p.x - cx, p.y - cy) } as Shape)
        resetDrawing()
      }
      finish()
      return
    }
    if (activeTool === 'polyline' || activeTool === 'hatch') {
      if (!isDrawing) {
        setIsDrawing(true)
        setDrawPoints([p.x, p.y])
      } else {
        setDrawPoints([...drawPoints, p.x, p.y])
      }
      finish()
      return
    }
    if (activeTool === 'text') {
      const text = window.prompt('テキストを入力してください', '')
      if (text != null) {
        addShape({ id: nanoid(), type: 'text', layerId: activeLayerId, locked: false, x: p.x, y: p.y, text, fontSize: 14, rotation: 0 } as Shape)
      }
      finish()
      return
    }
    if (activeTool === 'symbol') {
      const symbolId = ts.selectedSymbolId ?? 'cone'
      addShape({ id: nanoid(), type: 'symbol', layerId: activeLayerId, locked: false, symbolId, x: p.x, y: p.y, rotation: 0, scale: 1 } as Shape)
      finish()
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
        addShape({ id: nanoid(), type: 'dimension', layerId: activeLayerId, locked: false, x1, y1, x2: p.x, y2: p.y, orientation: dx >= dy ? 'horizontal' : 'vertical', offset: 30, textHeight: 12, arrowSize: 8 } as Shape)
        resetDrawing()
      }
      finish()
      return
    }
    finish()
  }, [pendingCoord])

  const handleStageMouseMove = useCallback(
    (e: Parameters<typeof handleCanvasMouseMove>[0]) => {
      handleCanvasMouseMove(e)
      handleToolMouseMove(e)

      if (isSpacePanning.current && isDragging.current) {
        const dx = e.evt.clientX - lastPanPos.current.x
        const dy = e.evt.clientY - lastPanPos.current.y
        setPan(panX + dx, panY + dy)
        lastPanPos.current = { x: e.evt.clientX, y: e.evt.clientY }
      }
    },
    [handleCanvasMouseMove, handleToolMouseMove, panX, panY, setPan],
  )

  const handleStageMouseDown = useCallback(
    (e: Parameters<typeof handleMouseDown>[0]) => {
      if (isSpacePanning.current) {
        isDragging.current = true
        lastPanPos.current = { x: e.evt.clientX, y: e.evt.clientY }
        return
      }
      handleMiddleMouseDown(e)
      handleMouseDown(e)
    },
    [handleMiddleMouseDown, handleMouseDown],
  )

  const handleStageMouseUp = useCallback(
    (e: Parameters<typeof handleCanvasMouseUp>[0]) => {
      isDragging.current = false
      handleCanvasMouseUp(e)
      handleToolMouseUp()
    },
    [handleCanvasMouseUp, handleToolMouseUp],
  )

  const { w, h } = size
  const selectionRect = selectionBox
    ? rectFromPoints(selectionBox.start, selectionBox.current)
    : null

  const layerById = useMemo(
    () => new Map(layers.map((l) => [l.id, l])),
    [layers],
  )
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const visibleShapes = useMemo(() => {
    if (!shouldCull(shapes.length)) return shapes
    const vp = { zoom, panX, panY, width: w, height: h }
    return shapes.filter((s) => isInViewport(s, vp))
  }, [shapes, zoom, panX, panY, w, h])

  // Group visible shapes by layerId once per render (O(L+S) vs O(L*S) naive filter)
  // and iterate layers in their existing order so draw order is preserved.
  const shapesByLayer = useMemo(() => {
    const map = new Map<string, typeof visibleShapes>()
    for (const s of visibleShapes) {
      const arr = map.get(s.layerId)
      if (arr) arr.push(s)
      else map.set(s.layerId, [s])
    }
    return map
  }, [visibleShapes])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden bg-neutral-100"
      style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
    >
      <Stage
        ref={stageRef}
        width={w} height={h}
        x={panX} y={panY}
        scaleX={zoom} scaleY={zoom}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onDblClick={handleDoubleClick}
      >
        <Layer ref={gridLayerRef} />
        {/* Static shapes layer — redraws only when shapes/layers/selection change */}
        <Layer>
          {layers.flatMap((l) => {
            if (!l.visible) return []
            const arr = shapesByLayer.get(l.id)
            if (!arr) return []
            return arr.map((s) => (
              <ShapeRenderer
                key={s.id}
                shape={s}
                layer={l}
                isSelected={selectedIdSet.has(s.id)}
                onSelect={(id) => setSelected([id])}
              />
            ))
          })}
        </Layer>
        {/* Dynamic layer — preview / selection rect / snap marker. Isolated so
            frequent mouse-move updates do not invalidate the static layer. */}
        <Layer listening={false}>
          {previewShape && (
            <ShapeRenderer
              key="__preview"
              shape={previewShape}
              layer={layerById.get(previewShape.layerId)}
              isSelected={false}
              onSelect={() => {}}
              isPreview
            />
          )}
          {selectionRect && (
            <Rect
              x={selectionRect.minX}
              y={selectionRect.minY}
              width={selectionRect.maxX - selectionRect.minX}
              height={selectionRect.maxY - selectionRect.minY}
              stroke="#4af"
              strokeWidth={1 / zoom}
              dash={[4 / zoom, 4 / zoom]}
              fill="rgba(68, 170, 255, 0.08)"
              listening={false}
            />
          )}
          {activeTool !== 'select' && <SnapMarker snap={lastSnap} zoom={zoom} />}
        </Layer>
      </Stage>
    </div>
  )
}
