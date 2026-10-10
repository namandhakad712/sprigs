/*
@title: Railyard Dispatcher
@author: thisisnaman
@description: Route speeding color-coded trains to matching depots by flipping junction arrows. 3 levels, 3 HP, real-time.
@tags: ['strategy', 'puzzle', 'real-time']
@addedOn: 2026-10-08
*/

// ===========================================================
//  RAILYARD DISPATCHER  --  rewrite edition
//  paste this in https://sprig.hackclub.com/ -> New Game -> RUN
//
//  ur the yard dispatcher. trains keep rollin in from the top
//  portals and u gotta flip the yellow junction arrows so each
//  train pulls into the depot that matches its OWN color.
//     red train -> red depot | blue -> blue | yellow -> yellow
//
//  controls (dont @ me about the keybinds):
//   WASD  : hop the green cursor between yellow arrows (fast!!)
//   I / J : spin the arrow under the cursor (up->right->down->left)
//   K     : pause / unpause
//   L     : restart the whole run from lvl 1
//
//  all arrows start pointing DOWN by default, so a train that
//  nobody touches just dives straght into whatever depot is below
//  its portal. right depot = delivered, wrong depot = crash lol.
//
//  3 crashes (derail / wrong depot / 2 trains kissing) = GG.
//  fill the quota on each level to advance. it gets faster, trust.
// ===========================================================


// ---- tile id's ----
// (these r just the chars that go in the legend, nothin fancy)
const W    = "w";   // wall / border
const T    = "t";   // plain track
const UP   = "u";
const DN   = "d";
const LF   = "l";
const RT   = "r";
const SP   = "s";   // spawner portal up top
const STA_R = "a";  // red depot
const STA_B = "b";  // blue depot
const STA_Y = "c";  // yellow depot
const TRN_R = "R";  // red train
const TRN_E = "E";  // blue train (ya i know E = blue is weird, deal w/ it)
const TRN_Y = "Y";  // yellow train
const CUR  = "p";   // the cursor box
const BLK  = "x";   // blank black tile for the title screen


