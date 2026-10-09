// Balance check: runs the naive "burn all energy, end turn" bot N times.
const { chromium } = require("playwright")
const BASE = "http://localhost:8123/arcana_ascent/arcana_test.html"
const N = Number(process.argv[2] || 5)

async function run(page) {
  await page.goto(BASE)
  await page.waitForTimeout(450)
  await page.evaluate(() => document.getElementById("canvas").focus())
  const press = async k => {
    await page.evaluate(k => window.__press(k), k)
    await page.waitForTimeout(35)
  }
  await press("i")

  for (let n = 0; n < 500; n++) {
    const p = await page.evaluate(() => window.__probe())
    if (p.screen === "gameover" || p.screen === "win") return p
    if (p.screen === "battle") {
      for (let m = 0; m < 10; m++) {
        const q = await page.evaluate(() => window.__probe())
        if (q.screen !== "battle" || q.hand.length === 0) break
        const before = q.energy + ":" + q.hand.length
        await press("i")
        const r = await page.evaluate(() => window.__probe())
        if (r.screen !== "battle") break
        if (r.energy + ":" + r.hand.length === before) await press("s")
      }
      const q = await page.evaluate(() => window.__probe())
      if (q.screen === "battle") await press("j")
    } else if (p.screen === "reward") {
      await press("i")
    } else {
      return p
    }
  }
  return await page.evaluate(() => window.__probe())
}

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const errors = []
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()) })
  page.on("pageerror", e => errors.push(e.message))

  let wins = 0
  const hp = []
  const floors = []
  for (let i = 0; i < N; i++) {
    const r = await run(page)
    const won = r.screen === "win"
    if (won) wins++
    hp.push(r.pHp)
    floors.push(r.floor + 1)
    console.log(`run ${i + 1}: ${r.screen.padEnd(8)} floor ${floors[i]}/5  hp ${r.pHp}/${r.pMaxHp}  deck ${r.deck}  turns ${r.turn}`)
  }
  console.log(`\n${wins}/${N} wins   avg hp ${Math.round(hp.reduce((a, b) => a + b, 0) / N)}   avg death floor ${floors.reduce((a, b) => a + b, 0) / N}`)
  console.log("errors: " + (errors.length ? JSON.stringify(errors) : "NONE"))
  await browser.close()
})().catch(e => { console.error(e); process.exit(1) })
