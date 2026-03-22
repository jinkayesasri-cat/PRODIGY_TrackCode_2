const timeDisplay = document.getElementById('time');
const msDisplay = document.getElementById('milliseconds');
const startPauseBtn = document.getElementById('startPauseBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsList = document.getElementById('lapsList');

let isRunning = false;
let startTime = 0;
let elapsedTime = 0;
let intervalId = null;
let lastLapTime = 0;
let laps = [];

// --- Background "Sparkle Fall" Mouse Game ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };

window.addEventListener('resize', resizeCanvas);
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    // Spawn multiple sparkles on mouse move
    for (let i = 0; i < 5; i++) {
        particles.push(new Sparkle(mouse.x, mouse.y));
    }
});

class Sparkle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 2 + 1; // Always falling down
        this.gravity = 0.05;
        this.opacity = 1;

        // Dynamic Bright Colors
        const colors = [
            '#FFD700', // Gold
            '#FF69B4', // Hot Pink
            '#00FA9A', // Medium Spring Green
            '#00BFFF', // Deep Sky Blue
            '#FF4500', // Orange Red
            '#EE82EE'  // Violet
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.flickerSpeed = Math.random() * 0.1 + 0.02;
    }

    update() {
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= this.flickerSpeed;

        // Random flicker effect
        if (Math.random() > 0.8) this.opacity += 0.05;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fillStyle = this.color;

        // Draw a diamond/star shape for "sparkle" look
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x + this.size / 2, this.y);
        ctx.lineTo(this.x, this.y + this.size);
        ctx.lineTo(this.x - this.size / 2, this.y);
        ctx.closePath();
        ctx.fill();

        // Add a glow/halo to the sparkle
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.restore();
    }
}

function handleParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].opacity <= 0 || particles[i].y > canvas.height) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(handleParticles);
}
handleParticles();

// --- Stopwatch Logic ---
function formatTime(timeInMs) {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const ms = Math.floor((timeInMs % 1000) / 10);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (hours > 0) timeString = `${hours.toString().padStart(2, '0')}:${timeString}`;

    return { timeString, msString: `.${ms.toString().padStart(2, '0')}` };
}

function updateDisplay() {
    const formatted = formatTime(elapsedTime);
    timeDisplay.textContent = formatted.timeString;
    msDisplay.textContent = formatted.msString;
}

function startTimer() {
    startTime = Date.now() - elapsedTime;
    isRunning = true;
    intervalId = requestAnimationFrame(runTimer);

    startPauseBtn.textContent = 'Pause';
    startPauseBtn.classList.add('pause');
    lapBtn.disabled = false;
    resetBtn.disabled = true;
}

function runTimer() {
    if (!isRunning) return;
    elapsedTime = Date.now() - startTime;
    updateDisplay();
    requestAnimationFrame(runTimer);
}

function pauseTimer() {
    isRunning = false;
    startPauseBtn.textContent = 'Start';
    startPauseBtn.classList.remove('pause');
    lapBtn.disabled = true;
    resetBtn.disabled = false;
}

function resetTimer() {
    elapsedTime = 0;
    lastLapTime = 0;
    laps = [];
    updateDisplay();
    lapsList.innerHTML = '';
    resetBtn.disabled = true;
}

function recordLap() {
    const lapTime = elapsedTime - lastLapTime;
    lastLapTime = elapsedTime;
    const lapNumber = laps.length + 1;
    laps.push({ number: lapNumber, time: lapTime, total: elapsedTime });
    renderLap(lapNumber, lapTime, elapsedTime);
}

function renderLap(number, lapTime, totalTime) {
    const lapItem = document.createElement('li');
    lapItem.className = 'lap-item';

    const fLap = formatTime(lapTime);
    const fTotal = formatTime(totalTime);

    lapItem.innerHTML = `
        <span>LAP ${number.toString().padStart(2, '0')}</span>
        <span>${fLap.timeString}${fLap.msString}</span>
        <span>${fTotal.timeString}${fTotal.msString}</span>
    `;
    lapsList.prepend(lapItem);
}

startPauseBtn.addEventListener('click', () => isRunning ? pauseTimer() : startTimer());
lapBtn.addEventListener('click', () => isRunning && recordLap());
resetBtn.addEventListener('click', resetTimer);

updateDisplay();
