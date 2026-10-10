/*
  @title: The Great Laser Pointer Heist
  @author: thisisnaman
  @tags: ['puzzle', 'stealth', 'meme', 'gravity']
  @addedOn: 2026-10-08
  @description: Play as Garfield-X the meme cat! Flip gravity, dodge Dr. Stick's flashlight patrols, grab all fish energy drives, and steal the legendary red laser pointer across 7 security zones!
*/

/* ===================================================
   ok so this is the whole game in one file lol
   if u somehow ended up reading this then hi 👋
   i wrote all of this by hand at ungodly hours and
   my wrist is NOT happy about it. anyway, enjoy the heist 🔦
   =================================================== */


// ===================================================
// 1. SPRITES N STUFF  (everything is 16x16, sprig rules not mine)
// ===================================================

// just a plain white tile, we slap this all over the menu
// screens so the text is actually readable instead of floating
// in the void like some horror game yaar
const whiteTile = bitmap`
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
`;

// the wall. was going for like sci-fi lab metal panel vibes
// came out kinda mid ngl but its a wall, nobody is admiring it
const wall = bitmap`
0000000000000000
0DDDDDDDDDDDDDD0
0DCCCCCCCCCCCCD0
0DC..........CD0
0DC.DDDDDDDD.CD0
0DC.D......D.CD0
0DC.D......D.CD0
0DC.D......D.CD0
0DC.D......D.CD0
0DC.D......D.CD0
0DC.D......D.CD0
0DC.DDDDDDDD.CD0
0DC..........CD0
0DCCCCCCCCCCCCD0
0DDDDDDDDDDDDDD0
0000000000000000
`;

// Garfield-X, the GOAT. the :3 smug face goes hard no cap,
// he knows he's getting that laser pointer tonight
const cat = bitmap`
................
..00........00..
..030......030..
..000000000000..
.00000000000000.
.00LL000000LL00.
.00LL000000LL00.
.000000LL000000.
.00000L00L00000.
.000000LL000000.
..000000000000..
.00000000000000.
.00.00000000.00.
....00....00....
....00....00....
................
`;

// Dr. Stick. THIS is the guy ruining everyones day, bro literally
// stands guard over a laser pointer like its the one ring or something
const stickman = bitmap`
......LLLL......
.....L....L.....
.....L....L.....
......LLLL......
.......LL.......
....LLLLLLLL....
...L...LL...L...
...L...LL...L...
.......LL.......
.......LL.......
......L..L......
.....L....L.....
....L......L....
...L........L...
..L..........L..
................
`;

// the flashlight beam. if garfield touches this he is COOKED 💀
// (this sprite gets spawned in front of the guards every tick)
const beam = bitmap`
................
................
................
..777777777777..
.77777777777777.
.77337777773377.
.77337777773377.
.77777777777777.
.77777777777777.
.77337777773377.
.77337777773377.
.77777777777777.
..777777777777..
................
................
................
`;

// fish energy drive. its NOT a real fish pls dont try to eat it
// garfield needs all of these before the exit even thinks about opening
const fish = bitmap`
................
................
.....55.........
...555555.......
..55555555..55..
.55L55555555555.
.55555555555555.
..55555555..55..
...555555.......
.....55.........
................
................
................
................
................
................
`;

// gravity pad. step on this and up becomes down, its giving
// inception fr. mandatory for like half the levels out here
const gravPad = bitmap`
................
................
.......CC.......
......CCCC......
.....CCCCCC.....
....CCCCCCCC....
.......CC.......
.......CC.......
.......CC.......
.......CC.......
....CCCCCCCC....
.....CCCCCC.....
......CCCC......
.......CC.......
................
................
`;

// THE red laser pointer. the whole reason we doing this heist.
// every cat in a 10 mile radius wants this thing and honestly same
const laserGoal = bitmap`
................
................
.....333333.....
....33333333....
...3333333333...
...3344444433...
...3344334433...
...3344334433...
...3344444433...
...3333333333...
....33333333....
.....333333.....
................
................
................
................
`;