setLegend(
  // cursor -- green outline box, blinks when ur playing
  [CUR, bitmap`
4444444444444444
4444444444444444
444..........444
444..........444
444..........444
444..........444
444..........444
444..........444
444..........444
444..........444
444..........444
444..........444
444..........444
444..........444
4444444444444444
4444444444444444`],

  // ---- the trains. 3 flavors, same body just diff colors ----
  [TRN_R, bitmap`
................
.22222222222222.
.23333333333332.
.23222222222232.
.23222222222232.
.23333333333332.
.23333333333332.
.23003333330032.
.23003333330032.
.23333333333332.
.23333333333332.
.23300000000332.
.23300000000332.
.22222222222222.
................
................`],
  [TRN_E, bitmap`
................
.22222222222222.
.25555555555552.
.25222222222252.
.25222222222252.
.25555555555552.
.25555555555552.
.25005555550052.
.25005555550052.
.25555555555552.
.25555555555552.
.25500000000552.
.25500000000552.
.22222222222222.
................
................`],
  [TRN_Y, bitmap`
................
.22222222222222.
.26666666666662.
.26222222222262.
.26222222222262.
.26666666666662.
.26666666666662.
.26006666660062.
.26006666660062.
.26666666666662.
.26666666666662.
.26600000000662.
.26600000000662.
.22222222222222.
................
................`],

  // ---- depots (the colored bays at the bottom) ----
  [STA_R, bitmap`
3333333333333333
3222222222222233
3222222222222233
3223333333332233
3223222222222233
3223222222222233
3223222222222233
3223222222222233
3223222222222233
3223000000002233
3223000000002233
3223000000002233
3223000000002233
3223333333332233
3333333333333333
3333333333333333`],
  [STA_B, bitmap`
5555555555555555
5222222222222255
5222222222222255
5225555555552255
5225222222222255
5225222222222255
5225222222222255
5225222222222255
5225222222222255
5225000000002255
5225000000002255
5225000000002255
5225000000002255
5225555555552255
5555555555555555
5555555555555555`],
  [STA_Y, bitmap`
6666666666666666
6222222222222266
6222222222222266
6226666666662266
6226200000022266
6226200000022266
6226200000022266
6226200000022266
6226200000022266
6226000000002266
6226000000002266
6226000000002266
6226000000002266
6226666666662266
6666666666666666
6666666666666666`],

  // the portal thing trains pop out of
  [SP, bitmap`
5555555555555555
5222222222222255
5222222222222255
5225555555552255
5225255555252255
5225255555252255
5225255555252255
5225255555252255
5225255555252255
5225255555252255
5225555555552255
5222222222222255
5222222222222255
5555555555555555
5555555555555555
5555555555555555`],

  // ---- junction arrows (the things u flip) ----
  [UP, bitmap`
0000000000000000
0000006666000000
0000066666600000
0000666666660000
0006666666666000
0066666666666600
0066666666666600
0000066666600000
0000066666600000
0000066666600000
0000066666600000
0000066666600000
0000066666600000
0000066666600000
0000000000000000
0000000000000000`],
  [DN, bitmap`
0000000000000000
0000000000000000
0000066666600000
0000066666600000
0000066666600000
0000066666600000
0000066666600000
0000066666600000
0000066666600000
0000066666600000
0066666666666600
0066666666666600
0006666666666000
0000666666660000
0000066666600000
0000000000000000`],
  [LF, bitmap`
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0066000000000000
0666600000000000
6666666666666600
6666666666666600
6666666666666600
6666666666666600
0666600000000000
0066000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000`],
  [RT, bitmap`
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000006600
0000000000066660
0066666666666666
0066666666666666
0066666666666666
0066666666666666
0000000000066660
0000000000006600
0000000000000000
0000000000000000
0000000000000000
0000000000000000`],

  // plain track tile -- rails + ties, the stuff trains roll on
  [T, bitmap`
L0L11LLLLLL11L0L
LLL11LLLLLL11LLL
LLL11LLLLLL11LLL
1111111111111111
1111111111111111
LLL11LL00LL11LLL
LLL11LL00LL11LLL
L0L11LLLLLL11L0L
LLL11LLLLLL11LLL
LLL11LL00LL11LLL
LLL11LL00LL11LLL
1111111111111111
1111111111111111
LLL11LLLLLL11LLL
L0L11LLLLLL11L0L
LLL11LLLLLL11LLL`],

  // wall
  [W, bitmap`
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LL00LLLLLLLL00LL
LL00LLLLLLLL00LL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LL00LLLLLLLL00LL
LL00LLLLLLLL00LL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL`],

  // dead black square (only used to blank out the title screen)
  [BLK, bitmap`
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
0000000000000000`]
);

setSolids([]);          // no solids, we move trains manualy in tick()
setBackground(W);


// ==================== board geometry ====================
// 12 wide, 10 tall. keeps the hud readable and the yard compact.
const MW = 12;
const MH = 10;

// where the flippable yellow arrows live. cursor hops between these.
const SWITCH_SPOTS = [
   { x: 2, y: 3 }, { x: 6, y: 3 }, { x: 9, y: 3 },
   { x: 2, y: 6 }, { x: 6, y: 6 }, { x: 9, y: 6 },
];

// trains crawl outta here going straight down
const SPAWNERS = [
  { x: 2, y: 1, dx: 0, dy: 1 },
  { x: 9, y: 1, dx: 0, dy: 1 },
];

// the depots at the bottom. color is which train they accept.
// (color "E" == blue here because blue's tile char is E, dont ask)
const STATIONS = [
  { x: 2, y: 8, color: "E", tile: STA_B },
  { x: 6, y: 8, color: "Y", tile: STA_Y },
  { x: 9, y: 8, color: "R", tile: STA_R },
];

