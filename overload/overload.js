/*
@title: Overload
@description: endless fall game. dodge the junk, survive the effects that break ur senses (flashing + spinning, fair warning)
@author: thisisnaman
@tags: ['arcade', 'reflexes', 'endless']
@addedOn: 2026-10-08
*/

/*
 *  O V E R L O A D
 *
 *  the idea: u are falling down this shaft and junk keeps coming up at u.
 *  the deeper u go the game starts cooking ur head — tunnel twist,
 *  breathing walls, strobing, mirror mode, inverted controls,
 *  double vision, static everywhere. eventually ur just drowning in all of it
 *
 *  controls (dont @ me):
 *    A / D ... steer left / right
 *    W ....... brake  (slower world, half points)
 *    S ....... dive   (double points, faster world)
 *    I ....... pause
 *    J ....... start / retry
 */

// sprite keys — just the single chars that go in the legend, nothin fancy
const hero = "p"
const gh = "g"
const warn = "!"
const nubL = "n"
const nubR = "N"
const block = "b"
const spike = "s"
const bar = "h"
const saw = "x"
const wall = "W"
const noise = "z"
const bgA = "A"
const bgB = "B"
const bgC = "C"
const bgD = "D"

// sprites. every one is 16x16 (sprig rule not mine), drawn mostly at 2am so dont judge
const bmpHero = bitmap`
................
................
....00000000....
...0666666660...
..066666666660..
..066222222660..
..066222222660..
..066666666660..
..066666666660..
...0666666660...
...0999999990...
....09999990....
.....009900.....
......0990......
.......00.......
................`

const bmpGhost = bitmap`
................
................
....00000000....
...0111111110...
..011111111110..
..011LLLLLL110..
..011LLLLLL110..
..011111111110..
..011111111110..
...0111111110...
...0LLLLLLLL0...
....0LLLLLL0....
.....00LL00.....
......0LL0......
.......00.......
................`

const bmpWarn = bitmap`
................
................
.......66.......
.......66.......
.......66.......
.......66.......
.......66.......
.......66.......
.......66.......
................
.......66.......
.......66.......
................
................
................
................`

const bmpNubL = bitmap`
333333333333....
33333333333333..
333333333333....
33333333333333..
333333333333....
33333333333333..
333333333333....
33333333333333..
333333333333....
33333333333333..
333333333333....
33333333333333..
333333333333....
33333333333333..
333333333333....
33333333333333..`

const bmpNubR = bitmap`
....333333333333
..33333333333333
....333333333333
..33333333333333
....333333333333
..33333333333333
....333333333333
..33333333333333
....333333333333
..33333333333333
....333333333333
..33333333333333
....333333333333
..33333333333333
....333333333333
..33333333333333`

const bmpBlock = bitmap`
0000000000000000
0999999999999990
0999999999999990
0999999999999990
0999900000099990
0999999999999990
0999999999999990
0999999999999990
0999999999999990
0999999999999990
0999999999999990
0999900000099990
0999999999999990
0999999999999990
0999999999999990
0000000000000000`

const bmpSpike = bitmap`
................
................
.......33.......
......3333......
.....333333.....
....33333333....
...3333333333...
..333333333333..
.33333333333333.
..333333333333..
...3333333333...
....33333333....
.....333333.....
......3333......
.......33.......
................`

const bmpBar = bitmap`
................
................
................
................
0000000000000000
0888888888888880
0888888888888880
0HHHHHHHHHHHHHH0
0888888888888880
0000000000000000
................
................
................
................
................
................`

const bmpSaw = bitmap`
.......99.......
......9999......
.....999999.....
....99999999....
...9999009999...
..999990099999..
..999999999999..
.99999999999999.
9999999999999999
.99999999999999.
..999999999999..
...9999999999...
....99999999....
.....999999.....
......9999......
.......99.......`

