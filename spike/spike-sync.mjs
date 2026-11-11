// THROWAWAY: does an extra field on sharedState sync presenter -> viewer, to late joiners, and survive normal use?
import { chromium } from 'playwright-chromium'
const base = process.argv[2]
const b = await chromium.launch()
const ctx = await b.newContext()           // same context = same BroadcastChannel scope
const A = await ctx.newPage(), B = await ctx.newPage()
await A.goto(`${base}/presenter/1`); await B.goto(`${base}/1`)
await A.waitForFunction(() => window.__shared); await B.waitForFunction(() => window.__shared)
await A.waitForTimeout(1500)
const read = (p, k) => p.evaluate(k => JSON.parse(JSON.stringify(window.__shared[k] ?? null)), k)

// control: a built-in field
await A.evaluate(() => { window.__shared.page = 2 }); await A.waitForTimeout(1200)
console.log('control page A->B     :', await read(B, 'page'))

// the question: an extra field
await A.evaluate(() => { window.__shared.laserPointer = { color: 'okabe-blue', size: 20 } }); await A.waitForTimeout(1200)
console.log('extra A->B            :', await read(B, 'laserPointer'))

// late joiner
const C = await ctx.newPage(); await C.goto(`${base}/1`); await C.waitForFunction(() => window.__shared); await C.waitForTimeout(1500)
console.log('extra to late joiner C:', await read(C, 'laserPointer'))

// built-in state still fine after extra field
await A.evaluate(() => { window.__shared.page = 1 }); await A.waitForTimeout(1200)
console.log('page after extra A->B :', await read(B, 'page'))

// removal
await A.evaluate(() => { delete window.__shared.laserPointer }); await A.waitForTimeout(1200)
console.log('after delete, B sees  :', await read(B, 'laserPointer'))
await b.close()
