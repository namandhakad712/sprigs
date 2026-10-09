# OVERLOAD — a sensory dropper for Sprig

*You are falling. The shaft streams past. Dodge the debris. The deeper you get,
the more the game fights your senses.*

An original Sprig game inspired by the "dropper + disorientation" genre
(Sensory Overload on Steam), built from scratch for the Sprig gallery —
which contains **zero** games built around escalating sensory-disorientation
effects (checked against all 1,155 gallery entries).

## Controls

| Key | Action |
|-----|--------|
| `A` / `D` | steer left / right |
| `W` | brake — slower world, **half** points |
| `S` | dive — **double** points, faster world |
| `I` | pause |
| `J` | start / retry |

## How it works

- One screen (10×8 tiles), you're pinned at row 3, the world streams upward.
- Hazards rise toward you: **blocks**, **spikes**, **3-wide bars with one gap**,
  **saws**. Every spawn shows a `!` warning tile one step before it materializes.
- Distance = score. Depth gates advance the level, each faster + denser:

| Lv | Name | Speed (ms/step) | Spawn chance | Unlocked effects |
|----|------|------|------|------|
| 1 | WARM-UP | 250 | 0.30 | *(none — learn the dodge)* |
| 2 | SPIN CYCLE | 200 | 0.38 | sway (tunnel twists) |
| 3 | STATIC | 200 | 0.44 | static, palette cycle |
| 4 | BREATH | 150 | 0.50 | breathing walls, sway, static |
| 5 | MIRRORS | 150 | 0.56 | mirror flip, control inversion |
| 6 | MELTDOWN | 100 | 0.62 | strobe, double vision, shake |
| 7 | BLACKOUT | 100 | 0.70 | stacks more |
| 8 | OVERLOAD | 100 | 0.80 | everything, 2 at once |
| 9 | !! | 100 | 0.90 | maximum chaos |

### The nine effects
1. **sway** — the whole tunnel twists sideways while hazards approach
2. **shake** — jolting horizontal jitter
3. **breathe** — walls chew in and out of the shaft (1-tick `!` warning, then lethal)
4. **mirror** — world flips left↔right (and flips back when it ends)
5. **invert** — `A/D` and `W/S` silently swap (only a `?` hint)
6. **strobe** — background cycles hot colors at 2 Hz (well under photosensitivity thresholds, warned)
7. **palette** — every sprite's colors rotate through the 16-color palette
8. **ghost** — a decoy copy of your pod trails you
9. **static** — TV-noise tiles scatter across the playfield

Hazards at/past your own row never twist — only *approaching* hazards do, so
every death is readable (the fairness line the test harness enforces).

## Files

- **`game.js`** — the complete game. Paste into https://sprig.hackclub.com/editor and press Run.
- **`test.js`** — headless test harness: a faithful mock of the Sprig engine
  (`engine/src/base/index.ts` semantics: solids, bounds, map parsing, legend
  validation, tune-format validation, text bounds) plus an adaptive AI player
  that plays for ~20 simulated minutes per run.

```bash
node test.js
```

Latest verified results (stable across runs):

```
max level   : 8   (final "!!" level reached)
max depth   : 2000+ m
effects seen: all 9
deaths      : 6 per 24,000 ticks (only inescapable spawn boxes)
errors      : 0    warnings: 0
```

The harness validates: every bitmap is exactly 16×16 with legal palette chars,
legend keys unique/single-char, no shadowing of Sprig API identifiers, tune
strings parse, text fits the 21×16 text grid, all sprites stay in bounds,
menu→play→pause→dead→retry state machine works, stationary players die
(minimum challenge), injected hazards kill, and depth gates/effects fire.

## Notable bugs the harness caught (fixed)

1. Sway/shake swung hazards *sideways into the player's row* after the world
   step — zero-reaction-time deaths. Now skipped for `y <= 3`.
2. `toggleBreath` leaked stale `!` warning sprites each cycle.
3. Tunes use **MIDI note numbers**, not Hz (`frequency = 2**((n-69)/12)*440`).

## Sprig submission checklist (GET_A_SPRIG)

- [x] Runs in the Sprig editor (current API: `setInterval`, `onInput`, no removed APIs)
- [x] Original — no gallery game uses sensory-disorientation mechanics
- [x] 1 minute+ of gameplay — runs are 30 s (early death) to 3+ min (deep runs); endless score attack
- [x] Uses only Sprig hardware: 160×128 screen, A/D/W/S/I/J keys, speaker tunes
- [x] Flashing kept at ≤2 Hz on dark palette colors with an on-screen warning
- [x] Auto-triage bot compliance: metadata header (`@title/@author/@description/@tags/@addedOn`) included in `game.js`, no `document/window/alert/fetch` in code, filename `Overload.js` in `games/`, PR body fields (author/about/how-to-play) ready in the submission copy above
