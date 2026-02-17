# Asteroids — Session Status
**Updated:** Feb 17, 2026
**Last commit:** `5ef40b6` — Sprite-based rendering overhaul
**Repo:** https://github.com/cd-source/asteroids

---

## What Was Done (Feb 15–17)

### Sprite Generation
- Generated **35 custom sprites** via Flux 2 (fal-ai/flux/dev) with consistent neon-cyan aesthetic
- All sprites on black backgrounds, composited with additive blending in-game
- Resized all to spec dimensions with `sips`
- Optimized total assets from **19MB → 7.4MB**

| Category | Assets | Sizes |
|----------|--------|-------|
| Ship (idle, thrust-1, thrust-2, flash, shadow) | 5 | 256x256 |
| Asteroids (l1-l6, m1-m6, s1-s6) | 18 | 256/192/128 |
| Bullets (glow, trail) | 2 | 32x32, 64x16 |
| Backgrounds (space-base, nebula, stars x2) | 4 | 2048x2048 (no longer loaded) |
| Overlays (vignette) | 1 | 2048x2048 |
| VFX (explosion-sheet, particles x2, shockwave, smoke) | 5 | various |
| UI (hud-frame, icons x3, button) | 5 | various |

### Game Engine Rewrite
- **Asset preloader** with cyan progress bar loading screen
- **Sprite-based rendering** for ship, asteroids, bullets, explosions
- **Explosion spritesheet** — 8x8 grid (64 frames) with shockwave ring
- **Score popups** — "+25/50/75" float from destroyed asteroids
- **Level transitions** — "LEVEL X / GET READY" with fade + chime sound
- **High score** — localStorage persistence, shown on start screen + game over
- **Responsive canvas** — scales with wrapper via `S()` function
- **Procedural fallbacks** — every sprite has a canvas-drawn fallback if load fails

### HTML Updates
- Switched to Google Fonts CDN (Orbitron + Space Grotesk)
- High score display on start screen
- Start game via Enter, Space, or Click
- Removed film-grain overlay reference (asset doesn't exist)

---

## Playtest Fixes (Feb 17 — uncommitted)

After playtesting, these issues were found and fixed:

| Issue | Fix | File:Line |
|-------|-----|-----------|
| **Explosions had visible black squares** | Clipped to circle + added fade-out in last 30% | game.js:633 |
| **Ship too transparent/ghostly** | Changed from `drawSpriteAdditive` to `drawSprite` (normal blend) | game.js:373 |
| **Asteroids transparent** | Same — rendering through additive blend made them see-through. Ship uses normal blend now, asteroids still use additive (which makes black BG invisible while keeping the sprite visible on dark canvas) | game.js:497 |
| **Small asteroids too small to hit** | Bumped draw size from S(38)→S(60), collision radius from S(15)→S(28) | game.js:479,491 |
| **Medium asteroids** | Bumped draw size from S(58)→S(65) | game.js:491 |
| **Slow frame rate** | Removed 4 heavy background images (14MB of parallax layers drawing 27 large images/frame). Replaced with procedural pixel stars | game.js:167,906 |
| **Background too distracting** | Simplified to classic Asteroids: black fill + ~120 static white dots (1-2px) | game.js:906 |
| **Start game not responding** | Added Space/Click to start + canvas focus on load | game.js:1030 |
| **film-grain.png 404** | Removed CSS reference to nonexistent asset | index.html:201 |

**Status: These changes are in the working tree but NOT yet committed.**

---

## What's Left to Do

### Priority 1 — Verify & Commit
- [ ] Playtest current state — confirm all 9 fixes above work visually
- [ ] Commit the uncommitted changes

### Priority 2 — Visual Polish
- [ ] Ship trail using bullet-trail.png during thrust
- [ ] Smoke puffs tuning on ship death
- [ ] Vignette overlay — check if it adds value or remove
- [ ] Screen shake tuning (already coded, may need amplitude adjustment)

### Priority 3 — UI Integration
- [ ] Wire up hud-frame.png, icon-score/lives/level.png, button-main.png (generated but unused)
- [ ] Styled game-over screen using UI sprites

### Priority 4 — Audio
- [ ] Volume slider (currently just mute toggle)
- [ ] Background music loop
- [ ] Richer explosion/thrust sounds

### Priority 5 — Cleanup
- [ ] Remove empty `/src/` placeholder files
- [ ] Add .gitignore for .DS_Store
- [ ] Remove or archive unused background images from `assets/img/backgrounds/` (no longer loaded)

---

## How to Run
```bash
cd ~/asteroids
python3 -m http.server 8080
# or: npx serve -l 8080
# Open http://localhost:8080
```
No build step — plain HTML/JS/CSS.

---

## Architecture
```
asteroids/
├── index.html          # Entry point, Google Fonts, start screen
├── game.js             # All game logic (~1040 lines)
├── STATUS.md           # This file
├── asteroid_assets.md  # Asset specification document
├── assets/
│   ├── fonts/          # Empty (using Google Fonts CDN)
│   ├── audio/          # Empty (using Web Audio synthesis)
│   └── img/
│       ├── backgrounds/    # 4 PNGs (no longer loaded in game)
│       ├── overlays/       # vignette.png
│       └── sprites/
│           ├── asteroids/  # 18 variants (l/m/s × 6)
│           ├── bullets/    # glow + trail
│           ├── ship/       # idle, thrust-1, thrust-2, flash, shadow
│           ├── ui/         # hud-frame, icons, button (not yet wired up)
│           └── vfx/        # explosion-sheet, particles, shockwave, smoke
```
