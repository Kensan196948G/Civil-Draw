import { useCallback, useState } from 'react'
import { useLayerStore } from '../store/layerStore'
import { generatePerfShapes, generatePerfLayers } from '../utils/perfHarness'

const COUNTS = [1000, 5000, 10000] as const

export function BenchmarkPanel() {
  const [open, setOpen] = useState(false)
  const [lastLoad, setLastLoad] = useState<{ count: number; ms: number } | null>(null)
  const loadDocument = useLayerStore((s) => s.loadDocument)
  const shapeCount = useLayerStore((s) => s.shapes.length)

  const runLoad = useCallback(
    (count: number) => {
      const layers = generatePerfLayers()
      const start = performance.now()
      const shapes = generatePerfShapes({
        count,
        layerId: layers[0].id,
        area: { width: 5000, height: 5000 },
        seed: 42,
      })
      loadDocument(layers, shapes)
      const ms = performance.now() - start
      setLastLoad({ count, ms })
      console.log(`[Benchmark] Generated ${count} shapes in ${ms.toFixed(1)}ms`)
    },
    [loadDocument],
  )

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="パフォーマンスベンチマーク"
        className="px-2 py-1 bg-amber-700 hover:bg-amber-600 rounded text-xs"
      >
        ⚡ Bench
      </button>
    )
  }

  return (
    <div className="fixed bottom-8 right-4 bg-gray-800 border border-amber-600 rounded-lg p-3 shadow-xl z-40 text-xs text-gray-200 w-64">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-amber-300">⚡ Benchmark Panel</span>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">×</button>
      </div>
      <p className="text-gray-400 mb-2">現在: {shapeCount} 図形</p>
      <div className="flex gap-1 mb-2">
        {COUNTS.map((c) => (
          <button
            key={c}
            onClick={() => runLoad(c)}
            className="flex-1 px-1 py-1 bg-amber-900 hover:bg-amber-700 rounded"
          >
            {c >= 1000 ? `${c / 1000}K` : c}
          </button>
        ))}
      </div>
      {lastLoad && (
        <p className="text-gray-400">
          生成: {lastLoad.count} → {lastLoad.ms.toFixed(1)}ms
        </p>
      )}
      <p className="text-gray-500 mt-2 text-[10px]">
        マウスホイールでズーム、Space+ドラッグでパン。FPS をステータスバーで確認。
      </p>
    </div>
  )
}
