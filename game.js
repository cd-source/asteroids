// Asteroids Clone - Enhanced Graphics
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const messageEl = document.getElementById('message');

// Game dimensions
canvas.width = 800;
canvas.height = 600;

// Game state
let ship = null;
let asteroids = [];
let bullets = [];
let particles = [];
let score = 0;
let lives = 3;
let level = 1;
let gameOver = false;
let invincible = false;
let invincibleTimer = 0;

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Ship class with detailed graphics
class Ship {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.angle = -Math.PI / 2;
        this.velocity = { x: 0, y: 0 };
        this.radius = 15;
        this.thrust = false;
        this.shootCooldown = 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Invincibility flash
        if (invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Ship body (sleek triangle design)
        ctx.fillStyle = '#4A9EFF';
        ctx.strokeStyle = '#2E7FD9';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(-15, -12);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-15, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ship detail lines (panel lines)
        ctx.strokeStyle = '#1A5FA8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-5, -6);
        ctx.moveTo(10, 0);
        ctx.lineTo(-5, 6);
        ctx.stroke();

        // Cockpit
        ctx.fillStyle = '#00D4FF';
        ctx.beginPath();
        ctx.arc(8, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0099CC';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Wing highlights
        ctx.strokeStyle = '#6BB4FF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-12, -10);
        ctx.moveTo(15, 0);
        ctx.lineTo(-12, 10);
        ctx.stroke();

        // Engine exhaust when thrusting
        if (this.thrust) {
            const flameLength = 15 + Math.random() * 10;
            const flameWidth = 8 + Math.random() * 4;
            
            // Outer flame (yellow)
            const gradient1 = ctx.createLinearGradient(-10, 0, -25, 0);
            gradient1.addColorStop(0, '#FFA500');
            gradient1.addColorStop(1, 'rgba(255, 165, 0, 0)');
            ctx.fillStyle = gradient1;
            ctx.beginPath();
            ctx.moveTo(-10, -flameWidth/2);
            ctx.lineTo(-10 - flameLength, 0);
            ctx.lineTo(-10, flameWidth/2);
            ctx.closePath();
            ctx.fill();

            // Inner flame (white-blue)
            const gradient2 = ctx.createLinearGradient(-10, 0, -20, 0);
            gradient2.addColorStop(0, '#FFFFFF');
            gradient2.addColorStop(1, '#00D4FF');
            ctx.fillStyle = gradient2;
            ctx.beginPath();
            ctx.moveTo(-10, -flameWidth/3);
            ctx.lineTo(-10 - flameLength * 0.6, 0);
            ctx.lineTo(-10, flameWidth/3);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    update() {
        // Rotation
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.angle -= 0.08;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.angle += 0.08;
        }

        // Thrust
        this.thrust = false;
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            this.thrust = true;
            const acceleration = 0.15;
            this.velocity.x += Math.cos(this.angle) * acceleration;
            this.velocity.y += Math.sin(this.angle) * acceleration;

            // Thrust particles
            if (Math.random() > 0.5) {
                const particleAngle = this.angle + Math.PI + (Math.random() - 0.5) * 0.5;
                particles.push(new Particle(
                    this.x - Math.cos(this.angle) * 10,
                    this.y - Math.sin(this.angle) * 10,
                    Math.cos(particleAngle) * (2 + Math.random() * 2),
                    Math.sin(particleAngle) * (2 + Math.random() * 2),
                    '#FFA500',
                    15
                ));
            }
        }

        // Friction
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;

        // Speed limit
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (speed > 8) {
            this.velocity.x = (this.velocity.x / speed) * 8;
            this.velocity.y = (this.velocity.y / speed) * 8;
        }

        // Movement
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Screen wrap
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Shooting
        this.shootCooldown--;
        if ((keys[' '] || keys['Enter']) && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = 15;
        }
    }

    shoot() {
        bullets.push(new Bullet(
            this.x + Math.cos(this.angle) * 20,
            this.y + Math.sin(this.angle) * 20,
            this.velocity.x + Math.cos(this.angle) * 10,
            this.velocity.y + Math.sin(this.angle) * 10
        ));
    }
}

// Asteroid class with textured graphics
class Asteroid {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size; // 3 = large, 2 = medium, 1 = small
        this.radius = size * 15;
        
        // Random velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = (4 - size) * 0.5 + Math.random();
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        
        // Generate random shape
        this.points = [];
        const numPoints = 8 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const radiusVariation = 0.7 + Math.random() * 0.6;
            this.points.push({
                angle: angle,
                radius: this.radius * radiusVariation
            });
        }
        
