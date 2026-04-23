import { useToolStore } from '../../store/toolStore'
import { SYMBOL_CATALOG, getCategories } from '../../utils/symbolCatalog'
import type { HatchPattern } from '../../types/geometry'

const PATTERNS: { id: HatchPattern; label: string }[] = [
  { id: 'parallel', label: '平行線' },
  { id: 'cross', label: 'クロス' },
  { id: 'earth', label: '土工 (45°x)' },
  { id: 'gravel', label: '砂利' },
]

export function ToolOptionsPanel() {
  const activeTool = useToolStore((s) => s.activeTool)

  if (activeTool === 'hatch') return <HatchOptions />
  if (activeTool === 'symbol') return <SymbolOptions />
  return null
}

function HatchOptions() {
  const {
    hatchPattern, hatchSpacing, hatchAngle,
    setHatchPattern, setHatchSpacing, setHatchAngle,
  } = useToolStore()
  return (
    <div className="p-2 bg-gray-800 text-xs text-gray-200 border-b border-gray-700">
      <p className="font-semibold mb-1">ハッチング設定</p>
      <label className="block mb-1">
        パターン
        <select
          value={hatchPattern}
          onChange={(e) => setHatchPattern(e.target.value as HatchPattern)}
          className="ml-1 bg-gray-700 border border-gray-600 rounded px-1 w-full"
        >
          {PATTERNS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-1 mb-1">
        間隔
        <input
          type="number" value={hatchSpacing}
          min={1} max={200} step={1}
          onChange={(e) => setHatchSpacing(Number(e.target.value))}
          className="flex-1 bg-gray-700 border border-gray-600 rounded px-1"
        />
      </label>
      <label className="flex items-center gap-1">
        角度°
        <input
          type="number" value={hatchAngle}
          min={0} max={180} step={5}
          onChange={(e) => setHatchAngle(Number(e.target.value))}
          className="flex-1 bg-gray-700 border border-gray-600 rounded px-1"
        />
      </label>
      <p className="text-gray-500 mt-1">クリックで頂点追加・ダブルクリックで閉じる</p>
    </div>
  )
}

function SymbolOptions() {
  const { selectedSymbolId, setSelectedSymbolId } = useToolStore()
  const categories = getCategories()
  return (
    <div className="p-2 bg-gray-800 text-xs text-gray-200 border-b border-gray-700 max-h-48 overflow-y-auto">
      <p className="font-semibold mb-1">シンボル選択</p>
      {categories.map((cat) => (
        <div key={cat} className="mb-2">
          <p className="text-gray-400 mt-1">{cat}</p>
          <div className="flex flex-wrap gap-1">
            {SYMBOL_CATALOG.filter((s) => s.category === cat).map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSymbolId(s.id)}
                title={s.name}
                className={`px-2 py-1 rounded text-xs ${
                  selectedSymbolId === s.id
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
