import { describe, it, expect } from 'vitest'
import { SYMBOL_CATALOG, getSymbolById, getCategories } from './symbolCatalog'

describe('symbolCatalog', () => {
  it('contains exactly 30 symbols', () => {
    expect(SYMBOL_CATALOG).toHaveLength(30)
  })

  it('includes all 5 categories', () => {
    const cats = getCategories()
    expect(cats).toContain('仮設')
    expect(cats).toContain('土工')
    expect(cats).toContain('測量')
    expect(cats).toContain('車両')
    expect(cats).toContain('構造物')
  })

  it('each symbol has a unique id', () => {
    const ids = SYMBOL_CATALOG.map((s) => s.id)
    expect(new Set(ids).size).toBe(SYMBOL_CATALOG.length)
  })

  it('each symbol has at least one path', () => {
    for (const sym of SYMBOL_CATALOG) {
      expect(sym.paths.length).toBeGreaterThan(0)
    }
  })

  it('getSymbolById returns correct symbol', () => {
    const cone = getSymbolById('cone')
    expect(cone?.name).toBe('カラーコーン')
  })

  it('getSymbolById returns undefined for unknown id', () => {
    expect(getSymbolById('nonexistent')).toBeUndefined()
  })

  it('新カテゴリ 構造物 に 5 シンボルが含まれる', () => {
    const structural = SYMBOL_CATALOG.filter((s) => s.category === '構造物')
    expect(structural).toHaveLength(5)
  })

  it('新規追加シンボル (manhole / culvert / drainage-pit / pipe / retaining-wall) が存在する', () => {
    for (const id of ['manhole', 'culvert', 'drainage-pit', 'pipe', 'retaining-wall']) {
      expect(getSymbolById(id)).toBeDefined()
    }
  })
})
