// Asteroids – Sprite-Based Arcade Game
// ═══════════════════════════════════════════════════════════════

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const messageEl = document.getElementById('message');

// ── Responsive Canvas ────────────────────────────────────────
const BASE_W = 960;
const BASE_H = 720;

function resizeCanvas() {
    const wrap = canvas.parentElement;
    const rect = wrap.getBoundingClientRect();
    canvas.width = Math.round(rect.width);
    canvas.height = Math.round(rect.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── Asset Loader ─────────────────────────────────────────────
const ASSETS = {};
const ASSET_LIST = {
    // Backgrounds
    'bg-space':        'assets/img/backgrounds/space-base.png',
    'bg-nebula':       'assets/img/backgrounds/nebula-layer.png',
    'bg-stars-bright': 'assets/img/backgrounds/stars-bright.png',
    'bg-stars-dense':  'assets/img/backgrounds/stars-dense.png',
    // Overlays
    'overlay-vignette': 'assets/img/overlays/vignette.png',
    // Ship
    'ship-idle':       'assets/img/sprites/ship/ship-idle.png',
    'ship-thrust-1':   'assets/img/sprites/ship/ship-thrust-1.png',
    'ship-thrust-2':   'assets/img/sprites/ship/ship-thrust-2.png',
    'ship-flash':      'assets/img/sprites/ship/ship-flash.png',
    'ship-shadow':     'assets/img/sprites/ship/ship-shadow.png',
    // Asteroids – Large
    'asteroid-l1': 'assets/img/sprites/asteroids/asteroid-l1.png',
    'asteroid-l2': 'assets/img/sprites/asteroids/asteroid-l2.png',
    'asteroid-l3': 'assets/img/sprites/asteroids/asteroid-l3.png',
    'asteroid-l4': 'assets/img/sprites/asteroids/asteroid-l4.png',
    'asteroid-l5': 'assets/img/sprites/asteroids/asteroid-l5.png',
    'asteroid-l6': 'assets/img/sprites/asteroids/asteroid-l6.png',
    // Asteroids – Medium
    'asteroid-m1': 'assets/img/sprites/asteroids/asteroid-m1.png',
    'asteroid-m2': 'assets/img/sprites/asteroids/asteroid-m2.png',
    'asteroid-m3': 'assets/img/sprites/asteroids/asteroid-m3.png',
    'asteroid-m4': 'assets/img/sprites/asteroids/asteroid-m4.png',
    'asteroid-m5': 'assets/img/sprites/asteroids/asteroid-m5.png',
    'asteroid-m6': 'assets/img/sprites/asteroids/asteroid-m6.png',
    // Asteroids – Small
    'asteroid-s1': 'assets/img/sprites/asteroids/asteroid-s1.png',
    'asteroid-s2': 'assets/img/sprites/asteroids/asteroid-s2.png',
    'asteroid-s3': 'assets/img/sprites/asteroids/asteroid-s3.png',
    'asteroid-s4': 'assets/img/sprites/asteroids/asteroid-s4.png',
    'asteroid-s5': 'assets/img/sprites/asteroids/asteroid-s5.png',
    'asteroid-s6': 'assets/img/sprites/asteroids/asteroid-s6.png',
    // Bullets
    'bullet-glow':  'assets/img/sprites/bullets/bullet-glow.png',
    'bullet-trail': 'assets/img/sprites/bullets/bullet-trail.png',
    // VFX
    'particle-soft':   'assets/img/sprites/vfx/particle-soft.png',
    'particle-spark':  'assets/img/sprites/vfx/particle-spark.png',
    'explosion-sheet': 'assets/img/sprites/vfx/explosion-sheet.png',
    'shockwave-ring':  'assets/img/sprites/vfx/shockwave-ring.png',
    'smoke-puff':      'assets/img/sprites/vfx/smoke-puff.png',
};

let assetsLoaded = false;

function loadAssets(onProgress) {
    return new Promise((resolve) => {
        const keys = Object.keys(ASSET_LIST);
        let loaded = 0;
        const total = keys.length;

        keys.forEach(key => {
            const img = new Image();
            img.onload = () => {
                ASSETS[key] = img;
                loaded++;
                if (onProgress) onProgress(loaded, total);
                if (loaded >= total) { assetsLoaded = true; resolve(); }
            };
            img.onerror = () => {
                console.warn(`Failed to load: ${ASSET_LIST[key]}`);
                loaded++;
                if (onProgress) onProgress(loaded, total);
                if (loaded >= total) { assetsLoaded = true; resolve(); }
            };
            img.src = ASSET_LIST[key];
        });
    });
}

// ── Loading Screen ───────────────────────────────────────────
function drawLoadingScreen(loaded, total) {
    const W = canvas.width;
    const H = canvas.height;
    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, W, H);

    const progress = loaded / total;
    const barW = Math.min(320, W * 0.5);
    const barH = 6;
    const barX = (W - barW) / 2;
    const barY = H / 2 + 30;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${Math.round(W * 0.04)}px Orbitron, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('ASTEROIDS', W / 2, H / 2 - 20);

    // Subtitle
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = `${Math.round(W * 0.014)}px monospace`;
    ctx.fillText(`Loading assets  ${loaded}/${total}`, W / 2, H / 2 + 12);

    // Progress bar track
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, barH / 2);
    ctx.fill();

    // Progress bar fill
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, '#00d4ff');
    grad.addColorStop(1, '#78fff5');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * progress, barH, barH / 2);
    ctx.fill();

    // Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00d4ff';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * progress, barH, barH / 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

