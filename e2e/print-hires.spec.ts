import { test, expect } from '@playwright/test'

// PERF-003: high-DPI print — PDF export opens a new window with canvas image

test.describe('CivilDraw — PERF-003 high-DPI print', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}))
    await page.goto('/')
  })

  test('PDF出力 button opens a new page with canvas image', async ({ page, context }) => {
    // Draw a line so the canvas has content
    await page.getByTitle('線分').click()
    const canvas = page.locator('canvas').first()
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return
    await page.mouse.click(box.x + 200, box.y + 200)
    await page.mouse.click(box.x + 400, box.y + 400)

    // Click PDF button — expect a new page/popup to open
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /PDF出力/ }).click(),
    ])

    await popup.waitForLoadState('domcontentloaded')

    // The popup should contain an <img> with a data URL
    const img = popup.locator('img').first()
    await expect(img).toBeVisible({ timeout: 5000 })
    const imgSrc = await img.getAttribute('src')
    expect(imgSrc).toMatch(/^data:image\//)

    // Should also have print/close buttons
    await expect(popup.getByRole('button', { name: '印刷' })).toBeVisible()
    await expect(popup.getByRole('button', { name: '閉じる' })).toBeVisible()
  })

  test('PDF出力 does not crash main page', async ({ page, context }) => {
    // Even if popup is blocked, main page must remain functional
    context.on('page', (popup) => popup.close().catch(() => {}))

    await page.getByRole('button', { name: /PDF出力/ }).click()

    // Main page toolbar should still be visible
    await expect(page.getByTitle('線分')).toBeVisible()
  })
})
