import type { LineStyle } from './geometry'

export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  color: string
  lineStyle: LineStyle
  lineWidth: number
  order: number
}

export const DEFAULT_LAYERS: Omit<Layer, 'id'>[] = [
  { name: '仮設構造物', visible: true, locked: false, color: '#FF6600', lineStyle: 'solid', lineWidth: 1, order: 0 },
  { name: '土工', visible: true, locked: false, color: '#8B4513', lineStyle: 'solid', lineWidth: 1, order: 1 },
  { name: '既存構造物', visible: true, locked: false, color: '#808080', lineStyle: 'dashdot', lineWidth: 1, order: 2 },
  { name: '寸法', visible: true, locked: false, color: '#0000FF', lineStyle: 'solid', lineWidth: 0.5, order: 3 },
  { name: '注記', visible: true, locked: false, color: '#000000', lineStyle: 'solid', lineWidth: 0.5, order: 4 },
]
