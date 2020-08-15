const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
let DIFFICULITY ='EASY';
const cellElements = document.querySelectorAll('.cell')
const board = document.querySelector('.board')
const restartBtn = document.querySelector('#restart-btn')
const startBtn = document.querySelector('#modal-text')
const continueBtn = document.querySelector('#contunue-btn')
const difficulityBtn = document.querySelector('#difficulity-btn')
const opponentBtn = document.querySelector('#opponent-btn')
const modal = document.querySelector('.modal')
const modalText = document.querySelector('#modal-text')
const difficulity = document.querySelector('#difficulity');
const opponent = document.querySelector('#opponent')

const winSound = new Audio('sounds/win.mp3')
const moveSound = new Audio('sounds/move.m4a')
const lossSound = new Audio('sounds/loss.wav')
const drawSound = new Audio('sounds/draw.wav')
const clickSound = new Audio('sounds/click.wav')

const pointSpans = {
    vsBot: {
        wins : document.querySelector('.wins-text'),
        draws : document.querySelector('.draws-text'),
        losses : document.querySelector('.losses-text')
    },
    vsPlayer: {
        x: document.querySelector('.p1-text'),
        draws: document.querySelector('.vs-draw-text'),
        o: document.querySelector('.p2-text')
    }
}
let points = {
    vsBot: { wins: 0, draws: 0, losses: 0},
    vsPlayer: { x: 0, draws: 0, o: 0}
}
let circleTurn, circleStarted;
let playVsBot = true;
let turnOver = true;

startBtn.addEventListener('click', initializeGame)
restartBtn.addEventListener('click', startGame)
continueBtn.addEventListener('click', function(){
    modal.classList.add('hide')
    startGame();
})
difficulityBtn.addEventListener('click', difficulityChange)
opponentBtn.addEventListener('click', opponentChange)

function initializeGame(){
    startBtn.removeEventListener('click', initializeGame)
    modal.classList.add('hide')
    DIFFICULITY = difficulity.textContent; 
    circleStarted = true;
    startGame();
}

function resetEverything() {
    Object.keys(points).forEach(type => {
        Object.keys(points[type]).forEach(key => {
            points[type][key] = 0;
        }) 
    })
    Object.keys(pointSpans).forEach(type => {
        Object.keys(pointSpans[type]).forEach(key => {
            pointSpans[type][key].textContent = '0';
        }) 
    })
}

function startGame() {
    clickSound.play()
    turnOver = true;
    circleTurn = switchStartingPlayer();
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS)
        cell.classList.remove(O_CLASS)
        cell.removeEventListener('click', handleClick)
        cell.addEventListener('click', handleClick)
    })
    setBoardHoverClass();
    if(circleTurn && playVsBot){
        botLogic();
    }
}

function cellAvailable(target) {
    return !target.classList.contains(X_CLASS) && !target.classList.contains(O_CLASS)
}

function difficulityChange(){
    clickSound.play()
    circleStarted = true;
    startGame()
    resetEverything()
    if(difficulity.textContent == 'EASY'){
        difficulity.textContent = 'MEDIUM'
        DIFFICULITY ='MEDIUM'
    } else if(difficulity.textContent == 'MEDIUM') {
        difficulity.textContent = 'HARD'
        DIFFICULITY = 'HARD'
    } else if(difficulity.textContent == 'HARD'){
        difficulity.textContent = 'EASY'
        DIFFICULITY = 'EASY'
    }
}

function opponentChange(){
    clickSound.play()
    circleStarted = true;
    startGame()
    resetEverything()
    if(opponent.textContent == '1vs1'){
        opponent.textContent = "1VsBot"
        playVsBot = false;
        document.getElementById('type-bot').classList.remove('standings');
        document.getElementById('type-bot').classList.add('hide');
        document.getElementById('type-vs').classList.add('standings');
        document.getElementById('type-vs').classList.remove('hide');
       // document.documentElement.style.setProperty('--columnNr', 2);
        difficulityBtn.classList.add('hide');
    } else if(opponent.textContent == '1VsBot') {
        opponent.textContent = '1vs1'
        playVsBot = true;
        document.getElementById('type-bot').classList.add('standings');
        document.getElementById('type-bot').classList.remove('hide');
        document.getElementById('type-vs').classList.remove('standings');
        document.getElementById('type-vs').classList.add('hide');
       // document.documentElement.style.setProperty('--columnNr', 3);
        difficulityBtn.classList.remove('hide');
    }
}

function handleClick(e){
    if(cellAvailable(e.target)){
        if(turnOver || !playVsBot){
            const cell = e.target
            const currentClass = circleTurn ? O_CLASS : X_CLASS;
            placeMark(cell, currentClass);
            if (checkWin(currentClass)) {
                endGame(false, currentClass)
            } else if (checkDraw()) {
                endGame(true, currentClass)
            } else {
                switchTurns();
                setBoardHoverClass()  
                if(playVsBot && circleTurn){    
                    botLogic()  
                }
            }
            moveSound.play()
        } 
    }
}


function checkDraw(){
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS)
    })
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination =>  {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentClass);
        })
    })
}

function placeMark(cell, currentClass){
    cell.classList.add(currentClass);
}