// vertical guard, its dr stick again but this one figured out
// how to walk up and down. honestly more annoying than the horizontal ones
const verticalGuard = bitmap`
......LLLL......
.....L.33.L.....
.....L....L.....
......LLLL......
.......LL.......
....LLLLLLLL....
...L...LL...L...
.......LL.......
.......LL.......
......L..L......
.....L....L.....
....L......L....
...L........L...
..L..........L..
................
................
`;

// golden trophy for beating all 7 zones. huge W, put it on the shelf
const trophy = bitmap`
................
..777777777777..
..700000000007..
.77000000000077.
.7.7000000007.7.
.7.7000000007.7.
..770000000077..
...7700000077...
....77000077....
.....770077.....
......7007......
......7007......
.....770077.....
....77000077....
...7777777777...
................
`;

// ===================================================
// 2. THE LEGEND  (which letter = which sprite. dont mess this up)
// ===================================================

setLegend(
  [ "w", wall ],
  [ "k", whiteTile ],
  [ "p", cat ],
  [ "s", stickman ],
  [ "v", verticalGuard ],
  [ "b", beam ],
  [ "f", fish ],
  [ "g", gravPad ],
  [ "l", laserGoal ],
  [ "t", trophy ]
);

// ===================================================
// 3. MAPS & LEVEL STUFF
// ===================================================

// cover the whole screen in white tiles for menus/transitions
// coz playing the heist on a black void is a different genre bhai
const whiteScreenMap = map`
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
`;

// the win screen, trophy + garfield chilling. they earned it fr
const winMap = map`
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkttk0kkkkk
kkkkkkkkttk0kkkkk
kkkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkkk
kkkkkkkkppkkkkkkk
kkkkkkkkppkkkkkkk
kkkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkkk
`;

// zone names + the little hint that shows up on the transition screen
// (the tips are basically free advice, still gonna get caught tho lol)
const levelMeta = [
  { name: "ZONE 1: VENTILATION SHAFT", tip: "Dr. Stick patrols horizontally. Grab fish and exit!" },
  { name: "ZONE 2: INVERSION TOWER", tip: "Vertical guards sweep up and down! Watch the beam." },
  { name: "ZONE 3: CROSSFIRE CORRIDOR", tip: "Both horizontal and vertical guards overlap here!" },
  { name: "ZONE 4: THE TWIN LABYRINTH", tip: "Use gravity pad G to bypass sentry patrol choke points." },
  { name: "ZONE 5: SENTRY INTERCHANGE", tip: "Multiple patrols! Time your movement through the middle." },
  { name: "ZONE 6: THE CEILING VAULT", tip: "Fish drives are high up. Invert gravity to collect them!" },
  { name: "ZONE 7: RED CORE SANCTUM", tip: "Final security layer! Outsmart all guards to win the Trophy!" }
];

