import type { Shape } from '../types/geometry'

export type TransformOp = 'rotateCW' | 'rotateCCW' | 'mirrorH' | 'mirrorV'

// canvas coords: Y-down, so visual CW is: (dx,dy) → (-dy, dx)
function applyPoint(x: number, y: number, cx: number, cy: number, op: TransformOp): [number, number] {
  const dx = x - cx
  const dy = y - cy
  switch (op) {
    case 'rotateCW':  return [cx - dy, cy + dx]
    case 'rotateCCW': return [cx + dy, cy - dx]
    case 'mirrorH':   return [cx - dx, cy + dy]
    case 'mirrorV':   return [cx + dx, cy - dy]
  }
}

function applyAngle(angle: number, op: TransformOp): number {
  switch (op) {
    case 'rotateCW':  return angle + 90
    case 'rotateCCW': return angle - 90
    case 'mirrorH':   return -angle
    case 'mirrorV':   return 180 - angle
  }
}

function applyPoints(pts: number[], cx: number, cy: number, op: TransformOp): number[] {
  const out: number[] = []
  for (let i = 0; i + 1 < pts.length; i += 2) {
    const [nx, ny] = applyPoint(pts[i], pts[i + 1], cx, cy, op)
    out.push(nx, ny)
  }
  return out
}

function shapeKeyPoints(s: Shape): number[] {
  switch (s.type) {
    case 'line':
    case 'dimension': return [s.x1, s.y1, s.x2, s.y2]
    case 'rect':      return [s.x, s.y, s.x + s.width, s.y + s.height]
    case 'circle':    return [s.cx - s.radius, s.cy, s.cx + s.radius, s.cy, s.cx, s.cy - s.radius, s.cx, s.cy + s.radius]
    case 'polyline':
    case 'hatch':     return [...s.points]
    case 'text':
    case 'symbol':    return [s.x, s.y]
  }
}

export function computeCentroid(shapes: Shape[]): { cx: number; cy: number } {
  const pts = shapes.flatMap(shapeKeyPoints)
  if (pts.length < 2) return { cx: 0, cy: 0 }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (let i = 0; i + 1 < pts.length; i += 2) {
    if (pts[i] < minX) minX = pts[i]
    if (pts[i] > maxX) maxX = pts[i]
    if (pts[i + 1] < minY) minY = pts[i + 1]
    if (pts[i + 1] > maxY) maxY = pts[i + 1]
  }
  return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 }
}

export function transformShape(s: Shape, cx: number, cy: number, op: TransformOp): Shape {
  switch (s.type) {
    case 'line': {
      const [x1, y1] = applyPoint(s.x1, s.y1, cx, cy, op)
      const [x2, y2] = applyPoint(s.x2, s.y2, cx, cy, op)
      return { ...s, x1, y1, x2, y2 }
    }
    case 'rect': {
      const rcx = s.x + s.width / 2
      const rcy = s.y + s.height / 2
      const [ncx, ncy] = applyPoint(rcx, rcy, cx, cy, op)
      const isRotate = op === 'rotateCW' || op === 'rotateCCW'
      const nw = isRotate ? s.height : s.width
      const nh = isRotate ? s.width : s.height
      return { ...s, x: ncx - nw / 2, y: ncy - nh / 2, width: nw, height: nh, rotation: applyAngle(s.rotation, op) }
    }
    case 'circle': {
      const [ncx, ncy] = applyPoint(s.cx, s.cy, cx, cy, op)
      return { ...s, cx: ncx, cy: ncy }
    }
    case 'polyline': {
      return { ...s, points: applyPoints(s.points, cx, cy, op) }
    }
    case 'hatch': {
      return { ...s, points: applyPoints(s.points, cx, cy, op) }
    }
    case 'text':
    case 'symbol': {
      const [nx, ny] = applyPoint(s.x, s.y, cx, cy, op)
      return { ...s, x: nx, y: ny, rotation: applyAngle(s.rotation, op) }
    }
    case 'dimension': {
      const [x1, y1] = applyPoint(s.x1, s.y1, cx, cy, op)
      const [x2, y2] = applyPoint(s.x2, s.y2, cx, cy, op)
      return { ...s, x1, y1, x2, y2 }
    }
  }
}
