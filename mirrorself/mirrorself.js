/*
@title: mirrorself
@description: One brain, two bodies, one D-pad. You move; your mirror-twin drifts in the exact opposite. The floor remembers every tile you have ever touched — step on your own past and you die. Spikes kill both bodies at once. Clear two doors, in any order, without ever meeting yourself.
@author: your_hackclub_handle
@tags: ['puzzle','original','difficult','retro']
@addedOn: 2026-10-09

Five hand-crafted reflections, each a trap of its own.
WASD = step both bodies. L = undo once. I = retry/next. K = level select.
*/

// ============================ MIRRORSELF ============================
// ONE brain. TWO bodies. One D-pad. Fight your own controller.
//
//  - YOU = 'h' (green). You obey WASD like any mortal.
//  - TWIN = 't' (pink). It is the EXACT INVERSION of you around
//    the map's center: twin always sits at (W-1-x, H-1-y). When
//    you step right, it drifts left. When you climb, it sinks.
//
// RULES OF THE REFLECTION
//  1. THE FLOOR REMEMBERS. You may never step on a tile you have
//     already visited. It turns to haunted '*'. Touching it = death.
//  2. SPIKES are death for BOTH bodies. One keystroke, two lives.
//  3. WALLS are hard doors. If EITHER body would hit a wall, the
//     whole step is refused.
//  4. WIN: your twin rests at ITS door ('M') AND you rest at YOURS
//     ('D'). Either order — your plan decides.
//
// Controls:  W A S D  step both   L = undo (once per level)
//            I = play / next     K = level select or menu
//            A/D on select      flip level
// ============================================================

// ------------------------- LEVELS -------------------------
// Geometry is data, rendered into the 20x12 grid by buildRows().
// D = hero door tile, M = twin door tile.

