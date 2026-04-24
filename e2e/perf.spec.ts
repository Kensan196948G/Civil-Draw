import { test, expect } from '@playwright/test'

// PERF-001: Automated FPS measurement for 1K / 5K / 10K shapes
// Run with: PERF_RUN=1 npx playwright test e2e/perf.spec.ts --reporter=list
// This test is excluded from the default e2e suite via playwright.config.ts testIgnore.

type FpsSample = {
  count: number
  frames: number
  avgFps: number
  minFps: number
  p95FrameMs: number
}

// Sample FPS in-browser by chaining requestAnimationFrame and measuring deltas.
async function sampleFps(page: import('@playwright/test').Page, frames: number): Promise<Omit<FpsSample, 'count'>> {
  return page.evaluate(async (targetFrames) => {
    const deltas: number[] = []
    let last = performance.now()
    return new Promise<{ frames: number; avgFps: number; minFps: number; p95FrameMs: number }>((resolve) => {
      let collected = 0
      const step = (now: number) => {
        const dt = now - last
        last = now
        if (collected > 0) deltas.push(dt) // discard the very first delta (warmup)
        collected++
        if (collected <= targetFrames) {
          requestAnimationFrame(step)
        } else {
          deltas.sort((a, b) => a - b)
          const sum = deltas.reduce((s, d) => s + d, 0)
          const avgMs = sum / deltas.length
          const maxMs = deltas[deltas.length - 1]
          const p95Ms = deltas[Math.floor(deltas.length * 0.95)]
          resolve({
            frames: deltas.length,
            avgFps: 1000 / avgMs,
            minFps: 1000 / maxMs,
            p95FrameMs: p95Ms,
          })
        }
      }
      requestAnimationFrame(step)
    })
  }, frames)
}

async function loadShapes(page: import('@playwright/test').Page, count: 1000 | 5000 | 10000) {
  // Open BenchmarkPanel
  await page.getByRole('button', { name: /⚡ Bench$/ }).click()
  // Click the count button (label is "1K" / "5K" / "10K")
  const label = count >= 1000 ? `${count / 1000}K` : `${count}`
  await page.getByRole('button', { name: new RegExp(`^${label}$`) }).click()
  // Wait for the load-summary text to confirm the generation finished
  await expect(page.getByText(new RegExp(`生成:\\s*${count}`))).toBeVisible({ timeout: 15_000 })
  // Allow Konva to paint the first frame after state update
  await page.waitForTimeout(500)
}

const results: FpsSample[] = []

test.describe('PERF-001: FPS measurement', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}))
    await page.goto('/')
    await page.waitForSelector('canvas')
  })

  for (const count of [1000, 5000, 10000] as const) {
    test(`S1-S3 static viewport @ ${count} shapes`, async ({ page }) => {
      await loadShapes(page, count)
      const sample = await sampleFps(page, 120)
      const row: FpsSample = { count, ...sample }
      results.push(row)
      console.log(`[PERF-001][static][${count}] avg=${sample.avgFps.toFixed(1)}fps min=${sample.minFps.toFixed(1)}fps p95frame=${sample.p95FrameMs.toFixed(2)}ms`)
      // Fail-loud guard: even minimum must stay above 5 FPS to catch total regressions.
      expect(sample.minFps).toBeGreaterThan(5)
    })
  }

  test('S6 preview draw @ 10K bg', async ({ page }) => {
    await loadShapes(page, 10000)
    await page.getByTitle('線分').click()
    const canvas = page.locator('canvas').first()
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    // Set anchor point and move mouse to trigger preview shape rendering
    await page.mouse.click(cx - 200, cy)
    await page.mouse.move(cx + 100, cy + 50) // move to create a preview segment
    await page.waitForTimeout(300)
    // Sample FPS after preview is active (no concurrent mouse movement to avoid rAF interference)
    const sample = await sampleFps(page, 90)
    console.log(`[PERF-001][preview][10000] avg=${sample.avgFps.toFixed(1)}fps min=${sample.minFps.toFixed(1)}fps p95frame=${sample.p95FrameMs.toFixed(2)}ms`)
    expect(sample.minFps).toBeGreaterThan(3)
  })

  test.afterAll(async () => {
    if (results.length === 0) return
    console.log('\n=== PERF-001 SUMMARY ===')
    console.log('count | avg FPS | min FPS | p95 frame(ms)')
    for (const r of results) {
      console.log(`${String(r.count).padStart(6)} | ${r.avgFps.toFixed(1).padStart(7)} | ${r.minFps.toFixed(1).padStart(7)} | ${r.p95FrameMs.toFixed(2).padStart(6)}`)
    }
  })
})