// the actual 7 zones. hand designed every single one of these and
// playtested until my eyes hurt, zone 4 can honestly catch these hands
const playableLevels = [
  // Zone 1: Ventilation Hallway - the tutorial basically, dont get cocky
  map`
wwwwwwwwwwwwwwww
w.p..........f.w
w..............w
w...wwwwwwww...w
w..............w
w.......s......w
w..............w
w...wwwwwwww...w
w..............w
w..f...........w
w..............w
w...wwwwwwww...w
w..............w
w.......s......w
w......f.....l.w
wwwwwwwwwwwwwwww
`,

  // Zone 2: Inversion Tower - tall map, ur gonna need them grav pads
  map`
wwwwwwwwwwwwwwww
w.p...w....w.f.w
w.....w....w...w
w..f..w.v..w...w
w.....w....w...w
w.....w....w...w
w..............w
w..wwww....ww..w
w..............w
w...w....w.....w
w...w.v..w..f..w
w...w....w.....w
w...w....w.....w
w..............w
w..g.........l.w
wwwwwwwwwwwwwwww
`,

  // Zone 3: Crossfire Corridor - beams from both directions, good luck lol
  map`
wwwwwwwwwwwwwwww
w.p............w
w...wwwwwwww...w
w...w........f.w
w.v.w....s.....w
w...w..........w
w...wwww.www...w
w...f..........w
w...wwww.www...w
w...w..........w
w...w....s.....w
w.v.w........f.w
w...wwwwwwww...w
w..............w
w..g.........l.w
wwwwwwwwwwwwwwww
`,

  // Zone 4: Twin Labyrinth - my personal villain origin story ngl
  map`
wwwwwwwwwwwwwwww
w.p............w
w...s...g......w
w..............w
wwww....ww..wwww
w...f......f...w
w..v........v..w
w..............w
w..s........s..w
w..............w
w..g........g..w
wwww....ww..wwww
w..............w
w......s.......w
w......f....l..w
wwwwwwwwwwwwwwww
`,

  // Zone 5: Sentry Interchange - pure chaos, no thoughts just timing
  map`
wwwwwwwwwwwwwwww
w.p....w....f..w
w......w..v....w
w..s...w.......w
w......w.......w
w...wwwww..w...w
w..............w
w.g.....s....f.w
w..............w
w...w..wwwww...w
w......w..v....w
w..s...w.......w
w......w.......w
w...g......f...w
w............l.w
wwwwwwwwwwwwwwww
`,

  // Zone 6: Ceiling Vault - the fish are HIGH up, gravity is ur bestie here
  map`
wwwwwwwwwwwwwwww
w.p.f..w..f..f.w
w......w.......w
w.v....w....v..w
w......w.......w
w..wwwww..wwwww.w
w..............w
w......s.......w
w.g............w
w..wwwww..wwwww.w
w..w........w..w
w..w...s....w..w
w..w........w..w
w..wwwww..wwwww.w
w.g..........l.w
wwwwwwwwwwwwwwww
`,

  // Zone 7: Red Core Sanctum - final boss level of guard density, lets gooo
  map`
wwwwwwwwwwwwwwww
w.p....w.f..w..w
w..v...w....w.vw
w......w....w..w
w...wwww..ww...w
w..............w
w..s...f...s...w
w..............w
w...ww..wwww...w
w.g....w....w.gw
w......w....w..w
w..v...w.f..w.vw
w......ww..w...w
w..............w
w......s.....l.w
wwwwwwwwwwwwwwww
`
];

// ===================================================
// 4. GAME STATE  (the global mess, everything lives here)
// ===================================================

let gameState = "INTRO"; // "INTRO", "TRANSITION", "PLAYING", "BUSTED", "WIN"
let currentLevelIdx = 0;
let fishCollected = 0;
let totalFishInLevel = 0;
let gravityInverted = false;
let guards = [];
let bustedTimer = null;

// ===================================================
// 5. HUD & TEXT  (whatever is on the screen right now)
// ===================================================

