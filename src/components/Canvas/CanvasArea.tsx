import { useEffect, useRef, useCallback } from 'react'
import { Stage, Layer } from 'react-konva'
import { useCanvasStore } from '../../store/canvasStore'
import { useLayerStore } from '../../store/layerStore'
import { useToolStore } from '../../store/toolStore'
import { useCanvas } from '../../hooks/useCanvas'
import { useTool } from '../../hooks/useTool'
import { renderGrid } from '../../utils/gridRenderer'
import { ShapeRenderer } from './ShapeRenderer'
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

  const { layers, shapes, selectedIds, setSelected } = useLayerStore((s) => ({
    layers: s.layers,
    shapes: s.shapes,
    selectedIds: s.selectedIds,
    setSelected: s.setSelected,
  }))

  const {
    handleWheel,
    handleMiddleMouseDown,
    handleMouseMove: handleCanvasMouseMove,
    handleMouseUp,
    stageToWorld,
  } = useCanvas()

  const {
    previewShape,
    handleMouseDown,
    handleMouseMove: handleToolMouseMove,
    handleDoubleClick,
    handleKeyDown,
  } = useTool(stageToWorld)

  const activeTool = useToolStore((s) => s.activeTool)

  const isSpacePanning = useRef(false)
  const lastPanPos = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)

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

  const getSize = () => ({
    w: containerRef.current?.offsetWidth ?? 800,
    h: containerRef.current?.offsetHeight ?? 600,
  })

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
    (e: Parameters<typeof handleMouseUp>[0]) => {
      isDragging.current = false
      handleMouseUp(e)
    },
    [handleMouseUp],
  )

  const handleStageClick = useCallback(
    (e: Parameters<typeof handleMouseDown>[0]) => {
      if (activeTool === 'select' && e.target === e.target.getStage()) {
        setSelected([])
      }
    },
    [activeTool, setSelected],
  )

  const { w, h } = getSize()
  const layerById = new Map(layers.map((l) => [l.id, l]))

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden bg-neutral-100" style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}>
      <Stage
        ref={stageRef}
        width={w} height={h}
        x={panX} y={panY}
        scaleX={zoom} scaleY={zoom}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
        onDblClick={handleDoubleClick}
      >
        <Layer ref={gridLayerRef} />
        <Layer>
          {layers
            .filter((l) => l.visible)
            .flatMap((l) =>
              shapes
                .filter((s) => s.layerId === l.id)
                .map((s) => (
                  <ShapeRenderer
                    key={s.id}
                    shape={s}
                    layer={layerById.get(s.layerId)}
                    isSelected={selectedIds.includes(s.id)}
                    onSelect={(id) => setSelected([id])}
                  />
                )),
            )}
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
        </Layer>
      </Stage>
    </div>
  )
}
