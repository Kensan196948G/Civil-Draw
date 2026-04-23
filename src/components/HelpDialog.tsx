import { useState, useEffect } from 'react'

const SHORTCUTS = [
  { key: 'Ctrl + Z', desc: '元に戻す' },
  { key: 'Ctrl + Y', desc: 'やり直し' },
  { key: 'Ctrl + C', desc: '選択図形をコピー' },
  { key: 'Ctrl + V', desc: 'クリップボードから貼り付け' },
  { key: 'Ctrl + D', desc: 'その場で複製' },
  { key: 'Delete / Backspace', desc: '選択図形を削除' },
  { key: 'Escape', desc: '描画キャンセル / 選択ツールに戻る' },
  { key: 'Enter', desc: 'ポリライン / ハッチ確定' },
  { key: 'ダブルクリック', desc: 'ポリライン / ハッチ確定' },
  { key: 'Space + ドラッグ', desc: 'キャンバスをパン' },
  { key: 'マウスホイール', desc: 'ズームイン / アウト' },
  { key: '中ボタンドラッグ', desc: 'キャンバスをパン' },
  { key: 'Shift + クリック', desc: '選択追加' },
  { key: 'F1 / ?', desc: 'このヘルプを表示' },
]

const TOOL_GUIDE = [
  { tool: '選択', step: '空白をドラッグして矩形選択、図形をクリックで単体選択、ドラッグで移動' },
  { tool: '線分', step: '始点をクリック → 終点をクリック' },
  { tool: '矩形', step: '一方の角をクリック → 対角をクリック' },
  { tool: '円', step: '中心をクリック → 半径点をクリック' },
  { tool: 'ポリライン', step: '頂点を連続クリック → ダブルクリックで確定' },
  { tool: 'テキスト', step: '位置をクリック → ダイアログに文字入力' },
  { tool: '寸法線', step: '始点をクリック → 終点をクリック (距離を自動計算)' },
  { tool: 'ハッチング', step: '頂点を連続クリックして多角形を定義 → ダブルクリックで確定' },
  { tool: 'シンボル', step: '右パネルでシンボルを選択 → 配置位置をクリック' },
]

export function HelpDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'F1' || e.key === '?') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="ヘルプ (F1)"
        className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded"
      >
        ?
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h2 className="text-lg font-semibold">CivilDraw 操作ガイド</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-4 text-sm text-gray-200">
              <section className="mb-4">
                <h3 className="font-semibold mb-2 text-blue-300">キーボードショートカット</h3>
                <table className="w-full text-left">
                  <tbody>
                    {SHORTCUTS.map((s) => (
                      <tr key={s.key} className="border-b border-gray-700">
                        <td className="py-1 pr-4 font-mono text-xs text-yellow-200 w-48">{s.key}</td>
                        <td className="py-1">{s.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <section>
                <h3 className="font-semibold mb-2 text-blue-300">ツール操作ガイド</h3>
                <table className="w-full text-left">
                  <tbody>
                    {TOOL_GUIDE.map((g) => (
                      <tr key={g.tool} className="border-b border-gray-700">
                        <td className="py-1 pr-4 font-semibold text-green-300 w-24">{g.tool}</td>
                        <td className="py-1">{g.step}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <p className="mt-4 text-gray-500 text-xs">F1 / ? キーでいつでもこのヘルプを再表示できます。</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
