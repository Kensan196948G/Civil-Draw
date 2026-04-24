import type { Point } from '../types/geometry'

/**
 * Parse a coordinate string into a world-space Point.
 *
 * Formats:
 *   "x,y"      — absolute coordinates
 *   "@dx,dy"   — relative offset from (baseX, baseY)
 *
 * Returns null if the string does not match either format.
 */
export function parseCoordinate(
  input: string,
  baseX: number,
  baseY: number,
): Point | null {
  const trimmed = input.trim()

  const relative = trimmed.startsWith('@')
  const body = relative ? trimmed.slice(1) : trimmed

  const parts = body.split(',')
  if (parts.length !== 2) return null

  const a = parseFloat(parts[0])
  const b = parseFloat(parts[1])
  if (isNaN(a) || isNaN(b)) return null

  if (relative) {
    return { x: baseX + a, y: baseY + b }
  }
  return { x: a, y: b }
}
