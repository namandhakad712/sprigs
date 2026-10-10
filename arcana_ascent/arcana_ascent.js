/* ================================================================
   ARCANA ASCENT                              v2.0 -- full rewrite
   a deckbuilding roguelite for the Sprig console
   ----------------------------------------------------------------
   ok so heres the deal. you climb a tower, 5 floors, and every
   floor has some guardian that wants to ruin your day. each time
   you dunk one of them u get to draft a new card into ur deck.
   build something completely broken, try not to die, and yeet the
   lich off the top floor. thats the whole game tbh.

   CONTROLS   (i forget them half the time too so im writing them)
     W / S ... move the cursor up / down
     A / D ... same thing, other axis, deal with it
     I ....... play card / confirm / start the whole game
     J ....... end ur turn
     K ....... look at ur piles  (or skip a reward)
     L ....... back to the title screen

   @title        Arcana Ascent
   @author       TODO put my username here later
   @description  Climb a 5-floor tower, draft a card after every guardian, outlast the Lich.
   @tags         roguelite, cards, turn-based
   @addedOn      2026-10-10
   ================================================================ */


// ---------- SPRITES --------------------------------------------
// spent an embarrassing amount of time on these. the lich goes
// hard tho ngl, the slime is just a blob and im not sorry
const SLIME = "s"
const BAT = "t"     // t for bat. dont ask, its too late to change it
const GOLEM = "g"
const NECRO = "n"
const LICH = "l"
const BG = "f"      // the floor / background thing

setLegend(
  [BG, bitmap`
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
0000000000000000`],
  [SLIME, bitmap`
................
................
................
................
................
.....444444.....
....44444444....
...4444444444...
...4400440044...
...4444444444...
...4444444444...
..444444444444..
..444444444444..
...DDDDDDDDDD...
................
................`],
  [BAT, bitmap`
................
................
................
..H..........H..
..HH........HH..
...HH......HH...
....HHHHHHHH....
....HH6HH6HH....
.....HHHHHH.....
......HHHH......
.......HH.......
................
................
................
................
................`],
  [GOLEM, bitmap`
................
................
....11111111....
...1111111111...
..111111111111..
..111011110111..
..111111111111..
.11111111111111.
.11111111111111.
.11.11111111.11.
.11.11111111.11.
..111111111111..
...1111111111...
....LLLLLLLL....
................
................`],
  [NECRO, bitmap`
................
....HHHHHHHH....
...HHHHHHHHHH...
..HHH222222HHH..
..HHH232232HHH..
..HHH222222HHH..
..HHH200002HHH..
...HH222222HH...
..HHHHHHHHHHHH..
.HHHHHHHHHHHHHH.
.HHHHHHHHHHHHHH.
.HHH.HHHHHH.HHH.
HHHH.HHHHHH.HHHH
HHHHHHHHHHHHHHHH
................
................`],
  [LICH, bitmap`
................
...6..6..6..6...
...6666666666...
....22222222....
....22322322....
....22222222....
....22000022....
.....222222.....
...HHHHHHHHHH...
..HHHHHHHHHHHH..
.HHHHHHHHHHHHHH.
.HHHHHHHHHHHHHH.
.HHH.HHHHHH.HHH.
HHHH.HHHHHH.HHHH
HHHHHHHHHHHHHHHH
................`]
)

const BLANK_MAP = map`
..........
..........
..........
..........
..........
..........
..........
..........`

setBackground(BG)


// ---------- SOUNDS ---------------------------------------------
// format is:  <stepMs>: <pitch><instrument><noteMs>   comma = next
// instruments:  ~ sine   - square   ^ triangle   / sawtooth
// (sound design is mid, i know, fight me)
const sndPick = tune`80: c6^60`
const sndPlay = tune`70: e5^60, 70: g5^60`
const sndHit  = tune`70: a4-60, 70: f4-60`
const sndBlock= tune`70: g4^60, 70: d4^60`
const sndHeal = tune`70: c5^60, 70: e5^60`
const sndBad  = tune`70: f4-60, 70: d4-60`
const sndWin  = tune`70: c5^60, 70: e5^60, 140: g5^120`
const sndLose = tune`140: g4-120, 200: c4-180`


