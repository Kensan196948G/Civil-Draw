export interface SymbolPath {
  type: 'line' | 'circle' | 'polyline'
  data: number[]
  closed?: boolean
  fill?: boolean
}

export interface SymbolDef {
  id: string
  name: string
  category: '仮設' | '土工' | '測量' | '車両' | '構造物'
  size: number
  paths: SymbolPath[]
}

export const SYMBOL_CATALOG: SymbolDef[] = [
  {
    id: 'cone',
    name: 'カラーコーン',
    category: '仮設',
    size: 30,
    paths: [
      { type: 'polyline', data: [0, -15, -10, 15, 10, 15, 0, -15], closed: true, fill: true },
      { type: 'line', data: [-8, 8, 8, 8] },
      { type: 'line', data: [-6, -2, 6, -2] },
    ],
  },
  {
    id: 'fence',
    name: '仮囲い (単管バリケード)',
    category: '仮設',
    size: 40,
    paths: [
      { type: 'polyline', data: [-20, 10, 20, 10, 20, -10, -20, -10], closed: true },
      { type: 'line', data: [-20, 0, 20, 0] },
      { type: 'line', data: [-15, 10, -15, -10] },
      { type: 'line', data: [0, 10, 0, -10] },
      { type: 'line', data: [15, 10, 15, -10] },
    ],
  },
  {
    id: 'excavator',
    name: 'バックホウ (平面)',
    category: '車両',
    size: 80,
    paths: [
      { type: 'polyline', data: [-30, -20, 30, -20, 30, 20, -30, 20], closed: true },
      { type: 'circle', data: [15, 0, 12] },
      { type: 'polyline', data: [15, 0, 40, -5, 55, 8], closed: false },
      { type: 'line', data: [-30, -25, 30, -25] },
      { type: 'line', data: [-30, 25, 30, 25] },
    ],
  },
  {
    id: 'truck',
    name: 'ダンプトラック (平面)',
    category: '車両',
    size: 80,
    paths: [
      { type: 'polyline', data: [-30, -15, 30, -15, 30, 15, -30, 15], closed: true },
      { type: 'polyline', data: [-28, -12, -5, -12, -5, 12, -28, 12], closed: true },
      { type: 'line', data: [-30, -18, 30, -18] },
      { type: 'line', data: [-30, 18, 30, 18] },
    ],
  },
  {
    id: 'survey-peg',
    name: '測量杭',
    category: '測量',
    size: 15,
    paths: [
      { type: 'polyline', data: [-5, -5, 5, -5, 5, 5, -5, 5], closed: true, fill: true },
      { type: 'line', data: [-8, 0, 8, 0] },
      { type: 'line', data: [0, -8, 0, 8] },
    ],
  },
  {
    id: 'bm',
    name: '基準点 (BM)',
    category: '測量',
    size: 20,
    paths: [
      { type: 'circle', data: [0, 0, 8] },
      { type: 'circle', data: [0, 0, 3] },
      { type: 'line', data: [-10, 0, -4, 0] },
      { type: 'line', data: [4, 0, 10, 0] },
      { type: 'line', data: [0, -10, 0, -4] },
      { type: 'line', data: [0, 4, 0, 10] },
    ],
  },
  {
    id: 'signal',
    name: '信号機',
    category: '仮設',
    size: 25,
    paths: [
      { type: 'polyline', data: [-6, -10, 6, -10, 6, 10, -6, 10], closed: true },
      { type: 'circle', data: [0, -6, 3] },
      { type: 'circle', data: [0, 0, 3] },
      { type: 'circle', data: [0, 6, 3] },
    ],
  },
  {
    id: 'spoil-pile',
    name: '土砂山',
    category: '土工',
    size: 40,
    paths: [
      { type: 'polyline', data: [-20, 15, 20, 15, 0, -15], closed: true, fill: true },
      { type: 'line', data: [-15, 10, -5, 0] },
      { type: 'line', data: [5, 0, 15, 10] },
    ],
  },
  // ── 仮設 (追加) ──────────────────────────────
  {
    id: 'road-sign',
    name: '警戒標識',
    category: '仮設',
    size: 25,
    paths: [
      { type: 'polyline', data: [0, -15, 12, 0, 0, 15, -12, 0], closed: true },
      { type: 'polyline', data: [0, -9, 8, 0, 0, 9, -8, 0], closed: true },
    ],
  },
  {
    id: 'barrier',
    name: '工事用バリア',
    category: '仮設',
    size: 35,
    paths: [
      { type: 'polyline', data: [-15, 12, 15, 12, 12, -5, -12, -5], closed: true },
      { type: 'polyline', data: [-8, -5, 8, -5, 6, -13, -6, -13], closed: true },
    ],
  },
  {
    id: 'delineator',
    name: '視線誘導標',
    category: '仮設',
    size: 20,
    paths: [
      { type: 'line', data: [0, 14, 0, -14] },
      { type: 'polyline', data: [-4, -14, 4, -14, 4, -7, -4, -7], closed: true, fill: true },
      { type: 'line', data: [-6, 14, 6, 14] },
    ],
  },
  {
    id: 'water-barrier',
    name: '仮締切',
    category: '仮設',
    size: 30,
    paths: [
      { type: 'polyline', data: [-12, -10, 12, -10, 12, 10, -12, 10], closed: true },
      { type: 'line', data: [-12, 0, 12, 0] },
      { type: 'line', data: [-6, -10, -6, 10] },
      { type: 'line', data: [6, -10, 6, 10] },
    ],
  },
  {
    id: 'site-office',
    name: '現場事務所',
    category: '仮設',
    size: 40,
    paths: [
      { type: 'polyline', data: [-18, 10, 18, 10, 18, -8, -18, -8], closed: true },
      { type: 'polyline', data: [-20, -8, 0, -22, 20, -8], closed: false },
      { type: 'polyline', data: [5, -8, 5, 8, 14, 8, 14, -8], closed: true },
    ],
  },
  // ── 車両 (追加) ──────────────────────────────
  {
    id: 'bulldozer',
    name: 'ブルドーザー (平面)',
    category: '車両',
    size: 70,
    paths: [
      { type: 'polyline', data: [-25, -12, 25, -12, 25, 12, -25, 12], closed: true },
      { type: 'line', data: [-28, -16, 28, -16] },
      { type: 'line', data: [-28, 16, 28, 16] },
      { type: 'polyline', data: [25, -14, 38, -8, 38, 8, 25, 14], closed: true },
    ],
  },
  {
    id: 'roller',
    name: 'ロードローラー (平面)',
    category: '車両',
    size: 65,
    paths: [
      { type: 'polyline', data: [-15, -8, 15, -8, 15, 8, -15, 8], closed: true },
      { type: 'circle', data: [-24, 0, 11] },
      { type: 'circle', data: [24, 0, 11] },
    ],
  },
  {
    id: 'crane',
    name: 'クレーン車 (平面)',
    category: '車両',
    size: 90,
    paths: [
      { type: 'polyline', data: [-35, -10, 35, -10, 35, 10, -35, 10], closed: true },
      { type: 'line', data: [-38, -13, 38, -13] },
      { type: 'line', data: [-38, 13, 38, 13] },
      { type: 'polyline', data: [0, -10, 0, -42, 30, -47], closed: false },
      { type: 'line', data: [30, -47, 30, -10] },
    ],
  },
  {
    id: 'grader',
    name: 'モーターグレーダー (平面)',
    category: '車両',
    size: 80,
    paths: [
      { type: 'polyline', data: [-35, -10, 35, -10, 35, 10, -35, 10], closed: true },
      { type: 'line', data: [-38, -13, 38, -13] },
      { type: 'line', data: [-38, 13, 38, 13] },
      { type: 'polyline', data: [20, -10, 35, -10, 35, 5, 20, 5], closed: true, fill: true },
      { type: 'line', data: [-20, -13, 10, 13] },
    ],
  },
  // ── 測量 (追加) ──────────────────────────────
  {
    id: 'level-point',
    name: '水準点',
    category: '測量',
    size: 22,
    paths: [
      { type: 'polyline', data: [0, -15, 13, 10, -13, 10], closed: true, fill: true },
      { type: 'line', data: [-13, 10, 13, 10] },
    ],
  },
  {
    id: 'alignment-stake',
    name: '中心杭',
    category: '測量',
    size: 22,
    paths: [
      { type: 'line', data: [-12, 0, 12, 0] },
      { type: 'line', data: [0, -12, 0, 12] },
      { type: 'polyline', data: [-4, -7, 0, -13, 4, -7], closed: true, fill: true },
    ],
  },
  {
    id: 'slope-stake',
    name: '法肩杭',
    category: '測量',
    size: 18,
    paths: [
      { type: 'polyline', data: [-7, -7, 7, -7, 7, 7, -7, 7], closed: true },
      { type: 'line', data: [-7, -7, 7, 7] },
      { type: 'line', data: [7, -7, -7, 7] },
    ],
  },
  {
    id: 'control-point',
    name: '三角点',
    category: '測量',
    size: 22,
    paths: [
      { type: 'polyline', data: [0, -14, 12, 8, -12, 8], closed: true },
      { type: 'circle', data: [0, 0, 3], fill: true },
    ],
  },
  // ── 土工 (追加) ──────────────────────────────
  {
    id: 'cut-slope',
    name: '切土法面',
    category: '土工',
    size: 30,
    paths: [
      { type: 'line', data: [-14, 0, 14, 0] },
      { type: 'line', data: [0, -14, 0, 0] },
      { type: 'polyline', data: [-5, -9, 0, -14, 5, -9], closed: true, fill: true },
    ],
  },
  {
    id: 'fill-slope',
    name: '盛土法面',
    category: '土工',
    size: 30,
    paths: [
      { type: 'polyline', data: [-14, 8, 0, -14, 14, 8], closed: true, fill: true },
      { type: 'line', data: [-14, 8, 14, 8] },
    ],
  },
  {
    id: 'earthflow',
    name: '土工流れ矢印',
    category: '土工',
    size: 25,
    paths: [
      { type: 'line', data: [-14, 0, 8, 0] },
      { type: 'polyline', data: [8, -5, 15, 0, 8, 5], closed: true, fill: true },
    ],
  },
  {
    id: 'soil-nail',
    name: 'グラウンドアンカー',
    category: '土工',
    size: 30,
    paths: [
      { type: 'line', data: [-14, 0, 8, 0] },
      { type: 'polyline', data: [8, -4, 14, 0, 8, 4], closed: true, fill: true },
      { type: 'polyline', data: [-14, -6, -14, 6, -20, 6, -20, -6], closed: true },
    ],
  },
  // ── 構造物 (新カテゴリ) ──────────────────────
  {
    id: 'retaining-wall',
    name: '擁壁 (断面)',
    category: '構造物',
    size: 30,
    paths: [
      {
        type: 'polyline',
        data: [-5, -15, 0, -15, 0, 8, 12, 8, 12, 15, -10, 15, -10, 8, -5, 8],
        closed: true,
        fill: true,
      },
    ],
  },
  {
    id: 'manhole',
    name: 'マンホール',
    category: '構造物',
    size: 22,
    paths: [
      { type: 'circle', data: [0, 0, 11] },
      { type: 'circle', data: [0, 0, 7] },
      { type: 'line', data: [-11, 0, 11, 0] },
      { type: 'line', data: [0, -11, 0, 11] },
    ],
  },
  {
    id: 'culvert',
    name: '暗渠 (BOXカルバート)',
    category: '構造物',
    size: 30,
    paths: [
      { type: 'polyline', data: [-12, -10, 12, -10, 12, 10, -12, 10], closed: true },
      { type: 'polyline', data: [-9, -7, 9, -7, 9, 7, -9, 7], closed: true },
      { type: 'line', data: [-15, 0, -12, 0] },
      { type: 'line', data: [12, 0, 15, 0] },
    ],
  },
  {
    id: 'drainage-pit',
    name: '集水桝',
    category: '構造物',
    size: 25,
    paths: [
      { type: 'polyline', data: [-10, -10, 10, -10, 10, 10, -10, 10], closed: true },
      { type: 'circle', data: [0, 0, 5] },
      { type: 'line', data: [-3, -3, 3, 3] },
      { type: 'line', data: [-3, 3, 3, -3] },
    ],
  },
  {
    id: 'pipe',
    name: '管路',
    category: '構造物',
    size: 20,
    paths: [
      { type: 'circle', data: [0, 0, 8] },
      { type: 'circle', data: [0, 0, 5] },
      { type: 'line', data: [-8, 0, 8, 0] },
    ],
  },
]

export function getSymbolById(id: string): SymbolDef | undefined {
  return SYMBOL_CATALOG.find((s) => s.id === id)
}

export function getCategories(): SymbolDef['category'][] {
  return Array.from(new Set(SYMBOL_CATALOG.map((s) => s.category)))
}
