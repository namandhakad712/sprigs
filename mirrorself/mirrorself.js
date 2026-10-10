/*
@title: mirrorself
@description: One brain, two bodies, one D-pad. You move; your mirror-twin drifts in the exact opposite. The floor remembers every tile you have ever touched — step on your own past and you die. Spikes kill both bodies at once. Clear two doors, in any order, without ever meeting yourself.
@author: your_hackclub_handle
@tags: ['puzzle','original','difficult','retro']
@addedOn: 2026-10-09

Five hand-crafted reflections, each a trap of its own.
WASD = step both bodies. L = undo once. I = retry/next. K = level select.
*/

// ============================================================
//  MIRRORSELF -- one brain, two bodies, one D-pad
//  basically u fight ur own controller lol
//
//  - YOU = 'h' (the green guy). listens to WASD like a normal person
//  - TWIN = 't' (pink). does the EXACT OPPOSITE of u around
//    the middle of the map: twin sits at (W-1-x, H-1-y).
//    u go right, it floats left. u jump, it sinks. enemy of my enemy etc
//
//  THE RULES (read them or u will die a lot):
//   1. THE FLOOR HAS MEMORY. stepped on a tile once? dont step on it
//      again. it turns into haunted '*' and touching it = instant L.
//   2. SPIKES kill BOTH bodies. one key, two funerals. brutal.
//   3. WALLS are solid. if EITHER body would bonk a wall, the
//      whole move gets rejected. u stay put. yes its annoying.
//   4. TO WIN: twin has to sit on ITS door ('M') AND u sit on URS ('D').
//      which one first doesnt matter, thats ur problem to figure out
//
//  controls:  W A S D = step both    L = undo (once per level, dont waste it)
//             I = play / next        K = level select / menu
//             A/D on the select screen = flip thru levels
// ============================================================

// ------------------------- LEVELS -------------------------
// geometry is just data, buildRows() paints it onto the 20x12 grid.
// D = hero's door tile, M = twin's door tile. the border wall is
// drawn for free so i didnt have to type 60 #'s like a peasant

const LEVELS = [
  {
    name: "FIRST GLANCE",
    startHero: [2, 5],
    doorHero: [3, 2],
    doorTwin: [2, 10],
    walls: [],          // border is auto-added, this one is an open field
    spikes: [[3, 1], [16, 1], [8, 5], [11, 6]],
  },
  {
    name: "CROSSING",
    startHero: [2, 5],
    doorHero: [17, 3],
    doorTwin: [2, 9],
    walls: [
      [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3],
      [4, 4], [10, 4],
      [3, 5], [4, 5], [10, 5], [11, 5],
      [4, 6], [10, 6],
      [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7],
    ],
    spikes: [[7, 9], [12, 2]],
  },
  {
    name: "THE FORK",
    startHero: [8, 5],
    doorHero: [16, 2],
    doorTwin: [5, 10], // hero has to stand at twinAt([5,10]) which is (14,1). math is fun
    walls: [],         // no walls, the spikes ARE the maze here
    spikes: [
      // each spike has a mirror buddy: one bites u, the other bites the twin
      [12, 2], [7, 9],    // these two guard the middle crossing
      [9, 4], [10, 7],    // the fork teeth. pick a lane lol
      [17, 3], [2, 8],    // corner teeth, easy to forget about
      [3, 10], [16, 1],   // bottom-left & top-right, the sneaky ones
    ],
  },
  {
    name: "GRIDLOCK",
    startHero: [3, 6],
    doorHero: [10, 4],
    doorTwin: [10, 8],
    walls: [
      // three rooms: left x1-4, middle x6-13, right x15-18
      [5, 1], [5, 2], [5, 3], [5, 4],
      [5, 7], [5, 8], [5, 9], [5, 10],
      [14, 1], [14, 2], [14, 3], [14, 4],
      [14, 7], [14, 8], [14, 9], [14, 10],
      // wiggly snake thing inside the middle room
      [9, 1], [9, 2], [9, 4],
      [10, 7], [10, 9], [10, 10],
    ],
    spikes: [
      [4, 4], [4, 7],        // left room welcome committee
      [15, 4], [15, 7],      // same thing but for the twin side
      [6, 2], [13, 9],
    ],
  },
  {
    name: "FINAL REFRACTION",
    startHero: [3, 3],
    doorHero: [16, 9],
    doorTwin: [3, 9], // hero stands at twinAt([3,9]) = (16,2). trust the process
    walls: [
      // lil island in the dead center, blocks the easy route
      [9, 5], [10, 5], [9, 6], [10, 6],
    ],
    spikes: [
      // just a whole minefield, good luck lmao
      [4, 8], [15, 3],
      [13, 4], [6, 7],
      [12, 5], [7, 6],
      [2, 6], [17, 4],
      [10, 2], [9, 9],
      [1, 5], [18, 7],
    ],
  },
];

