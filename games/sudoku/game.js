// 스도쿠 보드 생성 및 렌더링 (기본 예시)
const sudokuBoard = [
    [5, 3, '', '', 7, '', '', '', ''],
    [6, '', '', 1, 9, 5, '', '', ''],
    ['', 9, 8, '', '', '', '', 6, ''],
    [8, '', '', '', 6, '', '', '', 3],
    [4, '', '', 8, '', 3, '', '', 1],
    [7, '', '', '', 2, '', '', '', 6],
    ['', 6, '', '', '', '', 2, 8, ''],
    ['', '', '', 4, 1, 9, '', '', 5],
    ['', '', '', '', 8, '', '', 7, 9]
];

// 실제 정답 배열 (예시)
var solutionBoard = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
];

const boardElement = document.querySelector('.sudoku-board');

function renderBoard(board) {
    boardElement.innerHTML = '';
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (board[row][col] !== '') {
                cell.textContent = board[row][col];
                cell.classList.add('original');
            } else {
                cell.textContent = '';
            }
            boardElement.appendChild(cell);
        }
    }
}


let selectedCell = null;
let selectedRow = null;
let selectedCol = null;

// 숫자 패드 생성
const numberPad = document.querySelector('.number-pad');
function renderNumberPad() {
    numberPad.innerHTML = '';
    for (let n = 1; n <= 9; n++) {
        const btn = document.createElement('button');
        btn.className = 'number-btn';
        btn.textContent = n;
        btn.addEventListener('click', () => {
            if (selectedCell && !selectedCell.classList.contains('original')) {
                selectedCell.textContent = n;
                sudokuBoard[selectedRow][selectedCol] = n;
                // 정답 체크
                if (Number(n) === solutionBoard[selectedRow][selectedCol]) {
                    selectedCell.classList.remove('error');
                    selectedCell.style.color = '#222';
                } else {
                    selectedCell.classList.add('error');
                    selectedCell.style.color = '#d32f2f';
                }
            }
        });
        numberPad.appendChild(btn);
    }
}

// 셀 선택 및 입력
function renderBoard(board) {
    boardElement.innerHTML = '';
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (board[row][col] !== '') {
                cell.textContent = board[row][col];
                cell.classList.add('original');
            } else {
                cell.textContent = '';
            }
            // 오답 표시 유지
            if (
                board[row][col] !== '' &&
                !cell.classList.contains('original') &&
                Number(board[row][col]) !== solutionBoard[row][col]
            ) {
                cell.classList.add('error');
                cell.style.color = '#d32f2f';
            }
            cell.addEventListener('click', () => {
                if (selectedCell) selectedCell.classList.remove('selected');
                if (!cell.classList.contains('original')) {
                    selectedCell = cell;
                    selectedRow = row;
                    selectedCol = col;
                    cell.classList.add('selected');
                } else {
                    selectedCell = null;
                    selectedRow = null;
                    selectedCol = null;
                }
            });
            boardElement.appendChild(cell);
        }
    }
}

// 지우기 버튼 기능
const eraseBtn = document.getElementById('erase');
if (eraseBtn) {
    eraseBtn.addEventListener('click', () => {
        if (selectedCell && !selectedCell.classList.contains('original')) {
            selectedCell.textContent = '';
            sudokuBoard[selectedRow][selectedCol] = '';
            selectedCell.classList.remove('error');
            selectedCell.style.color = '#222';
        }
    });
}

// 타이머
let timer = 0;
let timerInterval = null;
const timerElement = document.querySelector('.timer');
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timer = 0;
    updateTimer();
    timerInterval = setInterval(() => {
        timer++;
        updateTimer();
    }, 1000);
}
function updateTimer() {
    const min = String(Math.floor(timer / 60)).padStart(2, '0');
    const sec = String(timer % 60).padStart(2, '0');
    timerElement.textContent = `시간: ${min}:${sec}`;
}

