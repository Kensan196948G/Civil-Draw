import { useState } from 'react'
import { useLayerStore } from '../../store/layerStore'
import { useCanvasStore } from '../../store/canvasStore'
import { TEMPLATE_CATALOG, type TemplateDef } from '../../utils/templateCatalog'

const CATEGORIES = ['仮設', '土工', '舗装', '測量'] as const

export function TemplatePanel() {
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('仮設')
  const insertTemplate = useLayerStore((s) => s.insertTemplate)
  const cursorX = useCanvasStore((s) => s.cursorX)
  const cursorY = useCanvasStore((s) => s.cursorY)

  const filtered = TEMPLATE_CATALOG.filter((t) => t.category === activeCategory)

  function handleInsert(def: TemplateDef) {
    insertTemplate(def.id, cursorX, cursorY)
  }

  return (
    <div className="border-t border-gray-700">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700"
      >
        <span>テンプレート</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="bg-gray-800 text-xs text-gray-200">
          <div className="flex border-b border-gray-700">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 py-1 text-center transition-colors ${
                  activeCategory === cat
                    ? 'bg-teal-700 text-white'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-1 p-1.5 max-h-40 overflow-y-auto">
            {filtered.map((def) => (
              <button
                key={def.id}
                onClick={() => handleInsert(def)}
                className="w-full text-left px-2 py-1 rounded hover:bg-teal-700 transition-colors"
                title={def.description}
              >
                <p className="font-medium">{def.name}</p>
                <p className="text-gray-400 truncate">{def.description}</p>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-gray-500 px-2 py-1">テンプレートなし</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