// ── Game State ───────────────────────────────────────────────
let ship = null;
let asteroids = [];
let bullets = [];
let particles = [];
let explosions = [];
let shockwaves = [];
let scorePopups = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('asteroids-highscore')) || 0;
let lives = 3;
let level = 1;
let gameStarted = false;
let gameOver = false;
let invincible = false;
let invincibleTimer = 0;
let screenShake = 0;
let frameCount = 0;

// Level transition
let levelTransition = false;
let levelTransitionTimer = 0;
let levelTransitionText = '';

// Parallax offsets
const parallax = {
    dense:  { x: 0, y: 0 },
    bright: { x: 0, y: 0 },
    nebula: { x: 0, y: 0 },
};

// ── Audio ────────────────────────────────────────────────────
const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let thrustOscillator = null;
let thrustGain = null;

function initAudio() {
    if (!audioCtx) audioCtx = new AudioCtxClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playLaser() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.12);
}

function playExplosion(large = false) {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const dur = large ? 0.5 : 0.25;
    const bufSz = audioCtx.sampleRate * dur;
    const buf = audioCtx.createBuffer(1, bufSz, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSz; i++) data[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const flt = audioCtx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(large ? 250 : 700, audioCtx.currentTime);
    flt.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + dur);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(large ? 0.45 : 0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    src.connect(flt);
    flt.connect(gain);
    gain.connect(audioCtx.destination);
    src.start(audioCtx.currentTime);
    src.stop(audioCtx.currentTime + dur);
}

function playLevelUp() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + i * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.1 + 0.3);
        osc.start(audioCtx.currentTime + i * 0.1);
        osc.stop(audioCtx.currentTime + i * 0.1 + 0.3);
    });
}

function startThrust() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx || thrustOscillator) return;
    thrustOscillator = audioCtx.createOscillator();
    thrustGain = audioCtx.createGain();
    thrustOscillator.type = 'sawtooth';
    thrustOscillator.frequency.setValueAtTime(80, audioCtx.currentTime);
    thrustGain.gain.setValueAtTime(0, audioCtx.currentTime);
    thrustGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.05);
    thrustOscillator.connect(thrustGain);
    thrustGain.connect(audioCtx.destination);
    thrustOscillator.start(audioCtx.currentTime);
}

