import { useRef } from 'react'
import { useCanvasStore, type Scale, type PaperSize, type PaperOrientation } from '../../store/canvasStore'
import { useLayerStore } from '../../store/layerStore'
import { downloadDxf, downloadJson, parseJson } from '../../utils/dxfExporter'
import { importDxf } from '../../utils/dxfImporter'

export function Toolbar() {
  const { scale, setScale, paperSize, setPaperSize, paperOrientation, setPaperOrientation, gridVisible, setGridVisible, resetView } = useCanvasStore()
  const { layers, shapes, clearDocument, loadDocument } = useLayerStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dxfInputRef = useRef<HTMLInputElement>(null)

  const scales: Scale[] = [50, 100, 200, 500, 1000]
  const papers: PaperSize[] = ['A4', 'A3', 'A2', 'A1', 'A0']

  const handleSave = () => downloadJson(layers, shapes)
  const handleDxf = () => downloadDxf(layers, shapes)
  const handleNew = () => { if (confirm('新規図面を作成しますか？現在の内容は失われます。')) clearDocument() }
  const handleOpen = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const doc = parseJson(ev.target?.result as string)
        loadDocument(doc.layers, doc.shapes)
      } catch {
        alert('ファイルの読み込みに失敗しました')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDxfImport = () => dxfInputRef.current?.click()

  const handleDxfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const result = importDxf(ev.target?.result as string)
        loadDocument(result.layers, result.shapes)
        if (result.warnings.length > 0) {
          const sample = result.warnings.slice(0, 5).join('\n')
          alert(`DXF を読み込みました。\n注意:\n${sample}${result.warnings.length > 5 ? `\n... 他 ${result.warnings.length - 5} 件` : ''}`)
        }
      } catch (err) {
        alert('DXF の読み込みに失敗しました: ' + (err instanceof Error ? err.message : String(err)))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 text-white text-xs border-b border-gray-700 flex-shrink-0">
      <span className="font-bold text-sm mr-2">CivilDraw</span>

      <button onClick={handleNew} className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded">新規</button>
      <button onClick={handleOpen} className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded">開く</button>
      <button onClick={handleSave} className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded">保存</button>
      <button onClick={handleDxfImport} className="px-2 py-1 bg-indigo-700 hover:bg-indigo-600 rounded">DXF読込</button>
      <button onClick={handleDxf} className="px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded">DXF出力</button>
      <button onClick={() => window.print()} className="px-2 py-1 bg-purple-700 hover:bg-purple-600 rounded">PDF出力</button>
      <input ref={fileInputRef} type="file" accept=".civil,.json" className="hidden" onChange={handleFileChange} />
      <input ref={dxfInputRef} type="file" accept=".dxf" className="hidden" onChange={handleDxfFileChange} />

      <div className="w-px h-5 bg-gray-600 mx-1" />

      <label className="flex items-center gap-1">
        縮尺
        <select
          value={scale}
          onChange={(e) => setScale(Number(e.target.value) as Scale)}
          className="bg-gray-700 border border-gray-600 rounded px-1"
        >
          {scales.map((s) => <option key={s} value={s}>1/{s}</option>)}
        </select>
      </label>

      <label className="flex items-center gap-1">
        用紙
        <select
          value={paperSize}
          onChange={(e) => setPaperSize(e.target.value as PaperSize)}
          className="bg-gray-700 border border-gray-600 rounded px-1"
        >
          {papers.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={paperOrientation}
          onChange={(e) => setPaperOrientation(e.target.value as PaperOrientation)}
          className="bg-gray-700 border border-gray-600 rounded px-1"
        >
          <option value="landscape">横</option>
          <option value="portrait">縦</option>
        </select>
      </label>

      <label className="flex items-center gap-1 cursor-pointer">
        <input
          type="checkbox"
          checked={gridVisible}
          onChange={(e) => setGridVisible(e.target.checked)}
        />
        グリッド
      </label>

      <button onClick={resetView} className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded">表示リセット</button>
    </div>
  )
}