const bmpWall = bitmap`
L0L0L0L0L0L0L0L0
0L0L0L0L0L0L0L0L
L0L0L0L0L0L0L0L0
0L0L0L0L0L0L0L0L
L0L0L0L0L0L0L0L0
0L0L0L0L0L0L0L0L
L0L0L0L0L0L0L0L0
0L0L0L0L0L0L0L0L
L0L0L0L0L0L0L0L0
0L0L0L0L0L0L0L0L
L0L0L0L0L0L0L0L0
0L0L0L0L0L0L0L0L
L0L0L0L0L0L0L0L0
0L0L0L0L0L0L0L0L
L0L0L0L0L0L0L0L0
0L0L0L0L0L0L0L0L`

const bmpNoise = bitmap`
1L1L1L1L1L1L1L1L
L0L0L0L0L0L0L0L0
0101010101010101
L1L1L1L1L1L1L1L1
1L1L1L1L1L1L1L1L
L0L0L0L0L0L0L0L0
0101010101010101
L1L1L1L1L1L1L1L1
1L1L1L1L1L1L1L1L
L0L0L0L0L0L0L0L0
0101010101010101
L1L1L1L1L1L1L1L1
1L1L1L1L1L1L1L1L
L0L0L0L0L0L0L0L0
0101010101010101
L1L1L1L1L1L1L1L1`

const bmpBgA = bitmap`
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000`

const bmpBgB = bitmap`
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555`

const bmpBgC = bitmap`
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH`

const bmpBgD = bitmap`
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333`

// legend order = z-order, first entry gets drawn on top (yes i kept checking this)
const ENTRIES = [
    [hero, bmpHero],
    [gh, bmpGhost],
    [warn, bmpWarn],
    [nubL, bmpNubL],
    [nubR, bmpNubR],
    [block, bmpBlock],
    [spike, bmpSpike],
    [bar, bmpBar],
    [saw, bmpSaw],
    [wall, bmpWall],
    [noise, bmpNoise],
    [bgA, bmpBgA],
    [bgB, bmpBgB],
    [bgC, bmpBgC],
    [bgD, bmpBgD],
]

setLegend(...ENTRIES)

// the difficulty table. step = engine ticks per world step (lower = faster)
// spawn = chance a spawn attempt happens, fx = the effects this level can cook u w/
const LEVELS = [
    { n: "WARM-UP", step: 5, spawn: 0.30, fx: [] },
    { n: "SPIN CYCLE", step: 4, spawn: 0.38, fx: ["sway"] },
    { n: "STATIC", step: 4, spawn: 0.44, fx: ["noise", "palette"] },
    { n: "BREATH", step: 3, spawn: 0.50, fx: ["breathe", "sway", "noise"] },
    { n: "MIRRORS", step: 3, spawn: 0.56, fx: ["mirror", "invert", "palette", "breathe"] },
    { n: "MELTDOWN", step: 2, spawn: 0.62, fx: ["strobe", "ghost", "palette", "shake", "mirror"] },
    { n: "BLACKOUT", step: 2, spawn: 0.70, fx: ["noise", "breathe", "strobe", "mirror", "sway", "invert"] },
    { n: "OVERLOAD", step: 2, spawn: 0.80, fx: ["sway", "noise", "palette", "breathe", "mirror", "invert", "strobe", "ghost", "shake"] },
    { n: "!!", step: 2, spawn: 0.90, fx: ["sway", "noise", "palette", "breathe", "mirror", "invert", "strobe", "ghost", "shake"] },
]

// how deep (meters) before the next level kicks in
const GATE = [60, 160, 300, 480, 700, 960, 1260, 1600]

const HAZ = [block, spike, bar, saw, nubL, nubR]

// tunes, all midi pitches. the bgm one loops forever so it better not be annoying
const tBgm = tune`160:45-140,160:45-140,160:48-140,160:45-140,160:52-140,160:45-140,160:50-140,160:43-140`
const tStart = tune`50:60-40,50:64-40,50:67-40,140:72-130`
const tLevel = tune`70:72-60,70:76-60,70:79-60,180:84-170`
const tDeath = tune`90:57/80,90:53/80,90:50/80,320:45/300`
const tBlip = tune`60:90-50`
const tDive = tune`60:84-50`

// the world. instead of moving the hero down, the junk moves UP past u —
// same thing but way easier 2 write. walls on both sides, yep
const baseMap = map`W........W
W........W
W........W
W........W
W........W
W........W
W........W
W........W`

// state
const TICK = 50 // ms per engine tick

