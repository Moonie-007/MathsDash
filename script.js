const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const timeEl = document.getElementById('time');
const barFillEl = document.getElementById('barFill');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const startBtnEl = document.getElementById('startBtn');

let state;

function resetState() {
    state = {
        score: 0,
        level: 1,
        correctStreak: 0,
        totalTime: 60,
        timeLeft: 60,
        questionTime: 8,
        questionLeft: 8,
        answer: 0,
        running: false
    };
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestion(level) {
    const ops = ['+', '-'];
    if (level >= 3) ops.push('x');
    if (level >= 5) ops.push('÷');

    const op = ops[randomInt(0, ops.length - 1)];
    let a, b, answer;

    if (op === '+') {
        a = randomInt(2, 20 + level * 5);
        b = randomInt(2, 20 + level * 5);
        answer = a + b;
    } else if (op === '-') {
        a = randomInt(10, 30 + level * 5);
        b = randomInt(2, a);
        answer = a - b;
    } else if (op === 'x') {
        a = randomInt(2, 5 + level);
        b = randomInt(2, 9);
        answer = a * b;
    } else {
        b = randomInt(2, 9);
        answer = randomInt(2, 5 + level);
        a = b * answer;
    }

    const options = new Set([answer]);

    while (options.size < 4) {
        const offset = randomInt(1, Math.max(3, Math.round(Math.abs(answer) * 0.3)));
        const wrong = answer + (Math.random() < 0.5 ? -offset : offset);

        if (wrong >= 0 && wrong !== answer) {
            options.add(wrong);
        }
    }

    return {
        text: `${a} ${op} ${b}`,
        answer,
        options: shuffle([...options])
    };
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function nextQuestion() {
    const q = makeQuestion(state.level);
    state.answer = q.answer;
    state.questionLeft = state.questionTime;
    questionEl.textContent = q.text + ' = ?';

    answersEl.innerHTML = '';

    q.options.forEach(value => {
        const btn = document.createElement('button');
        btn.textContent = value;
        btn.addEventListener('click', () => answerQuestion(value));
        answersEl.appendChild(btn);
    });
}

function answerQuestion(value) {
    if (!state.running) return;

    if (value === state.answer) {
        state.score += 10;
        state.correctStreak++;

        if (state.correctStreak % 4 === 0) {
            state.level++;
            state.questionTime = Math.max(3, state.questionTime - 1);
        }
    } else {
        state.score = Math.max(0, state.score - 5);
        state.correctStreak = 0;
    }

    updateHud();
    nextQuestion();
}

let lastFrame = 0;

function loop(timestamp) {
    if (!state.running) return;

    const dt = (timestamp - lastFrame) / 1000;
    lastFrame = timestamp;

    state.timeLeft -= dt;
    state.questionLeft -= dt;

    timeEl.textContent = Math.ceil(Math.max(0, state.timeLeft));

    barFillEl.style.width =
        Math.max(0, state.questionLeft / state.questionTime) * 100 + '%';

    barFillEl.style.background =
        state.questionLeft < 2 ? '#ef4444' : '#4ade80';

    if (state.timeLeft <= 0) {
        gameOver('Round Over');
        return;
    }

    if (state.questionLeft <= 0) {
        gameOver('Time ran out on that question');
        return;
    }

    requestAnimationFrame(loop);
}

function startGame() {
    resetState();
    state.running = true;

    startBtnEl.textContent = 'Restart';
    updateHud();
    nextQuestion();

    lastFrame = performance.now();
    requestAnimationFrame(loop);
}

function gameOver(reason) {
    state.running = false;
    answersEl.innerHTML = '';
    questionEl.textContent = `Score: ${state.score}`;
    startBtnEl.textContent = 'Play Again';
    timeEl.textContent = '0';
    barFillEl.style.width = '0%';
}

function updateHud() {
    scoreEl.textContent = state.score;
    levelEl.textContent = state.level;
}

startBtnEl.addEventListener('click', startGame);

resetState();
