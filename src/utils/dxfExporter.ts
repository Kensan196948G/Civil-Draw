import Drawing from 'dxf-writer'
import type { Shape } from '../types/geometry'
import type { Layer } from '../types/layer'

function hexToAci(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const colors: [number, number, number, number][] = [
    [1, 255, 0, 0],
    [2, 255, 255, 0],
    [3, 0, 255, 0],
    [4, 0, 255, 255],
    [5, 0, 0, 255],
    [6, 255, 0, 255],
    [7, 255, 255, 255],
  ]
  let best = 0
  let bestDist = Infinity
  for (const [aci, cr, cg, cb] of colors) {
    const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2
    if (d < bestDist) { bestDist = d; best = aci }
  }
  return best
}

function lineStyleToDxf(style: string): string {
  switch (style) {
    case 'dashed': return 'DASHED'
    case 'dashdot': return 'DASHDOT'
    default: return 'CONTINUOUS'
  }
}

export function exportDxf(layers: Layer[], shapes: Shape[]): string {
  const d = new Drawing()
  d.setUnits('Meters')

  for (const layer of layers) {
    d.addLayer(layer.name, hexToAci(layer.color), lineStyleToDxf(layer.lineStyle))
  }

  for (const shape of shapes) {
    const layer = layers.find((l) => l.id === shape.layerId)
    const layerName = layer?.name ?? '0'
    d.setActiveLayer(layerName)

    switch (shape.type) {
      case 'line':
        d.drawLine(shape.x1, shape.y1, shape.x2, shape.y2)
        break
      case 'rect':
        d.drawRect(shape.x, shape.y, shape.x + shape.width, shape.y + shape.height)
        break
      case 'circle':
        d.drawCircle(shape.cx, shape.cy, shape.radius)
        break
      case 'polyline': {
        const pts: [number, number][] = []
        for (let i = 0; i < shape.points.length - 1; i += 2) {
          pts.push([shape.points[i], shape.points[i + 1]])
        }
        d.drawPolyline(pts, shape.closed)
        break
      }
      case 'text':
        d.drawText(shape.x, shape.y, shape.fontSize * 0.001, shape.rotation, shape.text)
        break
      case 'dimension': {
        const { x1, y1, x2, y2, offset, orientation, textHeight } = shape
        if (orientation === 'horizontal') {
          const ly = Math.min(y1, y2) - offset
          d.drawLine(x1, ly, x2, ly)
          d.drawLine(x1, y1, x1, ly)
          d.drawLine(x2, y2, x2, ly)
          d.drawText((x1 + x2) / 2, ly - textHeight, textHeight * 0.001, 0, Math.abs(x2 - x1).toFixed(2))
        } else if (orientation === 'vertical') {
          const lx = Math.min(x1, x2) - offset
          d.drawLine(lx, y1, lx, y2)
          d.drawLine(x1, y1, lx, y1)
          d.drawLine(x2, y2, lx, y2)
          d.drawText(lx - textHeight, (y1 + y2) / 2, textHeight * 0.001, 90, Math.abs(y2 - y1).toFixed(2))
        } else {
          d.drawLine(x1, y1, x2, y2)
          const len = Math.hypot(x2 - x1, y2 - y1)
          d.drawText((x1 + x2) / 2, (y1 + y2) / 2, textHeight * 0.001, 0, len.toFixed(2))
        }
        break
      }
    }
  }

  return d.toDxfString()
}

export function downloadDxf(layers: Layer[], shapes: Shape[], filename = 'drawing.dxf'): void {
  const content = exportDxf(layers, shapes)
  const blob = new Blob([content], { type: 'application/dxf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export interface CivilDocument {
  version: string
  layers: Layer[]
  shapes: Shape[]
}

export function exportJson(layers: Layer[], shapes: Shape[]): string {
  const doc: CivilDocument = { version: '1.0', layers, shapes }
  return JSON.stringify(doc, null, 2)
}

export function downloadJson(layers: Layer[], shapes: Shape[], filename = 'drawing.civil'): void {
  const content = exportJson(layers, shapes)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function parseJson(json: string): CivilDocument {
  return JSON.parse(json) as CivilDocument
}
