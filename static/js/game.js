class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.timeLeft = 30;
        this.mosquitos = [];
        this.particles = [];
        this.slashPoints = [];
        this.isSlashing = false;
        this.gameLoop = null;
        this.lastTime = 0;
        this.timeModifier = 1;
        this.level = 1;

        this.resize();
        this.setupEventListeners();
        this.loadAssets();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousedown', (e) => this.startSlash(e));
        this.canvas.addEventListener('mousemove', (e) => this.updateSlash(e));
        this.canvas.addEventListener('mouseup', () => this.endSlash());
        this.canvas.addEventListener('touchstart', (e) => this.startSlash(e.touches[0]));
        this.canvas.addEventListener('touchmove', (e) => this.updateSlash(e.touches[0]));
        this.canvas.addEventListener('touchend', () => this.endSlash());
    }

    loadAssets() {
        this.mosquitoTypes = {
            regular: {
                image: new Image(),
                points: 1,
                speed: 200
            },
            fast: {
                image: new Image(),
                points: 3,
                speed: 400
            },
            time: {
                image: new Image(),
                points: 1,
                speed: 150
            },
            green: {
                image: new Image(),
                points: -5,
                speed: 300
            }
        };

        this.mosquitoTypes.regular.image.src = '/static/assets/regular_mosquito.svg';
        this.mosquitoTypes.fast.image.src = '/static/assets/fast_mosquito.svg';
        this.mosquitoTypes.time.image.src = '/static/assets/time_mosquito.svg';
        this.mosquitoTypes.green.image.src = '/static/assets/evil_mosquito.png';
        
        // Add error handling for image loading
        Object.values(this.mosquitoTypes).forEach(type => {
            type.image.onerror = () => {
                console.error('Failed to load mosquito image:', type.image.src);
            };
        });
    }

    startGameLoop() {
        this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
        this.spawnTimer = setInterval(() => this.spawnMosquito(), 1000);
        this.countdownTimer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            if (this.timeLeft <= 0) this.endGame();
        }, 1000);
    }

    showTutorial(callback) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Как играть</h2>
                <p>В игре есть три типа комаров:</p>
                <ul style="text-align: left; margin: 20px 0; list-style: none;">
                    <li style="display: flex; align-items: center; margin-bottom: 10px;">
                        <img src="/static/assets/regular_mosquito.svg" style="width: 40px; height: 40px; margin-right: 10px;">
                        Обычный комар (1 очко)
                    </li>
                    <li style="display: flex; align-items: center; margin-bottom: 10px;">
                        <img src="/static/assets/fast_mosquito.svg" style="width: 40px; height: 40px; margin-right: 10px;">
                        Быстрый комар (3 очка)
                    </li>
                    <li style="display: flex; align-items: center; margin-bottom: 10px;">
                        <img src="/static/assets/time_mosquito.svg" style="width: 40px; height: 40px; margin-right: 10px;">
                        Замедляющий комар (замедляет время)
                    </li>
                </ul>
                <button id="start-game">Начать игру</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('start-game').addEventListener('click', () => {
            modal.remove();
            if (callback) callback();
        });
    }

    showLevel2Tutorial(callback) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Уровень 2</h2>
                <p>Внимание! Появился новый тип комара:</p>
                <ul style="text-align: left; margin: 20px 0; list-style: none;">
                    <li style="display: flex; align-items: center; margin-bottom: 10px;">
                        <img src="/static/assets/evil_mosquito.png" style="width: 40px; height: 40px; margin-right: 10px;">
                        Малярийный комар (отнимает 5 очков!)
                    </li>
                </ul>
                <p>Все комары теперь двигаются в два раза быстрее!</p>
                <button id="start-level-2">Начать уровень</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('start-level-2').addEventListener('click', () => {
            modal.remove();
            if (callback) callback();
        });
    }

    startGame() {
        this.score = 0;
        this.timeLeft = 30;
        this.mosquitos = [];
        this.particles = [];
        this.timeModifier = this.level === 2 ? 2 : 1;
        this.updateScore();
        this.updateTimer();
        
        if (this.level === 2) {
            this.showLevel2Tutorial(() => {
                this.startGameLoop();
            });
        } else {
            this.showTutorial(() => {
                this.startGameLoop();
            });
        }
    }

    start() {
        this.showTutorial(() => {
            this.startGameLoop();
        });
    }

    spawnMosquito() {
        const types = this.level === 1 
            ? ['regular', 'regular', 'regular', 'fast', 'time']
            : ['regular', 'regular', 'regular', 'fast', 'time', 'green'];
        const type = types[Math.floor(Math.random() * types.length)];
        const mosquito = {
            x: Math.random() * this.canvas.width,
            y: this.canvas.height + 50,
            type: type,
            angle: Math.random() * Math.PI * 2,
            speed: this.mosquitoTypes[type].speed
        };
        this.mosquitos.push(mosquito);
    }

    update(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update mosquitos
        this.mosquitos.forEach((mosquito, index) => {
            mosquito.y -= mosquito.speed * deltaTime * this.timeModifier;
            if (mosquito.y < -50) this.mosquitos.splice(index, 1);
        });

        // Update particles
        this.particles = this.particles.filter(particle => particle.update(deltaTime));

        // Draw slash trail
        if (this.isSlashing && this.slashPoints.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.slashPoints[0].x, this.slashPoints[0].y);
            for (let i = 1; i < this.slashPoints.length; i++) {
                this.ctx.lineTo(this.slashPoints[i].x, this.slashPoints[i].y);
            }
            this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }

        // Draw mosquitos
        this.mosquitos.forEach(mosquito => {
            this.ctx.save();
            this.ctx.translate(mosquito.x, mosquito.y);
            this.ctx.rotate(mosquito.angle);
            this.ctx.drawImage(
                this.mosquitoTypes[mosquito.type].image,
                -45, -45, 90, 90
            );
            this.ctx.restore();
        });

        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));

        if (this.timeLeft > 0) {
            this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
        }
    }

    startSlash(event) {
        this.isSlashing = true;
        this.slashPoints = [{x: event.clientX, y: event.clientY}];
        audioManager.playSlashSound();
    }

    updateSlash(event) {
        if (!this.isSlashing) return;
        this.slashPoints.push({x: event.clientX, y: event.clientY});
        this.checkCollisions(event.clientX, event.clientY);
    }

    endSlash() {
        this.isSlashing = false;
        this.slashPoints = [];
    }

    checkCollisions(x, y) {
        this.mosquitos.forEach((mosquito, index) => {
            const distance = Math.hypot(mosquito.x - x, mosquito.y - y);
            if (distance < 25) {
                // Увеличиваем скорость всех комаров на 3% после каждого убийства в первом уровне
                if (this.level === 1) {
                    this.mosquitos.forEach(m => {
                        m.speed *= 1.06;
                    });
                }
                
                this.score += this.mosquitoTypes[mosquito.type].points;
                this.updateScore();
                this.createParticles(mosquito.x, mosquito.y);
                if (mosquito.type === 'time') {
                    this.timeModifier = 0.5;
                    setTimeout(() => this.timeModifier = 1, 3000);
                }
                this.mosquitos.splice(index, 1);
                
                // Воспроизводим разные звуки в зависимости от типа комара
                if (mosquito.type === 'green') {
                    audioManager.playErrorSound();
                } else {
                    audioManager.playHitSound();
                }
            }
        });
    }

    createParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y));
        }
    }

    updateScore() {
        document.getElementById('scoreValue').textContent = this.score;
    }

    updateTimer() {
        document.getElementById('timeValue').textContent = this.timeLeft;
    }

    endGame() {
        cancelAnimationFrame(this.gameLoop);
        clearInterval(this.spawnTimer);
        clearInterval(this.countdownTimer);
        document.getElementById('final-score').textContent = this.score;
        quizManager.startQuiz();
    }
}

const game = new Game();
game.start();

document.getElementById('submit-score').addEventListener('click', async () => {
    const playerName = document.getElementById('player-name').value;
    if (!playerName) return;

    try {
        await fetch('/submit_score', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                player_name: playerName,
                score: game.score
            })
        });
        window.location.href = '/leaderboard';
    } catch (error) {
        console.error('Error submitting score:', error);
    }
});

document.getElementById('play-again').addEventListener('click', () => {
    document.getElementById('game-over').classList.add('hidden');
    game.start();
});