function stopThrust() {
    if (!thrustOscillator || !thrustGain) return;
    try {
        thrustGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.05);
        thrustOscillator.stop(audioCtx.currentTime + 0.06);
    } catch (e) { /* already stopped */ }
    thrustOscillator = null;
    thrustGain = null;
}

// ── Input ────────────────────────────────────────────────────
const keys = {};
document.addEventListener('keydown', (e) => { keys[e.key] = true; });
document.addEventListener('keyup',   (e) => { keys[e.key] = false; });

// ── Drawing Helpers ──────────────────────────────────────────
function drawSpriteAdditive(img, x, y, w, h, rotation = 0, alpha = 1) {
    if (!img) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    if (rotation) ctx.rotate(rotation);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
}

function drawSprite(img, x, y, w, h, rotation = 0, alpha = 1) {
    if (!img) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    if (rotation) ctx.rotate(rotation);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
}

// Scale factor for responsive rendering
function S(val) { return val * (canvas.width / BASE_W); }
function W() { return canvas.width; }
function H() { return canvas.height; }

// ── Score Popup ──────────────────────────────────────────────
class ScorePopup {
    constructor(x, y, pts) {
        this.x = x;
        this.y = y;
        this.pts = pts;
        this.life = 50;
        this.maxLife = 50;
        this.vy = -1.5;
    }

    draw() {
        const t = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = t;
        ctx.fillStyle = '#78fff5';
        ctx.font = `bold ${S(16)}px Orbitron, monospace`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00d4ff';
        ctx.fillText(`+${this.pts}`, this.x, this.y);
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    update() {
        this.y += this.vy;
        this.vy *= 0.97;
        this.life--;
    }
}

// ── Ship ─────────────────────────────────────────────────────
class Ship {
    constructor() {
        this.x = W() / 2;
        this.y = H() / 2;
        this.angle = -Math.PI / 2;
        this.velocity = { x: 0, y: 0 };
        this.radius = S(15);
        this.thrust = false;
        this.shootCooldown = 0;
        this.thrustFrame = 0;
    }

    draw() {
        const size = S(52);

        // Shadow
        if (ASSETS['ship-shadow']) {
            drawSpriteAdditive(ASSETS['ship-shadow'], this.x + S(3), this.y + S(3),
                size * 1.1, size * 1.1, this.angle + Math.PI / 2, 0.25);
        }

        // Choose sprite
        let spriteKey = 'ship-idle';
        if (this.thrust) {
            this.thrustFrame = (this.thrustFrame + 0.15) % 2;
            spriteKey = this.thrustFrame < 1 ? 'ship-thrust-1' : 'ship-thrust-2';
        }

        // Invincibility flash
        let alpha = 1;
        if (invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            alpha = 0.35;
            spriteKey = 'ship-flash';
        }

        const img = ASSETS[spriteKey];
        if (img) {
            drawSpriteAdditive(img, this.x, this.y, size, size, this.angle + Math.PI / 2, alpha);
        } else {
            this.drawFallback(alpha);
        }
    }

    drawFallback(alpha) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#4A9EFF';
        ctx.strokeStyle = '#2E7FD9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(S(20), 0);
        ctx.lineTo(S(-15), S(-12));
        ctx.lineTo(S(-10), 0);
        ctx.lineTo(S(-15), S(12));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (this.thrust) {
            const fl = S(15 + Math.random() * 10);
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.moveTo(S(-10), S(-4));
            ctx.lineTo(S(-10) - fl, 0);
            ctx.lineTo(S(-10), S(4));
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    update() {
        if (keys['ArrowLeft']  || keys['a'] || keys['A']) this.angle -= 0.08;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) this.angle += 0.08;

        const wasThrusting = this.thrust;
        this.thrust = false;
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            this.thrust = true;
            const accel = S(0.075);
            this.velocity.x += Math.cos(this.angle) * accel;
            this.velocity.y += Math.sin(this.angle) * accel;
            if (!wasThrusting) startThrust();

            // Thrust particles
            if (Math.random() > 0.4) {
                const pa = this.angle + Math.PI + (Math.random() - 0.5) * 0.5;
                particles.push(new Particle(
                    this.x - Math.cos(this.angle) * S(12),
                    this.y - Math.sin(this.angle) * S(12),
                    Math.cos(pa) * S(2 + Math.random() * 2),
                    Math.sin(pa) * S(2 + Math.random() * 2),
                    'thrust', 18
                ));
            }
        } else if (wasThrusting) {
            stopThrust();
        }

