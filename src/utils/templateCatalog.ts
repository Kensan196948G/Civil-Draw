import type { Shape } from '../types/geometry'

// Distributive Omit — preserves the discriminated union so 'type' narrows correctly
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never
export type ShapeTemplate = DistributiveOmit<Shape, 'id' | 'layerId' | 'locked'>

export interface TemplateDef {
  id: string
  name: string
  category: '仮設' | '土工' | '舗装' | '測量'
  description: string
  shapes: ShapeTemplate[]
}

export const TEMPLATE_CATALOG: TemplateDef[] = [
  {
    id: 'construction-zone',
    name: '工事ゾーン',
    category: '仮設',
    description: 'コーン4個 + バリケード2本',
    shapes: [
      { type: 'symbol', symbolId: 'cone',    x: -100, y: -100, rotation: 0, scale: 1 },
      { type: 'symbol', symbolId: 'cone',    x:  100, y: -100, rotation: 0, scale: 1 },
      { type: 'symbol', symbolId: 'cone',    x: -100, y:  100, rotation: 0, scale: 1 },
      { type: 'symbol', symbolId: 'cone',    x:  100, y:  100, rotation: 0, scale: 1 },
      { type: 'symbol', symbolId: 'barrier', x:  -50, y:    0, rotation: 0, scale: 1 },
      { type: 'symbol', symbolId: 'barrier', x:   50, y:    0, rotation: 0, scale: 1 },
    ],
  },
  {
    id: 'earthwork-section',
    name: '土工断面',
    category: '土工',
    description: '地盤線 + 盛土断面',
    shapes: [
      { type: 'line', x1: -200, y1: 0, x2: 200, y2: 0 },
      {
        type: 'polyline',
        points: [-100, 0, -50, -60, 0, -80, 50, -60, 100, 0],
        closed: false,
      },
      {
        type: 'hatch',
        points: [-100, 0, -50, -60, 0, -80, 50, -60, 100, 0, 100, 0, -100, 0],
        pattern: 'earth',
        angle: 45,
        spacing: 15,
      },
      {
        type: 'dimension',
        x1: -100, y1: 0, x2: 100, y2: 0,
        orientation: 'horizontal', offset: 30, textHeight: 12, arrowSize: 8,
      },
    ],
  },
  {
    id: 'paving',
    name: '舗装断面',
    category: '舗装',
    description: 'As + 路盤 + 路床の3層断面',
    shapes: [
      { type: 'rect',   x: -100, y: -10, width: 200, height: 10, rotation: 0 },
      { type: 'hatch',  points: [-100, -10, 100, -10, 100, 0, -100, 0], pattern: 'asphalt', angle: 0, spacing: 5 },
      { type: 'rect',   x: -120, y:   0, width: 240, height: 20, rotation: 0 },
      { type: 'hatch',  points: [-120,  0, 120,  0, 120, 20, -120, 20], pattern: 'gravel',  angle: 0, spacing: 8 },
      { type: 'rect',   x: -140, y:  20, width: 280, height: 20, rotation: 0 },
      { type: 'hatch',  points: [-140, 20, 140, 20, 140, 40, -140, 40], pattern: 'earth',   angle: 45, spacing: 12 },
    ],
  },
  {
    id: 'survey-layout',
    name: '測量レイアウト',
    category: '測量',
    description: '基準点3点 + 距離寸法',
    shapes: [
      { type: 'symbol', symbolId: 'bm', x: -150, y: 0, rotation: 0, scale: 1 },
      { type: 'symbol', symbolId: 'bm', x:    0, y: 0, rotation: 0, scale: 1 },
      { type: 'symbol', symbolId: 'bm', x:  150, y: 0, rotation: 0, scale: 1 },
      {
        type: 'dimension',
        x1: -150, y1: 0, x2: 0, y2: 0,
        orientation: 'horizontal', offset: -30, textHeight: 12, arrowSize: 8,
      },
      {
        type: 'dimension',
        x1: 0, y1: 0, x2: 150, y2: 0,
        orientation: 'horizontal', offset: -30, textHeight: 12, arrowSize: 8,
      },
    ],
  },
]