// the difficulty ladder. quota = trains u gotta deliver to clear the lvl.
const LEVELS = [
  // lvl 1 -- chill warmup, only red + blue, one train at a time
  { quota: 3, tickMs: 750, spawnMs: 3600, colors: ["R", "E"], maxTrains: 1, walls: [] },
  // lvl 2 -- all 3 colors now, 2 trains, a wall block in the middle
  { quota: 6, tickMs: 550, spawnMs: 2800, colors: ["R", "E", "Y"], maxTrains: 2,
    walls: [{ x: 5, y: 4 }, { x: 6, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 5 }] },
  // lvl 3 -- full chaos. fast ticks, 3 trains, split walls
  { quota: 8, tickMs: 420, spawnMs: 2200, colors: ["R", "E", "Y"], maxTrains: 3,
    walls: [{ x: 3, y: 4 }, { x: 4, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 },
            { x: 4, y: 5 }, { x: 7, y: 5 }] },
];

// the 4 directions, ordered so that (idx+1)%4 is a clockwise spin
const DIRS = [
  { ch: UP, dx:  0, dy: -1 },
  { ch: RT, dx:  1, dy:  0 },
  { ch: DN, dx:  0, dy:  1 },
  { ch: LF, dx: -1, dy:  0 },
];

// ---- tiny lookup helpers ----
function dirOf(ch) {
  for (const d of DIRS) { if (d.ch === ch) return d; }
  return null;
}
function arrowChar(ch) {
  if (ch === UP) return "^";
  if (ch === RT) return ">";
  if (ch === DN) return "v";
  if (ch === LF) return "<";
  return "?";
}
function trainCharFor(color) {
   return color === "R" ? TRN_R : color === "E" ? TRN_E : TRN_Y;
}
function stationColorFor(tile) {
  if (tile === STA_R) return "R";
  if (tile === STA_B) return "E";
  if (tile === STA_Y) return "Y";
  return null;
}


// ==================== state ====================
let state     = "title";  // title | playing | paused | gameover | win
let levelIdx  = 0;
let delivered = 0;
let lives     = 3;
let score     = 0;
let trains    = [];
let base      = [];           // the static tile grid (2d array of chars)
let cursor    = { x: 6, y: 3 };
let tickTimer  = null;
let spawnTimer = null;
let msg  = "";
let msgT = 0;
let flash = 0;                // >0 means show the "!!!!" crash indicator
let tickN = 0;                // counts ticks, used 2 blink the cursor


// ==================== sound effects ====================
// (tunes r short on purpose, nobody wants a 30s violin solo mid-game)
const sfxSwitch = tune`100: C5~100`;
const sfxHop    = tune`120: E5~120`;
const sfxSpawn  = tune`150: C4~150`;
const sfxGood   = tune`150: C4~150, 150: E4~150, 300: G4~300`;
const sfxBad    = tune`250: A4~250, 250: F4~250`;
const sfxWin    = tune`120: C4~120, 120: E4~120, 120: G4~120, 120: C5~120, 120: E5~120, 300: G5~300`;
const sfxLevel  = tune`120: G4~120, 120: C5~120, 250: E5~250`;


// ==================== build the board ====================
// builds the static grid for level #li -- border, portals, depots,
// level walls, then drops default DOWN arrows on every switch spot.
function buildBase(li)
{
  const lv = LEVELS[li];
  const g  = [];

  for (let y = 0; y < MH; y++) {
    const row = [];
      for (let x = 0; x < MW; x++) {
        // border = walls, everything else = track
        if (x === 0 || y === 0 || x === MW - 1 || y === MH - 1) row.push(W);
         else row.push(T);
      }
    g.push(row);
  }

  for (const s of SPAWNERS) g[s.y][s.x] = SP;

  // only draw the depots this level actually uses (lvl 1 skips yellow)
  for (const st of STATIONS.filter(s => lv.colors.includes(s.color))) {
      g[st.y][st.x] = st.tile;
  }

  // level walls -- but never stomp on a portal / depot / switch, thats unfair
  for (const wsec of lv.walls) {
    if (!g[wsec.y] || g[wsec.y][wsec.x] === undefined) continue;
      let dontOverwrite = false;
      for (const s of SPAWNERS)  if (s.x === wsec.x && s.y === wsec.y) dontOverwrite = true;
      for (const s of STATIONS)  if (s.x === wsec.x && s.y === wsec.y) dontOverwrite = true;
      for (const s of SWITCH_SPOTS) if (s.x === wsec.x && s.y === wsec.y) dontOverwrite = true;
    if (!dontOverwrite) g[wsec.y][wsec.x] = W;
  }

  // every switch spot gets a default DOWN arrow (unless a wall ate it)
  for (const sw of SWITCH_SPOTS) {
       if (g[sw.y][sw.x] !== W) g[sw.y][sw.x] = DN;
  }

  return g;
}


