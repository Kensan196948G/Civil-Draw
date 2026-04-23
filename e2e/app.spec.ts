import { test, expect } from '@playwright/test'

test.describe('CivilDraw — application smoke', () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss AutoSave restore prompt if present
    page.on('dialog', (d) => d.dismiss().catch(() => {}))
    await page.goto('/')
  })

  test('loads with CivilDraw title and Toolbar controls', async ({ page }) => {
    await expect(page).toHaveTitle(/CivilDraw/)
    await expect(page.getByRole('button', { name: /新規/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /DXF出力/ })).toBeVisible()
  })

  test('renders the default 5 layers', async ({ page }) => {
    // Default layers: 仮設構造物 / 土工 / 既存構造物 / 寸法 / 注記
    await expect(page.getByDisplayValue('仮設構造物')).toBeVisible()
    await expect(page.getByDisplayValue('土工')).toBeVisible()
    await expect(page.getByDisplayValue('注記')).toBeVisible()
  })

  test('opens the help dialog on button click', async ({ page }) => {
    await page.getByTitle('ヘルプ (F1)').click()
    await expect(page.getByText('CivilDraw 操作ガイド')).toBeVisible()
    await expect(page.getByText('キーボードショートカット')).toBeVisible()
  })
})
