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
                // Pre-brighten asset once (avoids costly per-frame ctx.filter)
                const c = document.createElement('canvas');
                c.width = img.width;
                c.height = img.height;
                const bctx = c.getContext('2d');
                bctx.filter = 'brightness(1.25)';
                bctx.drawImage(img, 0, 0);
                ASSETS[key] = c;
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
let loadingStars = [];
let loadingAngle = 0;
let loadingLoaded = 0;
let loadingTotal = 1;

function drawLoadingScreen() {
    const W = canvas.width;
    const H = canvas.height;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    // Animated star field
    if (loadingStars.length === 0) {
        for (let i = 0; i < 80; i++) {
            loadingStars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                size: Math.random() < 0.8 ? 1 : 2,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }
    for (const star of loadingStars) {
        star.twinkle += 0.02;
        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(star.twinkle) * 0.25})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    }

    const progress = loadingTotal > 0 ? loadingLoaded / loadingTotal : 0;
    const cx = W / 2;
    const cy = H / 2;

    // Rotating ship silhouette
    loadingAngle += 0.012;
    ctx.save();
    ctx.translate(cx, cy - H * 0.08);
    ctx.rotate(loadingAngle);
    const ss = Math.min(W, H) * 0.05;
    ctx.fillStyle = 'rgba(120, 255, 245, 0.12)';
    ctx.strokeStyle = 'rgba(120, 255, 245, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ss, 0);
    ctx.lineTo(-ss * 0.75, -ss * 0.6);
    ctx.lineTo(-ss * 0.5, 0);
    ctx.lineTo(-ss * 0.75, ss * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Title with glow
    ctx.save();
    ctx.fillStyle = '#78fff5';
    ctx.font = `bold ${Math.round(W * 0.05)}px Orbitron, monospace`;
    ctx.textAlign = 'center';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#00d4ff';
    ctx.fillText('ASTEROIDS', cx, cy + H * 0.02);
    ctx.shadowBlur = 0;
    ctx.restore();

    // Loading percentage
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = `${Math.round(W * 0.014)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`LOADING ${Math.round(progress * 100)}%`, cx, cy + H * 0.07);

    // Progress bar
    const barW = Math.min(280, W * 0.35);
    const barH = 3;
    const barX = cx - barW / 2;
    const barY = cy + H * 0.10;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, barH / 2);
    ctx.fill();

    if (progress > 0) {
        const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        grad.addColorStop(0, '#00d4ff');
        grad.addColorStop(1, '#78fff5');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00d4ff';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * progress, barH, barH / 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Credits
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.font = `${Math.round(W * 0.011)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('AN EDENIC LABS GAME', cx, H - H * 0.06);
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

// Power-ups
let powerups = [];
let activePowerUps = {}; // { type: { timer, permanent } }
let consecutiveHits = 0;
let lastPowerUpTime = 0; // frameCount when last power-up was spawned
let hyperspaceCharges = 0;
let hasShield = false;

// Ship skins
let currentSkin = 'classic';
let unlockedSkins = new Set(['classic']);
let skinAsteroidKills = 0;
let skinUfoKills = 0;
let skinBossKills = 0;
let skinShotsFired = 0;
let skinShotsHit = 0;
let shipTrail = [];

// UFOs
let ufos = [];
let ufoBullets = [];
let ufoSpawnTimer = 0;
const UFO_SPAWN_MIN = 900;   // ~15 seconds minimum between spawns
const UFO_SPAWN_MAX = 1500;  // ~25 seconds max
const UFO_MAX_ACTIVE = 1;    // only 1 on screen at a time

// Boss
let boss = null;
let bossActive = false;

// Extra lives
let nextExtraLife = 10000; // first extra life at 10,000 points

const POWERUP_TYPES = {
    'multi2':    { label: '2x GUN',     color: '#FF8800', duration: 600,  permanent: false, icon: '⟐' },
    'multi3':    { label: '3x GUN',     color: '#FF4400', duration: 450,  permanent: false, icon: '⟐' },
    'sideguns':  { label: 'SIDE GUNS',  color: '#44AAFF', duration: 0,    permanent: true,  icon: '⊞' },
    'rapid':     { label: 'RAPID FIRE', color: '#FFFF44', duration: 500,  permanent: false, icon: '⚡' },
    'shield':    { label: 'SHIELD',     color: '#44FF88', duration: 0,    permanent: true,  icon: '◎' },
    'hyperspace':{ label: 'HYPERSPACE', color: '#CC44FF', duration: 0,    permanent: true,  icon: '↯' },
};

// Drop weights by power-up type (higher = more common)
const POWERUP_WEIGHTS = {
    'multi2': 30, 'rapid': 25, 'shield': 20, 'hyperspace': 15, 'sideguns': 7, 'multi3': 3,
};

// Ship skins — earned through gameplay milestones (per-run, no persistence)
const SHIP_SKINS = {
    'classic':  { label: 'CLASSIC',  tier: 0, color: '#4A9EFF', glow: '#2E7FD9' },
    'dart':     { label: 'DART',     tier: 1, color: '#00FFCC', glow: '#00AA88' },
    'viper':    { label: 'VIPER',    tier: 2, color: '#FF6600', glow: '#CC4400' },
    'phoenix':  { label: 'PHOENIX',  tier: 3, color: '#FFAA00', glow: '#FF6600' },
    'phantom':  { label: 'PHANTOM',  tier: 4, color: '#BB77FF', glow: '#7733CC' },
    'heavy':    { label: 'HEAVY',    tier: 5, color: '#88CC44', glow: '#557722' },
};

// Supabase config
const SUPABASE_URL = 'https://foyctuwcadmlrdsgnsrn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZveWN0dXdjYWRtbHJkc2duc3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzA2NzIsImV4cCI6MjA4Njk0NjY3Mn0._oTIhgNwDD8lh-6NFzTsrdUNYaFfG3YrITDVpcye-6g';

// Leaderboard (local cache + remote)
let leaderboard = JSON.parse(localStorage.getItem('asteroids-leaderboard') || '[]');
let enteringName = false;
let playerName = '';
let nameSubmitted = false;
let nameCursorBlink = 0;
let leaderboardLoading = false;
let leaderboardError = false;

// Level transition
let levelTransition = false;
let levelTransitionTimer = 0;
let levelTransitionText = '';

// Per-level color palette — cycles through distinct environments
const LEVEL_PALETTES = [
    { name: 'Cyan Nebula',     tint: null,              starColor: '#FFFFFF', uiAccent: '#78fff5' }, // Level 1: default (no tint)
    { name: 'Ember Field',     tint: 'rgba(255,100,30,0.25)',  starColor: '#FFD4B0', uiAccent: '#FF8844' }, // Level 2: warm orange
    { name: 'Toxic Zone',      tint: 'rgba(80,255,60,0.25)',   starColor: '#B0FFB0', uiAccent: '#66FF44' }, // Level 3: green
    { name: 'Void Rift',       tint: 'rgba(160,80,255,0.25)',  starColor: '#D4B0FF', uiAccent: '#AA66FF' }, // Level 4: purple
    { name: 'Blood Moon',      tint: 'rgba(255,40,40,0.2)',    starColor: '#FFB0B0', uiAccent: '#FF4444' }, // Level 5: red
    { name: 'Deep Freeze',     tint: 'rgba(40,140,255,0.25)',  starColor: '#B0D4FF', uiAccent: '#4488FF' }, // Level 6: blue
    { name: 'Solar Flare',     tint: 'rgba(255,220,40,0.2)',   starColor: '#FFFFD0', uiAccent: '#FFDD44' }, // Level 7: yellow
    { name: 'Ghost Sector',    tint: 'rgba(255,255,255,0.15)', starColor: '#E0E0E0', uiAccent: '#CCCCCC' }, // Level 8: white/grey
];

function getLevelPalette() {
    return LEVEL_PALETTES[(level - 1) % LEVEL_PALETTES.length];
}

// Static star field (classic Asteroids style)
const STARS = [];
function generateStars() {
    STARS.length = 0;
    const cW = W();
    const cH = H();
    for (let i = 0; i < 120; i++) {
        STARS.push({
            x: Math.random() * cW,
            y: Math.random() * cH,
            size: Math.random() < 0.85 ? 1 : 2
        });
    }
}

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
    const t = audioCtx.currentTime;
    // Main zap — triangle wave for a crisper bite
    const osc1 = audioCtx.createOscillator();
    const g1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.connect(g1);
    g1.connect(audioCtx.destination);
    osc1.frequency.setValueAtTime(1200, t);
    osc1.frequency.exponentialRampToValueAtTime(150, t + 0.1);
    g1.gain.setValueAtTime(0.18, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc1.start(t);
    osc1.stop(t + 0.1);
    // High harmonic snap
    const osc2 = audioCtx.createOscillator();
    const g2 = audioCtx.createGain();
    osc2.type = 'square';
    osc2.connect(g2);
    g2.connect(audioCtx.destination);
    osc2.frequency.setValueAtTime(2400, t);
    osc2.frequency.exponentialRampToValueAtTime(400, t + 0.06);
    g2.gain.setValueAtTime(0.06, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc2.start(t);
    osc2.stop(t + 0.06);
}

function playExplosion(large = false) {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const t = audioCtx.currentTime;
    const dur = large ? 0.6 : 0.3;
    // Layer 1: Filtered white noise (rumble/crackle)
    const bufSz = audioCtx.sampleRate * dur;
    const buf = audioCtx.createBuffer(1, bufSz, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSz; i++) data[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const flt = audioCtx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(large ? 400 : 900, t);
    flt.frequency.exponentialRampToValueAtTime(40, t + dur);
    const g1 = audioCtx.createGain();
    g1.gain.setValueAtTime(large ? 0.35 : 0.2, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(flt);
    flt.connect(g1);
    g1.connect(audioCtx.destination);
    src.start(t);
    src.stop(t + dur);
    // Layer 2: Low thud (sine punch for bass impact)
    const osc = audioCtx.createOscillator();
    const g2 = audioCtx.createGain();
    osc.type = 'sine';
    osc.connect(g2);
    g2.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(large ? 80 : 120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + dur * 0.6);
    g2.gain.setValueAtTime(large ? 0.4 : 0.2, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.6);
    osc.start(t);
    osc.stop(t + dur * 0.6);
}

function playLevelUp() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const t = audioCtx.currentTime;
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
        // Main tone
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.12, t + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.35);
        osc.start(t + i * 0.12);
        osc.stop(t + i * 0.12 + 0.35);
        // Octave shimmer
        const osc2 = audioCtx.createOscillator();
        const g2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.connect(g2);
        g2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(freq * 2, t);
        g2.gain.setValueAtTime(0, t + i * 0.12);
        g2.gain.linearRampToValueAtTime(0.04, t + i * 0.12 + 0.02);
        g2.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.25);
        osc2.start(t + i * 0.12);
        osc2.stop(t + i * 0.12 + 0.25);
    });
}