// ---------- CARDS ----------------------------------------------
// c = energy cost, k = the card kind (atk/blk/ven/drn/heal), v is
// the number that actually matters. e is the little tag shown on
// screen and d is the flavor text that nobody reads
const CARDS = {
   strike: { n: "STRIKE", c: 1, k: "atk", v: 6,  e: "D6",  d: "Deal 6 damage." },
   defend: { n:"DEFEND", c:1, k:"blk", v:5, e:"B5", d:"Gain 5 block." },
   bash:   { n: "BASH",   c: 2, k: "atk", v: 10, e: "D10", d: "Deal 10 damage." },
   jab:    { n: "JAB", c: 0, k: "atk", v: 3, e: "D3", d: "Deal 3 damage." },   // FREE DAMAGE BABEY
   heavy:  { n: "HEAVY", c: 2, k: "atk", v: 14, e: "D14", d: "Deal 14 damage." },
   wall:   { n: "WALL", c: 2, k: "blk", v: 12, e: "B12", d: "Gain 12 block." },
   venom:  { n: "VENOM", c: 1, k: "ven", v: 4, e: "D4 P4", d: "4 dmg + 4 poison." },
   drain:  { n: "DRAIN", c: 1, k: "drn", v: 5, e: "D5 H3", d: "5 dmg, heal 3." },
   mend:   { n:"MEND", c:1, k:"heal", v:7, e:"H7", d:"Heal 7 HP." },
   fire:   { n: "FIRE", c: 2, k: "atk", v: 9, e: "D9", d: "Deal 9 damage." },
}

// cards that can show up as a reward. strike/defend/bash arent in
// here bcz u already start with a million of them
const REWARD_POOL = ["jab", "heavy", "wall", "venom", "drain", "mend", "fire", "bash"]

// the deck every run starts with. 4 strikes, 4 defends, one bash.
// its the most average starter deck ever made and i love it
const STARTER = ["strike","strike","strike","strike",
                 "defend","defend","defend","defend", "bash"]


// ---------- ENEMIES --------------------------------------------
// the 5 guardians in order. mv is their move pattern and they just
// loop it forever, writing real AI was NOT on the todolist lmao
const ENEMIES = [
  { n: "SLIME", spr: SLIME, hp: 18, mv: [{k:"atk",v:5}, {k:"atk",v:5}, {k:"blk",v:4}] },
  { n: "BAT", spr: BAT, hp: 26, mv: [{ k: "atk", v: 7 }, { k: "atk", v: 5 }, { k: "atk", v: 7 }] },
  { n: "GOLEM", spr: GOLEM, hp: 36, mv: [{ k: "blk", v: 8 }, { k: "atk", v: 12 }, { k: "atk", v: 9 }] },
  { n: "NECRO", spr: NECRO, hp: 34, mv: [{ k: "atk", v: 7 }, { k: "heal", v: 8 }, { k: "atk", v: 10 }] },
  { n: "LICH", spr: LICH, hp: 50, mv: [{ k: "atk", v: 11 }, { k: "blk", v: 12 }, { k: "atk", v: 15 }, { k: "heal", v: 8 }] },
]


