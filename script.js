const fps = 10;
const rows = 30;
const cols = 30;

const board = document.getElementById('board');
board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

let gameOver = false;
let score = 0;
let highScore = JSON.parse(localStorage.getItem('highScore'));

let food = {x: 0, y: 0};
let foodEaten = true;
let snake = [{x: cols/2, y: rows/2}];
let dir = {x: 1, y: 0};
let dirChangeCooldown = false;
let elementsList = [];

function play() {

    elementsList.forEach((e) => e.remove());
    elementsList = [];

    if (foodEaten) {
        foodEaten = false;

        let emptyCellFound = false;

        while (!emptyCellFound) {
            food.x = Math.floor(Math.random() * cols);
            food.y = Math.floor(Math.random() * rows);

            emptyCellFound = true;
            for (let e of snake) {
                if (food.x == e.x && food.y == e.y) {
                    emptyCellFound = false;
                    break;
                }
            }
        } 
    }

    if (snake[0].x == food.x && snake[0].y == food.y) {
        score++;
        highScore = Math.max(highScore, score);
        foodEaten = true;
        snake.push({x: snake[snake.length - 1].x, y: snake[snake.length - 1].y});
    }
    if (dirChangeCooldown) {
        dirChangeCooldown = false;
    }

    for (let i = snake.length - 1; i > 0; i--) {
        if (foodEaten && i == snake.length - 1) {
            continue;
        }
        snake[i].x = snake[i - 1].x;
        snake[i].y = snake[i - 1].y;
    }
    snake[0] = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

    if (snake[0].x < 0 || snake[0].x >= cols || snake[0].y < 0 || snake[0].y >= rows) {
        gameOver = true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x == snake[i].x && snake[0].y == snake[i].y) {
            gameOver = true;
            break;
        }
    }
    if (gameOver) {
        reset();
    }

    snake.forEach((e) => {
        const snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = e.y + 1;
        snakeElement.style.gridColumnStart = e.x + 1;
        snakeElement.classList.add('snake');

        elementsList.push(snakeElement);
        board.appendChild(snakeElement);
    })
    if (!foodEaten) {
        const foodElement = document.createElement('div');
        foodElement.style.gridRowStart = food.y + 1;
        foodElement.style.gridColumnStart = food.x + 1;
        foodElement.classList.add('food');
        
        board.appendChild(foodElement);
        elementsList.push(foodElement);
    }
    const scoreElement = document.createElement('p');
    scoreElement.classList.add('score');
    scoreElement.innerHTML = `Score: ${score}`;

    board.appendChild(scoreElement);
    elementsList.push(scoreElement);
}

const moveLeft = () => {

    if (dir.x == 0) {
        dirChangeCooldown = true;
        dir.x = -1;
        dir.y = 0;
    }
}
const moveUp = () => {

    if (dir.y == 0) {
        dirChangeCooldown = true;
        dir.x = 0;
        dir.y = -1;
    }
}
const moveRight = () => {

    if (dir.x == 0) {
        dirChangeCooldown = true;
        dir.x = 1;
        dir.y = 0;
    }
}

const moveDown = () => {

    if (dir.y == 0) {
        dirChangeCooldown = true;
        dir.x = 0;
        dir.y = 1;
    }
}

const move = (e) => {

    if (dirChangeCooldown) {
        return;
    }

    switch(e.code) {

        case 'ArrowLeft':
            moveLeft();
            break;

        case 'ArrowUp':
            moveUp();
            break;

        case 'ArrowRight':
            moveRight();
            break;

        case 'ArrowDown':
            moveDown();
            break;
    }
}
let xDown = null;                                                        
let yDown = null;

function handleTouchStart(evt) {                                         
    xDown = evt.touches[0].clientX;                                      
    yDown = evt.touches[0].clientY;                                      
}      

function handleTouchMove(evt) {
    
    if (!xDown || !yDown ) {
        return;
    }
    let xUp = evt.touches[0].clientX;                                    
    let yUp = evt.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;
    if(Math.abs(xDiff) + Math.abs(yDiff) > 10) { 

        if(Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) {
                moveLeft();
            } 
            else {
                moveRight();
            }                       
        }
        else {
            if (yDiff > 0) {
                moveUp();
            } 
            else { 
                moveDown();
            }                                                                 
        }
    xDown = null;
    yDown = null;
    }
}

document.addEventListener('keydown', move);

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

if (!highScore) {
    highScore = 0;
}
let intervalId = setInterval(play, 1000/fps);

function reset() {

    elementsList.forEach((e) => e.remove());
    elementsList = [];
    clearInterval(intervalId);

    localStorage.setItem('highScore', JSON.stringify(highScore));
    highScore = JSON.parse(localStorage.getItem('highScore'));

    const gameOverElement = document.createElement('div');
    const gameOverTextElement = document.createElement('div');
    const allScoresElement = document.createElement('div');
    const playAgainElement = document.createElement('button');

    gameOverElement.classList.add('game-over-container');
    gameOverTextElement.classList.add('game-over');
    allScoresElement.classList.add('all-scores');
    playAgainElement.classList.add('play-again');

    gameOverTextElement.innerHTML = `GAME OVER`;
    allScoresElement.innerHTML = `Score: ${score}<br>High Score: ${highScore}`;
    playAgainElement.innerHTML = `Play Again`;

    gameOverElement.insertAdjacentElement('beforeend', gameOverTextElement);
    gameOverElement.insertAdjacentElement('beforeend', allScoresElement);
    gameOverElement.insertAdjacentElement('beforeend', playAgainElement);

    board.appendChild(gameOverElement);

    elementsList.push(gameOverTextElement);
    elementsList.push(allScoresElement);
    elementsList.push(gameOverElement);
    elementsList.push(playAgainElement);

    playAgainElement.addEventListener('click', () => { 
        console.log('Play Again');
        gameOver = false; 
        score = 0;

        food = {x: 0, y: 0};
        foodEaten = true;
        snake = [{x: cols/2, y: rows/2}];
        dir = {x: 1, y: 0};
        dirChangeCooldown = false;

        intervalId = setInterval(play, 1000/fps);
    });
}