let st = "menu" // menu | play | pause | dead
let tickN = 0
let depth = 0
let level = 0
let best = 0
let stepPhase = 0
let brakeT = 0
let diveT = 0
let invertOn = false
let banner = ""
let bannerT = 0
let pending = [] // { x, t } — the "!" marks, become the real hazard on the next world step
let nubActive = []
let nubNext = []
let breathPhase = 0
let breathT = 0
let palIdx = 0
let swayDir = 1
let eff = {} // effect -> how many ticks left
let effOn = {} // which effects r on right now
let bgm = null

// setup — hero in the middle, walls r solid so u cant phase out of the screen
setMap(baseMap)
addSprite(4, 3, hero)
setBackground(bgA)
setSolids([hero, wall])

// the "palette" effect rotates every color in every sprite through this chain,
// 3->9->6->4->7->5->H->8->3 and back. kinda hypnotic if u stare at it too long lol
const ROT = { "3": "9", "9": "6", "6": "4", "4": "7", "7": "5", "5": "H", "H": "8", "8": "3", "1": "2", "2": "1" }

const rotateChar = (ch, idx) => {
    let c = ch
    for (let i = 0; i < idx; i++) c = ROT[c] || c
    return c
}

 // re-legend everything w/ the rotated colors
const applyPalette = (idx) => {
    setLegend(...ENTRIES.map(([k, src]) => {
        let out = ""
        for (const ch of src) out += rotateChar(ch, idx)
        return [k, out]
    }))
}

// little helpers, the boring stuff
 // only one hero on screen, getFirst is fine
const heroAt = () => getFirst(hero)

 // random col 1-8 (the walls r at 0 and 9)
const randCol = () => 1 + Math.floor(Math.random() * 8)

 // point mult — dive 2x, brake 0.5x, else normal
const multValue = () => (diveT > 0 ? 2 : (brakeT > 0 ? 0.5 : 1))

 // how many ticks between world steps right now
const effStep = () => {
    const base = LEVELS[level].step
    if (brakeT > 0) return base * 2
    if (diveT > 0) return Math.max(1, Math.round(base / 1.6))
    return base
}

// how the world moves
 // every step the hazards climb 1 row (aka u fell 1 row). off the top = bye
const moveWorld = () => {
    const obs = [...getAll(block), ...getAll(spike), ...getAll(bar), ...getAll(saw)]
    for (const s of obs) {
        if (s.y <= 0) s.remove()
        else s.y = s.y - 1
    }
}

 // the "!" marks on the bottom row finally become the real thing
const convertPending = () => {
    for (const w of pending) {
        clearTile(w.x, 7)
        addSprite(w.x, 7, w.t)
    }
    pending = []
}

 // try to seed new hazards at the bottom row
const maybeSpawn = () => {
    const L = LEVELS[level]
    const density = getAll(block).length + getAll(spike).length + getAll(bar).length + getAll(saw).length
    if (density > 22) return // screen full enough, skip (22 was a vibes number honestly)
    if (Math.random() > L.spawn) return
    const r = Math.random()
    if (r < 0.4) pending.push({ x: randCol(), t: block })
    else if (r < 0.65) pending.push({ x: randCol(), t: spike })
    else if (r < 0.9) {
        const a = 1 + Math.floor(Math.random() * 6) // leftmost of a 3-wide bar
        const gap = a + Math.floor(Math.random() * 3)
        for (let c = a; c <= a + 2; c++) if (c !== gap) pending.push({ x: c, t: bar })
    } else pending.push({ x: randCol(), t: saw })
    for (const w of pending) addSprite(w.x, 7, warn)
}

 // the sway/shake effect slides all the hazards sideways
const shiftObstacles = (d) => {
    const obs = [...getAll(block), ...getAll(spike), ...getAll(bar), ...getAll(saw)]
    for (const s of obs) {
        // only the hazards still approaching get twisted — anything at/past the player row
        // (y3) goes straight, otherwise it feels like the game is taunting u right before u die
        if (s.y <= 3) continue
        s.x = 1 + ((s.x - 1 + d + 8) % 8)
    }
}