// ---------- STATE ----------------------------------------------
// every variable i was too lazy to shove into one single object
let screen   = "title"     // title / battle / reward / deck / gameover / win
let floor    = 0           // 0..4, shown as 1..5 bcz zero-indexing is a crime
let deck     = []          // every card u own
let drawPile = []          // whats left to draw
let discard  = []          // the graveyard
let hand     = []          // whats in ur grubby hands rn
let cursor   = 0           // which card the > is pointing at
let energy   = 3           // 3 per turn, do not question the economy
let pBlk     = 0           // player block
let pHp      = 32          // player hp
let pMaxHp   = 32
let turn     = 1
let e        = null        // the current guardian (e = enemy, creative i KNOW)
let msg      = ""          // the big status line near the bottom
let rewardCards = []
let rewardHeal  = 0
let rCursor  = 0
let tab      = 0           // which tab of the deck viewer ur staring at


// ---------- HELPERS --------------------------------------------
// shorter addText wrapper, bcz typing {x:..,y:..,color:..} like 900
// times was genuinely making me wanna pass away
function txt(s, x, y, c) {
  addText(s, { x: x, y: y, color: c })
}

// shuffles an array in place. fisher-yates or watever its called,
// i grabbed it off stackoverflow years ago and its never failed me
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var t = a[i]
        a[i] = a[j]
        a[j] = t
    }
    return a
}

// builds a dumb little text bar like ###--- so hp is readable at
// a glance instead of just being two sad numbers
function bar(hp, max, len) {
  let f = Math.ceil((len * hp) / max)
  if (hp > 0 && f < 1) f = 1
  if (f > len) f = len
  if (hp <= 0) f = 0
  return "#".repeat(f) + "-".repeat(len - f)
}

// turns ["strike","strike","defend"] into ["STRIKE x2","DEFEND x1"]
function counts(arr) {
  const seen = {}
  const order = []
  for (let i = 0; i < arr.length; i++) {
    const id = arr[i]
    if (!(id in seen)) {
      seen[id] = 0
      order.push(id)
    }
    seen[id]++
  }
  const out = []
  for (let i = 0; i < order.length; i++)
  {
    out.push(CARDS[order[i]].n + " x" + seen[order[i]])
  }
  return out
}

// draws n cards off the top. reshuffles the discard into the draw
// pile when it runs dry. if BOTH are empty ur just out of luck
function draw(n) {
  for (let i = 0; i < n; i++) {
    if (drawPile.length === 0) {
      if (discard.length === 0) return
      drawPile = shuffle(discard)
      discard = []
    }
    hand.push(drawPile.pop())
  }
}

// pretty sure nothing calls this anymore but im too scared to
// delete it in case something somewhere does. it stays
function dump(o) {
  // console.log(JSON.stringify(o))   <- disabled, sprig got no console
  return o
}


// ---------- FLOW -----------------------------------------------
function startRun() {
  deck = STARTER.slice()
  pHp = pMaxHp
  floor = 0
  startBattle()
}

function startBattle() {
  const spec = ENEMIES[floor]
  e = {
    n: spec.n,  spr: spec.spr,
    hp: spec.hp, max: spec.hp,
    blk: 0,      psn: 0,
    mv: spec.mv, mi: 0,
  }
  drawPile = shuffle(deck.slice())
  discard = []
  hand = []
  energy = 3
  pBlk  = 0
  turn  = 1
  cursor = 0
  msg = "YOUR TURN"
  draw(4)
  screen = "battle"
}

// deals damage to the guardian. their block eats the hit first and
// then whatever leaks thru goes straight to hp. returns the little
// status string that gets slapped on screen
function hitEnemy(v) {
  const abs = Math.min(e.blk, v)
  e.blk -= abs
  const dmg = v - abs
  e.hp -= dmg
  playTune(sndHit)
  if (dmg <= 0) return "BLOCKED!"
  if (abs > 0) return "HIT " + v + ", " + abs + " BLKD"
  return "HIT FOR " + v
}