const MAP_W = 20;
const MAP_H = 12;

// sanity check so nobody sneaks a start position off the map
for (const lv of LEVELS) {
  if (lv.startHero[0] < 0 || lv.startHero[0] >= MAP_W || lv.startHero[1] < 0 || lv.startHero[1] >= MAP_H) throw new Error(`bad start ${lv.name}`);
}

// ------------------------- GRID -------------------------
// turns a level object into actual rows of tiles
function buildRows(lv) {
  const rows = Array.from({ length: MAP_H }, (_y, y) =>
    Array.from({ length: MAP_W }, (_x, x) => {
      if (x === 0 || x === MAP_W - 1 || y === 0 || y === MAP_H - 1) return "#";
      return ".";
    })
  );
  for (const [x, y] of lv.walls) rows[y][x] = "#";
  for (const [x, y] of lv.spikes) if (rows[y][x] !== "#") rows[y][x] = "^";
  rows[lv.doorHero[1]][lv.doorHero[0]] = "D";
  rows[lv.doorTwin[1]][lv.doorTwin[0]] = "M";
  rows[lv.startHero[1]][lv.startHero[0]] = ".";   // start tile must stay clean
  return rows;
}

// ------------------------- HELPERS -------------------------
// the whole game in one line: twin is ur reflection thru the center
const twinAt = (hx, hy) => [MAP_W - 1 - hx, MAP_H - 1 - hy];
const isIn = (x, y) => x >= 0 && x < MAP_W && y >= 0 && y < MAP_H;

// anything outside the board is treated as a wall (see rule 3)
function cellAt(x, y, rows) {
  if (!isIn(x, y)) return "#";
  return rows[y][x];
}

// ------------------------- ART -------------------------
// hand-pressed pixels at 2am, do not judge the proportions
const BG = bitmap`
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
0000000000000000`;

const B = {
  bg: BG,
  wall: bitmap`
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLL4LLLLLLL4LLL
LLLL4LLLLLL4LLLL
LLLL4LLLLLL4LLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL`,
  hero: bitmap`
................
................
....44444444....
...4444444444...
...4444444444...
....44444444....
.....444444.....
......4444......
.....444444.....
....44444444....
....444....44...
....LLLLLLLL....
....LLLLLLLL....
.....LL..LL.....
.....LL..LL.....
................`,
  twin: bitmap`
................
................
......888888....
.....8888888....
.....8888887....
......88888.....
.......777......
......88888.....
.....7777777....
....777777777...
....888....88...
....LLLLLLLL....
....LLLLLLLL....
.....LL..LL.....
.....LL..LL.....
................`,
  haunt: bitmap`
................
................
..666666666666..
..666666666666..
..666666666666..
..666666666666..
..666666666666..
..666666666666..
..666666666666..
..666666666666..
..666666666666..
..666666666666..
..666666666666..
..666666666666..
................
................`,
  spike: bitmap`
................
................
......99999.....
.....999999.....
....9999999.....
...999999999....
...999999999....
..9999999999....
...999999999....
....9999999.....
.....999999.....
......99999.....
................
................
................
................`,
  doorA: bitmap`
................
................
......44444.....
.....444444.....
....4444444.....
....444LLL4.....
...44444444.....
...444444444....
...444444444....
....44444444....
.....444444.....
......4444......
................
................
................
................`,
  doorB: bitmap`
................
................
......88888.....
.....888888.....
....8888888.....
....888LLL8.....
...88888888.....
...888888888....
...888888888....
....88888888....
.....888888.....
......8888......
................
................
................
................`,
};

