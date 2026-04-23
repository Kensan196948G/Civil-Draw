import { test, expect } from '@playwright/test'

test.describe('CivilDraw — drawing smoke', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}))
    await page.goto('/')
  })

  test('can activate the line tool and draw a segment', async ({ page }) => {
    await page.getByTitle('線分').click()

    const canvas = page.locator('canvas').first()
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return

    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2

    // Click start and end point
    await page.mouse.click(cx - 100, cy)
    await page.mouse.click(cx + 100, cy)

    // Shape count in StatusBar should include our new line (+ any benchmark data)
    await expect(page.getByText(/図形:\s*[1-9]/)).toBeVisible()
  })

  test('can switch to rectangle tool', async ({ page }) => {
    const rectButton = page.getByTitle('矩形')
    await rectButton.click()
    // The active tool indicator in the status bar
    await expect(page.getByText(/ツール:\s*rect/)).toBeVisible()
  })

  test('Escape returns to select tool', async ({ page }) => {
    await page.getByTitle('線分').click()
    await expect(page.getByText(/ツール:\s*line/)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByText(/ツール:\s*select/)).toBeVisible()
  })
})
