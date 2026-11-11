// Usage: node scripts/check-laser.mjs <configured-url> <stock-url>
import { chromium } from 'playwright-chromium'

const [configuredUrl, stockUrl] = process.argv.slice(2)
if (!configuredUrl || !stockUrl) {
  console.error('usage: check-laser.mjs <configured-url> <stock-url>')
  process.exit(2)
}

async function laserStyle(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await page.addInitScript(() => localStorage.setItem('slidev-cursor-style', 'laser'))
  await page.goto(url)
  await page.waitForSelector('.slidev-slide-container')
  await page.mouse.move(400, 300)
  await page.mouse.move(420, 310)
  await page.waitForSelector('.laser-pointer', { timeout: 5000 })
  const style = await page.$eval('.laser-pointer', (el) => {
    const s = getComputedStyle(el)
    return { width: s.width, bg: s.backgroundColor, bgImage: s.backgroundImage, shadow: s.boxShadow }
  })
  await page.close()
  return style
}

const failures = []
const expect = (label, cond, got) => { if (!cond) failures.push(`${label}: got ${JSON.stringify(got)}`) }

const browser = await chromium.launch()
const cfg = await laserStyle(browser, configuredUrl)
console.log('configured', cfg)
expect('configured width', cfg.width === '14px', cfg.width)
expect('configured color', cfg.bg === 'rgb(0, 114, 178)', cfg.bg)
expect('configured glow', cfg.shadow !== 'none', cfg.shadow)

const stock = await laserStyle(browser, stockUrl)
console.log('stock', stock)
expect('stock width', stock.width === '6px', stock.width)
expect('stock gradient', stock.bgImage.includes('radial-gradient'), stock.bgImage)
await browser.close()

if (failures.length) { console.error('FAIL\n' + failures.join('\n')); process.exit(1) }
console.log('OK')
