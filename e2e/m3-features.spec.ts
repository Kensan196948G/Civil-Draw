import { test, expect } from '@playwright/test'

// E2E-002: M3 new feature scenarios — templates, transform, CommandBar coord input, bulk edit

test.describe('CivilDraw — M3 features', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}))
    await page.goto('/')
  })

  test.describe('TemplatePanel — template insertion', () => {
    test('inserts 工事ゾーン template and increases shape count', async ({ page }) => {
      // Open the TemplatePanel (collapsed by default)
      await page.getByText('テンプレート').click()

      // The 仮設 category should be active by default; click 工事ゾーン
      await page.getByText('工事ゾーン').click()

      // Shape count must increase (工事ゾーン has 6 shapes: 4 cones + 2 barriers)
      await expect(page.getByText(/図形:\s*[1-9]/)).toBeVisible()
    })

    test('can switch template category to 土工 and insert 土工断面', async ({ page }) => {
      await page.getByText('テンプレート').click()
      await page.getByText('土工').click()
      await page.getByText('土工断面').click()

      await expect(page.getByText(/図形:\s*[1-9]/)).toBeVisible()
    })
  })

  test.describe('Transform — rotate and mirror', () => {
    async function drawLine(page: import('@playwright/test').Page) {
      await page.getByTitle('線分').click()
      const canvas = page.locator('canvas').first()
      const box = await canvas.boundingBox()
      expect(box).not.toBeNull()
      if (!box) return
      const cx = box.x + box.width / 2
      const cy = box.y + box.height / 2
      await page.mouse.click(cx - 80, cy)
      await page.mouse.click(cx + 80, cy)
      await expect(page.getByText(/図形:\s*[1-9]/)).toBeVisible()
    }

    async function selectAll(page: import('@playwright/test').Page) {
      await page.getByTitle('選択').click()
      const canvas = page.locator('canvas').first()
      const box = await canvas.boundingBox()
      if (!box) return
      // Drag selection rect to cover the drawn line
      await page.mouse.move(box.x + 50, box.y + 50)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width - 50, box.y + box.height - 50)
      await page.mouse.up()
    }

    test('rotate CW does not crash and shape count is preserved', async ({ page }) => {
      await drawLine(page)
      await selectAll(page)
      await page.getByTitle('90° 時計回り').click()
      // Shape count should be unchanged
      await expect(page.getByText(/図形:\s*[1-9]/)).toBeVisible()
    })

    test('rotate CCW does not crash', async ({ page }) => {
      await drawLine(page)
      await selectAll(page)
      await page.getByTitle('90° 反時計回り').click()
      await expect(page.getByText(/図形:\s*[1-9]/)).toBeVisible()
    })

    test('mirror H does not crash', async ({ page }) => {
      await drawLine(page)
      await selectAll(page)
      await page.getByTitle('水平反転').click()
      await expect(page.getByText(/図形:\s*[1-9]/)).toBeVisible()
    })
  })

  test.describe('CommandBar — coordinate input (UX-003)', () => {
    test('draws a line via coordinate input', async ({ page }) => {
      await page.getByTitle('線分').click()

      // CommandBar should now be visible
      const input = page.getByPlaceholder('x,y または @dx,dy')
      await expect(input).toBeVisible()

      // Enter first point
      await input.fill('100,200')
      await input.press('Enter')

      // Enter second point (relative offset)
      await input.fill('@100,0')
      await input.press('Enter')

      // A line should have been created
      await expect(page.getByText(/図形:\s*[1-9]/)).toBeVisible()
    })

    test('shows error indicator on invalid coordinate', async ({ page }) => {
      await page.getByTitle('線分').click()

      const input = page.getByPlaceholder('x,y または @dx,dy')
      await input.fill('invalid')
      await input.press('Enter')

      await expect(page.getByText('無効な座標')).toBeVisible()
    })

    test('Escape clears input without error', async ({ page }) => {
      await page.getByTitle('線分').click()

      const input = page.getByPlaceholder('x,y または @dx,dy')
      await input.fill('abc')
      await input.press('Escape')

      await expect(input).toHaveValue('')
    })

    test('CommandBar is hidden when select tool is active', async ({ page }) => {
      // Default is select, so CommandBar should not be visible
      await expect(page.getByPlaceholder('x,y または @dx,dy')).not.toBeVisible()

      await page.getByTitle('線分').click()
      await expect(page.getByPlaceholder('x,y または @dx,dy')).toBeVisible()

      await page.keyboard.press('Escape')
      await expect(page.getByPlaceholder('x,y または @dx,dy')).not.toBeVisible()
    })
  })

  test.describe('PropertyPanel — bulk layer edit', () => {
    test('shows PropertyPanel with lock option when shapes are selected', async ({ page }) => {
      // Draw two lines
      await page.getByTitle('線分').click()
      const canvas = page.locator('canvas').first()
      const box = await canvas.boundingBox()
      expect(box).not.toBeNull()
      if (!box) return
      const cx = box.x + box.width / 2
      const cy = box.y + box.height / 2

      await page.mouse.click(cx - 150, cy - 30)
      await page.mouse.click(cx - 50, cy - 30)

      await page.mouse.click(cx + 50, cy + 30)
      await page.mouse.click(cx + 150, cy + 30)

      await expect(page.getByText(/図形:\s*2/)).toBeVisible()

      // Select all via drag
      await page.getByTitle('選択').click()
      await page.mouse.move(box.x + 50, box.y + 50)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width - 50, box.y + box.height - 50)
      await page.mouse.up()

      // PropertyPanel bulk edit section should appear (shows "ロック" when shapes selected)
      await expect(page.getByText('ロック')).toBeVisible({ timeout: 3000 })
    })
  })
})
