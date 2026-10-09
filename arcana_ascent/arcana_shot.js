// Screenshots the Arcana Ascent test harness at several game states.
const { chromium } = require("playwright")
const fs = require("fs")

const BASE = "http://localhost:8123/arcana_ascent/arcana_test.html"

async function dumpText(page, label) {
  const texts = await page.evaluate(() =>
    window.__state.texts.map(t => ({
      x: t.x, y: t.y, s: t.content, len: t.content.length,
      right: t.x + t.content.length,
    }))
  )
  const bad = texts.filter(t => t.right > 20 || t.x < 0 || t.y > 15)
  console.log(`\n[${label}] ${texts.length} text lines` + (bad.length ? "  !! OVERFLOW: " + JSON.stringify(bad) : "  (fits)"))
  texts.forEach(t => console.log(`  y${String(t.y).padStart(2)} x${String(t.x).padStart(2)} |${t.s}|`))
  return texts
}

async function shot(page, name) {
  await page.waitForTimeout(120)
  // canvas.toDataURL reads the backing store directly; Playwright's element
  // screenshot captures black after a page reload (known headless quirk).
  const url = await page.evaluate(() => document.getElementById("canvas").toDataURL("image/png"))
  fs.writeFileSync(`arcana_${name}.png`, Buffer.from(url.split(",")[1], "base64"))
}

(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 900, height: 480 } })

  const errors = []
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()) })
  page.on("pageerror", e => errors.push(e.message))

  await page.goto(BASE)
  await page.waitForTimeout(600)
  await page.evaluate(() => document.getElementById("canvas").focus())

  const press = async k => {
    await page.evaluate(k => window.__press(k), k)
    await page.waitForTimeout(60)
  }

  await dumpText(page, "title")
  await shot(page, "title")

  await press("i") // start
  await dumpText(page, "battle")
  await shot(page, "battle")

  // play cards until out of energy, then end turn
  await press("i")
  await press("i")
  await dumpText(page, "after-plays")
  await shot(page, "after_plays")

  await press("j") // end turn -> enemy acts
  await dumpText(page, "enemy-turn")
  await shot(page, "enemy_turn")

  await press("k") // deck view
  await dumpText(page, "deck")
  await shot(page, "deck")
  await press("k") // back

  // play out the rest of the run, sampling each screen
  const seen = new Set()
  for (let n = 0; n < 400; n++) {
    const p = await page.evaluate(() => window.__probe())
    if (!seen.has(p.screen)) {
      seen.add(p.screen)
      await dumpText(page, p.screen)
      await shot(page, p.screen)
      console.log("  probe: " + JSON.stringify(p))
    }
    if (p.screen === "battle") {
      // burn all energy on card plays, then end the turn
      for (let m = 0; m < 10; m++) {
        const q = await page.evaluate(() => window.__probe())
        if (q.screen !== "battle" || q.hand.length === 0) break
        const before = q.energy + ":" + q.hand.length
        await press("i")
        const r = await page.evaluate(() => window.__probe())
        if (r.screen !== "battle") break
        if (r.energy + ":" + r.hand.length === before) await press("s") // couldn't play, try next
      }
      const q = await page.evaluate(() => window.__probe())
      if (q.screen === "battle") await press("j")
    } else if (p.screen === "reward") {
      await press("i") // take a card
    } else if (p.screen === "gameover" || p.screen === "win") {
      break
    } else {
      break
    }
  }
  const final = await page.evaluate(() => window.__probe())
  console.log("\nfinal probe: " + JSON.stringify(final))
  console.log("screens seen: " + [...seen].join(", "))

  // ---------- death path: never play a card, take every hit ----------
  await page.goto(BASE)
  await page.waitForTimeout(600)
  await page.evaluate(() => document.getElementById("canvas").focus())
  await press("i") // start

  let dead = false
  for (let n = 0; n < 40 && !dead; n++) {
    await press("j")
    const p = await page.evaluate(() => window.__probe())
    if (p.screen === "gameover") {
      dead = true
      console.log("\nreached gameover on turn " + p.turn + " (floor " + (p.floor + 1) + ")")
    }
  }
  if (dead) {
    await dumpText(page, "gameover")
    await shot(page, "gameover")
    await press("i") // retry
    const r = await page.evaluate(() => window.__probe())
    console.log("after retry I: " + JSON.stringify(r.screen) + " hp=" + r.pHp + " turn=" + r.turn)
    await press("j")
    await press("k") // deck view from the new run
    await press("k") // back
    await press("l") // to title
    const t = await page.evaluate(() => window.__probe())
    console.log("after L: " + JSON.stringify(t.screen))
  } else {
    console.log("!! never reached gameover")
  }

  console.log("console errors: " + (errors.length ? JSON.stringify(errors, null, 2) : "NONE"))
  await browser.close()
})().catch(e => { console.error(e); process.exit(1) })
