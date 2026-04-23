import { useLayerStore } from '../../store/layerStore'
import type { Layer } from '../../types/layer'
import type { LineStyle } from '../../types/geometry'

const LINE_STYLES: LineStyle[] = ['solid', 'dashed', 'dashdot']
const LINE_STYLE_LABELS: Record<LineStyle, string> = {
  solid: '実線',
  dashed: '破線',
  dashdot: '一点鎖',
}

export function LayerPanel() {
  const { layers, activeLayerId, setActiveLayer, addLayer, removeLayer, updateLayer } = useLayerStore()

  return (
    <div className="flex flex-col h-full text-xs text-gray-200 bg-gray-800">
      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-700">
        <span className="font-semibold">レイヤー</span>
        <button
          onClick={() => addLayer()}
          className="px-2 py-0.5 bg-blue-700 hover:bg-blue-600 rounded"
        >
          +追加
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {[...layers].sort((a, b) => a.order - b.order).map((layer) => (
          <LayerRow
            key={layer.id}
            layer={layer}
            isActive={layer.id === activeLayerId}
            onActivate={() => setActiveLayer(layer.id)}
            onUpdate={(patch) => updateLayer(layer.id, patch)}
            onRemove={() => removeLayer(layer.id)}
            canRemove={layers.length > 1}
          />
        ))}
      </div>
    </div>
  )
}

interface RowProps {
  layer: Layer
  isActive: boolean
  onActivate: () => void
  onUpdate: (patch: Partial<Layer>) => void
  onRemove: () => void
  canRemove: boolean
}

function LayerRow({ layer, isActive, onActivate, onUpdate, onRemove, canRemove }: RowProps) {
  return (
    <div
      className={`px-2 py-1 border-b border-gray-700 cursor-pointer
        ${isActive ? 'bg-blue-900' : 'hover:bg-gray-700'}`}
      onClick={onActivate}
    >
      <div className="flex items-center gap-1 mb-1">
        <button
          title={layer.visible ? '非表示にする' : '表示する'}
          onClick={(e) => { e.stopPropagation(); onUpdate({ visible: !layer.visible }) }}
          className={`w-5 h-5 rounded text-xs ${layer.visible ? 'text-yellow-400' : 'text-gray-600'}`}
        >
          👁
        </button>
        <button
          title={layer.locked ? 'ロック解除' : 'ロック'}
          onClick={(e) => { e.stopPropagation(); onUpdate({ locked: !layer.locked }) }}
          className={`w-5 h-5 rounded text-xs ${layer.locked ? 'text-red-400' : 'text-gray-500'}`}
        >
          🔒
        </button>
        <input
          type="text"
          value={layer.name}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="flex-1 bg-transparent border-none outline-none text-xs text-white min-w-0"
        />
        {canRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="text-gray-500 hover:text-red-400 px-1"
          >
            ✕
          </button>
        )}
      </div>
      <div className="flex items-center gap-1">
        <input
          type="color"
          value={layer.color}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate({ color: e.target.value })}
          className="w-5 h-5 cursor-pointer border-0 p-0 bg-transparent"
          title="色"
        />
        <select
          value={layer.lineStyle}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate({ lineStyle: e.target.value as LineStyle })}
          className="bg-gray-700 border border-gray-600 rounded px-1 text-xs flex-1"
        >
          {LINE_STYLES.map((s) => (
            <option key={s} value={s}>{LINE_STYLE_LABELS[s]}</option>
          ))}
        </select>
        <input
          type="number"
          value={layer.lineWidth}
          min={0.1} max={10} step={0.1}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate({ lineWidth: Number(e.target.value) })}
          className="w-12 bg-gray-700 border border-gray-600 rounded px-1 text-xs"
          title="線幅"
        />
      </div>
    </div>
  )
}