        // Friction & speed cap
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;
        const speed = Math.hypot(this.velocity.x, this.velocity.y);
        const maxSpd = S(8);
        if (speed > maxSpd) {
            this.velocity.x = (this.velocity.x / speed) * maxSpd;
            this.velocity.y = (this.velocity.y / speed) * maxSpd;
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Screen wrap
        if (this.x < 0) this.x = W();
        if (this.x > W()) this.x = 0;
        if (this.y < 0) this.y = H();
        if (this.y > H()) this.y = 0;

        this.shootCooldown--;
        if (keys[' '] && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = 12;
        }
    }

    shoot() {
        const bSpeed = S(10);
        bullets.push(new Bullet(
            this.x + Math.cos(this.angle) * S(22),
            this.y + Math.sin(this.angle) * S(22),
            this.velocity.x + Math.cos(this.angle) * bSpeed,
            this.velocity.y + Math.sin(this.angle) * bSpeed,
            this.angle
        ));
        playLaser();
    }
}

// ── Asteroid ─────────────────────────────────────────────────
class Asteroid {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size; // 3=large, 2=medium, 1=small
        this.radius = S(size * 15);
        const angle = Math.random() * Math.PI * 2;
        const speed = S((4 - size) * 0.5 + Math.random());
        this.velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.03;

        // Random variant 1-6
        this.variant = Math.floor(Math.random() * 6) + 1;
        const prefix = size === 3 ? 'l' : size === 2 ? 'm' : 's';
        this.spriteKey = `asteroid-${prefix}${this.variant}`;

        this.drawSize = S(size === 3 ? 85 : size === 2 ? 58 : 38);
    }

    draw() {
        const img = ASSETS[this.spriteKey];
        if (img) {
            drawSpriteAdditive(img, this.x, this.y, this.drawSize, this.drawSize, this.rotation);
        } else {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = '#6B6B6B';
            ctx.strokeStyle = '#2A2A2A';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.rotation += this.rotationSpeed;
        const r = this.drawSize / 2;
        if (this.x < -r) this.x = W() + r;
        if (this.x > W() + r) this.x = -r;
        if (this.y < -r) this.y = H() + r;
        if (this.y > H() + r) this.y = -r;
    }
}

// ── Bullet ───────────────────────────────────────────────────
class Bullet {
    constructor(x, y, vx, vy, angle) {
        this.x = x;
        this.y = y;
        this.velocity = { x: vx, y: vy };
        this.angle = angle;
        this.life = 55;
    }

