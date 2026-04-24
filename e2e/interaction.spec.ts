import { test, expect } from '@playwright/test'

// E2E-001: M3 additional scenarios — undo/redo, layer visibility, select+delete

test.describe('CivilDraw — interaction scenarios', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}))
    await page.goto('/')
  })

  test('undo removes a drawn shape, redo restores it', async ({ page }) => {
    await page.getByTitle('線分').click()
    const canvas = page.locator('canvas').first()
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return

    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    await page.mouse.click(cx - 100, cy)
    await page.mouse.click(cx + 100, cy)
    await expect(page.getByText(/図形:\s*[1-9]/)).toBeVisible()

    await page.getByTitle('元に戻す (Ctrl+Z)').click()
    await expect(page.getByText(/図形:\s*0\b/)).toBeVisible()

    await page.getByTitle('やり直し (Ctrl+Y)').click()
    await expect(page.getByText(/図形:\s*[1-9]/)).toBeVisible()
  })

  test('layer visibility toggle hides and restores a layer', async ({ page }) => {
    const hideBtn = page.getByTitle('非表示にする').first()
    await expect(hideBtn).toBeVisible()

    await hideBtn.click()
    await expect(page.getByTitle('表示する').first()).toBeVisible()

    await page.getByTitle('表示する').first().click()
    await expect(page.getByTitle('非表示にする').first()).toBeVisible()
  })

  test('select tool selects a shape and delete button removes it', async ({ page }) => {
    await page.getByTitle('線分').click()
    const canvas = page.locator('canvas').first()
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return

    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    await page.mouse.click(cx - 50, cy)
    await page.mouse.click(cx + 50, cy)
    await expect(page.getByText(/図形:\s*[1-9]/)).toBeVisible()

    await page.getByTitle('選択').click()
    await page.mouse.click(cx, cy)
    // Delete button appears only when shapes are selected
    await expect(page.getByTitle('削除 (Delete)')).toBeVisible({ timeout: 3000 })
    await page.getByTitle('削除 (Delete)').click()
    await expect(page.getByText(/図形:\s*0\b/)).toBeVisible()
  })
})