function switchTurns(){
    circleTurn = !circleTurn;
}

function switchStartingPlayer(){
    circleStarted = !circleStarted
    return circleStarted;
}

function setBoardHoverClass(){
    board.classList.remove(O_CLASS);
    board.classList.remove(X_CLASS);
    if(circleTurn && !playVsBot){
        board.classList.add(O_CLASS);
    } else {
        board.classList.add(X_CLASS);
    }
}

function endGame(draw, currentClass){
    let text ='';
    if(draw){
        text = `Draw!`;
        if(!playVsBot){
            pointUpdateVs(null)
        } else {
            pointUpdateBot('draws')
        }
        drawSound.play()
    } else {
        if(!playVsBot){
            text = `${currentClass.toUpperCase()} won`
            pointUpdateVs(currentClass)
            winSound.play()
        } else if(currentClass == 'x'){
            text = 'YOU WON!'
            pointUpdateBot('wins')
            winSound.play()
        } else {
            text = 'YOU LOST!'
            pointUpdateBot('losses')
            lossSound.play()
        }
    }
    modalText.textContent = text;
    continueBtn.classList.remove('hide')
    modalText.style.pointerEvents = "none";
    modal.classList.remove('hide');
}

async function botLogic(){
    turnOver = false;
    await sleep(500);  
    const availableCells = [];
    cellElements.forEach(cell => {
        if(!cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)){
            availableCells.push(cell);
        }
    })

    turnOver = true;
    if(DIFFICULITY === 'EASY'){
        availableCells[Math.floor(Math.random()  * availableCells.length)].click()
    } else if(DIFFICULITY === 'MEDIUM'){
        let bestMoveIndex = -1;
        for(let i=0; i<availableCells.length; i++){
            availableCells[i].classList.add(O_CLASS)
            if(checkWin(O_CLASS)){
                bestMoveIndex = i;
            } 
            availableCells[i].classList.remove(O_CLASS)
        }
        if(bestMoveIndex == -1){
            for(let i=0; i<availableCells.length; i++){
                availableCells[i].classList.add(X_CLASS)
                if(checkWin(X_CLASS)){
                    bestMoveIndex = i;
                } 
                availableCells[i].classList.remove(X_CLASS)
            }
        }
        if(bestMoveIndex == -1){
            availableCells[Math.floor(Math.random()  * availableCells.length)].click()
        } else {
            availableCells[bestMoveIndex].click()
        }
    } else if(DIFFICULITY ===  'HARD') {
        nr=0;
        let bestScore = -Infinity;
        let bestMoveIndex;
        for(let i=0; i<cellElements.length; i++){
            if(!cellElements[i].classList.contains(X_CLASS) && !cellElements[i].classList.contains(O_CLASS)){
                cellElements[i].classList.add(O_CLASS);
                let score = minimax(cellElements, -Infinity, Infinity, false);
                cellElements[i].classList.remove(O_CLASS);
                if(score > bestScore) {
                    bestScore = score;
                    bestMoveIndex = i; 
                }  
            }
        }
        cellElements[bestMoveIndex].click()  
        console.log(nr)
    }
}

function checkGameStatus(){
     if(checkWin(X_CLASS)){
        return X_CLASS;
    } else if(checkWin(O_CLASS)){
        return O_CLASS;
    } else if(checkDraw()){
        return 'tie';
    }
}

let minimaxScores  = {
    x: -10,
    o: 10,
    tie: 0
}

function minimax(cellElements, alpha, beta,  isMaximizing) {
    let result  = checkGameStatus();
    if(result != null){  
        return minimaxScores[result];
    }
    if(isMaximizing){
        let bestScore = -Infinity;
        for(let i=0; i<cellElements.length; i++) {
            if(!cellElements[i].classList.contains(X_CLASS) && !cellElements[i].classList.contains(O_CLASS)){
                cellElements[i].classList.add(O_CLASS);
                let score = minimax(cellElements, alpha, beta, false);
                cellElements[i].classList.remove(O_CLASS);
                bestScore = Math.max(bestScore, score)
                alpha = Math.max(alpha, score)
                if(beta <= alpha){break}
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for(let i=0; i<cellElements.length; i++) {
            if(!cellElements[i].classList.contains(X_CLASS) && !cellElements[i].classList.contains(O_CLASS)){
                cellElements[i].classList.add(X_CLASS)
                let score = minimax(cellElements, alpha, beta, true)
                cellElements[i].classList.remove(X_CLASS)
                bestScore = Math.min(bestScore, score)
                beta = Math.min(beta, score)
                if(beta <= alpha){break}
            }
        }
        return bestScore;
    }
}


function pointUpdateVs(winner) {
    if(winner != null){
        points.vsPlayer[winner] ++;
        pointSpans.vsPlayer[winner].textContent = points.vsPlayer[winner];
    } else {
        points.vsPlayer.draws ++;
        pointSpans.vsPlayer.draws.textContent = points.vsPlayer.draws;
    }
}

function pointUpdateBot(gameResult) {
    points.vsBot[gameResult] ++;
    pointSpans.vsBot[gameResult].textContent = points.vsBot[gameResult];
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}