const LEGEND = [
  ["g", B.bg],
  ["#", B.wall],
  ["^", B.spike],
  ["*", B.haunt],
  ["D", B.doorA],
  ["M", B.doorB],
  ["h", B.hero],
  ["t", B.twin],
];

// ------------------------- STATE -------------------------
// one fat object so i dont have 20 globals floating around
let S = {
  screen: "menu", // menu | select | game | win | lose | victory
  levelIdx: 0,
  heroX: 0, heroY: 0,
  trail: [],            // every tile u ever touched. ur sins.
  doorHeroDone: false,
  doorTwinDone: false,
  steps: 0,
  undoLeft: 1,
  lives: 3,
};

// ------------------------- BOOT -------------------------
// wires up every key then drops u on the title screen
function boot() {
  setLegend(...LEGEND);
  setBackground("g");
  setSolids([]);

  onInput("w", () => {
    if (S.screen === "menu") { start(0); return; }
    if (S.screen === "select") { S.levelIdx = (S.levelIdx - 1 + LEVELS.length) % LEVELS.length; render(); return; }
    step(0, -1);
  });
  onInput("s", () => {
    if (S.screen === "menu") { start(0); return; }
    if (S.screen === "select") { S.levelIdx = (S.levelIdx + 1) % LEVELS.length; render(); return; }
    step(0, 1);
  });
  onInput("a", () => { if (S.screen === "menu") { start(0); return; } step(-1, 0); });
  onInput("d", () => { if (S.screen === "menu") { start(0); return; } step(1, 0); });
  onInput("i", () => actionI());
  onInput("l", () => { if (S.screen === "game") undo(); });
  onInput("k", () => {
    if (S.screen === "menu" || S.screen === "game" || S.screen === "win" || S.screen === "lose") S.screen = "select";
    else S.screen = "menu";
    render();
  });

  menu();
}

// the 'i' key does something different on every screen, deal with it
function actionI() {
  if (S.screen === "menu") { start(0); return; }
  if (S.screen === "select") { start(S.levelIdx); return; }
  if (S.screen === "game") retry();
  if (S.screen === "lose") start(S.levelIdx);
  if (S.screen === "win") {
    S.levelIdx = (S.levelIdx + 1) % LEVELS.length;
    if (S.levelIdx === 0) { S.screen = "victory"; playTune(SFX_WIN); render(); }
    else start(S.levelIdx);
  }
  if (S.screen === "victory") { S.screen = "select"; render(); }
}

function menu() {
  S.screen = "menu";
  S.levelIdx = 0;
  playTune(AMBIENT);
  render();
}

// ------------------------- START / RETRY -------------------------
// resets everything to factory settings for the given level
function start(lvIdx) {
  S.levelIdx = lvIdx;
  S.screen = "game";
  S.lives = 3;
  S.undoLeft = 1;
  S.steps = 0;
  S.doorHeroDone = false;
  S.doorTwinDone = false;
  S.heroX = LEVELS[lvIdx].startHero[0];
  S.heroY = LEVELS[lvIdx].startHero[1];
  S.trail = [{ x: S.heroX, y: S.heroY }];
  playTune(AMBIENT);
  render();
}

function retry() { start(S.levelIdx); }

// ------------------------- MOVEMENT -------------------------
// the meat of the whole game. every WASD press runs thru this.
function step(dx, dy) {
  if (S.screen !== "game") return;
  const rows = rowsNow();
  const nx = S.heroX + dx, ny = S.heroY + dy;
  const [tx, ty] = twinAt(nx, ny);

  // rule 3: either body hits a wall -> whole step cancelled, no refund
  if (cellAt(nx, ny, rows) === "#") return;
  if (cellAt(tx, ty, rows) === "#") return;
  // rule 2: spikes -> both of u die. one input, two casualties
  if (cellAt(nx, ny, rows) === "^") { die("spike"); return; }
  if (cellAt(tx, ty, rows) === "^") { die("spike"); return; }
  // the mirror yeeted somebody off the edge of existence
  if (!isIn(nx, ny) || !isIn(tx, ty)) { die("void"); return; }
  // rule 1: stepping on ur own trail is a death sentence
  for (const p of S.trail)
    if (p.x === nx && p.y === ny) { die("haunt"); return; }

  // ok we're clear, actually move
  S.heroX = nx;
  S.heroY = ny;
  S.trail.push({ x: nx, y: ny });
  S.steps++;

  // doors: raw rows used on purpose so the '*' overlay cant hide one
  const raw = buildRows(LEVELS[S.levelIdx]);
  if (!S.doorHeroDone && raw[ny][nx] === "D") S.doorHeroDone = true;
  if (!S.doorTwinDone && raw[ty][tx] === "M") S.doorTwinDone = true;

  if (S.doorHeroDone && S.doorTwinDone) {
    S.screen = "win";
    playTune(SFX_WIN);
  } else {
    playTune(SFX_STEP);
  }
  render();
}

