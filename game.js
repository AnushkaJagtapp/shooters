const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game variables
let player = { x: canvas.width / 2, y: canvas.height - 60, width: 70, height: 30, speed: 7, cannonWidth: 70, cannonHeight: 30, cannonAngle: 0 };
let bullets = [];
let targets = [];
let score = 0;
let gameOver = false;
let level = 'easy';
let targetInterval = 2000;  // Time interval for creating targets
let targetSpeed = 2;       // Speed of falling targets
let bulletSpeed = 5;       // Speed of the bullets
let targetSpawnTimer;

// Intro and Game Over screens
const introScreen = document.getElementById("intro-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScore = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");

// Difficulty selection
document.getElementById("easy-btn").addEventListener("click", () => setDifficulty('easy'));
document.getElementById("medium-btn").addEventListener("click", () => setDifficulty('medium'));
document.getElementById("hard-btn").addEventListener("click", () => setDifficulty('hard'));

// Restart game
restartBtn.addEventListener("click", restartGame);

function setDifficulty(selectedLevel) {
    level = selectedLevel;
    introScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    // Set difficulty levels for target frequency, target speed, and bullet speed
    if (level === 'easy') {
        targetInterval = 2500; // slower targets, less frequent
        targetSpeed = 1; // slow speed
        bulletSpeed = 4; // normal bullet speed
    } else if (level === 'medium') {
        targetInterval = 1800; // moderate speed, moderate frequency
        targetSpeed = 3;
        bulletSpeed = 5; // moderate bullet speed
    } else if (level === 'hard') {
        targetInterval = 1200; // fast targets, more frequent
        targetSpeed = 4; // fast speed
        bulletSpeed = 6; // faster bullets
    }

    startGame();
}

function startGame() {
    player = { x: canvas.width / 2, y: canvas.height - 60, width: 70, height: 30, speed: 7, cannonWidth: 70, cannonHeight: 30, cannonAngle: 0 };
    bullets = [];
    targets = [];
    score = 0;
    gameOver = false;

    // Set up the target spawning interval
    targetSpawnTimer = setInterval(createTarget, targetInterval);  
    update();
}

// Mobile touch events for player movement
let touchStartX = 0;

canvas.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
});

canvas.addEventListener("touchmove", (event) => {
    let touchMoveX = event.touches[0].clientX;
    let deltaX = touchMoveX - touchStartX;

    if (deltaX > 0 && player.x < canvas.width - player.width) {
        player.x += player.speed; // Move right
    } else if (deltaX < 0 && player.x > 0) {
        player.x -= player.speed; // Move left
    }

    touchStartX = touchMoveX;
    event.preventDefault(); // Prevent default scrolling behavior
});

// Mobile touch to shoot
canvas.addEventListener("touchend", (event) => {
    if (!gameOver) {
        bullets.push({ x: player.x + player.cannonWidth / 2, y: player.y - 10, radius: 10, speed: bulletSpeed });
    }
});

// Create targets
function createTarget() {
    const targetWidth = 50;
    const targetHeight = 50;
    const x = Math.random() * (canvas.width - targetWidth);
    const y = -targetHeight;
    const target = { x, y, width: targetWidth, height: targetHeight, speed: targetSpeed };
    targets.push(target);
}

// Update game
function update() {
    if (gameOver) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cannon (player)
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + player.cannonWidth, player.y);
    ctx.lineTo(player.x + player.cannonWidth / 2, player.y + player.cannonHeight);
    ctx.closePath();
    ctx.fill();

    // Draw bullets (circle shape)
    ctx.fillStyle = "red";
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();

        // Remove bullets that go out of bounds
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });

    // Draw targets
    ctx.fillStyle = "blue";
    targets.forEach((target, index) => {
        target.y += target.speed;
        ctx.fillRect(target.x, target.y, target.width, target.height);

        // Check for collisions
        bullets.forEach((bullet, bulletIndex) => {
            if (
                bullet.x > target.x &&
                bullet.x < target.x + target.width &&
                bullet.y > target.y &&
                bullet.y < target.y + target.height
            ) {
                // Remove bullet and target on collision
                bullets.splice(bulletIndex, 1);
                targets.splice(index, 1);
                score += 10;
            }
        });

        // Game over if target reaches the bottom
        if (target.y > canvas.height) {
            gameOver = true;
            showGameOverScreen();
        }
    });

    // Display score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);

    // Request the next frame
    requestAnimationFrame(update);
}

function showGameOverScreen() {
    finalScore.textContent = score;
    gameOverScreen.style.display = 'block';
    clearInterval(targetSpawnTimer);  // Clear target spawning interval when game over
}

function restartGame() {
    gameOverScreen.style.display = 'none';
    clearInterval(targetSpawnTimer);  // Clear target spawning interval
    startGame();
}