// ==================== render ====================
// redraws EVERYTHING. called after any state change, sprig is cheap w/ this.
function render()
{
  if (state === "title") {
    // blank the board out w/ black tiles then slap the text on
      const brows = [];
    for (let y = 0; y < MH; y++) brows.push(BLK.repeat(MW));
    setMap(brows.join("\n"));
    clearText();
    addText("RAIL YARD",     { x: 6, y: 1,  color: color`6` });
    addText("DISPATCHER",    { x: 5, y: 2,  color: color`6` });
    addText("Send each train to",  { x: 1, y: 4, color: color`2` });
    addText("its SAME-COLOR depot", { x: 0, y: 5, color: color`2` });
    addText("red->red blue->blue",  { x: 0, y: 7, color: color`3` });
    addText("yellow->yellow",       { x: 3, y: 8, color: color`6` });
    addText("WASD: hop arrows",  { x: 1, y: 10, color: color`2` });
    addText("I/J: flip arrow",   { x: 2, y: 11, color: color`2` });
    addText("K: pause L: restart", { x: 0, y: 12, color: color`2` });
    addText("press I to start",    { x: 2, y: 14, color: color`4` });
    return;
  }

  // paint the static grid
  const rows = [];
    for (let y = 0; y < MH; y++) rows.push(base[y].join(""));
  setMap(rows.join("\n"));

  // then every train on top of it
  for (const t of trains) addSprite(t.x, t.y, trainCharFor(t.color));

  // cursor: solid while paused, blinking while live (so it dont blind u)
     if (state === "paused") addSprite(cursor.x, cursor.y, CUR);
  else if (state === "playing" && tickN % 2 === 0) addSprite(cursor.x, cursor.y, CUR);

  clearText();

  // ---- HUD line ----
  const lv = LEVELS[levelIdx];
  let hud;
    if (msgT > 0) { hud = msg; msgT--; }
  else {
    hud = "L" + (levelIdx + 1) + " " + delivered + "/" + lv.quota + " H" + lives + " S" + score;
    const under = base[cursor.y][cursor.x];
      if (dirOf(under) !== null) hud += " " + arrowChar(under);
  }
  addText(hud, { x: 0, y: 0, color: color`2` });

  // ---- overlays ----
  if (state === "paused") {
    addText("PAUSED - K resume", { x: 2, y: 6, color: color`6` });
  } else if (state === "gameover") {
      addText("DERAILED!",   { x: 6, y: 4, color: color`3` });
    addText("score " + score, { x: 6, y: 6, color: color`2` });
    addText("L restart",      { x: 6, y: 8, color: color`2` });
  } else if (state === "win") {
      addText("ALL LINES CLEAR!", { x: 2, y: 4, color: color`4` });
    addText("score " + score,     { x: 6, y: 6, color: color`2` });
    addText("L play again",       { x: 4, y: 8, color: color`2` });
  } else {
    // playing -- show the crash flash if a train just ate it
      if (flash > 0) {
        addText("! ! !", { x: 8, y: 7, color: color`3` });
      flash--;
    }
  }
}

// flash a temp message in the HUD slot for a few frames
function say(m) { msg = m; msgT = 6; }


// ==================== timers ====================
function stopTimers() {
  if (tickTimer !== null)  { clearInterval(tickTimer);  tickTimer = null; }
    if (spawnTimer !== null) { clearInterval(spawnTimer); spawnTimer = null; }
}


// ==================== game flow ====================
function startLevel(li)
{
  levelIdx  = li;
  delivered = 0;
  trains    = [];
  base      = buildBase(li);
  cursor    = { x: 6, y: 3 };
  render();

  stopTimers();
  const lv = LEVELS[li];
  tickTimer  = setInterval(tick, lv.tickMs);
  spawnTimer = setInterval(spawnTick, lv.spawnMs);
  // instant first train so the level isnt 3 seconds of nothing
  spawnTick();
}