// plays whatever card the cursor is currently sitting on. if u got
// no energy for it it just yells at u, which is fair
function playCard() {
  if (hand.length == 0) {
    msg = "NO CARDS IN HAND"
    playTune(sndBad)
    return
  }

  const id = hand[cursor]
  const c = CARDS[id]

  if (energy < c.c) {
    msg = "NOT ENOUGH ENERGY"
    playTune(sndBad)
    return
  }

  energy -= c.c
  hand.splice(cursor, 1)
  discard.push(id)

  let snd = sndPlay
  if (c.k === "atk") {
      msg = hitEnemy(c.v)
  } else if (c.k === "blk") {
      pBlk += c.v
      msg = "GAIN " + c.v + " BLOCK"
      snd = sndBlock
  } else if (c.k==="ven") {
      hitEnemy(c.v)
      e.psn += c.v
      msg = c.v + " DMG + " + c.v + " POISON"
  } else if (c.k === "drn") {
      hitEnemy(c.v)
      const h = Math.min(3, pMaxHp - pHp)
      pHp += h
      msg = "DRAINED " + h + " HP"
      snd = sndHeal
  } else if (c.k == "heal") {
      const h = Math.min(c.v, pMaxHp - pHp)
      pHp += h
      msg = "HEALED " + h + " HP"
      snd = sndHeal
  }

  if (cursor >= hand.length) cursor = Math.max(0, hand.length - 1)
  if (e.hp <= 0) winBattle()
  else playTune(snd)
}

// ends the players turn and lets the guardian do their thing.
// NOTE: poison ticks BEFORE they move, that detail has saved my
// life exactly one time and ive never forgotten it since
function endTurn() {
  if (hand.length > 0) {
    discard = discard.concat(hand)
    hand = []
  }
  cursor = 0

  // poison bite first
  if (e.psn > 0) {
    e.hp -= e.psn
    msg = "POISON -" + e.psn
    e.psn--
    if (e.hp <= 0) {
      winBattle()
      return
    }
  }

  e.blk = 0            // guardian block resets every turn, same as urs
  const mv = e.mv[e.mi]
  let snd = sndPick

  if (mv.k === "atk") {
    const abs = Math.min(pBlk, mv.v)
    pBlk -= abs
    const dmg = mv.v - abs
    pHp -= dmg
    if (dmg <= 0) msg = "BLOCKED ALL"
    else if (abs > 0) msg = "BLOCKED " + abs + ", -" + dmg + " HP"
    else msg = e.n + " HITS " + mv.v
    snd = sndHit
    if (pHp <= 0) {
      pHp = 0
      gameOver()
      return
    }
  } else if (mv.k === "blk") {
    e.blk += mv.v
    msg = e.n + " BLOCKS " + mv.v
    snd = sndBlock
  } else if (mv.k === "heal") {
    e.hp = Math.min(e.max, e.hp + mv.v)
    msg = e.n + " HEALS " + mv.v
    snd = sndHeal
  }

  e.mi = (e.mi + 1) % e.mv.length
  pBlk = 0
  energy = 3
  turn++
  draw(4)
  playTune(snd)
}

// called the second a guardian hits 0 hp. top floor means u just
// won the whole run, otherwise u get a tiny heal + the card draft
function winBattle() {
  e.hp = 0
  if (floor >= ENEMIES.length - 1) {
    screen = "win"
    playTune(sndWin)
    return
  }
  rewardHeal = Math.min(4, pMaxHp - pHp)
  pHp += rewardHeal
  rewardCards = shuffle(REWARD_POOL.slice()).slice(0, 3)
  rCursor = 0
  screen = "reward"
  playTune(sndWin)
}

function takeCard() {
  deck.push(rewardCards[rCursor])
  floor++
  startBattle()
  playTune(sndWin)
}

// skipping a card tops u up 6 hp instead. yes its the worse deal,
// thats the entire point. take the card u coward
function skipCard() {
  pHp = Math.min(pMaxHp, pHp + 6)
  floor++
  startBattle()
  playTune(sndPick)
}

function gameOver() {
  screen = "gameover"
  playTune(sndLose)
}