function updateHUD() {
  clearText();

  if (gameState === "INTRO") {
    addText("THE GREAT LASER HEIST", { y: 1, color: color`3` });
    addText("Dr. Stick guards the Red Laser", { y: 3, color: color`0` });
    addText("Controls: WASD Move - J Flip Grav", { y: 5, color: color`D` });
    addText("Goal: Eat all fish treats, reach exit", { y: 7, color: color`5` });
    addText("Dodge yellow flashlight beams", { y: 9, color: color`3` });
    addText("Watch out for horizontal & vertical guards", { y: 11, color: color`0` });
    addText("Press K anytime to reset level", { y: 13, color: color`D` });
    addText("PRESS J OR W TO START", { y: 14, color: color`3` });
  }
  else if (gameState === "TRANSITION") {
      const meta = levelMeta[currentLevelIdx] || { name: `ZONE ${currentLevelIdx + 1}`, tip: "Stay sharp!" };
      addText(meta.name, { y: 2, color: color`3` });
      addText(`PREPARE GARFIELD-X!`, { y: 4, color: color`0` });
      addText(`LEVEL ${currentLevelIdx + 1} OF ${playableLevels.length}`, { y: 6, color: color`D` });
      addText(`MISSION INTEL:`, { y: 8, color: color`5` });
      addText(meta.tip, { y: 10, color: color`0` });
      addText(`PRESS J OR W TO ENTER ZONE`, { y: 13, color: color`3` });
  }
  else if (gameState === "PLAYING") {
      const gravText = gravityInverted ? "CEILING" : "FLOOR";
      addText(`ZONE ${currentLevelIdx + 1}/${playableLevels.length}  FISH: ${fishCollected}/${totalFishInLevel}  GRAV: ${gravText}`, {
        y: 0,
        color: color`0`
      });
  }
  else if (gameState === "BUSTED") {
      addText("BUSTED BY DR. STICK!", { y: 3, color: color`3` });
      addText("Flashlight beam detected Garfield-X!", { y: 6, color: color`0` });
      addText("Stay in cover and time your runs!", { y: 8, color: color`D` });
      addText("RESTARTING ZONE...", { y: 11, color: color`3` });
  }
  else if (gameState === "WIN") {
      addText("HEIST COMPLETE!", { y: 1, color: color`3` });
      addText("GOLDEN TROPHY UNLOCKED!", { y: 3, color: color`7` });
      addText("Garfield-X stole the Red Laser Pointer!", { y: 5, color: color`5` });
      addText("All 7 laboratory zones cleared!", { y: 8, color: color`0` });
      addText("Dr. Stick is totally baffled forever!", { y: 10, color: color`D` });
      addText("PRESS J TO REPLAY HEIST", { y: 14, color: color`3` });
  }
}

// ===================================================
// 6. LEVEL SETUP  (putting things where they belong)
// ===================================================

// grab the cat. theres only ever one player so this is fine lol
function getPlayer() {
  return getFirst("p");
}

// yeet every sprite of a type off the map, we use this to wipe
// the old flashlight beams before drawing the new ones every tick
function clearTileType(type) {
  const tiles = getAll(type);
  if (tiles) {
    tiles.forEach(t => t.remove());
  }
}

// turn every "s" and "v" on the map into an actual patrolling guard
// the idx % 2 thing just makes em alternate directions so they
// dont all walk the same way like some kinda synchronized dance group
function setupGuards() {
  guards = [];
  clearTileType("b");

    // horizontal ones, they march left and right
    const hGuards = getAll("s");
    if (hGuards) {
      hGuards.forEach((g, idx) => {
        guards.push({
          sprite: g,
          axis: "h",
          dir: idx % 2 === 0 ? 1 : -1
        });
      });
    }

    // vertical ones, these go up and down instead
    const vGuards = getAll("v");
    if (vGuards) {
      vGuards.forEach((g, idx) => {
        guards.push({
          sprite: g,
          axis: "v",
          dir: idx % 2 === 0 ? 1 : -1
        });
      });
    }
}

// the white screen that pops up between levels with the zone name on it
function showTransitionScreen(idx) {
  gameState = "TRANSITION";
  currentLevelIdx = idx;
  clearTileType("b");
  setMap(whiteScreenMap);
  updateHUD();
  playTune(tune`500:c5-100 650:g5-150`);
}

// loads a zone for real: resets gravity, counts the fish, spawns guards
function startLevel(idx) {
  gameState = "PLAYING";
  currentLevelIdx = idx;
  gravityInverted = false;
  setMap(playableLevels[currentLevelIdx]);

  const allFish = getAll("f");
  totalFishInLevel = allFish ? allFish.length : 0;
  fishCollected = 0;

  setupGuards();
  updateHUD();
}

// title screen, first thing u see when u boot the game up
function showIntroScreen() {
  gameState = "INTRO";
  clearTileType("b");
  setMap(whiteScreenMap);
  updateHUD();
}

// the W screen. garfield got the laser, dr stick is somewhere crying
function showWinScreen() {
  gameState = "WIN";
  clearTileType("b");
  setMap(winMap);
  updateHUD();
  playTune(tune`
    500:c5-150
    600:e5-150
    700:g5-150
    900:c6-250
    1000:e6-400
  `);
}