// breathing walls — the nub rows close/open in turns. "!" marks show where the
// NEXT closing r, so a decent player has about 16 ticks to react
const toggleBreath = () => {
    for (const s of [...getAll(nubL), ...getAll(nubR)]) s.remove()
    // clear the old "!" marks so only the next pattern shows
    for (const s of getAll(warn)) if (s.x === 1 || s.x === 8) s.remove()
    nubActive = nubNext
    for (const r of nubActive) {
        addSprite(1, r, nubL)
        addSprite(8, r, nubR)
    }
    breathPhase = breathPhase ^ 1
    nubNext = []
    for (let r = 0; r < 8; r++) if ((r + breathPhase) % 3 === 0) nubNext.push(r)
    for (const r of nubNext) {
        addSprite(1, r, warn)
        addSprite(8, r, warn)
    }
}

 // walls back to open
const clearBreath = () => {
    for (const s of [...getAll(nubL), ...getAll(nubR)]) s.remove()
    for (const s of getAll(warn)) if (s.x === 1 || s.x === 8) s.remove()
    nubActive = []
    nubNext = []
}

// mirror = flip the whole world horizontally. cols wrap 0..9 so x becomes 9-x,
// the nubs swap L/R, and the pending spawn queue gets flipped too
const flipWorld = () => {
    for (const s of getAll()) {
        const wasL = s.type === nubL
        const wasR = s.type === nubR
        s.x = 9 - s.x
        if (wasL) s.type = nubR
        else if (wasR) s.type = nubL
    }
    pending = pending.map(w => ({ x: 9 - w.x, t: w.t }))
}

// effects. each one lasts 35-69 ticks then stops. if u dont pass a key it
// picks a random one from the current level's fx list
const startEffect = (k) => {
    const L = LEVELS[level]
    const key = k || L.fx[Math.floor(Math.random() * L.fx.length)]
    if (!key || effOn[key]) return
    effOn[key] = true
    eff[key] = 35 + Math.floor(Math.random() * 35)
    if (key === "breathe") {
        breathT = 16
        nubActive = []
        nubNext = []
        toggleBreath()
    } else if (key === "mirror") {
        flipWorld()
        banner = "MIRROR"
        bannerT = 30
        playTune(tBlip, 1)
    } else if (key === "invert") {
        invertOn = true
        banner = "?"
        bannerT = 30
        playTune(tBlip, 1)
    } else if (key === "sway") {
        swayDir = Math.random() < 0.5 ? -1 : 1
        banner = "TWIST"
        bannerT = 30
        playTune(tBlip, 1)
    } else if (key === "shake") {
        banner = "!!"
        bannerT = 30
        playTune(tBlip, 1)
    } else if (key === "strobe") {
        banner = "STROBE"
        bannerT = 30
        playTune(tBlip, 1)
    } else if (key === "noise") {
        banner = "STATIC"
        bannerT = 30
        playTune(tBlip, 1)
    } else if (key === "palette") {
        banner = "??"
        bannerT = 30
        playTune(tBlip, 1)
    } else if (key === "ghost") {
        banner = "DOUBLE"
        bannerT = 30
        playTune(tBlip, 1)
    }
}

 // cleanup when an effect ends — mirror flips back, palette resets, nubs vanish, etc
const stopEffect = (k) => {
    effOn[k] = false
    if (k === "palette") {
        palIdx = 0
        applyPalette(0)
    } else if (k === "strobe") {
        setBackground(bgA)
    } else if (k === "mirror") {
        flipWorld()
    } else if (k === "invert") {
        invertOn = false
    } else if (k === "breathe") {
        clearBreath()
    } else if (k === "noise") {
        for (const s of getAll(noise)) s.remove()
    } else if (k === "ghost") {
        for (const s of getAll(gh)) s.remove()
    }
}

 // keeps the screen from going silent. how many effects can run at once
 // scales w/ level (deeper = more chaos on screen at the same time)
const scheduleEffects = () => {
    const L = LEVELS[level]
    if (L.fx.length === 0) return
    const every = 90 - Math.min(level, 6) * 8
    if (tickN % every !== 0) return
    const want = level >= 4 ? 2 : 1
    let active = 0
    for (const k of Object.keys(effOn)) if (effOn[k]) active++
    let tries = 0
    while (active < want && tries < 4) {
        const k = L.fx[Math.floor(Math.random() * L.fx.length)]
        if (!effOn[k]) {
            startEffect(k)
            active++
        }
        tries++
    }
}

 // count down the effect timers, stop em when they hit 0