// ---------- SCREENS --------------------------------------------
// every screen is honestly just a function that vomits text onto
// the grid. 20 wide x 16 tall is all we got so its all crammed in
function drawTitle() {
  txt("ARCANA ASCENT", 3, 2, color`6`)
  txt("DRAFT CARDS.", 0, 4, color`2`)
  txt("CLIMB 5 FLOORS.", 0, 5, color`2`)
  txt("W/S:pick  I:play", 0, 7, color`1`)
  txt("J:end  K:deck", 0, 8, color`1`)
  txt("BLOCK SOAKS HITS", 0, 10, color`7`)
  txt("POISON DRAINS HP", 0, 11, color`8`)
  txt("PRESS I TO START", 0, 13, color`4`)
  txt("good luck lol", 0, 14, color`3`)
}

function drawBattle() {
  const mv = e.mv[e.mi]
  const mvTxt = mv.k === "atk" ? "ATK " + mv.v : mv.k === "blk" ? "BLK " + mv.v : "HEAL " + mv.v

  txt(e.n + "  F" + (floor + 1) + "/5", 0, 0, color`3`)
  txt("HP " + bar(e.hp, e.max, 6) + " " + e.hp + "/" + e.max, 0, 1, color`3`)
  txt("NEXT: " + mvTxt, 0, 2, color`9`)

  // enemy statuses, jammed together on one line if they got both
  let st = ""
  if (e.blk > 0) st += "BLK " + e.blk
  if (e.psn > 0) st += (st ? "  " : "") + "POISON " + e.psn
  if (st) txt(st, 0, 3, color`7`)

  txt("YOU " + pHp + "/" + pMaxHp + "  BLK " + pBlk, 0, 4, color`4`)
  txt("ENERGY " + energy + "/3  DRAW " + drawPile.length, 0, 5, color`6`)
  const t = "TURN " + turn
  txt(t, 20 - t.length, 6, color`1`)
  txt("HAND  DISCARD " + discard.length, 0, 7, color`1`)

  // the hand list. whatever card the cursor is on gets the > and
  // turns yellow so u know which one ur about to yeet
  for (let i = 0; i < hand.length; i++) {
    const c = CARDS[hand[i]]
    const row = (i === cursor ? ">" : " ") + c.n.padEnd(8) + c.c + "E "
    txt(row + c.e, 0, 8 + i, i === cursor ? color`6` : color`2`)
  }

  if (hand.length === 0) txt("HAND EMPTY - PRESS J", 0, 13, color`1`)
  else txt(CARDS[hand[cursor]].d, 0, 13, color`1`)

  txt(msg, 0, 14, color`7`)
  txt("I:play J:end K:deck", 0, 15, color`1`)
}

function drawReward() {
  txt("FLOOR " + (floor + 1) + " CLEARED!", 0, 0, color`6`)
  txt(rewardHeal > 0 ? "RECOVERED " + rewardHeal + " HP" : "HP ALREADY FULL", 0, 1, color`4`)
  txt("PICK A CARD:", 0, 3, color`2`)
  for (let i = 0; i < rewardCards.length; i++) {
    const c = CARDS[rewardCards[i]]
    const row = (i === rCursor ? ">" : " ") + c.n.padEnd(8) + c.c + "E "
    txt(row + c.e, 0, 5 + i, i === rCursor ? color`6` : color`2`)
  }
  txt(CARDS[rewardCards[rCursor]].d, 0, 9, color`1`)
  txt("DECK SIZE: " + deck.length, 0, 11, color`1`)
  txt("I:take  K:skip +6HP", 0, 13, color`4`)
  txt("W/S:pick card", 0, 15, color`1`)
}

