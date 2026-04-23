import { useCanvasStore } from '../store/canvasStore'
import { useLayerStore } from '../store/layerStore'
import { useToolStore } from '../store/toolStore'

export function StatusBar() {
  const { cursorX, cursorY, zoom, scale, gridSnap } = useCanvasStore()
  const selectedIds = useLayerStore((s) => s.selectedIds)
  const activeTool = useToolStore((s) => s.activeTool)

  return (
    <div className="flex items-center gap-4 px-3 py-0.5 bg-gray-900 text-gray-400 text-xs border-t border-gray-700 flex-shrink-0">
      <span>X: {cursorX.toFixed(2)} m</span>
      <span>Y: {cursorY.toFixed(2)} m</span>
      <span>1/{scale}</span>
      <span>ズーム: {(zoom * 100).toFixed(0)}%</span>
      <span>スナップ: {gridSnap ? 'ON' : 'OFF'}</span>
      <span>ツール: {activeTool}</span>
      {selectedIds.length > 0 && <span>選択: {selectedIds.length}</span>}
    </div>
  )
}
