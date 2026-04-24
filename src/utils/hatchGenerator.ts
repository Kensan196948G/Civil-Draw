import type { HatchPattern } from '../types/geometry'

export interface BBox {
  minX: number; minY: number; maxX: number; maxY: number
}

export function polygonBBox(points: number[]): BBox {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (let i = 0; i < points.length; i += 2) {
    const x = points[i], y = points[i + 1]
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return { minX, minY, maxX, maxY }
}

export function pointInPolygon(x: number, y: number, poly: number[]): boolean {
  let inside = false
  const n = poly.length / 2
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poly[i * 2], yi = poly[i * 2 + 1]
    const xj = poly[j * 2], yj = poly[j * 2 + 1]
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export interface HatchLine {
  x1: number; y1: number; x2: number; y2: number
}

function clipSegmentToPolygon(
  x1: number, y1: number, x2: number, y2: number,
  poly: number[],
  steps = 50,
): HatchLine[] {
  const out: HatchLine[] = []
  let inSeg = false
  let segStartX = 0, segStartY = 0
  let lastX = x1, lastY = y1
  let lastInside = pointInPolygon(x1, y1, poly)
  if (lastInside) { inSeg = true; segStartX = x1; segStartY = y1 }

  for (let s = 1; s <= steps; s++) {
    const t = s / steps
    const x = x1 + (x2 - x1) * t
    const y = y1 + (y2 - y1) * t
    const inside = pointInPolygon(x, y, poly)
    if (inside && !inSeg) {
      inSeg = true
      segStartX = lastX
      segStartY = lastY
    } else if (!inside && inSeg) {
      out.push({ x1: segStartX, y1: segStartY, x2: x, y2: y })
      inSeg = false
    }
    lastX = x; lastY = y; lastInside = inside
  }
  if (inSeg) out.push({ x1: segStartX, y1: segStartY, x2: lastX, y2: lastY })
  return out
}

export function generateHatchLines(
  points: number[],
  pattern: HatchPattern,
  angle: number,
  spacing: number,
): HatchLine[] {
  const bbox = polygonBBox(points)
  const diag = Math.hypot(bbox.maxX - bbox.minX, bbox.maxY - bbox.minY)
  const cx = (bbox.minX + bbox.maxX) / 2
  const cy = (bbox.minY + bbox.maxY) / 2

  const makeLines = (a: number): HatchLine[] => {
    const cos = Math.cos(a)
    const sin = Math.sin(a)
    const half = diag
    const lines: HatchLine[] = []
    const n = Math.ceil(diag / spacing) + 1
    for (let i = -n; i <= n; i++) {
      const offset = i * spacing
      // Line center offset perpendicular to line direction
      const px = cx - sin * offset
      const py = cy + cos * offset
      const x1 = px - cos * half
      const y1 = py - sin * half
      const x2 = px + cos * half
      const y2 = py + sin * half
      const clipped = clipSegmentToPolygon(x1, y1, x2, y2, points)
      lines.push(...clipped)
    }
    return lines
  }

  const rad = (angle * Math.PI) / 180

  switch (pattern) {
    case 'parallel':
      return makeLines(rad)
    case 'cross':
      return [...makeLines(rad), ...makeLines(rad + Math.PI / 2)]
    case 'earth':
      return [...makeLines(Math.PI / 4), ...makeLines((Math.PI * 3) / 4)]
    case 'gravel':
      return makeLines(rad)
    // Fixed-angle patterns — independent of user's angle slider
    case 'concrete':
      // 0°+90° rectangular grid (JIS concrete)
      return [...makeLines(0), ...makeLines(Math.PI / 2)]
    case 'rock':
      // 0°+60°+120° triangular mesh (rock/granite)
      return [...makeLines(0), ...makeLines(Math.PI / 3), ...makeLines((2 * Math.PI) / 3)]
    case 'asphalt':
      // 30°+150° diamond (steeper than earth)
      return [...makeLines(Math.PI / 6), ...makeLines((5 * Math.PI) / 6)]
    case 'wood':
      // Fixed horizontal lines (0°)
      return makeLines(0)
    case 'steel':
      // 45°+90° diagonal+vertical (steel cross-section)
      return [...makeLines(Math.PI / 4), ...makeLines(Math.PI / 2)]
    case 'water':
      // 0°+10° near-horizontal double lines (wave effect)
      return [...makeLines(0), ...makeLines(Math.PI / 18)]
  }
}