const LEVELS = [
  {
    name: "FIRST GLANCE",
    startHero: [2, 5],
    doorHero: [3, 2],
    doorTwin: [2, 10],
    walls: [],          // border added automatically
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
    doorTwin: [5, 10], // hero must stand at twinAt([5,10]) = (14,1)
    walls: [],         // open hall — the FORK is made by spikes
    spikes: [
      // mirrored spike pairs: each tooth hurts one body, its mirror hurts the other
      [12, 2], [7, 9],    // pair: blocks the middle crossing
      [9, 4], [10, 7],    // pair: the fork teeth
      [17, 3], [2, 8],    // pair: corner teeth
      [3, 10], [16, 1],   // pair: bottom-left / top-right teeth
    ],
  },
  {
    name: "GRIDLOCK",
    startHero: [3, 6],
    doorHero: [10, 4],
    doorTwin: [10, 8],
    walls: [
      // two-room hall: left x1-4, middle x6-13, right x15-18
      [5, 1], [5, 2], [5, 3], [5, 4],
      [5, 7], [5, 8], [5, 9], [5, 10],
      [14, 1], [14, 2], [14, 3], [14, 4],
      [14, 7], [14, 8], [14, 9], [14, 10],
      // serpentine inside the middle room
      [9, 1], [9, 2], [9, 4],
      [10, 7], [10, 9], [10, 10],
    ],
    spikes: [
      [4, 4], [4, 7],        // left-room gauntlet
      [15, 4], [15, 7],      // twin gauntlet (mirror side)
      [6, 2], [13, 9],
    ],
  },
  {
    name: "FINAL REFRACTION",
    startHero: [3, 3],
    doorHero: [16, 9],
    doorTwin: [3, 9], // hero must stand at twinAt([3,9]) = (16,2)
    walls: [
      // small island in the middle
      [9, 5], [10, 5], [9, 6], [10, 6],
    ],
    spikes: [
      // a scattered minefield, mirrored pressure included
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

for (const lv of LEVELS) {
  if (lv.startHero[0] < 0 || lv.startHero[0] >= MAP_W || lv.startHero[1] < 0 || lv.startHero[1] >= MAP_H) throw new Error(`bad start ${lv.name}`);
}

// ------------------------- GRID -------------------------
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
  rows[lv.startHero[1]][lv.startHero[0]] = ".";
  return rows;
}

// ------------------------- HELPERS -------------------------
const twinAt = (hx, hy) => [MAP_W - 1 - hx, MAP_H - 1 - hy];
const isIn = (x, y) => x >= 0 && x < MAP_W && y >= 0 && y < MAP_H;

function cellAt(x, y, rows) {
  if (!isIn(x, y)) return "#";
  return rows[y][x];
}

// ------------------------- HUMAN =========================
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
let S = {
  screen: "menu", // menu | select | game | win | lose | victory
  levelIdx: 0,
  heroX: 0, heroY: 0,
  trail: [],            // your fatal past
  doorHeroDone: false,
  doorTwinDone: false,
  steps: 0,
  undoLeft: 1,
  lives: 3,
};

// ------------------------- BOOT -------------------------
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
function step(dx, dy) {
  if (S.screen !== "game") return;
  const rows = rowsNow();
  const nx = S.heroX + dx, ny = S.heroY + dy;
  const [tx, ty] = twinAt(nx, ny);

  // either body hits wall/void → step refused
  if (cellAt(nx, ny, rows) === "#") return;
  if (cellAt(tx, ty, rows) === "#") return;
  // spikes → death to both
  if (cellAt(nx, ny, rows) === "^") { die("spike"); return; }
  if (cellAt(tx, ty, rows) === "^") { die("spike"); return; }
  // out of ring → death (mirror pushed you off the board)
  if (!isIn(nx, ny) || !isIn(tx, ty)) { die("void"); return; }
  // your own past is fatal
  for (const p of S.trail)
    if (p.x === nx && p.y === ny) { die("haunt"); return; }

  // commit
  S.heroX = nx;
  S.heroY = ny;
  S.trail.push({ x: nx, y: ny });
  S.steps++;

  // doors (use raw rows so '*' overlay never hides them)
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

function reEvalDoors() {
  const raw = buildRows(LEVELS[S.levelIdx]);
  S.doorHeroDone = S.doorTwinDone = false;
  for (const p of S.trail) {
    if (raw[p.y][p.x] === "D") S.doorHeroDone = true;
    const [tx, ty] = twinAt(p.x, p.y);
    if (raw[ty][tx] === "M") S.doorTwinDone = true;
  }
}

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
// text plane = 20 chars x 16 rows (char units). board = 20x12 tiles.
let mapDrawnFor = "";
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

function drawPreview() {
  setMap(buildRows(LEVELS[S.levelIdx]).map(r => r.join("")).join("\n"));
}

function drawBlack() {
  setMap(Array.from({ length: MAP_H }, () => ".".repeat(MAP_W)).join("\n"));
}

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
    addText("LOST IN THE GLASS", { x: 0, y: 2, color: color`3` });
    addText("you met your past.", { x: 0, y: 3, color: color`2` });
    addText("i retry   k back", { x: 0, y: 5, color: color`7` });
    return;
  }

  // victory
  drawBlack();
  addText("YOU LEFT YOURSELF", { x: 0, y: 3, color: color`4` });
  addText("every door opened", { x: 1, y: 5, color: color`2` });
  addText("from the inside.", { x: 1, y: 6, color: color`2` });
  addText("i = reflections", { x: 2, y: 15, color: color`7` });
}

// ------------------------- MUSIC -------------------------
function g(ms, notes) { return `${ms}: ${notes.map(([n, d]) => `${n}~${d}`).join(" + ")}`; }
function tuneSeq(...groups) { return groups.join(", "); }

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

// expose internals for the test harness
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    S, LEVELS, MAP_W, MAP_H,
    twinAt, isIn, cellAt, buildRows,
    step, start, undo, die, reEvalDoors, rowsNow,
    render, boot, actionI,
  };
}