        // Random crater positions for texture
        this.craters = [];
        const numCraters = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numCraters; i++) {
            this.craters.push({
                x: (Math.random() - 0.5) * this.radius * 1.2,
                y: (Math.random() - 0.5) * this.radius * 1.2,
                radius: 3 + Math.random() * (this.radius * 0.2)
            });
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Create gradient for 3D effect
        const gradient = ctx.createRadialGradient(
            -this.radius * 0.3, -this.radius * 0.3, 0,
            0, 0, this.radius
        );
        gradient.addColorStop(0, '#9A9A9A');  // Light grey center
        gradient.addColorStop(0.5, '#6B6B6B'); // Medium grey
        gradient.addColorStop(1, '#3C3C3C');   // Dark grey edge

        // Draw asteroid shape
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#2A2A2A';  // Dark grey outline
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            const x = Math.cos(point.angle) * point.radius;
            const y = Math.sin(point.angle) * point.radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw craters for texture
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.craters.forEach(crater => {
            ctx.beginPath();
            ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Highlight edge for 3D effect
            ctx.fillStyle = 'rgba(180, 180, 180, 0.3)';  // Light grey highlight
            ctx.beginPath();
            ctx.arc(
                crater.x - crater.radius * 0.2,
                crater.y - crater.radius * 0.2,
                crater.radius * 0.4,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        });

        // Add some detail lines (cracks)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const length = this.radius * (0.3 + Math.random() * 0.4);
            const startX = Math.cos(angle) * (this.radius * 0.3);
            const startY = Math.sin(angle) * (this.radius * 0.3);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(
                startX + Math.cos(angle + 0.2) * length,
                startY + Math.sin(angle + 0.2) * length
            );
            ctx.stroke();
        }

        ctx.restore();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.rotation += this.rotationSpeed;

        // Screen wrap
        if (this.x < -this.radius) this.x = canvas.width + this.radius;
        if (this.x > canvas.width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = canvas.height + this.radius;
        if (this.y > canvas.height + this.radius) this.y = -this.radius;
    }
}

// Bullet class
class Bullet {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.velocity = { x: vx, y: vy };
        this.life = 60;
    }

    draw() {
        // Bullet trail
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00D4FF';
        ctx.fillStyle = '#00D4FF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life--;

        // Screen wrap
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }
}

// Particle class for explosions
class Particle {
    constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.velocity = { x: vx, y: vy };
        this.color = color;
        this.life = life;
        this.maxLife = life;
    }

    draw() {
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life--;
    }
}

// Initialize game
function init() {
    ship = new Ship();
    asteroids = [];
    bullets = [];
    particles = [];
    score = 0;
    lives = 3;
    level = 1;
    gameOver = false;
    spawnAsteroids(4);
    updateUI();
}

// Spawn asteroids
function spawnAsteroids(count) {
    for (let i = 0; i < count; i++) {
        let x, y;
        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        } while (ship && Math.hypot(x - ship.x, y - ship.y) < 150);
        
        asteroids.push(new Asteroid(x, y, 3));
    }
}

// Collision detection
function checkCollisions() {
    // Bullets vs Asteroids
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const dx = bullets[i].x - asteroids[j].x;
            const dy = bullets[i].y - asteroids[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroids[j].radius) {
                // Create explosion
                for (let k = 0; k < 15; k++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1 + Math.random() * 3;
                    particles.push(new Particle(
                        asteroids[j].x,
                        asteroids[j].y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        ['#FFA500', '#FF6600', '#FFD700'][Math.floor(Math.random() * 3)],
                        30
                    ));
                }

                // Score
                score += (4 - asteroids[j].size) * 20;

                // Split asteroid
                if (asteroids[j].size > 1) {
                    for (let k = 0; k < 2; k++) {
                        asteroids.push(new Asteroid(
                            asteroids[j].x,
                            asteroids[j].y,
                            asteroids[j].size - 1
                        ));
                    }
                }

                asteroids.splice(j, 1);
                bullets.splice(i, 1);
                break;
            }
        }
    }

    // Ship vs Asteroids
    if (!invincible) {
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const dx = ship.x - asteroids[i].x;
            const dy = ship.y - asteroids[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < ship.radius + asteroids[i].radius) {
                // Ship explosion
                for (let k = 0; k < 30; k++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1 + Math.random() * 4;
                    particles.push(new Particle(
                        ship.x,
                        ship.y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        ['#4A9EFF', '#00D4FF', '#FFFFFF'][Math.floor(Math.random() * 3)],
                        40
                    ));
                }

                lives--;
                if (lives <= 0) {
                    gameOver = true;
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

// Update game state
function update() {
    if (gameOver) return;

    ship.update();
    asteroids.forEach(a => a.update());
    bullets.forEach(b => b.update());
    particles.forEach(p => p.update());

    // Remove dead objects
    bullets = bullets.filter(b => b.life > 0);
    particles = particles.filter(p => p.life > 0);

    // Check collisions
    checkCollisions();

    // Invincibility timer
    if (invincible) {
        invincibleTimer--;
        if (invincibleTimer <= 0) {
            invincible = false;
        }
    }

    // Level up
    if (asteroids.length === 0) {
        level++;
        spawnAsteroids(3 + level);
    }

    updateUI();
}

// Draw everything
function draw() {
    // Space background
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 100; i++) {
        const x = (i * 67 + 13) % canvas.width;
        const y = (i * 97 + 29) % canvas.height;
        const size = (i % 3) * 0.5 + 0.5;
        ctx.fillRect(x, y, size, size);
    }

    particles.forEach(p => p.draw());
    asteroids.forEach(a => a.draw());
    bullets.forEach(b => b.draw());
    if (!gameOver) ship.draw();

    // Game over message
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 60);
    }
}

// Update UI
function updateUI() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    levelEl.textContent = level;
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Restart game
document.addEventListener('keydown', (e) => {
    if ((e.key === 'r' || e.key === 'R') && gameOver) {
        init();
    }
});

// Start game
init();
gameLoop();
