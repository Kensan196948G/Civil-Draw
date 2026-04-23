import type { Layer } from '../types/layer'
import type { Shape } from '../types/geometry'

const STORAGE_KEY = 'civildraw:autosave:v1'
const STORAGE_TS_KEY = 'civildraw:autosave:ts:v1'

export interface AutoSaveSnapshot {
  version: string
  layers: Layer[]
  shapes: Shape[]
  savedAt: number
}

export function saveAutoSnapshot(layers: Layer[], shapes: Shape[]): void {
  try {
    const snapshot: AutoSaveSnapshot = {
      version: '1.0',
      layers,
      shapes,
      savedAt: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    localStorage.setItem(STORAGE_TS_KEY, String(snapshot.savedAt))
  } catch {
    // Storage full or disabled — silent fallback
  }
}

export function loadAutoSnapshot(): AutoSaveSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AutoSaveSnapshot
    if (!Array.isArray(parsed.layers) || !Array.isArray(parsed.shapes)) return null
    return parsed
  } catch {
    return null
  }
}

export function clearAutoSnapshot(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_TS_KEY)
  } catch {
    // noop
  }
}

export function getLastSavedTimestamp(): number | null {
  try {
    const ts = localStorage.getItem(STORAGE_TS_KEY)
    return ts ? Number(ts) : null
  } catch {
    return null
  }
}

export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}