// take back ONE step per level. use it wisely, u only get one
function undo() {
  if (S.undoLeft <= 0 || S.trail.length <= 2) return;
  S.undoLeft--;
  S.trail.pop();
  const p = S.trail[S.trail.length - 1];
  S.heroX = p.x;
  S.heroY = p.y;
  S.steps--;
  reEvalDoors();
  playTune(SFX_UNDO);
  render();
}

// after an undo we gotta re-check which doors were already touched
// (undoing could theoretically un-complete a door, so just recompute)
function reEvalDoors() {
  const raw = buildRows(LEVELS[S.levelIdx]);
  S.doorHeroDone = S.doorTwinDone = false;
  for (const p of S.trail) {
    if (raw[p.y][p.x] === "D") S.doorHeroDone = true;
    const [tx, ty] = twinAt(p.x, p.y);
    if (raw[ty][tx] === "M") S.doorTwinDone = true;
  }
}

// u messed up. lose a life and snap back to spawn, or just lose
function die(reason) {
  S.lives--;
  playTune(SFX_DIE);
  if (S.lives <= 0) {
    S.screen = "lose";
  } else {
    const lv = LEVELS[S.levelIdx];
    S.heroX = lv.startHero[0];
    S.heroY = lv.startHero[1];
    S.trail = [{ x: S.heroX, y: S.heroY }];
    S.doorHeroDone = S.doorTwinDone = false;
  }
  render();
}

// ------------------------- RENDER -------------------------
// text plane is 20 chars wide and 16 rows tall. board is 20x12 tiles.
// (fun fact: text and tiles are different sizes, dont mix them up lol)
let mapDrawnFor = "";

// builds the board WITH ur trail, hero and twin already stamped in
function rowsNow() {
  const lv = LEVELS[S.levelIdx];
  const rows = buildRows(lv);
  for (const p of S.trail) {
    const c = rows[p.y][p.x];
    if (c === "." || c === "D" || c === "M") rows[p.y][p.x] = "*";
  }
  rows[S.heroY][S.heroX] = "h";
  const [tx, ty] = twinAt(S.heroX, S.heroY);
  if (isIn(tx, ty)) rows[ty][tx] = "t";
  return rows;
}

function drawMap() {
  setMap(rowsNow().map(r => r.join("")).join("\n"));
}

// level preview for the select screen, no trail no bodies, just the maze
function drawPreview() {
  setMap(buildRows(LEVELS[S.levelIdx]).map(r => r.join("")).join("\n"));
}

function drawBlack() {
  setMap(Array.from({ length: MAP_H }, () => ".".repeat(MAP_W)).join("\n"));
}