    draw() {
        const trailImg = ASSETS['bullet-trail'];
        const bulletImg = ASSETS['bullet-glow'];

        if (trailImg) {
            drawSpriteAdditive(trailImg,
                this.x - Math.cos(this.angle) * S(14),
                this.y - Math.sin(this.angle) * S(14),
                S(32), S(8), this.angle, 0.5);
        }

        if (bulletImg) {
            drawSpriteAdditive(bulletImg, this.x, this.y, S(18), S(18), 0, 1);
        } else {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00D4FF';
            ctx.fillStyle = '#00D4FF';
            ctx.beginPath();
            ctx.arc(this.x, this.y, S(3), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life--;
        if (this.x < 0) this.x = W();
        if (this.x > W()) this.x = 0;
        if (this.y < 0) this.y = H();
        if (this.y > H()) this.y = 0;
    }
}

// ── Particle ─────────────────────────────────────────────────
class Particle {
    constructor(x, y, vx, vy, type, life) {
        this.x = x;
        this.y = y;
        this.velocity = { x: vx, y: vy };
        this.type = type; // 'thrust', 'explosion', 'spark'
        this.life = life;
        this.maxLife = life;
    }

    draw() {
        const t = this.life / this.maxLife;
        const sz = this.type === 'spark' ? S(10) : S(8);

        if (this.type === 'thrust' && ASSETS['particle-soft']) {
            drawSpriteAdditive(ASSETS['particle-soft'], this.x, this.y, sz * 2, sz * 2, 0, t * 0.7);
        } else if (this.type === 'spark' && ASSETS['particle-spark']) {
            drawSpriteAdditive(ASSETS['particle-spark'], this.x, this.y, sz * 2, sz * 2, Math.random() * Math.PI, t);
        } else if (this.type === 'explosion' && ASSETS['particle-soft']) {
            drawSpriteAdditive(ASSETS['particle-soft'], this.x, this.y, sz * 2.5, sz * 2.5, 0, t * 0.8);
        } else {
            ctx.globalAlpha = t;
            ctx.fillStyle = this.type === 'thrust' ? '#FFA500' : '#FFD700';
            ctx.beginPath();
            ctx.arc(this.x, this.y, S(2), 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
        this.life--;
    }
}

// ── Explosion (spritesheet) ──────────────────────────────────
class Explosion {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.frame = 0;
        this.totalFrames = 64; // 8×8 grid
        this.speed = 0.7;
        this.done = false;
    }

    draw() {
        const sheet = ASSETS['explosion-sheet'];
        if (!sheet) return;

        const col = Math.floor(this.frame) % 8;
        const row = Math.floor(Math.floor(this.frame) / 8);
        const fw = sheet.width / 8;
        const fh = sheet.height / 8;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(sheet,
            col * fw, row * fh, fw, fh,
            this.x - this.size / 2, this.y - this.size / 2,
            this.size, this.size
        );
        ctx.restore();
    }

    update() {
        this.frame += this.speed;
        if (this.frame >= this.totalFrames) this.done = true;
    }
}

// ── Shockwave ────────────────────────────────────────────────
class Shockwave {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.scale = 0.1;
        this.alpha = 1;
        this.done = false;
    }

    draw() {
        const img = ASSETS['shockwave-ring'];
        if (!img) return;
        const s = this.scale * S(130);
        drawSpriteAdditive(img, this.x, this.y, s, s, 0, this.alpha);
    }

    update() {
        this.scale += 0.07;
        this.alpha -= 0.035;
        if (this.alpha <= 0) this.done = true;
    }
}

// ── Smoke Puff (for ship destruction) ────────────────────────
class SmokePuff {
    constructor(x, y) {
        this.x = x + (Math.random() - 0.5) * S(20);
        this.y = y + (Math.random() - 0.5) * S(20);
        this.size = S(20 + Math.random() * 30);
        this.alpha = 0.6;
        this.rotation = Math.random() * Math.PI * 2;
        this.vx = (Math.random() - 0.5) * S(0.5);
        this.vy = (Math.random() - 0.5) * S(0.5);
        this.done = false;
    }

    draw() {
        const img = ASSETS['smoke-puff'];
        if (!img) return;
        drawSpriteAdditive(img, this.x, this.y, this.size, this.size, this.rotation, this.alpha);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.size += S(0.5);
        this.alpha -= 0.012;
        if (this.alpha <= 0) this.done = true;
    }
}

// ── Initialize ───────────────────────────────────────────────
function init() {
    initAudio();
    resizeCanvas();
    ship = new Ship();
    asteroids = [];
    bullets = [];
    particles = [];
    explosions = [];
    shockwaves = [];
    scorePopups = [];
    score = 0;
    lives = 3;
    level = 1;
    gameStarted = true;
    gameOver = false;
    invincible = false;
    invincibleTimer = 0;
    screenShake = 0;
    levelTransition = false;
    levelTransitionTimer = 0;
    messageEl.classList.remove('visible');
    spawnAsteroids(4);
    updateUI();
}

function spawnAsteroids(count) {
    for (let i = 0; i < count; i++) {
        let x, y;
        do {
            x = Math.random() * W();
            y = Math.random() * H();
        } while (ship && Math.hypot(x - ship.x, y - ship.y) < S(180));
        asteroids.push(new Asteroid(x, y, 3));
    }
}

// ── Collisions ───────────────────────────────────────────────
function checkCollisions() {
    // Bullets vs Asteroids
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const dist = Math.hypot(bullets[i].x - asteroids[j].x, bullets[i].y - asteroids[j].y);
            if (dist < asteroids[j].radius + S(4)) {
                const ax = asteroids[j].x;
                const ay = asteroids[j].y;
                const aSize = asteroids[j].size;

                // Explosion
                const expSize = S(aSize === 3 ? 110 : aSize === 2 ? 75 : 50);
                explosions.push(new Explosion(ax, ay, expSize));
                shockwaves.push(new Shockwave(ax, ay));

                // Particles
                for (let k = 0; k < 14; k++) {
                    const a = Math.random() * Math.PI * 2;
                    const s = S(1 + Math.random() * 3);
                    particles.push(new Particle(ax, ay,
                        Math.cos(a) * s, Math.sin(a) * s, 'explosion', 28));
                }
                for (let k = 0; k < 6; k++) {
                    const a = Math.random() * Math.PI * 2;
                    const s = S(2 + Math.random() * 4);
                    particles.push(new Particle(ax, ay,
                        Math.cos(a) * s, Math.sin(a) * s, 'spark', 18));
                }

                playExplosion(aSize === 3);
                screenShake = aSize === 3 ? S(10) : S(5);

                const pts = (4 - aSize) * 25;
                score += pts;
                scorePopups.push(new ScorePopup(ax, ay - S(15), pts));

                if (aSize > 1) {
                    for (let k = 0; k < 2; k++) {
                        asteroids.push(new Asteroid(ax, ay, aSize - 1));
                    }
                }
                asteroids.splice(j, 1);
                bullets.splice(i, 1);
                break;
            }
        }
    }

