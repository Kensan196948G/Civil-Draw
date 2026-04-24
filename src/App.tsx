import { useEffect, useRef } from 'react'
import { Toolbar } from './components/Toolbar/Toolbar'
import { ToolPanel } from './components/ToolPanel/ToolPanel'
import { ToolOptionsPanel } from './components/ToolPanel/ToolOptionsPanel'
import { CanvasArea } from './components/Canvas/CanvasArea'
import { LayerPanel } from './components/LayerPanel/LayerPanel'
import { PropertyPanel } from './components/PropertyPanel/PropertyPanel'
import { TemplatePanel } from './components/TemplatePanel/TemplatePanel'
import { CommandBar } from './components/CommandBar/CommandBar'
import { StatusBar } from './components/StatusBar'
import { useLayerStore } from './store/layerStore'
import { useToolStore } from './store/toolStore'
import { saveAutoSnapshot, loadAutoSnapshot, debounce } from './utils/autosave'

export default function App() {
  const undo = useLayerStore((s) => s.undo)
  const redo = useLayerStore((s) => s.redo)
  const removeShapes = useLayerStore((s) => s.removeShapes)
  const copySelection = useLayerStore((s) => s.copySelection)
  const pasteClipboard = useLayerStore((s) => s.pasteClipboard)
  const duplicateSelection = useLayerStore((s) => s.duplicateSelection)
  const selectedIds = useLayerStore((s) => s.selectedIds)
  const setActiveTool = useToolStore((s) => s.setActiveTool)
  const activeTool = useToolStore((s) => s.activeTool)
  const loadDocument = useLayerStore((s) => s.loadDocument)
  const restored = useRef(false)

  useEffect(() => {
    if (restored.current) return
    restored.current = true
    const snapshot = loadAutoSnapshot()
    if (!snapshot) return
    const ageHours = (Date.now() - snapshot.savedAt) / 1000 / 60 / 60
    const when = ageHours < 1
      ? `${Math.round(ageHours * 60)} 分前`
      : `${Math.round(ageHours)} 時間前`
    const ok = confirm(
      `前回の自動保存（${when}）から ${snapshot.shapes.length} 図形を復元しますか？`,
    )
    if (ok && snapshot.layers.length > 0) {
      loadDocument(snapshot.layers, snapshot.shapes)
    }
  }, [loadDocument])

  useEffect(() => {
    const persist = debounce(() => {
      const { layers, shapes } = useLayerStore.getState()
      saveAutoSnapshot(layers, shapes)
    }, 1000)
    const unsub = useLayerStore.subscribe(persist)
    return unsub
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo() }
      if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo() }
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) { e.preventDefault(); copySelection() }
      if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) { e.preventDefault(); pasteClipboard() }
      if (e.ctrlKey && (e.key === 'd' || e.key === 'D')) { e.preventDefault(); duplicateSelection() }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) removeShapes(selectedIds)
      }
      if (e.key === 'Escape') setActiveTool('select')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, removeShapes, copySelection, pasteClipboard, duplicateSelection, selectedIds, setActiveTool])

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      <div className="no-print"><Toolbar /></div>
      <div className="flex flex-1 overflow-hidden">
        <div className="no-print"><ToolPanel /></div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <CanvasArea />
          {activeTool !== 'select' && (
            <div className="no-print shrink-0">
              <CommandBar key={activeTool} />
            </div>
          )}
        </div>
        <div className="flex flex-col w-60 border-l border-gray-700 flex-shrink-0 no-print">
          <ToolOptionsPanel />
          <TemplatePanel />
          <div className="flex-1 overflow-y-auto">
            <LayerPanel />
          </div>
          <div className="border-t border-gray-700 overflow-y-auto max-h-60">
            <PropertyPanel />
          </div>
        </div>
      </div>
      <div className="no-print"><StatusBar /></div>
    </div>
  )
}