// draws whatever screen S says we're on. one big if-else ladder, classy
function render() {
  clearText();
  const st = S.screen;

  if (st === "menu") {
    drawBlack();
    addText("MIRRORSELF", { x: 4, y: 3, color: color`F` });
    addText("one pad. two bodies.", { x: 0, y: 5, color: color`2` });
    addText("you move. your twin", { x: 0, y: 7, color: color`1` });
    addText("drifts the opposite.", { x: 0, y: 8, color: color`1` });
    addText("your past = death.", { x: 0, y: 10, color: color`6` });
    addText("spikes kill both.", { x: 0, y: 11, color: color`6` });
    addText("rest at both doors.", { x: 0, y: 12, color: color`4` });
    addText("any key = play", { x: 4, y: 14, color: color`7` });
    addText("k = pick a level", { x: 2, y: 15, color: color`7` });
    return;
  }

  if (st === "select") {
    drawPreview();
    addText("REFLECTIONS", { x: 4, y: 0, color: color`F` });
    LEVELS.forEach((lv, i) => {
      addText((i === S.levelIdx ? ">" : " ") + (i + 1) + " " + lv.name, {
        x: 0, y: 2 + i, color: i === S.levelIdx ? color`4` : color`2`,
      });
    });
    addText("w/s pick  i play", { x: 0, y: 8, color: color`7` });
    addText("k back", { x: 13, y: 15, color: color`7` });
    return;
  }

  if (st === "game" || st === "win" || st === "lose") {
    // only redraw the map when something actually changed, saves cycles
    const tag = st + "|" + S.heroX + "," + S.heroY + "|" + S.trail.length;
    if (tag !== mapDrawnFor) { mapDrawnFor = tag; drawMap(); }

    if (st === "game") {
      addText(`L${S.levelIdx + 1}/${LEVELS.length} ${LEVELS[S.levelIdx].name}`, { x: 0, y: 0, color: color`6` });
      addText(`steps ${S.steps} hp ${S.lives} undo ${S.undoLeft}`, { x: 0, y: 1, color: color`F` });
      addText("wasd step   l undo", { x: 0, y: 14, color: color`1` });
      addText("i retry     k pick", { x: 0, y: 15, color: color`1` });
      return;
    }
    if (st === "win") {
      addText(LEVELS[S.levelIdx].name, { x: 4, y: 2, color: color`4` });
      addText("CLEARED", { x: 6, y: 3, color: color`4` });
      addText(`steps ${S.steps} undo ${S.undoLeft}`, { x: 0, y: 4, color: color`F` });
      addText("i next    k choose", { x: 0, y: 6, color: color`7` });
      return;
    }
    // lose screen, the one u'll be seeing a lot of
    addText("LOST IN THE GLASS", { x: 0, y: 2, color: color`3` });
    addText("you met your past.", { x: 0, y: 3, color: color`2` });
    addText("i retry   k back", { x: 0, y: 5, color: color`7` });
    return;
  }

  // the good ending, u beat all five reflections. gigachad screen
  drawBlack();
  addText("YOU LEFT YOURSELF", { x: 0, y: 3, color: color`4` });
  addText("every door opened", { x: 1, y: 5, color: color`2` });
  addText("from the inside.", { x: 1, y: 6, color: color`2` });
  addText("i = reflections", { x: 2, y: 15, color: color`7` });
}

// ------------------------- MUSIC -------------------------
// tiny note-string builders so i dont have to hand-write giant tune strings
function g(ms, notes) { return `${ms}: ${notes.map(([n, d]) => `${n}~${d}`).join(" + ")}`; }
function tuneSeq(...groups) { return groups.join(", "); }

// ambient drone for menus, loops forever (or until it gets annoying)
const AMBIENT = tune`${tuneSeq(
  g(800, [["A3", 700], ["C4", 700]]),
  g(800, [["D4", 700], ["F4", 700]]),
  g(800, [["E4", 700], ["G4", 700]]),
  g(800, [["B3", 700], ["D4", 700]]),
)}`;
const SFX_STEP = tune`${g(70, [["C5", 55]])}`;
const SFX_DIE = tune`${tuneSeq(g(130, [["G4", 110]]), g(130, [["F4", 110]]))}`;
const SFX_UNDO = tune`${g(120, [["E5", 100]])}`;
const SFX_WIN = tune`${tuneSeq(
  g(120, [["C4", 100]]), g(120, [["E4", 100]]), g(120, [["G4", 100]]),
  g(300, [["C5", 260]]), g(120, [["E5", 100]]), g(120, [["G5", 100]]),
  g(360, [["C6", 320]]),
)}`;

boot();

// exposed for the test harness so it can poke at my internals without mercy
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    S, LEVELS, MAP_W, MAP_H,
    twinAt, isIn, cellAt, buildRows,
    step, start, undo, die, reEvalDoors, rowsNow,
    render, boot, actionI,
  };
}