function startGame() {
  state = "playing";
    levelIdx = 0;
  lives = 3;
    score = 0;
  startLevel(0);
  say("match colors!");
}

// one train (or more) just wrecked. take a HP, clean up the wreckage.
function crashAt(x, y, why)
{
  lives--;
    flash = 8;
  playTune(sfxBad);
  say(why + " -1HP");
  // yeet every train sitting on that tile
  trains = trains.filter(t => !(t.x === x && t.y === y));
    if (lives <= 0) {
    state = "gameover";
      stopTimers();
  }
  render();
}

// train pulled into the right depot. cha-ching.
function deliverTrain(t)
{
  delivered++;
    score += 100 + levelIdx * 50;
  playTune(sfxGood);
  trains = trains.filter(o => o !== t);

  const lv = LEVELS[levelIdx];
    if (delivered >= lv.quota) {
      if (levelIdx >= LEVELS.length - 1) {
        // last level cleared = u win the whole game
        state = "win";
          stopTimers();
        playTune(sfxWin);
      } else {
        playTune(sfxLevel);
          startLevel(levelIdx + 1);
        say("level " + (levelIdx + 1) + "!");
        return;
      }
    }
  render();
}

function inBounds(x, y) { return x >= 0 && y >= 0 && x < MW && y < MH; }


// ==================== the tick (train movement) ====================
// this is the heart of the game. every tickMs ms, every train steps
// one tile in the direction its currently heading. we figure out all
// the intended moves FIRST, check for crashes, then actually move.
function tick()
{
  if (state !== "playing") return;
    tickN++;
  if (trains.length === 0) { render(); return; }

  // step 1: where does everybody wanna go
  const moves = [];
    for (const t of trains) {
      moves.push({ t, nx: t.x + t.dx, ny: t.y + t.dy });
    }

  // step 2: two trains diving at the same tile = trainwreck, literally
  const targetCount = {};
  for (const m of moves) {
      const k = m.nx + "," + m.ny;
    targetCount[k] = (targetCount[k] || 0) + 1;
  }
    for (const m of moves) {
    const k = m.nx + "," + m.ny;
        if (targetCount[k] > 1) { crashAt(m.nx, m.ny, "collision"); return; }
  }

  // step 3: head-on swap -- A walks into B's tile while B walks into A's
  for (let i = 0; i < moves.length; i++) {
      for (let j = i + 1; j < moves.length; j++) {
        const a = moves[i], b = moves[j];
      if (a.nx === b.t.x && a.ny === b.t.y && b.nx === a.t.x && b.ny === a.t.y) {
            crashAt(a.nx, a.ny, "head-on");
        return;
      }
    }
  }

  // step 4: resolve each move one at a time (order matters, so snapshot)
  const snapshot = moves.slice();
    for (const m of snapshot) {
    // a train mightve already been deleted by an earlier crash this tick
      if (trains.indexOf(m.t) === -1) continue;

    const { nx, ny } = m;

      if (!inBounds(nx, ny)) { crashAt(m.t.x, m.t.y, "derailed"); return; }

    const tile = base[ny][nx];
        if (tile === W) { crashAt(nx, ny, "derailed"); return; }

    // depot? step on it first, THEN see if the color was right
    const sc = stationColorFor(tile);
        if (sc !== null) {
          m.t.x = nx; m.t.y = ny;
        if (sc === m.t.color) deliverTrain(m.t);
          else crashAt(nx, ny, "wrong depot");
        if (state !== "playing") return;
        continue;
    }

    // junction arrow? hop on and adopt its direction
    const dd = dirOf(tile);
      if (dd !== null) {
        m.t.x = nx; m.t.y = ny;
      m.t.dx = dd.dx; m.t.dy = dd.dy;
        continue;
    }

    // plain track or a portal tile -> keep ur heading
    if (tile === T || tile === SP) {
          m.t.x = nx; m.t.y = ny;
      continue;
    }

    // anything else (shouldnt really happen but) = derail
      crashAt(nx, ny, "derailed");
    return;
  }

  render();
}