// 정답 확인
const checkBtn = document.getElementById('check');
if (checkBtn) {
    checkBtn.addEventListener('click', () => {
        let correct = true;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (String(sudokuBoard[row][col]) !== String(solutionBoard[row][col])) {
                    correct = false;
                    break;
                }
            }
            if (!correct) break;
        }
        if (correct) {
            alert('정답입니다!');
        } else {
            alert('오답이 있습니다!');
        }
    });
}

// 실제 스도쿠 퍼즐(문제/정답 쌍) 예시 3개
const puzzles = [
  {
    puzzle: [
      [5, 3, '', '', 7, '', '', '', ''],
      [6, '', '', 1, 9, 5, '', '', ''],
      ['', 9, 8, '', '', '', '', 6, ''],
      [8, '', '', '', 6, '', '', '', 3],
      [4, '', '', 8, '', 3, '', '', 1],
      [7, '', '', '', 2, '', '', '', 6],
      ['', 6, '', '', '', '', 2, 8, ''],
      ['', '', '', 4, 1, 9, '', '', 5],
      ['', '', '', '', 8, '', '', 7, 9]
    ],
    solution: [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9]
    ]
  },
  {
    puzzle: [
      ['', '', '', 2, 6, '', 7, '', 1],
      [6, 8, '', '', 7, '', '', 9, ''],
      [1, 9, '', '', '', 4, 5, '', ''],
      [8, 2, '', 1, '', '', '', 4, ''],
      ['', '', 4, 6, '', 2, 9, '', ''],
      ['', 5, '', '', '', 3, '', 2, 8],
      ['', '', 9, 3, '', '', '', 7, 4],
      ['', 4, '', '', 5, '', '', 3, 6],
      [7, '', 3, '', 1, 8, '', '', '']
    ],
    solution: [
      [4,3,5,2,6,9,7,8,1],
      [6,8,2,5,7,1,4,9,3],
      [1,9,7,8,3,4,5,6,2],
      [8,2,6,1,9,5,3,4,7],
      [3,7,4,6,8,2,9,1,5],
      [9,5,1,7,4,3,6,2,8],
      [5,1,9,3,2,6,8,7,4],
      [2,4,8,9,5,7,1,3,6],
      [7,6,3,4,1,8,2,5,9]
    ]
  },
  {
    puzzle: [
      ['', 2, '', '', '', '', '', '', 9],
      ['', '', '', 5, '', 9, 2, '', ''],
      [4, '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', 7, 1],
      ['', '', 5, '', 6, '', 3, '', ''],
      [3, 9, '', '', '', '', '', '', ''],
      ['', '', 1, 8, '', '', '', '', 2],
      ['', '', 6, 3, '', '', '', '', ''],
      [2, '', '', '', '', '', '', 6, '']
    ],
    solution: [
      [5,2,3,6,7,1,8,4,9],
      [1,6,7,5,4,9,2,3,8],
      [4,8,9,2,3,7,1,5,6],
      [6,5,2,4,8,3,9,7,1],
      [9,1,5,7,6,2,3,8,4],
      [3,9,8,1,5,4,6,2,7],
      [7,3,1,8,9,6,4,5,2],
      [8,4,6,3,2,5,7,9,1],
      [2,7,4,9,1,8,5,6,3]
    ]
  }
];

// 새 게임 (실제 퍼즐 무작위)
const newGameBtn = document.getElementById('new-game');
if (newGameBtn) {
    newGameBtn.addEventListener('click', () => {
        const idx = Math.floor(Math.random() * puzzles.length);
        for (let i = 0; i < 9; i++) sudokuBoard[i] = puzzles[idx].puzzle[i].slice();
        for (let i = 0; i < 9; i++) solutionBoard[i] = puzzles[idx].solution[i].slice();
        renderBoard(sudokuBoard);
        renderNumberPad();
        startTimer();
    });
}

// 최초 시작 시 실제 퍼즐로 시작
(function(){
    const idx = Math.floor(Math.random() * puzzles.length);
    for (let i = 0; i < 9; i++) sudokuBoard[i] = puzzles[idx].puzzle[i].slice();
    for (let i = 0; i < 9; i++) solutionBoard[i] = puzzles[idx].solution[i].slice();
    renderBoard(sudokuBoard);
    renderNumberPad();
    startTimer();
})();