// ===================================================
// 7. GUARD AI  (dr stick aint smart but he aint standing still)
// ===================================================

// this runs on a loop every ~420ms. each guard takes a step in its
// lane, then plops down 2 beam tiles in front of itself. if garfield
// is standing in one of those tiles, thats a bust, gg
function updatePatrols() {
  if (gameState !== "PLAYING") return;

  clearTileType("b");

  guards.forEach(guard => {
    let nx = guard.sprite.x;
    let ny = guard.sprite.y;

      if (guard.axis === "h") {
        nx += guard.dir;
        const hitWall = getTile(nx, ny).some(s => s.type === "w");
        if (hitWall || nx <= 0 || nx >= 15) {
          guard.dir *= -1;
          nx = guard.sprite.x + guard.dir;
        }
        else {
          guard.sprite.x = nx;
        }

        // beam shoots out 2 tiles in the direction hes facing
        for (let dist = 1; dist <= 2; dist++) {
          let bx = guard.sprite.x + (guard.dir * dist);
          let by = guard.sprite.y;

          if (bx > 0 && bx < 15) {
            let wallAtBeam = getTile(bx, by).some(s => s.type === "w");
            if (wallAtBeam) break;

            addSprite(bx, by, "b");

            const player = getPlayer();
            if (player && player.x === bx && player.y === by) {
              triggerBusted();
              return;
            }
          }
        }
      }
      else {
        // same thing but vertical, dont ask me to explain it twice lol
        ny += guard.dir;
        const hitWall = getTile(nx, ny).some(s => s.type === "w");
        if (hitWall || ny <= 0 || ny >= 15) {
          guard.dir *= -1;
          ny = guard.sprite.y + guard.dir;
        }
        else {
          guard.sprite.y = ny;
        }

        for (let dist = 1; dist <= 2; dist++) {
          let bx = guard.sprite.x;
          let by = guard.sprite.y + (guard.dir * dist);

          if (by > 0 && by < 15) {
            let wallAtBeam = getTile(bx, by).some(s => s.type === "w");
            if (wallAtBeam) break;

            addSprite(bx, by, "b");

            const player = getPlayer();
            if (player && player.x === bx && player.y === by) {
              triggerBusted();
              return;
            }
          }
        }
      }
  });

  // also if u just rawdog walk INTO a guard thats also a bust,
  // some people try it, it does not work
  const player = getPlayer();
  if (player) {
    guards.forEach(g => {
      if (g.sprite.x === player.x && g.sprite.y === player.y) {
        triggerBusted();
      }
    });
  }
}

// L. the sad violin sound is on purpose, it builds character
function triggerBusted() {
  if (gameState !== "PLAYING") return;
  gameState = "BUSTED";
  clearTileType("b");
  setMap(whiteScreenMap);
  updateHUD();

  playTune(tune`
    320:d4-150
    240:c4-250
    180:a3-350
  `);

    if (bustedTimer) clearTimeout(bustedTimer);
    bustedTimer = setTimeout(() => {
      startLevel(currentLevelIdx);
    }, 1400);
}

// ===================================================
// 8. MOVEMENT, GRAVITY & PICKUPS
// ===================================================

// gravity in this game is not a suggestion, its a whole mechanic.
// whenever gravity flips (or u land on a pad) garfield yeets all the
// way to the floor/ceiling in that direction until a wall says stop
function applyGravity() {
  if (gameState !== "PLAYING") return;
  const player = getPlayer();
  if (!player) return;

  const dy = gravityInverted ? -1 : 1;
  let targetY = player.y + dy;

    while (targetY >= 0 && targetY <= 15) {
      let blocked = getTile(player.x, targetY).some(s => s.type === "w");
      if (blocked) break;

      player.y = targetY;
      handleInteractions(player.x, player.y);
      targetY = player.y + dy;
    }
}