// ==================== spawning ====================
function spawnTick()
{
  if (state !== "playing") return;
    const lv = LEVELS[levelIdx];
  if (trains.length >= lv.maxTrains) return;       // cap reached, hold up

  const free = SPAWNERS.filter(s => !trains.some(t => t.x === s.x && t.y === s.y));
    if (free.length === 0) return;                 // both portals blocked

  const s = free[Math.floor(Math.random() * free.length)];
    const color = lv.colors[Math.floor(Math.random() * lv.colors.length)];
  trains.push({ x: s.x, y: s.y, dx: s.dx, dy: s.dy, color });
  playTune(sfxSpawn);
    render();
}


// ==================== player actions ====================
// spin the arrow under the cursor clockwise
function cycleSwitch()
{
  if (state !== "playing") return;
    const tile = base[cursor.y][cursor.x];
  const idx = DIRS.findIndex(d => d.ch === tile);
      if (idx === -1) return;                        // cursor aint on an arrow
  base[cursor.y][cursor.x] = DIRS[(idx + 1) % DIRS.length].ch;
  playTune(sfxSwitch);
    render();
}

// hop the cursor to the nearest switch in direction (px, py).
// not a free roam -- cursor ONLY sits on arrows, thats the whole point.
function hopDir(px, py)
{
  if (state !== "playing") return;

  let best = -1, bs = 1e9;
    for (let i = 0; i < SWITCH_SPOTS.length; i++) {
      const s = SWITCH_SPOTS[i];
    if (s.x === cursor.x && s.y === cursor.y) continue;  // skip where we r

    const dx = s.x - cursor.x, dy = s.y - cursor.y;
        if (px > 0 && dx <= 0) continue;   // wanna go right but its not right
      if (px < 0 && dx >= 0) continue;
    if (py > 0 && dy <= 0) continue;
        if (py < 0 && dy >= 0) continue;

    // prefer switches lined up w/ us, penalize the sideways offset
    const along = px !== 0 ? Math.abs(dx) : Math.abs(dy);
    const off   = px !== 0 ? Math.abs(dy) : Math.abs(dx);
      const sc = along + off * 2;
    if (sc < bs) { bs = sc; best = i; }
  }

    if (best === -1) return;   // no arrow that way, do nothing
  cursor.x = SWITCH_SPOTS[best].x;
    cursor.y = SWITCH_SPOTS[best].y;
  playTune(sfxHop);
  render();
}


// ==================== input ====================
// WASD moves, I/J flips, K pauses, L restarts.
// also: any of these boots the game off the title screen.
onInput("w", () => {
    if (state === "title") { startGame(); return; }
  if (state === "gameover" || state === "win") return;
    hopDir(0, -1);
});
onInput("s", () => {
  if (state === "title") { startGame(); return; }
      if (state === "gameover" || state === "win") return;
  hopDir(0, 1);
});
onInput("a", () => {
    if (state === "title") { startGame(); return; }
  if (state === "gameover" || state === "win") return;
      hopDir(-1, 0);
});
onInput("d", () => {
  if (state === "title") { startGame(); return; }
    if (state === "gameover" || state === "win") return;
  hopDir(1, 0);
});

onInput("j", () => {
      if (state === "title") { startGame(); return; }
  cycleSwitch();
});
onInput("i", () => {
  if (state === "title") { startGame(); return; }
      cycleSwitch();
});

onInput("k", () => {
    if (state === "title") { startGame(); return; }
  if (state === "gameover" || state === "win") return;

  if (state === "playing") {
        state = "paused";
    stopTimers();
    render();
  } else if (state === "paused") {
      state = "playing";
    const lv = LEVELS[levelIdx];
        tickTimer  = setInterval(tick, lv.tickMs);
    spawnTimer = setInterval(spawnTick, lv.spawnMs);
    render();
  }
});

// hard restart, works from literally anywhere
onInput("l", () => {
  lives = 3;
    score = 0;
  state = "playing";
  startLevel(0);
    say("restarted!");
});


// ==================== boot ====================
// draw the title screen so the player sees somethin immediately
base = buildBase(0);
render();
