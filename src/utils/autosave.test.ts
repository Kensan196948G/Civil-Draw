import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveAutoSnapshot,
  loadAutoSnapshot,
  clearAutoSnapshot,
  getLastSavedTimestamp,
  debounce,
} from './autosave'
import type { Layer } from '../types/layer'
import type { Shape } from '../types/geometry'

const LAYER: Layer = {
  id: 'l1', name: '仮設', visible: true, locked: false,
  color: '#ff0000', lineStyle: 'solid', lineWidth: 1, order: 0,
}

const SHAPE: Shape = {
  id: 's1', type: 'line', layerId: 'l1', locked: false,
  x1: 0, y1: 0, x2: 10, y2: 10,
}

beforeEach(() => {
  localStorage.clear()
})

describe('autosave', () => {
  it('saves and loads a snapshot round-trip', () => {
    saveAutoSnapshot([LAYER], [SHAPE])
    const loaded = loadAutoSnapshot()
    expect(loaded).not.toBeNull()
    expect(loaded?.layers).toHaveLength(1)
    expect(loaded?.shapes).toHaveLength(1)
    expect(loaded?.shapes[0]).toEqual(SHAPE)
  })

  it('returns null when no snapshot exists', () => {
    expect(loadAutoSnapshot()).toBeNull()
  })

  it('returns null for corrupt storage data', () => {
    localStorage.setItem('civildraw:autosave:v1', 'not-json')
    expect(loadAutoSnapshot()).toBeNull()
  })

  it('clears the snapshot', () => {
    saveAutoSnapshot([LAYER], [SHAPE])
    clearAutoSnapshot()
    expect(loadAutoSnapshot()).toBeNull()
    expect(getLastSavedTimestamp()).toBeNull()
  })

  it('tracks the saved timestamp', () => {
    const before = Date.now()
    saveAutoSnapshot([LAYER], [SHAPE])
    const ts = getLastSavedTimestamp()
    expect(ts).not.toBeNull()
    expect(ts!).toBeGreaterThanOrEqual(before)
  })
})

describe('debounce', () => {
  it('calls the wrapped function only once for rapid calls', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    debounced()
    debounced()
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(150)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
