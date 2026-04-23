import { useLayerStore } from '../../store/layerStore'
import type { Shape } from '../../types/geometry'

export function PropertyPanel() {
  const { shapes, selectedIds, updateShape, removeShapes } = useLayerStore()
  const selected = shapes.filter((s) => selectedIds.includes(s.id))

  if (selected.length === 0) {
    return (
      <div className="p-2 text-xs text-gray-400 bg-gray-800">
        図形を選択してください
      </div>
    )
  }

  if (selected.length > 1) {
    return (
      <div className="p-2 text-xs text-gray-200 bg-gray-800">
        <p className="mb-2">{selected.length} 件選択中</p>
        <button
          onClick={() => removeShapes(selectedIds)}
          className="px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-xs"
        >
          削除
        </button>
      </div>
    )
  }

  const shape = selected[0]
  return (
    <div className="p-2 text-xs text-gray-200 bg-gray-800">
      <p className="font-semibold mb-2">{shapeTypeName(shape.type)}</p>
      <ShapeProps shape={shape} onUpdate={(patch) => updateShape(shape.id, patch)} />
      <button
        onClick={() => removeShapes(selectedIds)}
        className="mt-2 px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-xs w-full"
      >
        削除
      </button>
    </div>
  )
}

function shapeTypeName(type: Shape['type']): string {
  const names: Record<Shape['type'], string> = {
    line: '線分', rect: '矩形', circle: '円',
    polyline: 'ポリライン', text: 'テキスト', dimension: '寸法線',
    hatch: 'ハッチング', symbol: 'シンボル',
  }
  return names[type]
}

interface PropsProps {
  shape: Shape
  onUpdate: (patch: Partial<Shape>) => void
}

function ShapeProps({ shape, onUpdate }: PropsProps) {
  switch (shape.type) {
    case 'line':
      return (
        <div className="space-y-1">
          <Row label="X1" value={shape.x1} onChange={(v) => onUpdate({ x1: v } as Partial<typeof shape>)} />
          <Row label="Y1" value={shape.y1} onChange={(v) => onUpdate({ y1: v } as Partial<typeof shape>)} />
          <Row label="X2" value={shape.x2} onChange={(v) => onUpdate({ x2: v } as Partial<typeof shape>)} />
          <Row label="Y2" value={shape.y2} onChange={(v) => onUpdate({ y2: v } as Partial<typeof shape>)} />
        </div>
      )
    case 'rect':
      return (
        <div className="space-y-1">
          <Row label="X" value={shape.x} onChange={(v) => onUpdate({ x: v } as Partial<typeof shape>)} />
          <Row label="Y" value={shape.y} onChange={(v) => onUpdate({ y: v } as Partial<typeof shape>)} />
          <Row label="W" value={shape.width} onChange={(v) => onUpdate({ width: v } as Partial<typeof shape>)} />
          <Row label="H" value={shape.height} onChange={(v) => onUpdate({ height: v } as Partial<typeof shape>)} />
          <Row label="回転" value={shape.rotation} onChange={(v) => onUpdate({ rotation: v } as Partial<typeof shape>)} />
        </div>
      )
    case 'circle':
      return (
        <div className="space-y-1">
          <Row label="CX" value={shape.cx} onChange={(v) => onUpdate({ cx: v } as Partial<typeof shape>)} />
          <Row label="CY" value={shape.cy} onChange={(v) => onUpdate({ cy: v } as Partial<typeof shape>)} />
          <Row label="半径" value={shape.radius} onChange={(v) => onUpdate({ radius: v } as Partial<typeof shape>)} />
        </div>
      )
    case 'text':
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="w-16">テキスト</span>
            <input
              type="text"
              value={shape.text}
              onChange={(e) => onUpdate({ text: e.target.value } as Partial<typeof shape>)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-1"
            />
          </div>
          <Row label="X" value={shape.x} onChange={(v) => onUpdate({ x: v } as Partial<typeof shape>)} />
          <Row label="Y" value={shape.y} onChange={(v) => onUpdate({ y: v } as Partial<typeof shape>)} />
          <Row label="サイズ" value={shape.fontSize} onChange={(v) => onUpdate({ fontSize: v } as Partial<typeof shape>)} />
          <Row label="回転" value={shape.rotation} onChange={(v) => onUpdate({ rotation: v } as Partial<typeof shape>)} />
        </div>
      )
    case 'symbol':
      return (
        <div className="space-y-1">
          <p className="text-gray-400">シンボル: {shape.symbolId}</p>
          <Row label="X" value={shape.x} onChange={(v) => onUpdate({ x: v } as Partial<typeof shape>)} />
          <Row label="Y" value={shape.y} onChange={(v) => onUpdate({ y: v } as Partial<typeof shape>)} />
          <Row label="回転°" value={shape.rotation} onChange={(v) => onUpdate({ rotation: v } as Partial<typeof shape>)} />
          <Row label="拡大率" value={shape.scale} onChange={(v) => onUpdate({ scale: v } as Partial<typeof shape>)} />
        </div>
      )
    case 'dimension':
      return (
        <div className="space-y-1">
          <Row label="X1" value={shape.x1} onChange={(v) => onUpdate({ x1: v } as Partial<typeof shape>)} />
          <Row label="Y1" value={shape.y1} onChange={(v) => onUpdate({ y1: v } as Partial<typeof shape>)} />
          <Row label="X2" value={shape.x2} onChange={(v) => onUpdate({ x2: v } as Partial<typeof shape>)} />
          <Row label="Y2" value={shape.y2} onChange={(v) => onUpdate({ y2: v } as Partial<typeof shape>)} />
          <Row label="オフセット" value={shape.offset} onChange={(v) => onUpdate({ offset: v } as Partial<typeof shape>)} />
        </div>
      )
    default:
      return <p className="text-gray-500">プロパティなし</p>
  }
}

function Row({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-14 text-gray-400">{label}</span>
      <input
        type="number"
        value={Math.round(value * 100) / 100}
        step={0.1}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 bg-gray-700 border border-gray-600 rounded px-1"
      />
    </div>
  )
}
