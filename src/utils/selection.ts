import type { Shape, Point } from '../types/geometry'

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export function getShapeBBox(shape: Shape): BoundingBox {
  switch (shape.type) {
    case 'line':
    case 'dimension':
      return {
        minX: Math.min(shape.x1, shape.x2),
        minY: Math.min(shape.y1, shape.y2),
        maxX: Math.max(shape.x1, shape.x2),
        maxY: Math.max(shape.y1, shape.y2),
      }
    case 'rect':
      return {
        minX: shape.x,
        minY: shape.y,
        maxX: shape.x + shape.width,
        maxY: shape.y + shape.height,
      }
    case 'circle':
      return {
        minX: shape.cx - shape.radius,
        minY: shape.cy - shape.radius,
        maxX: shape.cx + shape.radius,
        maxY: shape.cy + shape.radius,
      }
    case 'polyline': {
      const xs: number[] = []
      const ys: number[] = []
      for (let i = 0; i < shape.points.length; i += 2) {
        xs.push(shape.points[i])
        ys.push(shape.points[i + 1])
      }
      return {
        minX: Math.min(...xs), minY: Math.min(...ys),
        maxX: Math.max(...xs), maxY: Math.max(...ys),
      }
    }
    case 'text': {
      const w = shape.text.length * shape.fontSize * 0.6
      return {
        minX: shape.x, minY: shape.y,
        maxX: shape.x + w, maxY: shape.y + shape.fontSize,
      }
    }
    case 'hatch': {
      const xs: number[] = []
      const ys: number[] = []
      for (let i = 0; i < shape.points.length; i += 2) {
        xs.push(shape.points[i]); ys.push(shape.points[i + 1])
      }
      return {
        minX: Math.min(...xs), minY: Math.min(...ys),
        maxX: Math.max(...xs), maxY: Math.max(...ys),
      }
    }
    case 'symbol': {
      const half = 50 * shape.scale
      return {
        minX: shape.x - half, minY: shape.y - half,
        maxX: shape.x + half, maxY: shape.y + half,
      }
    }
  }
}

export function bboxContainsPoint(bbox: BoundingBox, p: Point, tolerance = 0): boolean {
  return (
    p.x >= bbox.minX - tolerance &&
    p.x <= bbox.maxX + tolerance &&
    p.y >= bbox.minY - tolerance &&
    p.y <= bbox.maxY + tolerance
  )
}

export function bboxIntersects(a: BoundingBox, b: BoundingBox): boolean {
  return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY)
}

export function rectFromPoints(p1: Point, p2: Point): BoundingBox {
  return {
    minX: Math.min(p1.x, p2.x),
    minY: Math.min(p1.y, p2.y),
    maxX: Math.max(p1.x, p2.x),
    maxY: Math.max(p1.y, p2.y),
  }
}

export function findShapesInRect(shapes: Shape[], rect: BoundingBox): string[] {
  return shapes
    .filter((s) => bboxIntersects(getShapeBBox(s), rect))
    .map((s) => s.id)
}

export function findShapeAtPoint(shapes: Shape[], p: Point, tolerance = 5): string | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (bboxContainsPoint(getShapeBBox(shapes[i]), p, tolerance)) {
      return shapes[i].id
    }
  }
  return null
}