const tickEffects = () => {
    for (const k of Object.keys(eff)) {
        if (eff[k] > 0) {
            eff[k]--
            if (eff[k] === 0) stopEffect(k)
        }
    }
}

// death + level ups
const checkDeath = () => {
    if (st !== "play") return
    const h = heroAt()
    if (!h) return
    const tile = getTile(h.x, h.y)
    for (const s of tile) {
        if (HAZ.includes(s.type)) {
            die()
            return
        }
    }
}

const die = () => {
    st = "dead"
    best = Math.max(best, Math.floor(depth))
    if (bgm) {
        bgm.end()
        bgm = null
    }
    playTune(tDeath, 1)
}

const checkLevelUp = () => {
    if (level >= GATE.length) return
    if (depth >= GATE[level]) {
        level++
        banner = "LV" + (level + 1) + " " + LEVELS[level].n
        bannerT = 50
        playTune(tLevel, 1)
        setBackground(bgD)
        startEffect()
    }
}

// static + double vision
 // 2 static tiles pop in per tick, oldest one gets eaten when > 14 on screen
const sprinkleNoise = () => {
    for (let i = 0; i < 2; i++) {
        const x = randCol()
        const y = Math.floor(Math.random() * 8)
        const occupied = getTile(x, y).some(s => s.type === noise)
        if (!occupied) addSprite(x, y, noise)
    }
    const all = getAll(noise)
    if (all.length > 14) all[0].remove()
}

 // a ghost copy of the hero, 1 col over, 1 row behind.
 // alternates sides every 20 ticks so ur brain never adjusts
const refreshGhost = () => {
    for (const s of getAll(gh)) s.remove()
    const h = heroAt()
    if (!h) return
    const dx = Math.floor(tickN / 20) % 2 === 0 ? 1 : -1
    const gx = h.x + dx
    if (gx >= 1 && gx <= 8) addSprite(gx, Math.min(7, h.y + 1), gh)
}

// hud
const drawHud = () => {
    clearText()
    const L = LEVELS[level]
    addText("LV" + (level + 1) + " " + L.n, { x: 1, y: 0, color: "6" })
    const rs = Math.floor(depth) + "M"
    addText(rs, { x: 20 - rs.length, y: 0, color: "2" })
    if (bannerT > 0) {
        const bx = Math.max(0, Math.floor((21 - banner.length) / 2))
        addText(banner, { x: bx, y: 15, color: "8" })
    } else if (diveT > 0) {
        addText("x2 DIVE", { x: 1, y: 15, color: "9" })
    } else if (brakeT > 0) {
        addText("x0.5 BRAKE", { x: 1, y: 15, color: "7" })
    }
}

 // menu / dead / pause screens
const drawIdle = () => {
    clearText()
    if (st === "menu") {
        const blink = Math.floor(tickN / 20) % 2 === 0
        addText("OVERLOAD", { x: 6, y: 4, color: blink ? "6" : "8" })
        addText("A SENSORY DROPPER", { x: 2, y: 6, color: "7" })
        addText("J : DROP IN", { x: 5, y: 9, color: "2" })
        addText("A/D STEER  W BRAKE", { x: 1, y: 11, color: "1" })
        addText("S DIVE  I PAUSE", { x: 2, y: 12, color: "1" })
        addText("WARNING: SPIN + FLASH", { x: 0, y: 14, color: "3" })
        if (best > 0) addText("BEST " + best + "M", { x: 6, y: 15, color: "4" })
    } else if (st === "dead") {
        addText("SIGNAL LOST", { x: 5, y: 5, color: "3" })
        addText(Math.floor(depth) + "M", { x: 9, y: 7, color: "6" })
        addText("BEST " + best + "M", { x: 6, y: 8, color: "1" })
        addText("REACHED LV" + (level + 1), { x: 5, y: 10, color: "7" })
        addText("J : RETRY", { x: 6, y: 13, color: "2" })
    } else if (st === "pause") {
        addText("PAUSED", { x: 7, y: 7, color: "6" })
        addText("I : RESUME", { x: 5, y: 9, color: "2" })
    }
}

