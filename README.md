# ASTEROIDS

A modern take on the classic arcade game — with enemy UFOs, boss motherships, power-ups, particle effects, and a global leaderboard. Built with vanilla JavaScript, Web Audio API, and 40+ hand-crafted sprites.

**Play now:** [https://cd-source.github.io/asteroids/](https://cd-source.github.io/asteroids/)

## Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Rotate | Arrow Left / Right or A / D | Left / Right buttons |
| Thrust | Arrow Up or W | Thrust button |
| Fire | Space | Fire button |
| Hyperspace | Tab (teleport to safety — requires charges) | Hyper button |
| Start / Restart | Enter, Space, or Click | Tap anywhere |

Touch controls appear automatically on mobile and tablet devices.

## How to Play

Destroy all asteroids to advance to the next level. Large asteroids split into medium, medium into small. You start with 3 lives — earn an extra life (1-UP) every 10,000 points.

**Scoring:**

| Target | Points |
|--------|--------|
| Large asteroid | 25 |
| Medium asteroid | 50 |
| Small asteroid | 75 |
| Large UFO | 200 |
| Small UFO | 1,000 |
| Boss mothership | 5,000 x boss number |

After each level, asteroids get faster and more numerous. The environment color shifts every level — 8 distinct palettes that cycle.

## Enemy UFOs

Two types of hostile saucers appear as you progress:

- **Large UFO** — slow, fires randomly. Appears from level 2+
- **Small UFO** — fast, aims directly at you. Appears from level 4+

UFOs spawn from the screen edges, fly across with a sine-wave drift, and fire at regular intervals. Destroying them has a high chance of dropping a power-up.

## Boss Motherships

Every 5 levels a boss mothership descends. Bosses have hit-point bars, multiple attack patterns (radial bursts, aimed volleys, spiral barrages), and escalating difficulty. Each successive boss is tougher, faster, and worth more points. Clear the boss to advance.

## Power-Ups

Power-ups drop from destroyed asteroids and UFOs. The better your streak, the more they appear.

| Power-Up | Effect | Duration |
|----------|--------|----------|
| 2x Gun | Triple shot, narrow spread | ~10 sec |
| 3x Gun | Triple shot, wide spread | ~7.5 sec |
| Rapid Fire | ~2.5x fire rate | ~8 sec |
| Side Guns | Extra bullets from ship flanks | Until death |
| Shield | Absorbs one hit | Until hit |
| Hyperspace | Gain 3 teleport charges (max 5) | Until used |

Timed power-ups flash when about to expire. All power-ups are lost when you die.

## Leaderboard

After game over, type your name and press Enter to save your score. The top 10 from the global leaderboard are shown on the start screen — compete against everyone who's played.

## Features

- 40+ custom sprites with additive-blend rendering
- Procedural audio (7 SFX + thrust engine) via Web Audio API
- Thrust flame and explosion particle effects
- Screen shake on impacts
- 8 cycling color palettes per level zone
- Responsive canvas — scales to any screen size
- Mobile touch controls (auto-detected)
- Global leaderboard via Supabase

## Requirements

Any modern browser — Chrome, Firefox, Safari, Edge. No install needed. Works on desktop and mobile.

---

Built by [Edenic Labs](https://edenic.co) with [Gee-Code](https://gee.computer)
