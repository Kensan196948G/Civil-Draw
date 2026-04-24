import { describe, it, expect } from 'vitest'
import { parseCoordinate } from './coordParser'

describe('parseCoordinate', () => {
  describe('absolute coordinates', () => {
    it('parses integer x,y', () => {
      expect(parseCoordinate('100,200', 0, 0)).toEqual({ x: 100, y: 200 })
    })

    it('parses negative values', () => {
      expect(parseCoordinate('-50,-30', 0, 0)).toEqual({ x: -50, y: -30 })
    })

    it('parses decimal values', () => {
      expect(parseCoordinate('1.5,2.75', 0, 0)).toEqual({ x: 1.5, y: 2.75 })
    })

    it('ignores the base point', () => {
      expect(parseCoordinate('10,20', 100, 200)).toEqual({ x: 10, y: 20 })
    })

    it('trims surrounding whitespace', () => {
      expect(parseCoordinate('  10 , 20  ', 0, 0)).toEqual({ x: 10, y: 20 })
    })
  })

  describe('relative coordinates', () => {
    it('adds offset to base point', () => {
      expect(parseCoordinate('@10,20', 100, 200)).toEqual({ x: 110, y: 220 })
    })

    it('handles negative relative offset', () => {
      expect(parseCoordinate('@-5,-3', 50, 60)).toEqual({ x: 45, y: 57 })
    })

    it('handles zero offset', () => {
      expect(parseCoordinate('@0,0', 30, 40)).toEqual({ x: 30, y: 40 })
    })

    it('handles decimal relative offset', () => {
      expect(parseCoordinate('@0.5,1.5', 10, 20)).toEqual({ x: 10.5, y: 21.5 })
    })
  })

  describe('invalid input', () => {
    it('returns null for empty string', () => {
      expect(parseCoordinate('', 0, 0)).toBeNull()
    })

    it('returns null for single number', () => {
      expect(parseCoordinate('100', 0, 0)).toBeNull()
    })

    it('returns null for non-numeric values', () => {
      expect(parseCoordinate('a,b', 0, 0)).toBeNull()
    })

    it('returns null for too many parts', () => {
      expect(parseCoordinate('1,2,3', 0, 0)).toBeNull()
    })

    it('returns null for relative with non-numeric', () => {
      expect(parseCoordinate('@x,y', 0, 0)).toBeNull()
    })
  })
})
