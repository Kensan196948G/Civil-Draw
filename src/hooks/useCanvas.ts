import { useCallback, useRef } from 'react'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { useCanvasStore } from '../store/canvasStore'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 50
const ZOOM_FACTOR = 1.05

export function useCanvas() {
  const zoom = useCanvasStore((s) => s.zoom)
  const panX = useCanvasStore((s) => s.panX)
  const panY = useCanvasStore((s) => s.panY)
  const setZoom = useCanvasStore((s) => s.setZoom)
  const setPan = useCanvasStore((s) => s.setPan)
  const setCursor = useCanvasStore((s) => s.setCursor)
  const scale = useCanvasStore((s) => s.scale)

  const isPanning = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()
      const stage = e.target.getStage()
      if (!stage) return

      const oldZoom = zoom
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      const direction = e.evt.deltaY < 0 ? 1 : -1
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom * (direction > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR)))

      const worldX = (pointer.x - panX) / oldZoom
      const worldY = (pointer.y - panY) / oldZoom
      const newPanX = pointer.x - worldX * newZoom
      const newPanY = pointer.y - worldY * newZoom

      setZoom(newZoom)
      setPan(newPanX, newPanY)
    },
    [zoom, panX, panY, setZoom, setPan],
  )

  const handleMiddleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 1) {
      isPanning.current = true
      lastPos.current = { x: e.evt.clientX, y: e.evt.clientY }
      e.evt.preventDefault()
    }
  }, [])

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (isPanning.current) {
        const dx = e.evt.clientX - lastPos.current.x
        const dy = e.evt.clientY - lastPos.current.y
        setPan(panX + dx, panY + dy)
        lastPos.current = { x: e.evt.clientX, y: e.evt.clientY }
      }

      const stage = e.target.getStage()
      if (stage) {
        const pointer = stage.getPointerPosition()
        if (pointer) {
          const worldX = (pointer.x - panX) / zoom
          const worldY = (pointer.y - panY) / zoom
          setCursor(worldX / scale * 1000, worldY / scale * 1000)
        }
      }
    },
    [isPanning, panX, panY, zoom, scale, setPan, setCursor],
  )

  const handleMouseUp = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 1) {
      isPanning.current = false
    }
  }, [])

  const stageToWorld = useCallback(
    (stageX: number, stageY: number): { x: number; y: number } => ({
      x: (stageX - panX) / zoom,
      y: (stageY - panY) / zoom,
    }),
    [panX, panY, zoom],
  )

  const handleSpaceKeyPan = useCallback(
    (stage: Konva.Stage, active: boolean) => {
      if (active) {
        stage.container().style.cursor = 'grab'
      } else {
        stage.container().style.cursor = 'default'
      }
    },
    [],
  )

  return {
    zoom, panX, panY,
    handleWheel, handleMiddleMouseDown, handleMouseMove, handleMouseUp,
    stageToWorld, handleSpaceKeyPan,
  }
}