function drawDeck() {
  let title = ""
  let list  = []
  if (tab === 0) {
    title = "YOUR DECK (" + deck.length + ")"
    list = counts(deck)
  } else if (tab === 1) {
    title = "DRAW PILE (" + drawPile.length + ")"
    list = counts(drawPile)
  } else {
    title = "DISCARD (" + discard.length + ")"
    list = counts(discard)
  }

  txt(title, 0, 0, color`6`)
  if (list.length === 0) txt("(empty)", 0, 3, color`1`)
  for (let i = 0; i < list.length && i < 11; i++) txt(list[i], 0, 3 + i, color`2`)

  if (tab === 0) txt("DRAW " + drawPile.length + "  DISCARD " + discard.length, 0, 14, color`1`)
  else if (tab === 1) txt("DECK " + deck.length + "  DISCARD " + discard.length, 0, 14, color`1`)
  else txt("DECK " + deck.length + "  DRAW " + drawPile.length, 0, 14, color`1`)
  txt("A/D:tabs  K:back", 0, 15, color`1`)
}

function drawOver() {
  txt("YOU DIED", 6, 4, color`3`)
  txt("REACHED FLOOR " + (floor + 1) + "/5", 0, 6, color`2`)
  txt("DECK SIZE: " + deck.length, 0, 8, color`1`)
  txt("I:retry  L:title", 0, 12, color`4`)
}

function drawWin() {
  txt("TOWER CLEARED!", 3, 3, color`6`)
  txt("THE LICH IS GONE", 0, 5, color`2`)
  txt("FINAL DECK: " + deck.length, 0, 7, color`1`)
  txt("I:again  L:title", 0, 12, color`4`)
}

function refresh() {
  setMap(BLANK_MAP)

  // slap a sprite or two on there so the map aint totally blank
  if (screen === "title") {
    addSprite(0, 0, SLIME)
    addSprite(9, 0, LICH)
  } else if (screen === "battle" || screen === "gameover") {
    addSprite(9, 0, e.spr)
  } else if (screen === "win") {
    addSprite(9, 0, LICH)
  }

  clearText()
  if (screen === "title") drawTitle()
  else if (screen === "battle") drawBattle()
  else if (screen === "reward") drawReward()
  else if (screen === "deck") drawDeck()
  else if (screen === "gameover") drawOver()
  else if (screen === "win") drawWin()
}


// ---------- INPUT ----------------------------------------------
// sprig does NOT repaint the screen for u, every handler has to do
// it itself. wrapping it all in handle() bcz there was genuinely NO
// way i was pasting refresh() in there 6 times without breaking it
function handle(fn) {
  return function () {
    try {
      fn()
    } finally {
      refresh()
    }
  }
}

function moveCursor(d) {
  if (screen === "battle") {
    if (hand.length > 0) cursor = (cursor + d + hand.length) % hand.length
    playTune(sndPick)
  } else if (screen === "reward") {
    rCursor = (rCursor + d + rewardCards.length) % rewardCards.length
    playTune(sndPick)
  } else if (screen === "deck") {
    tab = (tab + d + 3) % 3
    playTune(sndPick)
  }
}

onInput("w", handle(() => moveCursor(-1)))
onInput("a", handle(() => moveCursor(-1)))
onInput("s", handle(() => moveCursor(1)))
onInput("d", handle(() => moveCursor(1)))

onInput("i", handle(() => {
  if (screen === "title" || screen === "gameover" || screen === "win") {
    startRun()
    playTune(sndWin)
  } else if (screen === "battle") {
    playCard()
  } else if (screen === "reward") {
    takeCard()
  } else if (screen === "deck") {
    screen = "battle"
    playTune(sndPick)
  }
}))

onInput("j", handle(() => {
  if (screen === "battle") endTurn()
}))

onInput("k", handle(() => {
  if (screen === "battle") {
    screen = "deck"
    tab = 0
    playTune(sndPick)
  } else if (screen === "deck") {
    screen = "battle"
    playTune(sndPick)
  } else if (screen === "reward") {
    skipCard()
  }
}))

onInput("l", handle(() => {
  if (screen !== "title") {
    screen = "title"
    playTune(sndPick)
  }
}))

refresh()