// everything that can happen to garfield by standing on a tile:
// fish, grav pad, the exit, and the beam that ruins the whole run
function handleInteractions(x, y) {
  const player = getPlayer();
  if (!player) return;

  // 1. nom the fish
  const fishHere = getTile(x, y).find(s => s.type === "f");
  if (fishHere) {
    fishHere.remove();
    fishCollected++;
    playTune(tune`550:c5-80 650:g5-120`);
    updateHUD();
  }

  // 2. gravity pad, wheeeee
  const padHere = getTile(x, y).find(s => s.type === "g");
  if (padHere) {
    gravityInverted = !gravityInverted;
    playTune(tune`420:e4-120 750:b5-180`);
    updateHUD();
    applyGravity();
  }

  // 3. the laser pointer exit. locked until every fish is gone, sry
  const goalHere = getTile(x, y).find(s => s.type === "l");
  if (goalHere) {
    if (fishCollected >= totalFishInLevel) {
        if (currentLevelIdx < playableLevels.length - 1) {
          playTune(tune`600:c5-100 750:e5-100 900:c6-250`);
          showTransitionScreen(currentLevelIdx + 1);
        } else {
          showWinScreen();
        }
    }
    else {
      // locked. go back and get the fish bro, u skipped one
      playTune(tune`220:e3-150`);
    }
  }

  // 4. walked straight into a beam. skill issue tbh
  const beamHere = getTile(x, y).find(s => s.type === "b");
  if (beamHere) {
    triggerBusted();
  }
}

// ur basic one-tile walk. walls stop u, map edges stop u, everything
// else u can stroll right onto and then deal with the consequences
function tryMove(dx, dy) {
  if (gameState !== "PLAYING") return;
  const player = getPlayer();
  if (!player) return;

  const tx = player.x + dx;
  const ty = player.y + dy;

    // grid is 0-15, outside that is the void and we do not go there
    if (tx < 0 || tx > 15 || ty < 0 || ty > 15) return;
    const isWall = getTile(tx, ty).some(s => s.type === "w");
    if (isWall) return;

    player.x = tx;
    player.y = ty;

    handleInteractions(player.x, player.y);
}

// ===================================================
// 9. CONTROLS  (WASD to move, J gravity, K reset)
// ===================================================

onInput("w", () => {
  if (gameState === "INTRO" || gameState === "TRANSITION") {
    startLevel(currentLevelIdx);
  }
  else if (gameState === "BUSTED") {
    if (bustedTimer) clearTimeout(bustedTimer);
    startLevel(currentLevelIdx);
  }
  else {
    tryMove(0, -1);
  }
});

onInput("s", () => {
  tryMove(0, 1);
});

onInput("a", () => {
  tryMove(-1, 0);
});

onInput("d", () => {
  tryMove(1, 0);
});

// J does everything that isnt walking: start, enter zone, flip gravity,
// replay after winning. its the second most important button in the game
onInput("j", () => {
  if (gameState === "INTRO" || gameState === "TRANSITION") {
    startLevel(currentLevelIdx);
  }
  else if (gameState === "WIN") {
    currentLevelIdx = 0;
    showIntroScreen();
  }
  else if (gameState === "BUSTED") {
    if (bustedTimer) clearTimeout(bustedTimer);
    startLevel(currentLevelIdx);
  }
  else {
    gravityInverted = !gravityInverted;
    playTune(tune`360:d4-90 560:a4-130`);
    updateHUD();
    applyGravity();
  }
});

// panic button. softlocked? stuck? just press K, the zone resets
onInput("k", () => {
  if (gameState === "PLAYING" || gameState === "BUSTED") {
    if (bustedTimer) clearTimeout(bustedTimer);
    startLevel(currentLevelIdx);
  }
});

// ===================================================
// 10. THE TICK  (guards move on this heartbeat, dont set it too
// low or the game becomes unplayable, dont ask how i know)
// ===================================================

setInterval(() => {
  updatePatrols();
}, 420);

// boot it up. welcome to the heist 🐱🔦
showIntroScreen();
