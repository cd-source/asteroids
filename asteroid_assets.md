# Asteroids Game - Asset Specification

Modern arcade space aesthetic with crisp neon elements, painterly asteroids, subtle bloom/glow effects, and parallax nebula backgrounds.

---

## Background Layers

- space-base (1920x1440) - Dark navy/black space base layer with minimal noise, high quality JPG
  - Filename: `space-base.jpg`
  - Path: `assets/img/backgrounds/`

- nebula-layer (2048x2048) - Soft nebula clouds with alpha transparency, painterly style, deep purples and blues
  - Filename: `nebula-layer.png`
  - Path: `assets/img/backgrounds/`

- stars-bright (2048x2048) - Sparse bright stars layer, alpha transparency, parallax fast movement
  - Filename: `stars-bright.png`
  - Path: `assets/img/backgrounds/`

- stars-dense (2048x2048) - Dense tiny stars background, alpha transparency, parallax slow movement
  - Filename: `stars-dense.png`
  - Path: `assets/img/backgrounds/`

- vignette (1024x768) - Subtle edge darkening overlay, alpha transparency for depth
  - Filename: `vignette.png`
  - Path: `assets/img/overlays/`

- film-grain (512x512) - Tileable subtle film grain texture, alpha transparency
  - Filename: `film-grain.png`
  - Path: `assets/img/overlays/`

## Player Ship

- ship-idle (256x256) - Player ship resting state, neon rim-light, emissive cockpit, centered with rotation padding
  - Filename: `ship-idle.png`
  - Path: `assets/img/sprites/ship/`

- ship-thrust-1 (256x256) - Ship with small thrust flame, first animation frame
  - Filename: `ship-thrust-1.png`
  - Path: `assets/img/sprites/ship/`

- ship-thrust-2 (256x256) - Ship with larger thrust flame, second animation frame
  - Filename: `ship-thrust-2.png`
  - Path: `assets/img/sprites/ship/`

- ship-flash (256x256) - Bright white ship silhouette for hit/damage feedback
  - Filename: `ship-flash.png`
  - Path: `assets/img/sprites/ship/`

- ship-shadow (256x256) - Soft circular shadow blob for depth effect
  - Filename: `ship-shadow.png`
  - Path: `assets/img/sprites/ship/`

## Asteroids Large

- asteroid-l1 (256x256) - Large rocky asteroid, cracks and craters, top-left lighting, generous padding for rotation
  - Filename: `asteroid-l1.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-l2 (256x256) - Large rocky asteroid variant 2, unique shape with surface detail
  - Filename: `asteroid-l2.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-l3 (256x256) - Large rocky asteroid variant 3, jagged edges with crater ambient occlusion
  - Filename: `asteroid-l3.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-l4 (256x256) - Large rocky asteroid variant 4, rounded with deep cracks
  - Filename: `asteroid-l4.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-l5 (256x256) - Large rocky asteroid variant 5, angular faceted surfaces
  - Filename: `asteroid-l5.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-l6 (256x256) - Large rocky asteroid variant 6, weathered with exposed mineral veins
  - Filename: `asteroid-l6.png`
  - Path: `assets/img/sprites/asteroids/`

## Asteroids Medium

- asteroid-m1 (192x192) - Medium rocky asteroid, cracks and craters, top-left lighting
  - Filename: `asteroid-m1.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-m2 (192x192) - Medium rocky asteroid variant 2, irregular shape
  - Filename: `asteroid-m2.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-m3 (192x192) - Medium rocky asteroid variant 3, cratered surface
  - Filename: `asteroid-m3.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-m4 (192x192) - Medium rocky asteroid variant 4, chunky broken edges
  - Filename: `asteroid-m4.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-m5 (192x192) - Medium rocky asteroid variant 5, smooth weathered surfaces
  - Filename: `asteroid-m5.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-m6 (192x192) - Medium rocky asteroid variant 6, fractured crystalline structure
  - Filename: `asteroid-m6.png`
  - Path: `assets/img/sprites/asteroids/`

## Asteroids Small

- asteroid-s1 (128x128) - Small rocky fragment, simple detail, top-left lighting
  - Filename: `asteroid-s1.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-s2 (128x128) - Small rocky fragment variant 2, sharp edges
  - Filename: `asteroid-s2.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-s3 (128x128) - Small rocky fragment variant 3, rounded pebble
  - Filename: `asteroid-s3.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-s4 (128x128) - Small rocky fragment variant 4, angular shard
  - Filename: `asteroid-s4.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-s5 (128x128) - Small rocky fragment variant 5, irregular chunk
  - Filename: `asteroid-s5.png`
  - Path: `assets/img/sprites/asteroids/`

- asteroid-s6 (128x128) - Small rocky fragment variant 6, crystalline piece
  - Filename: `asteroid-s6.png`
  - Path: `assets/img/sprites/asteroids/`

## Projectiles and Effects

- bullet-glow (32x32) - Glowing bullet projectile, emissive core with soft halo
  - Filename: `bullet-glow.png`
  - Path: `assets/img/sprites/bullets/`

- bullet-trail (256x64) - Streaking trail texture, alpha transparency, stretches along velocity vector
  - Filename: `bullet-trail.png`
  - Path: `assets/img/sprites/bullets/`

- particle-soft (64x64) - Soft circular particle blob for general VFX, alpha transparency
  - Filename: `particle-soft.png`
  - Path: `assets/img/sprites/vfx/`

- particle-spark (64x64) - Sharp angular spark particle for impact effects, alpha transparency
  - Filename: `particle-spark.png`
  - Path: `assets/img/sprites/vfx/`

- explosion-sheet (2048x2048) - Explosion animation spritesheet, 8x8 grid equals 64 frames at 256x256 each
  - Filename: `explosion-sheet.png`
  - Path: `assets/img/sprites/vfx/`

- shockwave-ring (512x512) - Circular shockwave ring expanding from explosions, alpha transparency
  - Filename: `shockwave-ring.png`
  - Path: `assets/img/sprites/vfx/`

- smoke-puff (256x256) - Smoke cloud particle for debris trails, alpha transparency
  - Filename: `smoke-puff.png`
  - Path: `assets/img/sprites/vfx/`

## UI Elements

- hud-frame (1024x256) - Top bar HUD frame with glass effect, neon edges, 60-70% opacity
  - Filename: `hud-frame.png`
  - Path: `assets/img/sprites/ui/`

- icon-score (64x64) - Score/points icon, crisp neon styling
  - Filename: `icon-score.png`
  - Path: `assets/img/sprites/ui/`

- icon-lives (64x64) - Player lives/ships remaining icon
  - Filename: `icon-lives.png`
  - Path: `assets/img/sprites/ui/`

- icon-level (64x64) - Level/wave indicator icon
  - Filename: `icon-level.png`
  - Path: `assets/img/sprites/ui/`

- button-main (512x128) - Primary action button, neon border with glass fill
  - Filename: `button-main.png`
  - Path: `assets/img/sprites/ui/`
