import { chromium } from 'playwright'
const BASE = 'http://localhost:3003'
const browser = await chromium.launch()
async function run({ handler, dismissUpFront }) {
  const ctx = await browser.newContext(); const page = await ctx.newPage()
  if (handler) await page.addLocatorHandler(page.getByTestId('promo-overlay'), async (p) => {
    await p.getByTestId('promo-close').click() })
  await page.goto(BASE)
  await page.getByTestId('team-card').first().waitFor()
  if (dismissUpFront && await page.getByTestId('promo-overlay').isVisible())
    await page.getByTestId('promo-close').click()
  await page.getByTestId('search-input').fill('netherlands')
  await page.waitForFunction(() =>
    document.querySelector('[data-testid="result-count"]')?.textContent.trim() === '1 team')
  const ned = page.locator('[data-testid="team-card"][data-team="NED"]')
  try { await ned.getByTestId('like-button').click({ timeout: 5000 }); await ctx.close(); return 'pass' }
  catch { await ctx.close(); return 'FAIL' }
}
const N = 20
for (const [label, opts] of [
  ['NO handler             ', {}],
  ['dismiss-once workaround', { dismissUpFront: true }],
  ['WITH addLocatorHandler ', { handler: true }],
]) {
  const r = []; for (let i = 0; i < N; i++) r.push(await run(opts))
  const f = r.filter(x => x === 'FAIL').length
  console.log(`${label}: ${N-f}/${N} passed, ${f} failed (${Math.round(f/N*100)}%)  ${r.map(x=>x==='pass'?'.':'X').join('')}`)
}
await browser.close()