function playShipDeath() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const t = audioCtx.currentTime;
    // Descending tone — dramatic pitch drop
    const osc = audioCtx.createOscillator();
    const g1 = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.connect(g1);
    g1.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.8);
    g1.gain.setValueAtTime(0.25, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.start(t);
    osc.stop(t + 0.8);
    // Heavy noise burst
    const dur = 0.6;
    const bufSz = audioCtx.sampleRate * dur;
    const buf = audioCtx.createBuffer(1, bufSz, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSz; i++) data[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const flt = audioCtx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(500, t);
    flt.frequency.exponentialRampToValueAtTime(30, t + dur);
    const g2 = audioCtx.createGain();
    g2.gain.setValueAtTime(0.4, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(flt);
    flt.connect(g2);
    g2.connect(audioCtx.destination);
    src.start(t);
    src.stop(t + dur);
}

function playPowerUpPickup() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const t = audioCtx.currentTime;
    // Rising sparkle — two quick ascending tones
    const notes = [880, 1320, 1760];
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, t + i * 0.06);
        g.gain.setValueAtTime(0.12, t + i * 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.15);
        osc.start(t + i * 0.06);
        osc.stop(t + i * 0.06 + 0.15);
    });
}

function playHyperspace() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const t = audioCtx.currentTime;
    // Whoosh — noise sweep with rising pitch
    const dur = 0.25;
    const bufSz = audioCtx.sampleRate * dur;
    const buf = audioCtx.createBuffer(1, bufSz, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSz; i++) data[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const flt = audioCtx.createBiquadFilter();
    flt.type = 'bandpass';
    flt.frequency.setValueAtTime(200, t);
    flt.frequency.exponentialRampToValueAtTime(4000, t + dur);
    flt.Q.value = 2;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(flt);
    flt.connect(g);
    g.connect(audioCtx.destination);
    src.start(t);
    src.stop(t + dur);
    // Arrival tone
    const osc = audioCtx.createOscillator();
    const g2 = audioCtx.createGain();
    osc.type = 'sine';
    osc.connect(g2);
    g2.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(1200, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.35);
    g2.gain.setValueAtTime(0.08, t + 0.15);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.start(t + 0.15);
    osc.stop(t + 0.35);
}

function playShieldHit() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const t = audioCtx.currentTime;
    // Metallic ping
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'triangle';
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.2);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.2);
}

// UFO warble — menacing low-frequency hum when UFO is on screen
let ufoHumOsc = null;
let ufoHumGain = null;

function startUfoHum() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx || ufoHumOsc) return;
    const t = audioCtx.currentTime;
    ufoHumOsc = audioCtx.createOscillator();
    ufoHumGain = audioCtx.createGain();
    ufoHumOsc.type = 'sawtooth';
    ufoHumOsc.frequency.setValueAtTime(80, t);
    // Slow wobble on frequency for eerie warble
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(3, t);
    lfoGain.gain.setValueAtTime(20, t);
    lfo.connect(lfoGain);
    lfoGain.connect(ufoHumOsc.frequency);
    lfo.start(t);
    ufoHumOsc.connect(ufoHumGain);
    ufoHumGain.connect(audioCtx.destination);
    ufoHumGain.gain.setValueAtTime(0, t);
    ufoHumGain.gain.linearRampToValueAtTime(0.06, t + 0.3);
    ufoHumOsc.start(t);
    ufoHumOsc._lfo = lfo; // keep reference to stop later
}

function stopUfoHum() {
    if (ufoHumOsc) {
        try {
            const t = audioCtx.currentTime;
            ufoHumGain.gain.linearRampToValueAtTime(0, t + 0.2);
            ufoHumOsc.stop(t + 0.3);
            ufoHumOsc._lfo.stop(t + 0.3);
        } catch (e) {}
        ufoHumOsc = null;
        ufoHumGain = null;
    }
}

function playUfoShot() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const t = audioCtx.currentTime;
    // Deeper, more menacing shot — square wave with low sweep
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'square';
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.start(t);
    osc.stop(t + 0.15);
}

function playUfoExplosion() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const t = audioCtx.currentTime;
    // Noise burst — higher pitch than asteroid explosion
    const bufSz = audioCtx.sampleRate * 0.5;
    const buf = audioCtx.createBuffer(1, bufSz, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSz; i++) data[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const flt = audioCtx.createBiquadFilter();
    flt.type = 'bandpass';
    flt.frequency.setValueAtTime(1200, t);
    flt.frequency.exponentialRampToValueAtTime(200, t + 0.4);
    flt.Q.setValueAtTime(2, t);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    src.connect(flt);
    flt.connect(g);
    g.connect(audioCtx.destination);
    src.start(t);
    src.stop(t + 0.5);
    // Metallic ring — UFOs are machines
    const ring = audioCtx.createOscillator();
    const rg = audioCtx.createGain();
    ring.type = 'sine';
    ring.connect(rg);
    rg.connect(audioCtx.destination);
    ring.frequency.setValueAtTime(800, t);
    ring.frequency.exponentialRampToValueAtTime(200, t + 0.3);
    rg.gain.setValueAtTime(0.15, t);
    rg.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    ring.start(t);
    ring.stop(t + 0.3);
}

function playExtraLife() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const t = audioCtx.currentTime;
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, t + i * 0.08);
        g.gain.setValueAtTime(0.15, t + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.3);
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 0.3);
    });
}

function playBossWarning() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const t = audioCtx.currentTime;
    for (let i = 0; i < 3; i++) {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(65, t + i * 0.4);
        osc.frequency.linearRampToValueAtTime(55, t + i * 0.4 + 0.35);
        g.gain.setValueAtTime(0.2, t + i * 0.4);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.4 + 0.35);
        osc.start(t + i * 0.4);
        osc.stop(t + i * 0.4 + 0.35);
    }
}

function playBossHit() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'square';
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.start(t);
    osc.stop(t + 0.1);
}

function playBossDefeat() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const t = audioCtx.currentTime;
    const dur = 1.0;
    const bufSz = audioCtx.sampleRate * dur;
    const buf = audioCtx.createBuffer(1, bufSz, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSz; i++) data[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const flt = audioCtx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(600, t);
    flt.frequency.exponentialRampToValueAtTime(30, t + dur);
    const g1 = audioCtx.createGain();
    g1.gain.setValueAtTime(0.35, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(flt);
    flt.connect(g1);
    g1.connect(audioCtx.destination);
    src.start(t);
    src.stop(t + dur);
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, t + 0.5 + i * 0.12);
        g.gain.setValueAtTime(0.12, t + 0.5 + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.5 + i * 0.12 + 0.4);
        osc.start(t + 0.5 + i * 0.12);
        osc.stop(t + 0.5 + i * 0.12 + 0.4);
    });
}

function playSkinUnlock() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx) return;
    const t = audioCtx.currentTime;
    // Triumphant fanfare — ascending with shimmer
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'triangle';
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, t + i * 0.1);
        g.gain.setValueAtTime(0.15, t + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.4);
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.4);
        // High shimmer
        const osc2 = audioCtx.createOscillator();
        const g2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.connect(g2);
        g2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(freq * 2, t + i * 0.1);
        g2.gain.setValueAtTime(0.06, t + i * 0.1);
        g2.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3);
        osc2.start(t + i * 0.1);
        osc2.stop(t + i * 0.1 + 0.3);
    });
}

function isSkinUnlocked(name) {
    switch (name) {
        case 'classic': return true;
        case 'dart': return skinAsteroidKills >= 30;
        case 'viper': return skinUfoKills >= 5;
        case 'phoenix': return skinBossKills >= 1;
        case 'phantom': return skinShotsFired >= 50 && (skinShotsHit / skinShotsFired) >= 0.7;
        case 'heavy': return level >= 10;
        default: return false;
    }
}

function checkSkinUpgrade() {
    let highestTier = 0;
    let highestSkin = 'classic';

    for (const [name, skin] of Object.entries(SHIP_SKINS)) {
        if (name === 'classic') continue;
        if (isSkinUnlocked(name)) {
            if (!unlockedSkins.has(name)) {
                unlockedSkins.add(name);
                // Show popup for newly unlocked skin
                if (ship) {
                    scorePopups.push(new ScorePopup(ship.x, ship.y - S(40), `NEW SHIP: ${skin.label}`));
                    playSkinUnlock();
                }
            }
            if (skin.tier > highestTier) {
                highestTier = skin.tier;
                highestSkin = name;
            }
        }
    }

    if (highestSkin !== currentSkin) {
        currentSkin = highestSkin;
        invincible = true;
        invincibleTimer = Math.max(invincibleTimer, 20);
    }
}

