let varkyan = 0;
let rope = 0;
let mili = 0;
let timeInterval;
let fails = 0;
let maxfails = 5;
let gameOver = false;

// Sounds
const CorrectSound = new Audio('Correct sound.mp3');
const IncorrectSound = new Audio('Incorrect sound.mp3');
const WinningSound = new Audio('WIN.mp3');
const GameOverSound = new Audio('GameOver.mp3');

// Reset fails
function failreset() {
  document.getElementById("fails").innerText = "Fails: 0";
  fails = 0;
}

// Increase fails
function makefail() { 
  if (fails < maxfails) {
    fails++;
    document.getElementById("fails").innerText = "Fails: " + fails;
    if (fails === maxfails) {
      gameOver = true;
      timertostop();
      document.getElementById("sudoku").classList.add("error");
      document.querySelectorAll("input").forEach(inp => {
        inp.disabled = true;
        inp.classList.remove("correct");
        inp.parentElement.classList.remove("correct");
        inp.classList.add("error");
        inp.parentElement.classList.add("error");
      });
      GameOverSound.play();
      IncorrectSound.pause();
      GameOverGif();

      setTimeout(() => {
        clearInterval(timeInterval);
        timerEnd();
        stopGif1();
        failreset();
        startNewGame(81);
        document.getElementById("sudoku").classList.remove("error");
        gameOver = false;
      }, 3000);
    }
  }
}

// Timer functions
function updateTimerDisplay() {
  document.getElementById("Timer").textContent =
    `${rope.toString().padStart(2, '0')}:${varkyan.toString().padStart(2, '0')}:${mili.toString().padStart(3, '0')}`;
}

function timertostop() {
  clearInterval(timeInterval);
}

function timerResume() {
  updateTimerDisplay();
  timeInterval = setInterval(() => {
    mili++;
    if (mili >= 100) {
      mili = 0;
      varkyan++;
    }
    if (varkyan >= 60) {
      varkyan = 0;
      rope++;
    }
    updateTimerDisplay();
  }, 10);
}

function timerEnd() {
  varkyan = 0;
  mili = 0;
  rope = 0;
  clearInterval(timeInterval);
  updateTimerDisplay();
}

// Grid creation
function createEmptyGrid() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function isSafe(grid, row, col, num) {
  for (let x = 0; x < 9; x++) if (grid[row][x] === num || grid[x][col] === num) return false;
  let startRow = row - row % 3;
  let startCol = col - col % 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (grid[startRow + i][startCol + j] === num) return false;
  return true;
}

function fillGrid(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        let numbers = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
        for (let num of numbers) {
          if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function hideRandomCells(grid, emptyCount = 23) {
  let hidden = 0;
  while (hidden < emptyCount) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    if (grid[row][col] !== null) {
      grid[row][col] = null;
      hidden++;
    }
  }
  return grid;
}

// GIF functions
function showGif() {
  document.getElementById("gifOverlay").style.display = "flex";
  document.getElementById("gifOverlay1").style.display = "flex";
}
function stopGif() {
  document.getElementById("gifOverlay").style.display = "none";
  document.getElementById("gifOverlay1").style.display = "none";
}
function GameOverGif() {
  document.getElementById("gifOverlay2").style.display = "flex";
}
function stopGif1() {
  document.getElementById("gifOverlay2").style.display = "none";
}

// Render the grid
function renderGrid(grid, solutiongrid) {
  let table = document.getElementById("sudoku");
  table.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    let tr = document.createElement("tr");
    for (let j = 0; j < 9; j++) {
      let td = document.createElement("td");
      if (grid[i][j] === null) {
        let input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.style.textAlign = "center";
        input.style.fontSize = "20px";
        input.dataset.correct = solutiongrid[i][j];
        td.appendChild(input);

        input.oninput = function() {
          if (gameOver) return;
          let typed = input.value;
          if (/^[a-zA-Z]+$/.test(typed) || typed === " " || /^[+\-=_%@#$^&*(){}]+$/.test(typed) || /^[0]+$/.test(typed)) {
            clearInterval(timeInterval);
            input.classList.add("error");
            td.classList.add("error");
            IncorrectSound.currentTime = 0;
            IncorrectSound.play();
            makefail();
            setTimeout(() => {
              if (gameOver) return;
              input.value = "";
              input.classList.remove("error");
              td.classList.remove("error");
              timerResume();
            }, 1500);
          } else if (typed === "") {
            input.classList.remove("error");
            td.classList.remove("error");
            if (!gameOver) timerResume();
          } else if (parseInt(typed) === parseInt(input.dataset.correct)) {
            input.classList.add("correct");
            td.classList.add("correct");
            CorrectSound.currentTime = 0;
            CorrectSound.play();
            input.disabled = true;
            checkwin(table);
          } else {
            input.classList.add("error");
            td.classList.add("error");
            IncorrectSound.currentTime = 0;
            IncorrectSound.play();
            makefail();
          }
        }
      } else {
        td.textContent = grid[i][j];
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

// Check win
function checkwin(table) {
  let inputs = table.querySelectorAll('input[data-correct]');
  const solved = Array.from(inputs).every(input => input.value !== "" && input.value === input.dataset.correct);
  if (solved) {
    table.classList.add('win');
    showGif();
    WinningSound.play();
    CorrectSound.pause();
    clearInterval(timeInterval);
    setTimeout(() => {
      timerEnd();
      failreset();
      stopGif();
      startNewGame(81);
      table.classList.remove("win");
    }, 3000);
  }
}

// Start new game helper
function startNewGame(emptyCells = 23) {
  let sudokuGrid = createEmptyGrid();
  fillGrid(sudokuGrid);
  let solutiongrid = JSON.parse(JSON.stringify(sudokuGrid));
  hideRandomCells(sudokuGrid, emptyCells);
  renderGrid(sudokuGrid, solutiongrid);
}

// Difficulty buttons
document.getElementById("veryeasy").onclick = () => startNewGame(2);
document.getElementById("eazy").onclick = () => startNewGame(30);
document.getElementById("normal").onclick = () => startNewGame(40);
document.getElementById("hard").onclick = () => startNewGame(50);
document.getElementById("extrahard").onclick = () => startNewGame(60);
document.getElementById("impossible").onclick = () => startNewGame(70);

// Pause / Resume button
let isPaused = false;
document.getElementById("knopka").onclick = () => {
  if (isPaused) {
    timerResume();
    isPaused = false;
  } else {
    timertostop();
    isPaused = true;
  }
}

// Initialize game
startNewGame(81);
