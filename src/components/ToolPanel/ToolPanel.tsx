import { useToolStore } from '../../store/toolStore'
import { useLayerStore } from '../../store/layerStore'
import type { ToolType } from '../../types/geometry'

const TOOLS: { id: ToolType; label: string; icon: string }[] = [
  { id: 'select', label: '選択', icon: '↖' },
  { id: 'line', label: '線分', icon: '/' },
  { id: 'rect', label: '矩形', icon: '□' },
  { id: 'circle', label: '円', icon: '○' },
  { id: 'polyline', label: 'ポリライン', icon: '⌐' },
  { id: 'text', label: 'テキスト', icon: 'A' },
  { id: 'dimension', label: '寸法線', icon: '↔' },
]

export function ToolPanel() {
  const activeTool = useToolStore((s) => s.activeTool)
  const setActiveTool = useToolStore((s) => s.setActiveTool)
  const undo = useLayerStore((s) => s.undo)
  const redo = useLayerStore((s) => s.redo)
  const removeShapes = useLayerStore((s) => s.removeShapes)
  const selectedIds = useLayerStore((s) => s.selectedIds)

  return (
    <div className="flex flex-col items-center gap-1 p-1 bg-gray-800 w-14 border-r border-gray-700 flex-shrink-0">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          title={t.label}
          onClick={() => setActiveTool(t.id)}
          className={`w-10 h-10 rounded text-lg font-bold flex items-center justify-center
            ${activeTool === t.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          {t.icon}
        </button>
      ))}
      <div className="w-8 h-px bg-gray-600 my-1" />
      <button
        title="元に戻す (Ctrl+Z)"
        onClick={undo}
        className="w-10 h-10 rounded text-xs bg-gray-700 text-gray-300 hover:bg-gray-600"
      >
        ↩
      </button>
      <button
        title="やり直し (Ctrl+Y)"
        onClick={redo}
        className="w-10 h-10 rounded text-xs bg-gray-700 text-gray-300 hover:bg-gray-600"
      >
        ↪
      </button>
      {selectedIds.length > 0 && (
        <button
          title="削除 (Delete)"
          onClick={() => removeShapes(selectedIds)}
          className="w-10 h-10 rounded text-xs bg-red-700 text-white hover:bg-red-600"
        >
          ✕
        </button>
      )}
    </div>
  )
}