    // Ship vs Asteroids
    if (!invincible && ship) {
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const dist = Math.hypot(ship.x - asteroids[i].x, ship.y - asteroids[i].y);
            if (dist < ship.radius + asteroids[i].radius) {
                explosions.push(new Explosion(ship.x, ship.y, S(140)));
                shockwaves.push(new Shockwave(ship.x, ship.y));
                screenShake = S(14);

                // Sparks + smoke
                for (let k = 0; k < 30; k++) {
                    const a = Math.random() * Math.PI * 2;
                    const s = S(1 + Math.random() * 4);
                    particles.push(new Particle(ship.x, ship.y,
                        Math.cos(a) * s, Math.sin(a) * s, 'spark', 40));
                }
                for (let k = 0; k < 4; k++) {
                    particles.push(new SmokePuff(ship.x, ship.y));
                }

                playExplosion(true);
                stopThrust();
                lives--;

                if (lives <= 0) {
                    gameOver = true;
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('asteroids-highscore', highScore);
                    }
                } else {
                    ship = new Ship();
                    invincible = true;
                    invincibleTimer = 120;
                }
                break;
            }
        }
    }
}

// ── Update ───────────────────────────────────────────────────
function update() {
    frameCount++;

    if (!gameStarted || gameOver) {
        stopThrust();
        explosions.forEach(e => e.update());
        explosions = explosions.filter(e => !e.done);
        shockwaves.forEach(s => s.update());
        shockwaves = shockwaves.filter(s => !s.done);
        particles.forEach(p => p.update());
        particles = particles.filter(p => p.life > 0);
        scorePopups.forEach(p => p.update());
        scorePopups = scorePopups.filter(p => p.life > 0);
        return;
    }

    // Level transition pause
    if (levelTransition) {
        levelTransitionTimer--;
        if (levelTransitionTimer <= 0) {
            levelTransition = false;
            spawnAsteroids(3 + level);
        }
        // Still update VFX during transition
        particles.forEach(p => p.update());
        particles = particles.filter(p => p.life > 0);
        scorePopups.forEach(p => p.update());
        scorePopups = scorePopups.filter(p => p.life > 0);
        return;
    }

    ship.update();
    asteroids.forEach(a => a.update());
    bullets.forEach(b => b.update());
    particles.forEach(p => p.update());
    explosions.forEach(e => e.update());
    shockwaves.forEach(s => s.update());
    scorePopups.forEach(p => p.update());

    bullets = bullets.filter(b => b.life > 0);
    particles = particles.filter(p => p.life > 0);
    explosions = explosions.filter(e => !e.done);
    shockwaves = shockwaves.filter(s => !s.done);
    scorePopups = scorePopups.filter(p => p.life > 0);

    checkCollisions();

    if (invincible) {
        invincibleTimer--;
        if (invincibleTimer <= 0) invincible = false;
    }

    // Level complete
    if (asteroids.length === 0 && !levelTransition) {
        level++;
        levelTransition = true;
        levelTransitionTimer = 100;
        levelTransitionText = `LEVEL ${level}`;
        playLevelUp();
    }

    // Parallax
    if (ship) {
        parallax.dense.x  -= ship.velocity.x * 0.05;
        parallax.dense.y  -= ship.velocity.y * 0.05;
        parallax.bright.x -= ship.velocity.x * 0.15;
        parallax.bright.y -= ship.velocity.y * 0.15;
        parallax.nebula.x -= ship.velocity.x * 0.08;
        parallax.nebula.y -= ship.velocity.y * 0.08;
    }

    // Screen shake decay
    if (screenShake > 0) screenShake *= 0.85;
    if (screenShake < 0.5) screenShake = 0;

    updateUI();
}

