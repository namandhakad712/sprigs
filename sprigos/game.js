// 🌙 SprigOS v1.0 — paste in sprig editor and RUN
// controls: W/S up down, I select, K back, L restart
// tbh this started as a joke and now its a whole os lol

setLegend(
  ["f", bitmap`2222 2222 2222 2222`],
  ["w", bitmap`0000 0000 0000 0000`],
  ["p", bitmap`..22 ..22 ..22 ....`]
)

setSolids(["w"])
setBackground("f")

setMap(map`
  wwwwffffww
  wffffffffw
  wffffffffw
  wffffffffw
  wffffffffw
  wffffffffw
  wffffffffw
  wffffffffw
  wffffffffw
  wwwwffffww
`)

// sounds. the hack fail one is supposed 2 sound like a buzzer idk if it does
const sfxClick = tune`c4:1`
const sfxOpen = tune`c4:1 e4:1`
const sfxSuccess = tune`c4:1 e4:1 g4:2`
const sfxEnter = tune`c4:1 e4:1 g4:1 c5:2`
const sfxBack = tune`g4:1 c4:1`
const sfxHackFail = tune`a4:2 f4:2`

let screen = "desktop"
let cursor = 0
let hackCursor = 0
let hackPuzzle = 0
let hackWon = false
let hackAttempts = 0

// trivia for the hack minigame. dont @ me about the answers
const puzzles = [
  { q: "What is 7 * 8?", opts: ["54", "56", "58", "60"], ans: 1 },
  { q: "Which key deletes the last char?", opts: ["Enter", "Space", "Backspace", "Tab"], ans: 2 },
  { q: "What does CPU stand for?", opts: ["Central Proc Unit", "Computer Personal Unit", "Central Program Utility", "Core Proc Unit"], ans: 0 },
  { q: "How many bits in a byte?", opts: ["4", "8", "16", "32"], ans: 1 },
  { q: "What color is Sprig's Run button?", opts: ["Green", "Red", "Blue", "Yellow"], ans: 0 },
]

// draws whatever screen we on. clearText with "" bc sprig needs smth in there
function render() {
  clearText("")
  if (screen === "desktop") {
    addText("SPRIGOS v1.0", { x: 1, y: 0, color: color`7` })
    addText("Desktop", { x: 1, y: 1, color: color`7` })
    addText("----------", { x: 1, y: 2, color: color`C` })
    addText(cursor === 0 ? "> Terminal" : "  Terminal", { x: 1, y: 3, color: cursor === 0 ? color`3` : color`7` })
    addText(cursor === 1 ? "> Files" : "  Files", { x: 1, y: 4, color: cursor === 1 ? color`3` : color`7` })
    addText(cursor === 2 ? "> Calculator" : "  Calculator", { x: 1, y: 5, color: cursor === 2 ? color`3` : color`7` })
    addText(cursor === 3 ? "> Hack" : "  Hack", { x: 1, y: 6, color: cursor === 3 ? color`3` : color`7` })
    addText("----------", { x: 1, y: 7, color: color`C` })
    addText("W/S: Move  I: Select  K: Back  L: Restart", { x: 1, y: 8, color: color`C` })
  } else if (screen === "terminal") {
    addText("TERMINAL", { x: 1, y: 0, color: color`4` })
    addText("----------", { x: 1, y: 1, color: color`4` })
    addText("> help", { x: 1, y: 2, color: color`2` })
    addText("  ls", { x: 1, y: 3, color: color`4` })
    addText("  cd", { x: 1, y: 4, color: color`4` })
    addText("  whoami", { x: 1, y: 5, color: color`4` })
    addText("  date", { x: 1, y: 6, color: color`4` })
    addText("  hack", { x: 1, y: 7, color: color`4` })
    addText("  clear", { x: 1, y: 8, color: color`4` })
    addText("----------", { x: 1, y: 9, color: color`4` })
    addText("W/S: Select  I: Run  K: Back", { x: 1, y: 10, color: color`4` })
  } else if (screen === "hack") {
    addText("HACK TERMINAL", { x: 1, y: 0, color: color`3` })
    addText("----------", { x: 1, y: 1, color: color`3` })
    if (hackWon) {
      // gg u did it
      addText("ACCESS GRANTED!", { x: 2, y: 3, color: color`4` })
      addText("You hacked SprigOS!", { x: 2, y: 5, color: color`4` })
      addText("Press L to restart", { x: 3, y: 7, color: color`2` })
    } else {
      const p = puzzles[hackPuzzle]
      addText("Level " + (hackPuzzle + 1) + "/" + puzzles.length, { x: 1, y: 2, color: color`3` })
      addText(p.q, { x: 1, y: 4, color: color`2` })
      addText("Attempts: " + hackAttempts, { x: 1, y: 6, color: color`3` })
      p.opts.forEach((o, i) => {
        const sel = i === hackCursor
        addText(sel ? "> " + o : "  " + o, { x: 1, y: 7 + i, color: sel ? color`3` : color`C` })
      })
      addText("W/S: Choose  I: Confirm  K: Back", { x: 1, y: 12, color: color`C` })
    }
  }
}

