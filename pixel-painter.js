// Pixel Painter - Generative Art Game
// @title: Pixel Painter
// @description: Place colored tiles and watch them evolve into living art!
// @tags: ['sandbox', 'simulation', 'art']
// @author: sprig

const cur = "c"
const rd = "r"
const bl = "b"
const gn = "g"
const yw = "y"

setLegend(
  [cur, bitmap`
................
................
................
......9999......
.....9....9.....
....9.9999.9....
...9.9....9.9...
..9..9....9..9..
..9..9....9..9..
...9.9....9.9...
....9.9999.9....
.....9....9.....
......9999......
................
................
................`],
  [rd, bitmap`
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
  [bl, bitmap`
1111111111111111
................
1111111111111111
................
1111111111111111
................
1111111111111111
................
1111111111111111
................
1111111111111111
................
1111111111111111
................
1111111111111111
................`],
  [gn, bitmap`
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
0000000000000000
0000000000000000
0000000000000000
0000000000000000
2222222222222222
2222222222222222
2222222222222222
2222222222222222`],
  [yw, bitmap`
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
0000000000000000
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333`],
)

setSolids([])

const W = 16
const H = 16
const cols = [rd, bl, gn, yw]
const sfx = [tune`C4~`, tune`E4~`, tune`G4~`, tune`C5~`]

let mapData = []
for (let y = 0; y < H; y++) {
  let row = ""
  for (let x = 0; x < W; x++) row += "."
  mapData.push(row)
}

let curX = 8
let curY = 8
let state = "title"
let timeLeft = 120
let evoTimer = null
let tickTimer = null

function refreshMap() {
  setMap(mapData.join("\n"))
  addSprite(curX, curY, cur)
}

function startGame() {
  state = "playing"
  clearText()
  for (let y = 0; y < H; y++) {
    let row = ""
    for (let x = 0; x < W; x++) row += "."
    mapData[y] = row
  }
  curX = 8
  curY = 8
  refreshMap()
  timeLeft = 120

  evoTimer = setInterval(() => {
    if (state !== "playing") return
    const next = mapData.map(r => r.split(""))
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const cell = mapData[y][x]
        if (cell === ".") continue
        let same = 0
        const empties = []
        if (y > 0) {
          if (mapData[y - 1][x] === cell) same++
          else if (mapData[y - 1][x] === ".") empties.push([x, y - 1])
        }
        if (y < H - 1) {
          if (mapData[y + 1][x] === cell) same++
          else if (mapData[y + 1][x] === ".") empties.push([x, y + 1])
        }
        if (x > 0) {
          if (mapData[y][x - 1] === cell) same++
          else if (mapData[y][x - 1] === ".") empties.push([x - 1, y])
        }
        if (x < W - 1) {
          if (mapData[y][x + 1] === cell) same++
          else if (mapData[y][x + 1] === ".") empties.push([x + 1, y])
        }
        if (same >= 2 && empties.length > 0 && Math.random() < 0.35) {
          const [nx, ny] = empties[Math.floor(Math.random() * empties.length)]
          next[ny][nx] = cell
        }
        if (same === 0 && Math.random() < 0.08) {
          next[y][x] = "."
        }
      }
    }
    for (let y = 0; y < H; y++) mapData[y] = next[y].join("")
    refreshMap()
  }, 2500)

  tickTimer = setInterval(() => {
    if (state !== "playing") return
    timeLeft--
    if (timeLeft <= 0) endGame()
  }, 1000)
}

function placeColor(idx) {
  if (state !== "playing") return
  mapData[curY] = mapData[curY].substring(0, curX) + cols[idx] + mapData[curY].substring(curX + 1)
  refreshMap()
  playTune(sfx[idx])
}

function endGame() {
  state = "gameover"
  clearInterval(evoTimer)
  clearInterval(tickTimer)
  clearText()
  let total = 0
  const seen = {}
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = mapData[y][x]
      if (c !== ".") {
        total++
        seen[c] = true
      }
    }
  }
  const numColors = Object.keys(seen).length
  const score = total * numColors
  addText("GAME OVER", { x: 3, y: 3, color: color`1` })
  addText("Score: " + score, { x: 4, y: 6, color: color`3` })
  addText("Colors: " + numColors + " / 4", { x: 3, y: 8, color: color`4` })
  addText("Tiles: " + total, { x: 4, y: 10, color: color`2` })
  addText("Remix to play again!", { x: 2, y: 13, color: color`1` })
}

// Set initial map so the canvas renders (white background)
setMap(mapData.join("\n"))

// Title screen
addText("PIXEL PAINTER", { x: 2, y: 5, color: color`3` })
addText("I=Red J=Blue K=Green L=Yellow", { x: 0, y: 8, color: color`1` })
addText("Watch them evolve!", { x: 2, y: 10, color: color`2` })
addText("Press any key to start", { x: 1, y: 13, color: color`1` })

// Input handlers
onInput("w", () => {
  if (state === "title") { startGame(); return }
  if (state !== "playing") return
  curY = Math.max(0, curY - 1)
  refreshMap()
})
onInput("s", () => {
  if (state === "title") { startGame(); return }
  if (state !== "playing") return
  curY = Math.min(H - 1, curY + 1)
  refreshMap()
})
onInput("a", () => {
  if (state === "title") { startGame(); return }
  if (state !== "playing") return
  curX = Math.max(0, curX - 1)
  refreshMap()
})
onInput("d", () => {
  if (state === "title") { startGame(); return }
  if (state !== "playing") return
  curX = Math.min(W - 1, curX + 1)
  refreshMap()
})
onInput("i", () => {
  if (state === "title") { startGame(); return }
  placeColor(0)
})
onInput("j", () => {
  if (state === "title") { startGame(); return }
  placeColor(1)
})
onInput("k", () => {
  if (state === "title") { startGame(); return }
  placeColor(2)
})
onInput("l", () => {
  if (state === "title") { startGame(); return }
  placeColor(3)
})
