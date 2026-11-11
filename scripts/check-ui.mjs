// Usage: node scripts/check-ui.mjs <configured-base-url> <stock-base-url>   (e.g. http://localhost:3031 http://localhost:3032)
import { chromium } from 'playwright-chromium'

const [cfgBase, stockBase] = process.argv.slice(2)
if (!cfgBase || !stockBase) { console.error('usage: check-ui.mjs <configured-base> <stock-base>'); process.exit(2) }

const failures = []
const check = (label, cond, got) => { console.log(cond ? 'ok  ' : 'FAIL', label, cond ? '' : JSON.stringify(got)); if (!cond) failures.push(label) }

async function open(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await page.addInitScript(() => localStorage.setItem('slidev-cursor-style', 'laser'))
  await page.goto(url)
  await page.waitForSelector('.slidev-slide-container')
  return page
}
async function dot(page) {
  await page.mouse.move(400, 300); await page.mouse.move(430, 320)
  await page.waitForSelector('.laser-pointer', { timeout: 5000 })
  return page.$eval('.laser-pointer', (el) => { const s = getComputedStyle(el); return { width: s.width, bg: s.backgroundColor } })
}
const controls = page => page.locator('[data-testid=laser-control]').count()

const browser = await chromium.launch()

// 1. exactly one control per page, in play and presenter views
let page = await open(browser, `${cfgBase}/1`)
check('play view: one control', (await controls(page)) === 1, await controls(page))
const pres = await open(browser, `${cfgBase}/presenter/1`)
await pres.waitForTimeout(1500)
check('presenter view: one control', (await controls(pres)) === 1, await controls(pres))
await pres.close()

// 2. swatch, size, reset on the configured deck (okabe-blue, 14px)
check('starts as configured', JSON.stringify(await dot(page)) === JSON.stringify({ width: '14px', bg: 'rgb(0, 114, 178)' }), await dot(page))
await page.click('.slidev-laser-control .toggle')
await page.click('.slidev-laser-control [data-name=okabe-yellow]')
let d = await dot(page)
check('yellow swatch applies', d.bg === 'rgb(240, 228, 66)' && d.width === '14px', d)
await page.$eval('.slidev-laser-control input[type=range]', (el) => { el.value = '30'; el.dispatchEvent(new Event('input', { bubbles: true })) })
d = await dot(page)
check('size 30 applies', d.width === '30px', d)

// 3. keys in the popover must not navigate slides
// clicking inert panel text drops focus to <body>, where Slidev handles keys unless shortcuts are locked
await page.click('.slidev-laser-control .title')
await page.keyboard.press('ArrowRight'); await page.waitForTimeout(500)
check('arrow key in popover keeps the slide', /\/1$/.test(page.url()), page.url())
await page.click('.slidev-laser-control .reset')
d = await dot(page)
check('reset returns to deck default', d.width === '14px' && d.bg === 'rgb(0, 114, 178)', d)
await page.close()

// 4. stock deck: no override = stock; override applies; reload resets
page = await open(browser, `${stockBase}/1`)
d = await dot(page)
check('stock deck starts stock', d.width === '6px', d)
await page.click('.slidev-laser-control .toggle')
await page.click('.slidev-laser-control [data-name=okabe-vermillion]')
d = await dot(page)
check('stock deck: override applies', d.bg === 'rgb(213, 94, 0)', d)
await page.reload(); await page.waitForSelector('.slidev-slide-container')
d = await dot(page)
check('reload resets (session only)', d.width === '6px' && d.bg === 'rgba(0, 0, 0, 0)', d)
// 5. the panel must never leave a speaker with a dead clicker or a hidden-key trap
const panel = page => page.locator('.slidev-laser-control .panel').count()
const IDLE_MS = 10_000

page = await open(browser, `${cfgBase}/1`)
await page.click('.slidev-laser-control .toggle')
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
check('Escape closes the panel', (await panel(page)) === 0, await panel(page))
await page.keyboard.press('ArrowRight'); await page.waitForTimeout(500)
check('shortcuts work again after Escape', /\/2$/.test(page.url()), page.url())
await page.close()

page = await open(browser, `${cfgBase}/1`)
await page.click('.slidev-laser-control .toggle')
await page.mouse.click(300, 200); await page.waitForTimeout(300)
check('click outside closes the panel', (await panel(page)) === 0, await panel(page))
await page.close()

page = await open(browser, `${cfgBase}/1`)
await page.click('.slidev-laser-control .toggle')
await page.click('.slidev-laser-control .toggle')   // close via the button, focus used to stay on it
await page.keyboard.press('Space'); await page.waitForTimeout(500)
check('Space after closing does not re-open the panel', (await panel(page)) === 0, await panel(page))
check('Space after closing advances the slide', /\/2$/.test(page.url()), page.url())
await page.mouse.move(200, 200); await page.waitForTimeout(400)   // hover would force opacity 1
const opacity = await page.$eval('.slidev-laser-control .toggle', el => Number(getComputedStyle(el).opacity))
check('resting toggle opacity is .5-.99 (findable, and not just hovered)', opacity >= 0.5 && opacity < 1, opacity)
await page.close()

page = await open(browser, `${cfgBase}/1`)
await page.click('.slidev-laser-control .toggle')
await page.waitForTimeout(IDLE_MS + 800)
check('idle panel closes itself', (await panel(page)) === 0, await panel(page))
await page.close()

// 6. no control on export/print routes (PNG export uses screen media, where CSS print rules do not apply)
for (const path of ['/export/', '/1?print=true']) {
  page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await page.goto(`${cfgBase}${path}`)
  await page.waitForTimeout(3000)
  check(`no control on ${path}`, (await controls(page)) === 0, await controls(page))
  await page.close()
}

await browser.close()

if (failures.length) { console.error('\nFAILED:', failures.join('; ')); process.exit(1) }
console.log('\nOK')