// wipe everything + drop back in
const resetGame = () => {
    palIdx = 0
    applyPalette(0)
    setBackground(bgA)
    eff = {}
    effOn = {}
    invertOn = false
    pending = []
    nubActive = []
    nubNext = []
    breathPhase = 0
    depth = 0
    level = 0
    stepPhase = 0
    brakeT = 0
    diveT = 0
    banner = ""
    bannerT = 0
    setMap(baseMap)
    addSprite(4, 3, hero)
    st = "play"
    banner = "DROP!"
    bannerT = 30
    if (bgm) bgm.end()
    bgm = playTune(tBgm, Infinity)
    playTune(tStart, 1)
}

// the main loop, runs every TICK ms
const tickPlay = () => {
    if (bannerT > 0) bannerT--
    if (bannerT === 42 && !effOn.strobe) setBackground(bgA)
    if (brakeT > 0) brakeT--
    if (diveT > 0) diveT--

    tickEffects()

    stepPhase--
    if (stepPhase <= 0) {
        stepPhase = effStep()
        moveWorld()
        convertPending()
        maybeSpawn()
        depth += multValue()
        checkLevelUp()
    }

    if (effOn.breathe) {
        breathT--
        if (breathT <= 0) {
            breathT = 16
            toggleBreath()
        }
    }

    if (effOn.sway && tickN % 2 === 0) shiftObstacles(swayDir)
    if (effOn.shake && tickN % 4 < 2) shiftObstacles(tickN % 8 < 4 ? 1 : -1)

    if (effOn.noise && tickN % 2 === 0) sprinkleNoise()
    if (effOn.ghost) refreshGhost()

    // strobe just cycles the 4 bg colors in a fixed order every 10 ticks
    if (effOn.strobe && tickN % 10 === 0) {
        const cyc = [bgB, bgC, bgD, bgA]
        setBackground(cyc[Math.floor(tickN / 10) % 4])
    }
    // palette rotates the sprites through the chain every 10 ticks, 6 rounds before it loops
    if (effOn.palette && tickN % 10 === 0) {
        palIdx = (palIdx + 1) % 6
        applyPalette(palIdx)
    }

    scheduleEffects()
    checkDeath()
    drawHud()
}

setInterval(() => {
    tickN++
    if (st === "play") tickPlay()
    else drawIdle()
    // little debug hook, lets me peek at state from the console while testing
    globalThis.__overload = {
        st: st,
        depth: Math.floor(depth),
        level: level,
        best: best,
        fx: Object.keys(effOn).filter(k => effOn[k]).join(","),
    }
}, TICK)

// input
 // a/d steer. when the invert effect is on the dir flips — that's the whole point of it
const steer = (dir) => {
    if (st !== "play") return
    const h = heroAt()
    if (!h) return
    const sign = invertOn ? -dir : dir
    h.x = h.x + sign
    checkDeath()
}

onInput("a", () => steer(-1))
onInput("d", () => steer(1))

 // w = brake normally, BUT when the invert effect is on the actions swap —
 // so when inverted W is dive and S is brake. the "invert" banner shows up
 // before u notice, that's kinda the whole point of the game fr
onInput("w", () => {
    if (st !== "play") return
    const isDive = invertOn
    if (isDive) {
        if (diveT === 0) playTune(tDive, 1)
        diveT = 8
    } else {
        if (brakeT === 0) playTune(tBlip, 1)
        brakeT = 10
    }
})

 // s = dive normally, becomes brake when inverted (see above)
onInput("s", () => {
    if (st !== "play") return
    const isDive = !invertOn
    if (isDive) {
        if (diveT === 0) playTune(tDive, 1)
        diveT = 8
    } else {
        if (brakeT === 0) playTune(tBlip, 1)
        brakeT = 10
    }
})

onInput("i", () => {
    if (st === "play") st = "pause"
    else if (st === "pause") st = "play"
})

onInput("j", () => {
    if (st === "menu" || st === "dead") resetGame()
    else if (st === "pause") st = "play"
})
