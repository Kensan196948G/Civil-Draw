export interface SymbolPath {
  type: 'line' | 'circle' | 'polyline'
  data: number[]
  closed?: boolean
  fill?: boolean
}

export interface SymbolDef {
  id: string
  name: string
  category: '仮設' | '土工' | '測量' | '車両'
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
]

export function getSymbolById(id: string): SymbolDef | undefined {
  return SYMBOL_CATALOG.find((s) => s.id === id)
}

export function getCategories(): SymbolDef['category'][] {
  return Array.from(new Set(SYMBOL_CATALOG.map((s) => s.category)))
}