// ── Draw Background ──────────────────────────────────────────
function drawBackground() {
    const cW = W();
    const cH = H();

    // Base space
    const baseBg = ASSETS['bg-space'];
    if (baseBg) {
        ctx.drawImage(baseBg, 0, 0, cW, cH);
    } else {
        ctx.fillStyle = '#05070c';
        ctx.fillRect(0, 0, cW, cH);
    }

    // Dense stars (slow parallax)
    const dense = ASSETS['bg-stars-dense'];
    if (dense) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.5;
        const dx = ((parallax.dense.x % cW) + cW) % cW;
        const dy = ((parallax.dense.y % cH) + cH) % cH;
        for (let ox = -1; ox <= 1; ox++) {
            for (let oy = -1; oy <= 1; oy++) {
                ctx.drawImage(dense, dx + ox * cW - cW, dy + oy * cH - cH, cW, cH);
            }
        }
        ctx.restore();
    }

    // Nebula (medium parallax)
    const neb = ASSETS['bg-nebula'];
    if (neb) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.2;
        const nx = ((parallax.nebula.x % cW) + cW) % cW;
        const ny = ((parallax.nebula.y % cH) + cH) % cH;
        for (let ox = -1; ox <= 1; ox++) {
            for (let oy = -1; oy <= 1; oy++) {
                ctx.drawImage(neb, nx + ox * cW - cW, ny + oy * cH - cH, cW, cH);
            }
        }
        ctx.restore();
    }

    // Bright stars (fast parallax)
    const bright = ASSETS['bg-stars-bright'];
    if (bright) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.7;
        const bx = ((parallax.bright.x % cW) + cW) % cW;
        const by = ((parallax.bright.y % cH) + cH) % cH;
        for (let ox = -1; ox <= 1; ox++) {
            for (let oy = -1; oy <= 1; oy++) {
                ctx.drawImage(bright, bx + ox * cW - cW, by + oy * cH - cH, cW, cH);
            }
        }
        ctx.restore();
    }
}

