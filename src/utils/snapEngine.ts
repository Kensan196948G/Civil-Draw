import type { Shape, Point } from '../types/geometry'

export type SnapType = 'grid' | 'endpoint' | 'midpoint' | 'intersection' | 'none'

export interface SnapResult {
  point: Point
  type: SnapType
}

const SNAP_RADIUS = 10

function dist(a: Point, b: Point): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

function snapToGrid(p: Point, gridSize: number): Point {
  return {
    x: Math.round(p.x / gridSize) * gridSize,
    y: Math.round(p.y / gridSize) * gridSize,
  }
}

function getEndpoints(shape: Shape): Point[] {
  switch (shape.type) {
    case 'line':
      return [
        { x: shape.x1, y: shape.y1 },
        { x: shape.x2, y: shape.y2 },
      ]
    case 'rect':
      return [
        { x: shape.x, y: shape.y },
        { x: shape.x + shape.width, y: shape.y },
        { x: shape.x + shape.width, y: shape.y + shape.height },
        { x: shape.x, y: shape.y + shape.height },
      ]
    case 'circle':
      return [
        { x: shape.cx, y: shape.cy - shape.radius },
        { x: shape.cx + shape.radius, y: shape.cy },
        { x: shape.cx, y: shape.cy + shape.radius },
        { x: shape.cx - shape.radius, y: shape.cy },
      ]
    case 'polyline': {
      const pts: Point[] = []
      for (let i = 0; i < shape.points.length - 1; i += 2) {
        pts.push({ x: shape.points[i], y: shape.points[i + 1] })
      }
      return pts
    }
    case 'text':
      return [{ x: shape.x, y: shape.y }]
    case 'dimension':
      return [
        { x: shape.x1, y: shape.y1 },
        { x: shape.x2, y: shape.y2 },
      ]
    case 'hatch': {
      const pts: Point[] = []
      for (let i = 0; i < shape.points.length - 1; i += 2) {
        pts.push({ x: shape.points[i], y: shape.points[i + 1] })
      }
      return pts
    }
    case 'symbol':
      return [{ x: shape.x, y: shape.y }]
  }
}

function getMidpoints(shape: Shape): Point[] {
  switch (shape.type) {
    case 'line':
      return [{ x: (shape.x1 + shape.x2) / 2, y: (shape.y1 + shape.y2) / 2 }]
    case 'polyline': {
      const mids: Point[] = []
      for (let i = 0; i < shape.points.length - 3; i += 2) {
        mids.push({
          x: (shape.points[i] + shape.points[i + 2]) / 2,
          y: (shape.points[i + 1] + shape.points[i + 3]) / 2,
        })
      }
      return mids
    }
    default:
      return []
  }
}

function lineIntersection(
  p1: Point, p2: Point,
  p3: Point, p4: Point,
): Point | null {
  const d1x = p2.x - p1.x, d1y = p2.y - p1.y
  const d2x = p4.x - p3.x, d2y = p4.y - p3.y
  const denom = d1x * d2y - d1y * d2x
  if (Math.abs(denom) < 1e-10) return null
  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denom
  const u = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / denom
  if (t < 0 || t > 1 || u < 0 || u > 1) return null
  return { x: p1.x + t * d1x, y: p1.y + t * d1y }
}

function getSegments(shape: Shape): [Point, Point][] {
  switch (shape.type) {
    case 'line':
      return [[{ x: shape.x1, y: shape.y1 }, { x: shape.x2, y: shape.y2 }]]
    case 'rect': {
      const { x, y, width, height } = shape
      const corners: Point[] = [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ]
      return [
        [corners[0], corners[1]],
        [corners[1], corners[2]],
        [corners[2], corners[3]],
        [corners[3], corners[0]],
      ]
    }
    case 'polyline': {
      const segs: [Point, Point][] = []
      for (let i = 0; i < shape.points.length - 3; i += 2) {
        segs.push([
          { x: shape.points[i], y: shape.points[i + 1] },
          { x: shape.points[i + 2], y: shape.points[i + 3] },
        ])
      }
      return segs
    }
    default:
      return []
  }
}

export function computeSnap(
  cursor: Point,
  shapes: Shape[],
  gridSize: number,
  options: {
    snapGrid: boolean
    snapEndpoint: boolean
    snapMidpoint: boolean
    snapIntersection: boolean
  },
): SnapResult {
  let best: SnapResult = { point: cursor, type: 'none' }
  let bestDist = SNAP_RADIUS

  if (options.snapEndpoint) {
    for (const shape of shapes) {
      for (const ep of getEndpoints(shape)) {
        const d = dist(cursor, ep)
        if (d < bestDist) {
          bestDist = d
          best = { point: ep, type: 'endpoint' }
        }
      }
    }
  }

  if (options.snapMidpoint) {
    for (const shape of shapes) {
      for (const mp of getMidpoints(shape)) {
        const d = dist(cursor, mp)
        if (d < bestDist) {
          bestDist = d
          best = { point: mp, type: 'midpoint' }
        }
      }
    }
  }

  if (options.snapIntersection) {
    const allSegs = shapes.flatMap(getSegments)
    for (let i = 0; i < allSegs.length; i++) {
      for (let j = i + 1; j < allSegs.length; j++) {
        const ip = lineIntersection(allSegs[i][0], allSegs[i][1], allSegs[j][0], allSegs[j][1])
        if (ip) {
          const d = dist(cursor, ip)
          if (d < bestDist) {
            bestDist = d
            best = { point: ip, type: 'intersection' }
          }
        }
      }
    }
  }

  if (best.type !== 'none') return best

  if (options.snapGrid) {
    return { point: snapToGrid(cursor, gridSize), type: 'grid' }
  }

  return best
}
