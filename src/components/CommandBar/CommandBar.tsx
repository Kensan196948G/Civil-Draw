import { useState, useRef } from 'react'
import { useToolStore } from '../../store/toolStore'
import { useCanvasStore } from '../../store/canvasStore'
import { parseCoordinate } from '../../utils/coordParser'

const TOOL_LABELS: Record<string, string> = {
  line: '線分',
  rect: '矩形',
  circle: '円',
  polyline: 'ポリライン',
  text: 'テキスト',
  hatch: 'ハッチング',
  symbol: 'シンボル',
  dimension: '寸法',
}

const TOOL_HINTS: Record<string, string> = {
  line: '1点目 または 終点',
  rect: '1点目 または 対角点',
  circle: '中心 または 半径点',
  polyline: '次の頂点 (ダブルクリックで確定)',
  text: 'テキスト配置点',
  hatch: '次の頂点 (ダブルクリックで確定)',
  symbol: 'シンボル配置点',
  dimension: '1点目 または 終点',
}

export function CommandBar() {
  const activeTool = useToolStore((s) => s.activeTool)
  const setPendingCoord = useToolStore((s) => s.setPendingCoord)
  const cursorX = useCanvasStore((s) => s.cursorX)
  const cursorY = useCanvasStore((s) => s.cursorY)

  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()

    if (e.key === 'Enter') {
      const point = parseCoordinate(input, cursorX, cursorY)
      if (!point) {
        setError(true)
        return
      }
      setPendingCoord(point)
      setInput('')
      setError(false)
      inputRef.current?.focus()
    }

    if (e.key === 'Escape') {
      setInput('')
      setError(false)
    }
  }

  const label = TOOL_LABELS[activeTool] ?? activeTool
  const hint = TOOL_HINTS[activeTool] ?? '座標を入力'

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border-t border-gray-600 text-sm select-none">
      <span className="text-blue-400 font-mono font-semibold w-20 shrink-0">{label}</span>
      <span className="text-gray-400 text-xs w-52 shrink-0">{hint}</span>
      <div className="flex items-center gap-1 flex-1">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false) }}
          onKeyDown={handleKeyDown}
          placeholder="x,y または @dx,dy"
          className={`bg-gray-900 border rounded px-2 py-0.5 font-mono text-xs w-40 outline-none focus:border-blue-400 ${
            error ? 'border-red-500 text-red-400' : 'border-gray-600 text-green-300'
          }`}
          spellCheck={false}
          autoComplete="off"
        />
        {error && (
          <span className="text-red-400 text-xs">無効な座標</span>
        )}
      </div>
      <span className="text-gray-500 text-xs ml-auto">
        X: {cursorX.toFixed(1)} Y: {cursorY.toFixed(1)}
      </span>
    </div>
  )
}
