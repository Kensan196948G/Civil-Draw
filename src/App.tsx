import { useEffect } from 'react'
import { Toolbar } from './components/Toolbar/Toolbar'
import { ToolPanel } from './components/ToolPanel/ToolPanel'
import { CanvasArea } from './components/Canvas/CanvasArea'
import { LayerPanel } from './components/LayerPanel/LayerPanel'
import { PropertyPanel } from './components/PropertyPanel/PropertyPanel'
import { StatusBar } from './components/StatusBar'
import { useLayerStore } from './store/layerStore'
import { useToolStore } from './store/toolStore'

export default function App() {
  const undo = useLayerStore((s) => s.undo)
  const redo = useLayerStore((s) => s.redo)
  const removeShapes = useLayerStore((s) => s.removeShapes)
  const selectedIds = useLayerStore((s) => s.selectedIds)
  const setActiveTool = useToolStore((s) => s.setActiveTool)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo() }
      if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo() }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) removeShapes(selectedIds)
      }
      if (e.key === 'Escape') setActiveTool('select')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, removeShapes, selectedIds, setActiveTool])

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <ToolPanel />
        <CanvasArea />
        <div className="flex flex-col w-60 border-l border-gray-700 flex-shrink-0">
          <div className="flex-1 overflow-y-auto">
            <LayerPanel />
          </div>
          <div className="border-t border-gray-700 overflow-y-auto max-h-60">
            <PropertyPanel />
          </div>
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
