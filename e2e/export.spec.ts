import { test, expect } from '@playwright/test'

test.describe('CivilDraw — export smoke', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}))
    await page.goto('/')
  })

  test('DXF output button triggers a download', async ({ page }) => {
    // Draw something so the file isn't entirely empty
    await page.getByTitle('線分').click()
    const canvas = page.locator('canvas').first()
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return
    await page.mouse.click(box.x + 200, box.y + 200)
    await page.mouse.click(box.x + 400, box.y + 400)

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /DXF出力/ }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.dxf')
  })

  test('JSON save triggers a download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /^保存$/ }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.(civil|json)$/)
  })
})
