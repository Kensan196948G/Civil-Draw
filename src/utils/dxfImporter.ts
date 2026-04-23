import DxfParser from 'dxf-parser'
import { nanoid } from 'nanoid'
import type { Shape, LineStyle } from '../types/geometry'
import type { Layer } from '../types/layer'

interface DxfEntity {
  type: string
  layer?: string
  vertices?: { x: number; y: number }[]
  startPoint?: { x: number; y: number }
  endPoint?: { x: number; y: number }
  center?: { x: number; y: number; z?: number }
  radius?: number
  position?: { x: number; y: number }
  text?: string
  textHeight?: number
  rotation?: number
  shape?: boolean
}

interface DxfDocument {
  entities?: DxfEntity[]
  tables?: {
    layer?: { layers?: Record<string, { name: string; color?: number }> }
  }
}

function aciToHex(aci: number): string {
  const map: Record<number, string> = {
    1: '#ff0000', 2: '#ffff00', 3: '#00ff00', 4: '#00ffff',
    5: '#0000ff', 6: '#ff00ff', 7: '#000000',
  }
  return map[aci] ?? '#000000'
}

export interface ImportResult {
  layers: Layer[]
  shapes: Shape[]
  warnings: string[]
}

export function importDxf(content: string): ImportResult {
  const parser = new DxfParser()
  const dxf = parser.parseSync(content) as DxfDocument | null
  const warnings: string[] = []

  if (!dxf) {
    throw new Error('DXF のパースに失敗しました')
  }

  const layerMap = new Map<string, Layer>()
  const dxfLayers = dxf.tables?.layer?.layers ?? {}
  let order = 0
  for (const name of Object.keys(dxfLayers)) {
    const src = dxfLayers[name]
    const layer: Layer = {
      id: nanoid(),
      name: src.name ?? name,
      visible: true,
      locked: false,
      color: aciToHex(src.color ?? 7),
      lineStyle: 'solid' as LineStyle,
      lineWidth: 1,
      order: order++,
    }
    layerMap.set(name, layer)
  }

  if (layerMap.size === 0) {
    const fallback: Layer = {
      id: nanoid(), name: '0', visible: true, locked: false,
      color: '#000000', lineStyle: 'solid', lineWidth: 1, order: 0,
    }
    layerMap.set('0', fallback)
  }

  const shapes: Shape[] = []
  const entities = dxf.entities ?? []

  for (const ent of entities) {
    const layerName = ent.layer ?? '0'
    const targetLayer = layerMap.get(layerName) ?? [...layerMap.values()][0]
    const layerId = targetLayer.id

    switch (ent.type) {
      case 'LINE': {
        // dxf-parser surfaces LINE as a `vertices` array of 2 points
        const v = ent.vertices
        if (v && v.length >= 2) {
          shapes.push({
            id: nanoid(), type: 'line', layerId, locked: false,
            x1: v[0].x, y1: v[0].y,
            x2: v[1].x, y2: v[1].y,
          })
        } else if (ent.startPoint && ent.endPoint) {
          shapes.push({
            id: nanoid(), type: 'line', layerId, locked: false,
            x1: ent.startPoint.x, y1: ent.startPoint.y,
            x2: ent.endPoint.x, y2: ent.endPoint.y,
          })
        }
        break
      }
      case 'CIRCLE': {
        if (!ent.center || ent.radius == null) continue
        shapes.push({
          id: nanoid(), type: 'circle', layerId, locked: false,
          cx: ent.center.x, cy: ent.center.y, radius: ent.radius,
        })
        break
      }
      case 'POLYLINE':
      case 'LWPOLYLINE': {
        const vertices = ent.vertices ?? []
        if (vertices.length < 2) continue
        const points: number[] = []
        for (const v of vertices) {
          points.push(v.x, v.y)
        }
        shapes.push({
          id: nanoid(), type: 'polyline', layerId, locked: false,
          points, closed: Boolean(ent.shape),
        })
        break
      }
      case 'TEXT':
      case 'MTEXT': {
        if (!ent.position) continue
        shapes.push({
          id: nanoid(), type: 'text', layerId, locked: false,
          x: ent.position.x, y: ent.position.y,
          text: ent.text ?? '',
          fontSize: ent.textHeight ?? 14,
          rotation: ent.rotation ?? 0,
        })
        break
      }
      default:
        warnings.push(`サポート外エンティティ: ${ent.type}`)
    }
  }

  return {
    layers: [...layerMap.values()],
    shapes,
    warnings,
  }
}
