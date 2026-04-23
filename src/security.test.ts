import { describe, it, expect } from 'vitest'
import indexHtml from '../index.html?raw'

describe('SEC-001 — Content-Security-Policy meta tag', () => {
  it('declares a CSP meta tag in index.html', () => {
    expect(indexHtml).toMatch(/http-equiv="Content-Security-Policy"/)
  })

  it.each([
    ["default-src 'self'"],
    ["script-src 'self'"],
    ["style-src 'self' 'unsafe-inline'"],
    ["img-src 'self' data: blob:"],
    ["font-src 'self' data:"],
    ["connect-src 'self'"],
    ["object-src 'none'"],
    ["base-uri 'self'"],
    ["form-action 'self'"],
  ])('includes directive: %s', (directive) => {
    expect(indexHtml).toContain(directive)
  })

  it('sets a strict referrer policy', () => {
    expect(indexHtml).toMatch(/<meta\s+name="referrer"\s+content="no-referrer"/)
  })

  it('does not contain inline event handlers in the shipped HTML', () => {
    expect(indexHtml).not.toMatch(/\son[a-z]+="/i)
  })
})