function drawMiniShip(x, y, skinName, size) {
    const skin = SHIP_SKINS[skinName] || SHIP_SKINS['classic'];
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = skin.color;
    ctx.shadowBlur = 3;
    ctx.shadowColor = skin.glow;
    const s = size;
    ctx.beginPath();
    if (skinName === 'dart') {
        ctx.moveTo(s * 1.3, 0);
        ctx.lineTo(-s * 0.6, -s * 0.35);
        ctx.lineTo(-s * 0.3, 0);
        ctx.lineTo(-s * 0.6, s * 0.35);
    } else if (skinName === 'viper') {
        ctx.moveTo(s, -s * 0.3);
        ctx.lineTo(-s * 0.6, -s * 0.6);
        ctx.lineTo(-s * 0.3, 0);
        ctx.lineTo(-s * 0.6, s * 0.6);
        ctx.lineTo(s, s * 0.3);
        ctx.lineTo(s * 0.6, 0);
    } else if (skinName === 'phoenix') {
        ctx.moveTo(s, 0);
        ctx.lineTo(-s * 0.8, -s * 0.8);
        ctx.lineTo(-s * 0.5, 0);
        ctx.lineTo(-s * 0.8, s * 0.8);
    } else if (skinName === 'heavy') {
        ctx.moveTo(s * 0.7, 0);
        ctx.lineTo(-s * 0.6, -s * 0.65);
        ctx.lineTo(-s * 0.7, 0);
        ctx.lineTo(-s * 0.6, s * 0.65);
    } else {
        // classic / phantom
        ctx.moveTo(s, 0);
        ctx.lineTo(-s * 0.6, -s * 0.5);
        ctx.lineTo(-s * 0.3, 0);
        ctx.lineTo(-s * 0.6, s * 0.5);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
}

function startThrust() {
    if (!window.__ASTEROIDS_SOUND_ON__ || !audioCtx || thrustOscillator) return;
    const t = audioCtx.currentTime;
    // Low rumble oscillator
    thrustOscillator = audioCtx.createOscillator();
    thrustOscillator.type = 'sawtooth';
    thrustOscillator.frequency.setValueAtTime(55, t);
    // Add noise texture via waveshaper for gritty engine sound
    const shaper = audioCtx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
        const x = (i / 128) - 1;
        curve[i] = Math.tanh(x * 2.5);
    }
    shaper.curve = curve;
    shaper.oversample = '2x';
    // Bandpass to keep it rumbly, not harsh
    const bpf = audioCtx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(120, t);
    bpf.Q.setValueAtTime(1.5, t);
    thrustGain = audioCtx.createGain();
    thrustGain.gain.setValueAtTime(0, t);
    thrustGain.gain.linearRampToValueAtTime(0.15, t + 0.08);
    thrustOscillator.connect(shaper);
    shaper.connect(bpf);
    bpf.connect(thrustGain);
    thrustGain.connect(audioCtx.destination);
    thrustOscillator.start(t);
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
document.addEventListener('keydown', (e) => { if (!enteringName) keys[e.key] = true; });
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
        const isExtraLife = this.pts === '1-UP';
        const isSkinUnlockMsg = typeof this.pts === 'string' && this.pts.startsWith('NEW SHIP');
        ctx.fillStyle = isSkinUnlockMsg ? '#FFAA00' : isExtraLife ? '#44FF88' : '#78fff5';
        ctx.font = `bold ${S(isSkinUnlockMsg ? 22 : isExtraLife ? 20 : 16)}px Orbitron, monospace`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = isSkinUnlockMsg ? 20 : isExtraLife ? 14 : 8;
        ctx.shadowColor = isSkinUnlockMsg ? '#FFAA00' : isExtraLife ? '#44FF88' : '#00d4ff';
        const label = typeof this.pts === 'string' ? this.pts : `+${this.pts}`;
        ctx.fillText(label, this.x, this.y);
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
        this.radius = S(12);
        this.thrust = false;
        this.shootCooldown = 0;
        this.thrustFrame = 0;
    }

    draw() {
        const size = S(52);

        // Invincibility flash
        let alpha = 1;
        if (invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            alpha = 0.35;
        }

        if (currentSkin === 'classic') {
            const img = ASSETS['ship-idle'];
            if (img) {
                drawSpriteAdditive(img, this.x, this.y, size, size, this.angle + Math.PI / 2, alpha);
            } else {
                this.drawFallback(alpha);
            }
        } else {
            this.drawSkin(alpha);
        }

        // Shield visual — glowing ring around ship
        if (hasShield) {
            ctx.save();
            const pulse = 1 + Math.sin(frameCount * 0.08) * 0.1;
            const shieldR = S(22) * pulse;
            ctx.globalAlpha = 0.4 + Math.sin(frameCount * 0.06) * 0.15;
            ctx.strokeStyle = '#44FF88';
            ctx.lineWidth = S(2);
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#44FF88';
            ctx.beginPath();
            ctx.arc(this.x, this.y, shieldR, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        // Side gun indicators — small dots on the sides
        if (activePowerUps['sideguns']) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#44AAFF';
            const leftX = this.x + Math.cos(this.angle - Math.PI / 2) * S(12);
            const leftY = this.y + Math.sin(this.angle - Math.PI / 2) * S(12);
            const rightX = this.x + Math.cos(this.angle + Math.PI / 2) * S(12);
            const rightY = this.y + Math.sin(this.angle + Math.PI / 2) * S(12);
            ctx.beginPath();
            ctx.arc(leftX, leftY, S(2.5), 0, Math.PI * 2);
            ctx.arc(rightX, rightY, S(2.5), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    drawFallback(alpha) {
        this.drawSkinShape(this.x, this.y, this.angle, alpha, SHIP_SKINS['classic'], this.thrust);
    }

    drawSkin(alpha) {
        const skin = SHIP_SKINS[currentSkin];

        // Ghost trail for Phantom
        if (currentSkin === 'phantom' && shipTrail.length > 1) {
            for (let i = 0; i < shipTrail.length - 1; i++) {
                const t = shipTrail[i];
                const trailAlpha = ((i + 1) / shipTrail.length) * 0.15 * alpha;
                this.drawSkinShape(t.x, t.y, t.angle, trailAlpha, skin, false);
            }
        }

        const mainAlpha = currentSkin === 'phantom' ? alpha * 0.6 : alpha;
        this.drawSkinShape(this.x, this.y, this.angle, mainAlpha, skin, this.thrust);
    }

    drawSkinShape(x, y, angle, alpha, skin, showThrust) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 12;
        ctx.shadowColor = skin.glow;
        ctx.fillStyle = skin.color;
        ctx.strokeStyle = skin.glow;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        switch (currentSkin) {
            case 'dart':
                ctx.moveTo(S(28), 0);
                ctx.lineTo(S(4), S(-6));
                ctx.lineTo(S(-14), S(-8));
                ctx.lineTo(S(-8), 0);
                ctx.lineTo(S(-14), S(8));
                ctx.lineTo(S(4), S(6));
                break;
            case 'viper':
                ctx.moveTo(S(22), S(-6));
                ctx.lineTo(S(10), S(-2));
                ctx.lineTo(S(-14), S(-13));
                ctx.lineTo(S(-6), S(-2));
                ctx.lineTo(S(-10), 0);
                ctx.lineTo(S(-6), S(2));
                ctx.lineTo(S(-14), S(13));
                ctx.lineTo(S(10), S(2));
                ctx.lineTo(S(22), S(6));
                ctx.lineTo(S(14), 0);
                break;
            case 'phoenix':
                ctx.moveTo(S(20), 0);
                ctx.lineTo(S(6), S(-5));
                ctx.lineTo(S(-6), S(-8));
                ctx.lineTo(S(-18), S(-18));
                ctx.lineTo(S(-10), S(-6));
                ctx.lineTo(S(-14), 0);
                ctx.lineTo(S(-10), S(6));
                ctx.lineTo(S(-18), S(18));
                ctx.lineTo(S(-6), S(8));
                ctx.lineTo(S(6), S(5));
                break;
            case 'phantom':
                ctx.moveTo(S(20), 0);
                ctx.lineTo(S(-15), S(-12));
                ctx.lineTo(S(-10), 0);
                ctx.lineTo(S(-15), S(12));
                break;
            case 'heavy':
                ctx.moveTo(S(16), 0);
                ctx.lineTo(S(10), S(-8));
                ctx.lineTo(S(-4), S(-12));
                ctx.lineTo(S(-14), S(-14));
                ctx.lineTo(S(-12), S(-6));
                ctx.lineTo(S(-16), 0);
                ctx.lineTo(S(-12), S(6));
                ctx.lineTo(S(-14), S(14));
                ctx.lineTo(S(-4), S(12));
                ctx.lineTo(S(10), S(8));
                break;
            default: // classic fallback
                ctx.moveTo(S(20), 0);
                ctx.lineTo(S(-15), S(-12));
                ctx.lineTo(S(-10), 0);
                ctx.lineTo(S(-15), S(12));
                break;
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Thrust flame
        if (showThrust) {
            const fl = S(12 + Math.random() * 10);
            ctx.fillStyle = currentSkin === 'phoenix' ? '#FF4400' : '#FFA500';
            ctx.globalAlpha = alpha * 0.8;
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

            // Thrust particles — emit 2-3 per frame for a dense exhaust stream
            const numP = 2 + (Math.random() > 0.5 ? 1 : 0);
            for (let i = 0; i < numP; i++) {
                const spread = (Math.random() - 0.5) * 0.6;
                const pa = this.angle + Math.PI + spread;
                const spd = S(1.5 + Math.random() * 2.5);
                const ox = (Math.random() - 0.5) * S(4); // lateral scatter
                particles.push(new Particle(
                    this.x - Math.cos(this.angle) * S(14) + Math.cos(this.angle + Math.PI/2) * ox,
                    this.y - Math.sin(this.angle) * S(14) + Math.sin(this.angle + Math.PI/2) * ox,
                    Math.cos(pa) * spd,
                    Math.sin(pa) * spd,
                    'thrust', 14 + Math.floor(Math.random() * 10)
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

        // Ghost trail for Phantom skin
        shipTrail.push({ x: this.x, y: this.y, angle: this.angle });
        if (shipTrail.length > 8) shipTrail.shift();

        this.shootCooldown--;
        const cooldown = activePowerUps['rapid'] ? 5 : 12;
        if (keys[' '] && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = cooldown;
        }
    }

    shoot() {
        skinShotsFired++;
        const bSpeed = S(10);
        const nose = S(22);

        // Determine spread angles based on active multi-gun
        const angles = [0]; // center shot always
        if (activePowerUps['multi3']) {
            angles.push(-0.18, 0.18); // ~10 degree spread each side
        } else if (activePowerUps['multi2']) {
            angles.push(-0.12, 0.12); // ~7 degree spread
        }

        // Fire main guns
        for (const offset of angles) {
            const a = this.angle + offset;
            bullets.push(new Bullet(
                this.x + Math.cos(a) * nose,
                this.y + Math.sin(a) * nose,
                this.velocity.x + Math.cos(a) * bSpeed,
                this.velocity.y + Math.sin(a) * bSpeed,
                a
            ));
        }

        // Side guns — fire perpendicular to ship facing
        if (activePowerUps['sideguns']) {
            const leftAngle = this.angle - Math.PI / 2;
            const rightAngle = this.angle + Math.PI / 2;
            const sideSpeed = bSpeed * 0.8;
            const sideOffset = S(10);
            bullets.push(new Bullet(
                this.x + Math.cos(leftAngle) * sideOffset,
                this.y + Math.sin(leftAngle) * sideOffset,
                this.velocity.x + Math.cos(leftAngle) * sideSpeed,
                this.velocity.y + Math.sin(leftAngle) * sideSpeed,
                leftAngle
            ));
            bullets.push(new Bullet(
                this.x + Math.cos(rightAngle) * sideOffset,
                this.y + Math.sin(rightAngle) * sideOffset,
                this.velocity.x + Math.cos(rightAngle) * sideSpeed,
                this.velocity.y + Math.sin(rightAngle) * sideSpeed,
                rightAngle
            ));
        }

        playLaser();
    }
}

// ── Asteroid ─────────────────────────────────────────────────
class Asteroid {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size; // 3=large, 2=medium, 1=small
        this.radius = S(size === 3 ? 45 : size === 2 ? 30 : 28);
        const angle = Math.random() * Math.PI * 2;
        // Speed scales with level: +12% per level, capped at 3x base speed
        const levelSpeedMult = Math.min(3, 1 + (level - 1) * 0.12);
        const baseSpeed = (4 - size) * 0.5 + Math.random();
        const speed = S(baseSpeed * levelSpeedMult);
        this.velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
        this.rotation = Math.random() * Math.PI * 2;
        // Rotation also increases with level for more visual chaos
        this.rotationSpeed = (Math.random() - 0.5) * (0.03 + level * 0.003);

        // Random variant 1-6
        this.variant = Math.floor(Math.random() * 6) + 1;
        const prefix = size === 3 ? 'l' : size === 2 ? 'm' : 's';
        this.spriteKey = `asteroid-${prefix}${this.variant}`;

        this.drawSize = S(size === 3 ? 90 : size === 2 ? 65 : 60);
    }

    draw() {
        const img = ASSETS[this.spriteKey];
        if (img) {
            drawSpriteAdditive(img, this.x, this.y, this.drawSize, this.drawSize, this.rotation);
            // Apply level color tint over the asteroid
            const palette = getLevelPalette();
            if (palette.tint) {
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = palette.tint;
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.beginPath();
                ctx.arc(0, 0, this.drawSize * 0.38, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
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

        ctx.save();
        if (this.type === 'thrust') {
            // Hot exhaust particles: white core → orange → dim red
            const r = S(1.5 + 2 * t);
            ctx.globalAlpha = t * 0.9;
            // Outer glow
            ctx.fillStyle = t > 0.6 ? '#FFA500' : t > 0.3 ? '#FF6600' : '#882200';
            ctx.beginPath();
            ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
            ctx.fill();
            // Hot white core on fresh particles
            if (t > 0.7) {
                ctx.globalAlpha = (t - 0.7) * 3;
                ctx.fillStyle = '#FFEECC';
                ctx.beginPath();
                ctx.arc(this.x, this.y, r * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.type === 'explosion') {
            const r = S(1 + 2.5 * t);
            ctx.globalAlpha = t * 0.85;
            ctx.fillStyle = t > 0.5 ? '#FFD700' : t > 0.2 ? '#FF6600' : '#661100';
            ctx.beginPath();
            ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // spark
            ctx.globalAlpha = t;
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(this.x, this.y, S(1.5), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
        this.life--;
    }
}

// ── Explosion (particle burst) ───────────────────────────────
class Explosion {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.done = false;
        this.particles = [];
        // Scale particle count and speed by explosion size
        const count = Math.floor(size / S(3));
        const maxSpeed = size / S(12);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = S(0.5) + Math.random() * maxSpeed;
            const life = 25 + Math.random() * 30;
            this.particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                radius: S(1 + Math.random() * 2.5),
                bright: Math.random() < 0.3, // some particles glow brighter
            });
        }
    }

    draw() {
        for (const p of this.particles) {
            if (p.life <= 0) continue;
            const t = p.life / p.maxLife;
            // Color: white → yellow → orange → dim red as it fades
            let r, g, b;
            if (t > 0.7) { r = 255; g = 255; b = 200 + Math.floor(55 * ((t - 0.7) / 0.3)); }
            else if (t > 0.4) { r = 255; g = Math.floor(180 + 75 * ((t - 0.4) / 0.3)); b = 50; }
            else { r = 200 + Math.floor(55 * (t / 0.4)); g = Math.floor(80 * (t / 0.4)); b = 20; }
            const alpha = Math.min(1, t * 1.5);
            const sz = p.radius * (0.3 + t * 0.7);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
            ctx.fill();
            // Bright particles get a glow halo
            if (p.bright && t > 0.3) {
                ctx.globalAlpha = alpha * 0.3;
                ctx.beginPath();
                ctx.arc(p.x, p.y, sz * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }

    update() {
        let alive = false;
        for (const p of this.particles) {
            if (p.life <= 0) continue;
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.97;
            p.vy *= 0.97;
            p.life--;
            if (p.life > 0) alive = true;
        }
        this.done = !alive;
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
        const r = this.scale * S(65);
        ctx.save();
        ctx.globalAlpha = this.alpha * 0.6;
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = S(2) * this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
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

// ── Power-Up ─────────────────────────────────────────────────
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.config = POWERUP_TYPES[type];
        this.radius = S(14);
        this.life = 400; // disappears after ~6.5 seconds
        this.bobPhase = Math.random() * Math.PI * 2;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    draw() {
        const t = this.life / 400;
        // Flash when about to expire
        if (this.life < 90 && Math.floor(this.life / 6) % 2 === 0) return;

        const bob = Math.sin(this.bobPhase) * S(3);
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.15;
        const r = this.radius * pulse;

        ctx.save();
        // Outer glow
        ctx.globalAlpha = 0.25 * t;
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y + bob, r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Ring
        ctx.globalAlpha = 0.7 * t;
        ctx.strokeStyle = this.config.color;
        ctx.lineWidth = S(2);
        ctx.beginPath();
        ctx.arc(this.x, this.y + bob, r, 0, Math.PI * 2);
        ctx.stroke();

        // Inner fill
        ctx.globalAlpha = 0.3 * t;
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y + bob, r * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Icon text
        ctx.globalAlpha = 0.9 * t;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${S(12)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.icon, this.x, this.y + bob);

        ctx.restore();
    }

    update() {
        this.bobPhase += 0.06;
        this.pulsePhase += 0.08;
        this.life--;
    }
}

// ── UFO ─────────────────────────────────────────────────────
class UFO {
    constructor(type) {
        this.type = type; // 'large' or 'small'
        this.radius = type === 'large' ? S(22) : S(14);
        const sizeW = type === 'large' ? S(56) : S(36);

        // Enter from left or right
        this.enterFromLeft = Math.random() < 0.5;
        this.x = this.enterFromLeft ? -sizeW : W() + sizeW;
        this.y = S(60) + Math.random() * (H() - S(120));

        // Horizontal speed
        const baseSpeed = type === 'large' ? S(1.5) : S(2.5);
        const levelBoost = Math.min(level * 0.05, 0.5);
        this.vx = (this.enterFromLeft ? 1 : -1) * (baseSpeed + S(levelBoost));

        // Vertical sine wave drift
        this.sinePhase = Math.random() * Math.PI * 2;
        this.sineAmp = S(type === 'large' ? 40 : 25);
        this.sineFreq = type === 'large' ? 0.015 : 0.025;
        this.baseY = this.y;

        // Shooting
        this.shootTimer = 60 + Math.floor(Math.random() * 60);
        this.shootCooldown = type === 'large' ? 90 : 60; // frames between shots

        // Points
        this.points = type === 'large' ? 200 : 1000;

        // Visual
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    draw() {
        const sz = this.type === 'large' ? S(56) : S(36);
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.05;

        ctx.save();
        ctx.translate(this.x, this.y);

        const color = this.type === 'large' ? '#FF4444' : '#FF8800';
        const glow = this.type === 'large' ? '#FF2222' : '#FF6600';

        // Glow underneath
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.ellipse(0, 0, sz * 0.7 * pulse, sz * 0.35 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main saucer body — ellipse
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#1a1a2e';
        ctx.strokeStyle = color;
        ctx.lineWidth = S(2);
        ctx.beginPath();
        ctx.ellipse(0, 0, sz * 0.45 * pulse, sz * 0.18 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Dome on top
        ctx.fillStyle = '#222244';
        ctx.strokeStyle = color;
        ctx.lineWidth = S(1.5);
        ctx.beginPath();
        ctx.ellipse(0, -sz * 0.08 * pulse, sz * 0.2 * pulse, sz * 0.15 * pulse, 0, Math.PI, 0);
        ctx.fill();
        ctx.stroke();

        // Window lights — pulsing dots around the rim
        ctx.globalAlpha = 0.6 + Math.sin(this.pulsePhase * 3) * 0.3;
        ctx.fillStyle = color;
        const numLights = this.type === 'large' ? 6 : 4;
        for (let i = 0; i < numLights; i++) {
            const a = (i / numLights) * Math.PI * 2 + this.pulsePhase;
            const lx = Math.cos(a) * sz * 0.35 * pulse;
            const ly = Math.sin(a) * sz * 0.08 * pulse;
            ctx.beginPath();
            ctx.arc(lx, ly, S(2), 0, Math.PI * 2);
            ctx.fill();
        }

        // Engine glow on bottom
        ctx.globalAlpha = 0.4 + Math.sin(this.pulsePhase * 2) * 0.2;
        ctx.fillStyle = glow;
        ctx.shadowBlur = 8;
        ctx.shadowColor = glow;
        ctx.beginPath();
        ctx.ellipse(0, sz * 0.1 * pulse, sz * 0.15, S(3), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    update() {
        this.x += this.vx;
        this.sinePhase += this.sineFreq;
        this.y = this.baseY + Math.sin(this.sinePhase) * this.sineAmp;
        this.pulsePhase += 0.06;

        // Clamp Y to stay on screen
        if (this.y < S(30)) this.y = S(30);
        if (this.y > H() - S(30)) this.y = H() - S(30);

        // Shooting
        this.shootTimer--;
        if (this.shootTimer <= 0) {
            this.shoot();
            this.shootTimer = this.shootCooldown + Math.floor(Math.random() * 30);
        }
    }

    shoot() {
        const bSpeed = S(5);
        let angle;

        if (this.type === 'large') {
            // Random direction
            angle = Math.random() * Math.PI * 2;
        } else {
            // Aimed at player
            if (ship) {
                angle = Math.atan2(ship.y - this.y, ship.x - this.x);
                // Add slight inaccuracy
                angle += (Math.random() - 0.5) * 0.3;
            } else {
                angle = Math.random() * Math.PI * 2;
            }
        }

        ufoBullets.push(new UFOBullet(
            this.x + Math.cos(angle) * this.radius,
            this.y + Math.sin(angle) * this.radius,
            Math.cos(angle) * bSpeed,
            Math.sin(angle) * bSpeed
        ));
        playUfoShot();
    }

    isOffScreen() {
        const margin = S(80);
        if (this.enterFromLeft && this.x > W() + margin) return true;
        if (!this.enterFromLeft && this.x < -margin) return true;
        return false;
    }
}

// ── UFO Bullet ──────────────────────────────────────────────
class UFOBullet {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.velocity = { x: vx, y: vy };
        this.life = 80; // slightly longer than player bullets
        this.radius = S(4);
    }

    draw() {
        ctx.save();
        // Red/orange glow for enemy bullets
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FF4400';
        ctx.fillStyle = '#FF6644';
        ctx.beginPath();
        ctx.arc(this.x, this.y, S(3.5), 0, Math.PI * 2);
        ctx.fill();
        // Hot core
        ctx.fillStyle = '#FFCC88';
        ctx.beginPath();
        ctx.arc(this.x, this.y, S(1.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life--;
        // Screen wrap
        if (this.x < 0) this.x = W();
        if (this.x > W()) this.x = 0;
        if (this.y < 0) this.y = H();
        if (this.y > H()) this.y = 0;
    }
}

// ── Boss (Mothership) ───────────────────────────────────────
class Boss {
    constructor(bossNumber) {
        this.bossNumber = bossNumber;
        this.x = W() / 2;
        this.y = -S(100);
        this.targetY = H() * 0.22;
        this.entering = true;

        this.maxHp = 15 + bossNumber * 5;
        this.hp = this.maxHp;
        this.radius = S(50);
        this.points = 5000 * bossNumber;

        this.direction = 1;
        this.speed = S(0.8 + bossNumber * 0.15);
        this.sinePhase = 0;

        this.attackTimer = 150;
        this.attackPattern = 0;
        this.burstQueue = [];

        this.pulsePhase = 0;
        this.hitFlash = 0;
        this.bodyColor = bossNumber <= 1 ? '#FF2244' : bossNumber <= 2 ? '#AA22FF' : '#FFAA00';
        this.glowColor = bossNumber <= 1 ? '#FF0022' : bossNumber <= 2 ? '#8800FF' : '#FF8800';
    }

    draw() {
        const sz = S(110);
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.03;

        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.ellipse(0, 0, sz * 0.6, sz * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Large glow
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = this.glowColor;
        ctx.beginPath();
        ctx.ellipse(0, S(5), sz * 0.7 * pulse, sz * 0.35 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main saucer body
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = '#0a0a1e';
        ctx.strokeStyle = this.bodyColor;
        ctx.lineWidth = S(2.5);
        ctx.beginPath();
        ctx.ellipse(0, 0, sz * 0.5 * pulse, sz * 0.18 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner ring
        ctx.strokeStyle = this.bodyColor;
        ctx.lineWidth = S(1);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, sz * 0.35 * pulse, sz * 0.12 * pulse, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Large dome
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#151530';
        ctx.strokeStyle = this.bodyColor;
        ctx.lineWidth = S(2);
        ctx.beginPath();
        ctx.ellipse(0, -sz * 0.06 * pulse, sz * 0.25 * pulse, sz * 0.18 * pulse, 0, Math.PI, 0);
        ctx.fill();
        ctx.stroke();

        // Rotating window lights
        ctx.globalAlpha = 0.7 + Math.sin(this.pulsePhase * 3) * 0.3;
        ctx.fillStyle = this.bodyColor;
        for (let i = 0; i < 10; i++) {
            const a = (i / 10) * Math.PI * 2 + this.pulsePhase * 0.5;
            const lx = Math.cos(a) * sz * 0.42 * pulse;
            const ly = Math.sin(a) * sz * 0.1 * pulse;
            ctx.beginPath();
            ctx.arc(lx, ly, S(2.5), 0, Math.PI * 2);
            ctx.fill();
        }

        // Engine glow
        ctx.globalAlpha = 0.5 + Math.sin(this.pulsePhase * 2) * 0.2;
        ctx.fillStyle = this.glowColor;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.glowColor;
        ctx.beginPath();
        ctx.ellipse(0, sz * 0.12 * pulse, sz * 0.2, S(5), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Weapon ports
        ctx.globalAlpha = 0.6 + Math.sin(this.pulsePhase * 4) * 0.3;
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(-sz * 0.35, sz * 0.05, S(3), 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sz * 0.35, sz * 0.05, S(3), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        this.drawHealthBar();
    }

    drawHealthBar() {
        const barW = S(120);
        const barH = S(8);
        const barX = this.x - barW / 2;
        const barY = this.y - S(55);
        const hpRatio = this.hp / this.maxHp;

        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, barH / 2);
        ctx.fill();

        ctx.globalAlpha = 0.9;
        const barColor = hpRatio > 0.5 ? '#44FF44' : hpRatio > 0.25 ? '#FFAA00' : '#FF3333';
        ctx.fillStyle = barColor;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * hpRatio, barH, barH / 2);
        ctx.fill();

        ctx.shadowBlur = 6;
        ctx.shadowColor = barColor;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * hpRatio, barH, barH / 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, barH / 2);
        ctx.stroke();

        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${S(9)}px Orbitron, monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`BOSS ${this.bossNumber}`, this.x, barY - S(5));
        ctx.restore();
    }

    update() {
        this.pulsePhase += 0.05;
        if (this.hitFlash > 0) this.hitFlash--;

        // Process burst queue
        if (this.burstQueue.length > 0) {
            this.burstQueue[0].delay--;
            if (this.burstQueue[0].delay <= 0) {
                const shot = this.burstQueue.shift();
                ufoBullets.push(new UFOBullet(
                    this.x + Math.cos(shot.angle) * this.radius,
                    this.y + Math.sin(shot.angle) * this.radius,
                    Math.cos(shot.angle) * shot.speed,
                    Math.sin(shot.angle) * shot.speed
                ));
                playUfoShot();
            }
        }

        if (this.entering) {
            this.y += S(1.5);
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.entering = false;
            }
            return;
        }

        this.x += this.speed * this.direction;
        this.sinePhase += 0.018;
        this.y = this.targetY + Math.sin(this.sinePhase) * S(35);

        if (this.x < S(100)) { this.x = S(100); this.direction = 1; }
        if (this.x > W() - S(100)) { this.x = W() - S(100); this.direction = -1; }

        this.attackTimer--;
        if (this.attackTimer <= 0 && this.burstQueue.length === 0) {
            this.doAttack();
            this.attackTimer = Math.max(40, 100 - this.bossNumber * 8);
        }
    }

    doAttack() {
        this.attackPattern = (this.attackPattern + 1) % 3;
        switch (this.attackPattern) {
            case 0: this.spreadShot(); break;
            case 1: this.aimedBurst(); break;
            case 2: this.spawnMinions(); break;
        }
    }

    spreadShot() {
        const count = 5 + Math.min(4, this.bossNumber);
        const spreadAngle = Math.PI * 0.6;
        const baseAngle = Math.PI / 2;
        for (let i = 0; i < count; i++) {
            const angle = baseAngle - spreadAngle / 2 + (i / (count - 1)) * spreadAngle;
            const speed = S(4);
            ufoBullets.push(new UFOBullet(
                this.x + Math.cos(angle) * this.radius,
                this.y + Math.sin(angle) * this.radius,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            ));
        }
        playUfoShot();
    }

    aimedBurst() {
        if (!ship) return;
        const baseAngle = Math.atan2(ship.y - this.y, ship.x - this.x);
        for (let i = 0; i < 3; i++) {
            this.burstQueue.push({
                angle: baseAngle + (Math.random() - 0.5) * 0.3,
                speed: S(5),
                delay: i * 8
            });
        }
    }

    spawnMinions() {
        const count = 2 + (this.bossNumber > 2 ? 1 : 0);
        for (let i = 0; i < count; i++) {
            const angle = Math.PI / 2 + (Math.random() - 0.5) * 1.5;
            const dist = this.radius + S(20);
            asteroids.push(new Asteroid(
                this.x + Math.cos(angle) * dist,
                this.y + Math.sin(angle) * dist,
                1
            ));
        }
        for (let k = 0; k < 5; k++) {
            const a = Math.random() * Math.PI * 2;
            const s = S(2 + Math.random() * 3);
            particles.push(new Particle(this.x, this.y,
                Math.cos(a) * s, Math.sin(a) * s, 'spark', 15));
        }
    }

    takeDamage() {
        this.hp--;
        this.hitFlash = 6;
        screenShake = S(2);
        playBossHit();
        for (let k = 0; k < 3; k++) {
            const a = Math.random() * Math.PI * 2;
            const s = S(2 + Math.random() * 3);
            particles.push(new Particle(this.x, this.y,
                Math.cos(a) * s, Math.sin(a) * s, 'spark', 12));
        }
    }
}

// ── Extra Life Check ────────────────────────────────────────
function checkExtraLife() {
    while (score >= nextExtraLife) {
        lives++;
        playExtraLife();
        scorePopups.push(new ScorePopup(
            ship ? ship.x : W() / 2,
            ship ? ship.y - S(30) : H() / 2,
            '1-UP'
        ));
        updateUI();
        nextExtraLife += 10000;
    }
}

// ── Boss Defeat ─────────────────────────────────────────────
function defeatBoss() {
    if (!boss) return;

    // Massive explosion
    explosions.push(new Explosion(boss.x, boss.y, S(200)));
    shockwaves.push(new Shockwave(boss.x, boss.y));
    for (let k = 0; k < 20; k++) {
        const a = Math.random() * Math.PI * 2;
        const s = S(3 + Math.random() * 6);
        particles.push(new Particle(boss.x, boss.y,
            Math.cos(a) * s, Math.sin(a) * s, 'spark', 30));
    }
    for (let i = 0; i < 5; i++) {
        const ox = (Math.random() - 0.5) * S(80);
        const oy = (Math.random() - 0.5) * S(40);
        explosions.push(new Explosion(boss.x + ox, boss.y + oy, S(80)));
    }

    screenShake = S(20);
    playBossDefeat();

    score += boss.points;
    scorePopups.push(new ScorePopup(boss.x, boss.y - S(30), boss.points));
    checkExtraLife();
    skinBossKills++;
    checkSkinUpgrade();

    // Drop 2 guaranteed power-ups
    for (let i = 0; i < 2; i++) {
        const ox = (Math.random() - 0.5) * S(60);
        spawnPowerUp(boss.x + ox, boss.y);
    }

    bossActive = false;
    boss = null;
    ufoBullets = [];

    // Advance to next level
    level++;
    levelTransition = true;
    levelTransitionTimer = 120;
    levelTransitionText = `LEVEL ${level}`;
    playLevelUp();
    resetUfoSpawnTimer();
    updateUI();
}

// ── UFO Spawning ────────────────────────────────────────────
function resetUfoSpawnTimer() {
    // Faster spawns at higher levels
    const levelFactor = Math.max(0.5, 1 - (level - 2) * 0.05);
    const min = Math.floor(UFO_SPAWN_MIN * levelFactor);
    const max = Math.floor(UFO_SPAWN_MAX * levelFactor);
    ufoSpawnTimer = min + Math.floor(Math.random() * (max - min));
}

function spawnUfo() {
    // Determine type: small UFOs only from level 4+
    let type = 'large';
    if (level >= 4) {
        // 40% chance of small at level 4, increasing with level
        const smallChance = Math.min(0.6, 0.3 + (level - 4) * 0.05);
        if (Math.random() < smallChance) type = 'small';
    }
    ufos.push(new UFO(type));
    startUfoHum();
}

function updateUfos() {
    // Spawn timer — only from level 2+
    if (level >= 2 && ufos.length < UFO_MAX_ACTIVE && !bossActive) {
        ufoSpawnTimer--;
        if (ufoSpawnTimer <= 0) {
            spawnUfo();
            resetUfoSpawnTimer();
        }
    }

    // Update UFOs
    for (let i = ufos.length - 1; i >= 0; i--) {
        ufos[i].update();
        if (ufos[i].isOffScreen()) {
            ufos.splice(i, 1);
        }
    }

    // Update UFO bullets
    ufoBullets.forEach(b => b.update());
    ufoBullets = ufoBullets.filter(b => b.life > 0);

    // Stop hum if no UFOs on screen
    if (ufos.length === 0 && ufoHumOsc) {
        stopUfoHum();
    }
}

function choosePowerUpType() {
    // Weighted random selection
    const entries = Object.entries(POWERUP_WEIGHTS);
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let roll = Math.random() * total;
    for (const [type, weight] of entries) {
        roll -= weight;
        if (roll <= 0) return type;
    }
    return 'multi2'; // fallback
}

function shouldDropPowerUp(asteroidSize) {
    const elapsed = frameCount - lastPowerUpTime;

    // a) Consecutive hits — 5+ hits in a row without missing bumps chance
    if (consecutiveHits >= 8) return Math.random() < 0.5;
    if (consecutiveHits >= 5) return Math.random() < 0.25;

    // b) Time without a power-up — after 10+ seconds, high chance
    if (elapsed > 600) return Math.random() < 0.35; // ~10 seconds
    if (elapsed > 360) return Math.random() < 0.15; // ~6 seconds

    // c) Random — small base chance, higher for big asteroids
    const baseChance = asteroidSize === 3 ? 0.12 : asteroidSize === 2 ? 0.06 : 0.03;
    return Math.random() < baseChance;
}

function spawnPowerUp(x, y) {
    const type = choosePowerUpType();
    powerups.push(new PowerUp(x, y, type));
    lastPowerUpTime = frameCount;
}

function activatePowerUp(type) {
    const config = POWERUP_TYPES[type];
    playPowerUpPickup();

    if (type === 'hyperspace') {
        hyperspaceCharges = Math.min(hyperspaceCharges + 3, 5); // gain 3 charges, max 5
        return;
    }

    if (type === 'shield') {
        hasShield = true;
        return;
    }

    // Multi-gun upgrades replace each other
    if (type === 'multi2' || type === 'multi3') {
        delete activePowerUps['multi2'];
        delete activePowerUps['multi3'];
    }

    if (config.permanent) {
        activePowerUps[type] = { timer: -1, permanent: true };
    } else {
        activePowerUps[type] = { timer: config.duration, permanent: false };
    }
}

function updatePowerUps() {
    // Update floating power-ups
    powerups.forEach(p => p.update());
    powerups = powerups.filter(p => p.life > 0);

    // Check collection
    if (ship) {
        for (let i = powerups.length - 1; i >= 0; i--) {
            const p = powerups[i];
            const dist = Math.hypot(ship.x - p.x, ship.y - p.y);
            if (dist < ship.radius + p.radius) {
                activatePowerUp(p.type);
                // Pickup sparkle
                for (let k = 0; k < 8; k++) {
                    const a = Math.random() * Math.PI * 2;
                    const s = S(2 + Math.random() * 3);
                    particles.push(new Particle(p.x, p.y,
                        Math.cos(a) * s, Math.sin(a) * s, 'spark', 20));
                }
                scorePopups.push(new ScorePopup(p.x, p.y - S(20), p.config.label));
                powerups.splice(i, 1);
            }
        }
    }

    // Tick active power-up timers
    for (const type of Object.keys(activePowerUps)) {
        const pu = activePowerUps[type];
        if (!pu.permanent) {
            pu.timer--;
            if (pu.timer <= 0) {
                delete activePowerUps[type];
            }
        }
    }
}

function doHyperspace() {
    if (hyperspaceCharges <= 0 || !ship) return;
    hyperspaceCharges--;
    playHyperspace();

    // Flash at old position
    for (let k = 0; k < 12; k++) {
        const a = Math.random() * Math.PI * 2;
        const s = S(3 + Math.random() * 5);
        particles.push(new Particle(ship.x, ship.y,
            Math.cos(a) * s, Math.sin(a) * s, 'spark', 15));
    }

    // Find a safe spot — at least 150px from any asteroid
    let attempts = 0;
    let nx, ny;
    do {
        nx = S(80) + Math.random() * (W() - S(160));
        ny = S(80) + Math.random() * (H() - S(160));
        attempts++;
    } while (attempts < 50 && asteroids.some(a =>
        Math.hypot(a.x - nx, a.y - ny) < S(150)));

    ship.x = nx;
    ship.y = ny;
    ship.velocity.x = 0;
    ship.velocity.y = 0;

    // Brief invincibility after hyperspace
    invincible = true;
    invincibleTimer = 45;

    // Flash at new position
    for (let k = 0; k < 8; k++) {
        const a = Math.random() * Math.PI * 2;
        const s = S(2 + Math.random() * 3);
        particles.push(new Particle(ship.x, ship.y,
            Math.cos(a) * s, Math.sin(a) * s, 'spark', 20));
    }
}

// ── Leaderboard ─────────────────────────────────────────────
function saveToLeaderboard(name, finalScore, finalLevel) {
    const entry = { name: name.toUpperCase(), score: finalScore, level: finalLevel, skin: currentSkin, date: Date.now() };

    // Save locally immediately (instant feedback)
    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem('asteroids-leaderboard', JSON.stringify(leaderboard));

    // Push to Supabase (fire and forget — don't block the game)
    const headers = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
    };
    const bodyWithSkin = { player_name: entry.name, score: entry.score, level: entry.level, ship_skin: entry.skin };
    const bodyNoSkin = { player_name: entry.name, score: entry.score, level: entry.level };
    fetch(`${SUPABASE_URL}/rest/v1/leaderboard`, {
        method: 'POST', headers, body: JSON.stringify(bodyWithSkin)
    }).then(res => {
        if (!res.ok) return fetch(`${SUPABASE_URL}/rest/v1/leaderboard`, {
            method: 'POST', headers, body: JSON.stringify(bodyNoSkin)
        });
    }).then(() => fetchGlobalLeaderboard())
    .catch(err => console.warn('Supabase save failed (score saved locally):', err));
}

async function fetchGlobalLeaderboard() {
    leaderboardLoading = true;
    leaderboardError = false;
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/leaderboard?select=player_name,score,level,ship_skin,created_at&order=score.desc&limit=10`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Merge: global leaderboard replaces local
        leaderboard = data.map(row => ({
            name: row.player_name,
            score: row.score,
            level: row.level,
            skin: row.ship_skin || 'classic',
            date: new Date(row.created_at).getTime()
        }));
        localStorage.setItem('asteroids-leaderboard', JSON.stringify(leaderboard));
    } catch (err) {
        console.warn('Supabase fetch failed (using local cache):', err);
        leaderboardError = true;
    }
    leaderboardLoading = false;
    updateStartScreenLeaderboard();
}

function updateStartScreenLeaderboard() {
    const container = document.getElementById('startLeaderboard');
    const table = document.getElementById('startLeaderboardTable');
    if (!container || !table) return;
    if (leaderboard.length === 0) { container.style.display = 'none'; return; }
    container.style.display = 'block';
    const top5 = leaderboard.slice(0, 5);
    table.innerHTML = top5.map((e, i) => {
        const rank = i + 1;
        const color = rank === 1 ? '#78fff5' : 'rgba(255,255,255,0.6)';
        const skinColor = (SHIP_SKINS[e.skin] || SHIP_SKINS['classic']).color;
        return `<tr style="color:${color}"><td style="padding:2px 8px;text-align:right">${rank}.</td><td style="padding:2px 4px"><span style="display:inline-block;width:8px;height:8px;background:${skinColor};border-radius:2px;vertical-align:middle;box-shadow:0 0 4px ${skinColor}"></span></td><td style="padding:2px 8px">${e.name}</td><td style="padding:2px 8px;text-align:right">${e.score.toLocaleString()}</td><td style="padding:2px 8px;color:rgba(255,255,255,0.35)">LV${e.level}</td></tr>`;
    }).join('');
}

function getLeaderboardRank(finalScore) {
    if (leaderboard.length < 10) return leaderboard.length + 1;
    for (let i = 0; i < leaderboard.length; i++) {
        if (finalScore > leaderboard[i].score) return i + 1;
    }
    return leaderboard.length < 10 ? leaderboard.length + 1 : -1;
}

// ── Initialize ───────────────────────────────────────────────
function init() {
    // Clear all key states to prevent stuck keys from name entry
    Object.keys(keys).forEach(k => keys[k] = false);
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
    powerups = [];
    activePowerUps = {};
    consecutiveHits = 0;
    lastPowerUpTime = 0;
    hyperspaceCharges = 0;
    hasShield = false;
    ufos = [];
    ufoBullets = [];
    stopUfoHum();
    resetUfoSpawnTimer();
    boss = null;
    bossActive = false;
    nextExtraLife = 10000;
    currentSkin = 'classic';
    unlockedSkins = new Set(['classic']);
    skinAsteroidKills = 0;
    skinUfoKills = 0;
    skinBossKills = 0;
    skinShotsFired = 0;
    skinShotsHit = 0;
    shipTrail = [];
    enteringName = false;
    playerName = '';
    nameSubmitted = false;
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

                // A few extra sparks for accent
                for (let k = 0; k < 4; k++) {
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
                checkExtraLife();

                // Track consecutive hits for power-up drops
                consecutiveHits++;
                skinAsteroidKills++;
                skinShotsHit++;
                checkSkinUpgrade();

                // Power-up drop check
                if (shouldDropPowerUp(aSize)) {
                    spawnPowerUp(ax, ay);
                    consecutiveHits = 0; // reset streak after drop
                }

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

    // Player Bullets vs UFOs
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = ufos.length - 1; j >= 0; j--) {
            const dist = Math.hypot(bullets[i].x - ufos[j].x, bullets[i].y - ufos[j].y);
            if (dist < ufos[j].radius + S(4)) {
                const ux = ufos[j].x;
                const uy = ufos[j].y;
                const uType = ufos[j].type;
                const pts = ufos[j].points;

                // Explosion
                const expSize = S(uType === 'large' ? 100 : 70);
                explosions.push(new Explosion(ux, uy, expSize));
                shockwaves.push(new Shockwave(ux, uy));
                for (let k = 0; k < 8; k++) {
                    const a = Math.random() * Math.PI * 2;
                    const s = S(2 + Math.random() * 5);
                    particles.push(new Particle(ux, uy,
                        Math.cos(a) * s, Math.sin(a) * s, 'spark', 22));
                }

                playUfoExplosion();
                screenShake = S(8);
                score += pts;
                scorePopups.push(new ScorePopup(ux, uy - S(15), pts));
                checkExtraLife();
                consecutiveHits++;
                skinUfoKills++;
                skinShotsHit++;
                checkSkinUpgrade();

                // UFOs have a high power-up drop chance (40%)
                if (Math.random() < 0.4) {
                    spawnPowerUp(ux, uy);
                }

                ufos.splice(j, 1);
                bullets.splice(i, 1);
                break;
            }
        }
    }

    // Player Bullets vs Boss
    if (bossActive && boss) {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const dist = Math.hypot(bullets[i].x - boss.x, bullets[i].y - boss.y);
            if (dist < boss.radius + S(4)) {
                bullets.splice(i, 1);
                boss.takeDamage();
                if (boss.hp <= 0) {
                    defeatBoss();
                    break;
                }
            }
        }
    }

    // UFO Bullets vs Ship
    if (!invincible && ship) {
        for (let i = ufoBullets.length - 1; i >= 0; i--) {
            const dist = Math.hypot(ship.x - ufoBullets[i].x, ship.y - ufoBullets[i].y);
            if (dist < ship.radius + ufoBullets[i].radius) {
                ufoBullets.splice(i, 1);

                // Shield absorbs UFO bullets too
                if (hasShield) {
                    hasShield = false;
                    playShieldHit();
                    screenShake = S(4);
                    invincible = true;
                    invincibleTimer = 20;
                    for (let k = 0; k < 8; k++) {
                        const a = Math.random() * Math.PI * 2;
                        const s = S(2 + Math.random() * 3);
                        particles.push(new Particle(ship.x, ship.y,
                            Math.cos(a) * s, Math.sin(a) * s, 'spark', 18));
                    }
                    continue;
                }

                // Ship destroyed by UFO bullet
                explosions.push(new Explosion(ship.x, ship.y, S(140)));
                shockwaves.push(new Shockwave(ship.x, ship.y));
                screenShake = S(14);
                for (let k = 0; k < 6; k++) {
                    const a = Math.random() * Math.PI * 2;
                    const s = S(2 + Math.random() * 5);
                    particles.push(new Particle(ship.x, ship.y,
                        Math.cos(a) * s, Math.sin(a) * s, 'spark', 30));
                }

                playShipDeath();
                stopThrust();
                activePowerUps = {};
                hyperspaceCharges = 0;
                hasShield = false;
                consecutiveHits = 0;
                lives--;

                if (lives <= 0) {
                    gameOver = true;
                    enteringName = true;
                    nameSubmitted = false;
                    playerName = '';
                    fetchGlobalLeaderboard();
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

    // Asteroids vs UFOs — asteroids destroy UFOs on contact
    for (let i = ufos.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const dist = Math.hypot(ufos[i].x - asteroids[j].x, ufos[i].y - asteroids[j].y);
            if (dist < ufos[i].radius + asteroids[j].radius) {
                const ux = ufos[i].x;
                const uy = ufos[i].y;
                explosions.push(new Explosion(ux, uy, S(80)));
                shockwaves.push(new Shockwave(ux, uy));
                for (let k = 0; k < 5; k++) {
                    const a = Math.random() * Math.PI * 2;
                    const s = S(2 + Math.random() * 4);
                    particles.push(new Particle(ux, uy,
                        Math.cos(a) * s, Math.sin(a) * s, 'spark', 18));
                }
                playUfoExplosion();
                ufos.splice(i, 1);
                break;
            }
        }
    }

    // Ship vs Asteroids
    if (!invincible && ship) {
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const dist = Math.hypot(ship.x - asteroids[i].x, ship.y - asteroids[i].y);
            if (dist < ship.radius + asteroids[i].radius) {

                // Shield absorbs the hit
                if (hasShield) {
                    hasShield = false;
                    playShieldHit();
                    screenShake = S(6);
                    // Destroy the asteroid that hit us
                    const ax = asteroids[i].x, ay = asteroids[i].y, aSize = asteroids[i].size;
                    explosions.push(new Explosion(ax, ay, S(aSize === 3 ? 80 : 50)));
                    shockwaves.push(new Shockwave(ax, ay));
                    if (aSize > 1) {
                        for (let k = 0; k < 2; k++) asteroids.push(new Asteroid(ax, ay, aSize - 1));
                    }
                    asteroids.splice(i, 1);
                    // Brief invincibility so we don't immediately eat another hit
                    invincible = true;
                    invincibleTimer = 30;
                    // Shield burst visual
                    for (let k = 0; k < 10; k++) {
                        const a = Math.random() * Math.PI * 2;
                        const s = S(2 + Math.random() * 4);
                        particles.push(new Particle(ship.x, ship.y,
                            Math.cos(a) * s, Math.sin(a) * s, 'spark', 20));
                    }
                    break;
                }

                explosions.push(new Explosion(ship.x, ship.y, S(140)));
                shockwaves.push(new Shockwave(ship.x, ship.y));
                screenShake = S(14);

                // A few extra sparks
                for (let k = 0; k < 6; k++) {
                    const a = Math.random() * Math.PI * 2;
                    const s = S(2 + Math.random() * 5);
                    particles.push(new Particle(ship.x, ship.y,
                        Math.cos(a) * s, Math.sin(a) * s, 'spark', 30));
                }

                playShipDeath();
                stopThrust();
                // Clear all power-ups on death
                activePowerUps = {};
                hyperspaceCharges = 0;
                hasShield = false;
                consecutiveHits = 0;
                lives--;

                if (lives <= 0) {
                    gameOver = true;
                    enteringName = true;
                    nameSubmitted = false;
                    playerName = '';
                    fetchGlobalLeaderboard(); // Refresh before showing
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
        stopUfoHum();
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
            if (level % 5 === 0) {
                boss = new Boss(Math.floor(level / 5));
                bossActive = true;
                startUfoHum();
            } else {
                spawnAsteroids(Math.min(14, 3 + level));
            }
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
    updatePowerUps();
    updateUfos();
    if (bossActive && boss) boss.update();

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
    if (asteroids.length === 0 && !levelTransition && !bossActive) {
        level++;
        checkSkinUpgrade();
        levelTransition = true;
        if (level % 5 === 0) {
            levelTransitionTimer = 150;
            levelTransitionText = 'WARNING';
            playBossWarning();
        } else {
            levelTransitionTimer = 100;
            levelTransitionText = `LEVEL ${level}`;
            playLevelUp();
        }
        // Clear UFOs between levels
        ufos = [];
        ufoBullets = [];
        stopUfoHum();
        resetUfoSpawnTimer();
    }

    // Stars are static — no update needed

    // Screen shake decay
    if (screenShake > 0) screenShake *= 0.85;
    if (screenShake < 0.5) screenShake = 0;

    updateUI();
}

// ── Draw Background ──────────────────────────────────────────
function drawBackground() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W(), H());

    const palette = getLevelPalette();
    ctx.fillStyle = palette.starColor;
    for (const star of STARS) {
        ctx.fillRect(star.x, star.y, star.size, star.size);
    }
}

// ── Power-Up HUD ────────────────────────────────────────────
function drawPowerUpHUD() {
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    let x = S(12);
    const y = H() - S(22);

    // Active timed power-ups
    for (const [type, pu] of Object.entries(activePowerUps)) {
        const config = POWERUP_TYPES[type];
        const remaining = pu.permanent ? 1 : pu.timer / config.duration;

        // Background pill
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#111';
        const pillW = S(72);
        const pillH = S(16);
        ctx.beginPath();
        ctx.roundRect(x, y - pillH / 2, pillW, pillH, pillH / 2);
        ctx.fill();

        // Timer bar (for timed power-ups)
        if (!pu.permanent) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = config.color;
            ctx.beginPath();
            ctx.roundRect(x, y - pillH / 2, pillW * remaining, pillH, pillH / 2);
            ctx.fill();
        }

        // Label
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = config.color;
        ctx.font = `bold ${S(9)}px monospace`;
        ctx.fillText(config.label, x + S(4), y + S(1));

        x += pillW + S(5);
    }

    // Hyperspace charges
    if (hyperspaceCharges > 0) {
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#CC44FF';
        ctx.font = `bold ${S(10)}px monospace`;
        ctx.fillText(`TAB: HYPERSPACE ×${hyperspaceCharges}`, x, y);
    }

    // Shield indicator
    if (hasShield) {
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#44FF88';
        ctx.font = `bold ${S(10)}px monospace`;
        const shieldX = hyperspaceCharges > 0 ? x + S(130) : x;
        ctx.fillText('◎ SHIELD', shieldX, y);
    }

    ctx.restore();
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
    ufos.forEach(u => u.draw());
    ufoBullets.forEach(b => b.draw());
    if (bossActive && boss) boss.draw();
    powerups.forEach(p => p.draw());
    bullets.forEach(b => b.draw());
    if (gameStarted && !gameOver && ship) ship.draw();
    scorePopups.forEach(p => p.draw());

    // Power-up HUD — active power-ups bar (bottom left)
    if (gameStarted && !gameOver) {
        drawPowerUpHUD();
    }

    ctx.restore(); // end screen shake

    // Vignette overlay
    const vig = ASSETS['overlay-vignette'];
    if (vig) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.35;
        ctx.drawImage(vig, 0, 0, W(), H());
        ctx.restore();
    }

    // Level transition announcement
    if (levelTransition) {
        const t = levelTransitionTimer / 100;
        const fadeIn = Math.min(1, (1 - t) * 4);
        const fadeOut = Math.min(1, t * 3);
        const alpha = Math.min(fadeIn, fadeOut);

        const isBossLevel = level % 5 === 0 && levelTransitionText === 'WARNING';
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = isBossLevel ? '#FF4444' : '#78fff5';
        ctx.font = `bold ${S(isBossLevel ? 52 : 48)}px Orbitron, monospace`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 25;
        ctx.shadowColor = isBossLevel ? '#FF0000' : '#00d4ff';
        ctx.fillText(levelTransitionText, W() / 2, H() / 2);

        ctx.font = `${S(16)}px monospace`;
        ctx.fillStyle = isBossLevel ? 'rgba(255,100,100,0.7)' : 'rgba(255,255,255,0.6)';
        ctx.shadowBlur = 0;
        ctx.fillText(isBossLevel ? 'BOSS INCOMING' : 'GET READY', W() / 2, H() / 2 + S(35));
        ctx.restore();
    }

    // Game over overlay
    if (gameOver) {
        nameCursorBlink++;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, W(), H());
        ctx.textAlign = 'center';

        const cx = W() / 2;
        let yOff = -S(140);

        // Title
        ctx.fillStyle = '#FF4444';
        ctx.font = `bold ${S(42)}px Orbitron, monospace`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FF4444';
        ctx.fillText('GAME OVER', cx, H() / 2 + yOff);
        ctx.shadowBlur = 0;
        yOff += S(40);

        // Score + Level
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${S(24)}px Orbitron, monospace`;
        ctx.fillText(`SCORE: ${score}   LEVEL: ${level}`, cx, H() / 2 + yOff);
        yOff += S(28);

        // High score indicator
        if (score >= highScore && score > 0) {
            ctx.fillStyle = '#78fff5';
            ctx.font = `bold ${S(14)}px monospace`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#78fff5';
            ctx.fillText('NEW HIGH SCORE!', cx, H() / 2 + yOff);
            ctx.shadowBlur = 0;
        }
        yOff += S(30);

        // Name entry
        if (enteringName) {
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = `${S(14)}px monospace`;
            ctx.fillText('ENTER YOUR NAME:', cx, H() / 2 + yOff);
            yOff += S(28);

            // Name input box
            const boxW = S(200);
            const boxH = S(32);
            ctx.strokeStyle = '#78fff5';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - boxW / 2, H() / 2 + yOff - boxH + S(6), boxW, boxH);

            // Name text with blinking cursor
            const cursor = Math.floor(nameCursorBlink / 30) % 2 === 0 ? '_' : '';
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold ${S(20)}px Orbitron, monospace`;
            ctx.fillText(playerName + cursor, cx, H() / 2 + yOff);
            yOff += S(28);

            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = `${S(12)}px monospace`;
            ctx.fillText('TYPE NAME  ·  ENTER TO SAVE  ·  ESC TO SKIP', cx, H() / 2 + yOff);
        } else {
            // Show leaderboard
            ctx.fillStyle = '#78fff5';
            ctx.font = `bold ${S(16)}px Orbitron, monospace`;
            const lbTitle = leaderboardError ? 'LEADERBOARD (LOCAL)' : 'GLOBAL LEADERBOARD';
            ctx.fillText(lbTitle, cx, H() / 2 + yOff);
            yOff += S(6);

            // Subtle indicator
            if (leaderboardLoading) {
                ctx.fillStyle = 'rgba(120,255,245,0.4)';
                ctx.font = `${S(10)}px monospace`;
                ctx.fillText('updating...', cx, H() / 2 + yOff);
            }
            yOff += S(18);

            if (leaderboard.length > 0) {
                ctx.font = `${S(13)}px monospace`;
                const top = leaderboard.slice(0, 10);
                for (let i = 0; i < top.length; i++) {
                    const entry = top[i];
                    const isCurrentScore = nameSubmitted &&
                        entry.score === score && entry.name === playerName.toUpperCase();
                    ctx.fillStyle = isCurrentScore ? '#78fff5' : 'rgba(255,255,255,0.6)';
                    const rank = `${i + 1}.`.padEnd(3);
                    const name = entry.name.padEnd(10);
                    const sc = String(entry.score).padStart(6);
                    const lv = `LV${entry.level}`;
                    // Ship icon
                    const entrySkin = entry.skin || 'classic';
                    drawMiniShip(cx - S(140), H() / 2 + yOff - S(3), entrySkin, S(6));
                    ctx.textAlign = 'center';
                    ctx.fillStyle = isCurrentScore ? '#78fff5' : 'rgba(255,255,255,0.6)';
                    ctx.fillText(`${rank} ${name} ${sc}  ${lv}`, cx, H() / 2 + yOff);
                    yOff += S(18);
                }
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.font = `${S(13)}px monospace`;
                ctx.fillText('NO SCORES YET — BE THE FIRST!', cx, H() / 2 + yOff);
                yOff += S(20);
            }
            yOff += S(12);

            // Restart hint
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = `${S(15)}px monospace`;
            ctx.fillText('PRESS  R  TO RESTART', cx, H() / 2 + yOff);
        }
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
    // Start game
    if (e.key === 'Enter' && !gameStarted && !gameOver) { init(); return; }
    if (e.key === ' ' && !gameStarted && !gameOver) { e.preventDefault(); init(); return; }

    // Hyperspace — Tab key
    if (e.key === 'Tab' && gameStarted && !gameOver) {
        e.preventDefault();
        doHyperspace();
        return;
    }

    // Name entry mode
    if (gameOver && enteringName) {
        if (e.key === 'Enter' && playerName.length > 0) {
            // Save score with name
            saveToLeaderboard(playerName, score, level);
            enteringName = false;
            nameSubmitted = true;
            return;
        }
        if (e.key === 'Escape') {
            // Skip name entry
            enteringName = false;
            nameSubmitted = false;
            return;
        }
        if (e.key === 'Backspace') {
            playerName = playerName.slice(0, -1);
            return;
        }
        // Accept alphanumeric and space, max 10 chars
        if (playerName.length < 10 && e.key.length === 1 && /[a-zA-Z0-9 ]/.test(e.key)) {
            playerName += e.key;
            return;
        }
        return; // block all other keys during name entry
    }

    // Restart after name entry (or skip)
    if ((e.key === 'r' || e.key === 'R') && gameOver && !enteringName) init();
    if (e.key === ' ' && gameOver && !enteringName) { e.preventDefault(); init(); }
});

// Click/tap to start or restart (not during name entry)
document.addEventListener('click', () => {
    if (!gameStarted && !gameOver) init();
    else if (gameOver && !enteringName) init();
});

// Ensure page has focus
canvas.setAttribute('tabindex', '0');
canvas.focus();

// Animated loading screen loop
requestAnimationFrame(function loadingLoop() {
    drawLoadingScreen();
    if (!assetsLoaded) requestAnimationFrame(loadingLoop);
});

// Load assets with progress, then start
loadAssets((loaded, total) => {
    loadingLoaded = loaded;
    loadingTotal = total;
}).then(() => {
    console.log('Assets loaded:', Object.keys(ASSETS).length, '/', Object.keys(ASSET_LIST).length);
    generateStars();
    fetchGlobalLeaderboard(); // Load global scores on startup
    gameLoop();
});

// Regenerate stars on resize
window.addEventListener('resize', () => {
    resizeCanvas();
    generateStars();
});

// ── Mobile Touch Controls — Virtual Joystick ────────────────
(function() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const touchControls = document.getElementById('touchControls');
    if (!isTouchDevice || !touchControls) return;

    touchControls.style.display = 'block';

    // ── Virtual Joystick (left half of screen) ──
    const joystickZone = document.getElementById('joystickZone');
    const joystickBase = document.getElementById('joystickBase');
    const joystickKnob = document.getElementById('joystickKnob');

    let joyTouchId = null;
    let joyOriginX = 0;
    let joyOriginY = 0;
    let joyZoneRect = null;
    const JOY_MAX = 55;   // max drag radius (px)
    const DEAD_ZONE = 15;  // ignore input within this radius

    function joyToZone(cx, cy) {
        return { x: cx - joyZoneRect.left, y: cy - joyZoneRect.top };
    }

    function updateJoystick(cx, cy) {
        const dx = cx - joyOriginX;
        const dy = cy - joyOriginY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Clamp knob to max radius
        let kx = cx, ky = cy;
        if (dist > JOY_MAX) {
            kx = joyOriginX + (dx / dist) * JOY_MAX;
            ky = joyOriginY + (dy / dist) * JOY_MAX;
        }
        const pos = joyToZone(kx, ky);
        joystickKnob.style.left = pos.x + 'px';
        joystickKnob.style.top  = pos.y + 'px';

        // Map direction to keys
        keys['ArrowLeft']  = false;
        keys['ArrowRight'] = false;
        keys['ArrowUp']    = false;

        if (dist > DEAD_ZONE) {
            if (dx < -DEAD_ZONE) keys['ArrowLeft']  = true;
            if (dx >  DEAD_ZONE) keys['ArrowRight'] = true;
            if (dy < -DEAD_ZONE) keys['ArrowUp']    = true;  // up = negative Y
        }
    }

    function hideJoystick() {
        joystickBase.style.display = 'none';
        joystickKnob.style.display = 'none';
        joyTouchId = null;
        keys['ArrowLeft']  = false;
        keys['ArrowRight'] = false;
        keys['ArrowUp']    = false;
    }

    joystickZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (joyTouchId !== null) return; // already tracking

        const t = e.changedTouches[0];
        joyTouchId = t.identifier;
        joyOriginX = t.clientX;
        joyOriginY = t.clientY;
        joyZoneRect = joystickZone.getBoundingClientRect();

        const pos = joyToZone(t.clientX, t.clientY);
        joystickBase.style.display = 'block';
        joystickBase.style.left = pos.x + 'px';
        joystickBase.style.top  = pos.y + 'px';
        joystickKnob.style.display = 'block';
        joystickKnob.style.left = pos.x + 'px';
        joystickKnob.style.top  = pos.y + 'px';

        // Start game on touch if needed
        if (!gameStarted && !gameOver) { initAudio(); init(); }
        else if (gameOver && !enteringName) init();
    }, { passive: false });

    joystickZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (const t of e.changedTouches) {
            if (t.identifier === joyTouchId) {
                updateJoystick(t.clientX, t.clientY);
                break;
            }
        }
    }, { passive: false });

    joystickZone.addEventListener('touchend', (e) => {
        for (const t of e.changedTouches) {
            if (t.identifier === joyTouchId) { hideJoystick(); break; }
        }
    }, { passive: false });

    joystickZone.addEventListener('touchcancel', () => { hideJoystick(); });

    // ── Right-side buttons (Fire + Warp) ──
    const btnMap = { 'touchFire': ' ', 'touchHyper': 'Tab' };

    for (const [id, key] of Object.entries(btnMap)) {
        const el = document.getElementById(id);
        if (!el) continue;

        el.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys[key] = true;
            el.classList.add('active');
            if (!gameStarted && !gameOver) { initAudio(); init(); }
            else if (gameOver && !enteringName) init();
            if (key === 'Tab' && gameStarted && !gameOver) doHyperspace();
        }, { passive: false });

        el.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys[key] = false;
            el.classList.remove('active');
        }, { passive: false });

        el.addEventListener('touchcancel', () => {
            keys[key] = false;
            el.classList.remove('active');
        });
    }

    // Tap canvas to start (areas not covered by joystick/buttons)
    canvas.addEventListener('touchstart', (e) => {
        if (!gameStarted && !gameOver) { e.preventDefault(); initAudio(); init(); }
        else if (gameOver && !enteringName) { e.preventDefault(); init(); }
    }, { passive: false });
})();