// w moves up. s moves down. ik its weird that w is +1 but the y axis is
// flipped in sprig so up = bigger y. took me forever to figure that out smh
onInput("w", () => {
  if (screen === "desktop") { cursor = Math.min(3, cursor + 1) }
  else if (screen === "terminal") { cursor = Math.min(6, cursor + 1) }
  else if (screen === "hack" && !hackWon) { hackCursor = Math.min(3, hackCursor + 1) }
  playTune(sfxClick)
  render()
})

onInput("s", () => {
  if (screen === "desktop") { cursor = Math.max(0, cursor - 1) }
  else if (screen === "terminal") { cursor = Math.max(0, cursor - 1) }
  else if (screen === "hack" && !hackWon) { hackCursor = Math.max(0, hackCursor - 1) }
  playTune(sfxClick)
  render()
})

// a/d also scroll the menu, extra comfiness
onInput("a", () => {
  if (screen === "desktop") { cursor = Math.max(0, cursor - 1) }
  playTune(sfxClick)
  render()
})

onInput("d", () => {
  if (screen === "desktop") { cursor = Math.min(3, cursor + 1) }
  playTune(sfxClick)
  render()
})

// the select button. this is where all the stuff happens
onInput("i", () => {
  if (screen === "desktop") {
    if (cursor === 0) { screen = "terminal"; cursor = 0 }
    else if (cursor === 1) { screen = "desktop"; cursor = 0 }  // files app (todo: actually make it)
    else if (cursor === 2) { screen = "desktop"; cursor = 0 }  // calc app (todo: this one too)
    else if (cursor === 3) { screen = "hack"; hackCursor = 0 }
    playTune(sfxOpen)
    render()
  } else if (screen === "terminal") {
    // faking a real terminal, each cmd just prints one line lol
    if (cursor === 0) { addText("help: commands", { x: 1, y: 11, color: color`4` }) }
    else if (cursor === 1) { addText("ls: files", { x: 1, y: 11, color: color`4` }) }
    else if (cursor === 2) { addText("cd: dir", { x: 1, y: 11, color: color`4` }) }
    else if (cursor === 3) { addText("whoami: guest", { x: 1, y: 11, color: color`4` }) }
    else if (cursor === 4) { addText("date: 2025", { x: 1, y: 11, color: color`4` }) }
    else if (cursor === 5) { screen = "hack"; hackCursor = 0 }
    else if (cursor === 6) { addText("cleared", { x: 1, y: 11, color: color`4` }) }
    playTune(sfxEnter)
    render()
  } else if (screen === "hack" && !hackWon) {
    const p = puzzles[hackPuzzle]
    if (hackCursor === p.ans) {
      hackPuzzle++
      hackCursor = 0
      playTune(sfxSuccess)
      if (hackPuzzle >= puzzles.length) {
        hackWon = true
        addText("ACCESS GRANTED!", { x: 2, y: 11, color: color`4` })
      } else {
        addText("Correct! Next puzzle...", { x: 1, y: 11, color: color`2` })
      }
    } else {
      hackAttempts++
      playTune(sfxHackFail)
      // 3 strikes and the counter resets, its not game over just a little slap
      if (hackAttempts >= 3) { addText("Wrong! Try again.", { x: 1, y: 11, color: color`3` }); hackAttempts = 0 }
      else addText("Wrong! " + (3 - hackAttempts) + " tries left", { x: 1, y: 11, color: color`3` })
    }
    render()
  } else if (screen === "hack" && hackWon) {
    hackPuzzle = 0; hackCursor = 0; hackWon = false; hackAttempts = 0; screen = "desktop"; cursor = 0
    addText("Restarted!", { x: 1, y: 11, color: color`2` })
    render()
  }
})

onInput("k", () => {
  if (screen === "hack") { screen = "desktop"; hackCursor = 0 }
  else if (screen !== "desktop") { screen = "desktop" }
  playTune(sfxBack)
  render()
})

// hard reset, mostly for after u win
onInput("l", () => {
  hackPuzzle = 0; hackCursor = 0; hackWon = false; hackAttempts = 0; screen = "desktop"; cursor = 0
  addText("Restarted!", { x: 1, y: 11, color: color`2` })
  render()
})

render()