// ── Draw ─────────────────────────────────────────────────────
function draw() {
    ctx.save();

    // Screen shake
    if (screenShake > 0) {
        const sx = (Math.random() - 0.5) * screenShake * 2;
        const sy = (Math.random() - 0.5) * screenShake * 2;
        ctx.translate(sx, sy);
    }

    drawBackground();

    // Game objects (back to front)
    particles.forEach(p => p.draw());
    shockwaves.forEach(s => s.draw());
    explosions.forEach(e => e.draw());
    asteroids.forEach(a => a.draw());
    bullets.forEach(b => b.draw());
    if (gameStarted && !gameOver && ship) ship.draw();
    scorePopups.forEach(p => p.draw());

    ctx.restore(); // end screen shake

    // Vignette overlay
    const vig = ASSETS['overlay-vignette'];
    if (vig) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.45;
        ctx.drawImage(vig, 0, 0, W(), H());
        ctx.restore();
    }

    // Level transition announcement
    if (levelTransition) {
        const t = levelTransitionTimer / 100;
        const fadeIn = Math.min(1, (1 - t) * 4);
        const fadeOut = Math.min(1, t * 3);
        const alpha = Math.min(fadeIn, fadeOut);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#78fff5';
        ctx.font = `bold ${S(48)}px Orbitron, monospace`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00d4ff';
        ctx.fillText(levelTransitionText, W() / 2, H() / 2);

        ctx.font = `${S(16)}px monospace`;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.shadowBlur = 0;
        ctx.fillText('GET READY', W() / 2, H() / 2 + S(35));
        ctx.restore();
    }

    // Game over overlay
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, W(), H());

        ctx.textAlign = 'center';

        // Title
        ctx.fillStyle = '#FF4444';
        ctx.font = `bold ${S(52)}px Orbitron, monospace`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FF4444';
        ctx.fillText('GAME OVER', W() / 2, H() / 2 - S(50));
        ctx.shadowBlur = 0;

        // Score
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${S(28)}px Orbitron, monospace`;
        ctx.fillText(`SCORE: ${score}`, W() / 2, H() / 2 + S(5));

        // High score
        ctx.font = `${S(16)}px monospace`;
        ctx.fillStyle = score >= highScore ? '#78fff5' : 'rgba(255,255,255,0.5)';
        const hsText = score >= highScore ? 'NEW HIGH SCORE!' : `BEST: ${highScore}`;
        ctx.fillText(hsText, W() / 2, H() / 2 + S(35));

        // Stats
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = `${S(14)}px monospace`;
        ctx.fillText(`REACHED LEVEL ${level}`, W() / 2, H() / 2 + S(60));

        // Restart hint
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = `${S(15)}px monospace`;
        ctx.fillText('PRESS  R  TO RESTART', W() / 2, H() / 2 + S(95));
    }
}

function updateUI() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    levelEl.textContent = level;
}

// ── Game Loop ────────────────────────────────────────────────
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ── Start / Restart ──────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !gameStarted && !gameOver) init();
    if ((e.key === 'r' || e.key === 'R') && gameOver) init();
});

// Load assets with progress, then start
loadAssets((loaded, total) => {
    drawLoadingScreen(loaded, total);
}).then(() => {
    console.log('Assets loaded:', Object.keys(ASSETS).length, '/', Object.keys(ASSET_LIST).length);
    gameLoop();
});
