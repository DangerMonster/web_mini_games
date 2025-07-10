// 게임 상태
let gameState = {
    score: 0,
    timeLeft: 60,
    selectedApples: [],
    gameBoard: [],
    isGameActive: false,
    gameTimer: null,
    targetSum: 10
};

// DOM 요소들
const gameBoard = document.getElementById('game-board');
const gameMessage = document.getElementById('message');
const timerBar = document.getElementById('timer-bar');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const gameOverModal = document.getElementById('gameover');
const finalScoreElement = document.getElementById('final-score');
const copyBtn = document.querySelector('.modal-actions .copy-btn');

// 터치 관련 변수
let isDragging = false;
let lastTouchTime = 0;
let touchStartPos = { x: 0, y: 0 };
let dragPath = []; // 드래그 경로 추적
let dragStartApple = null; // 드래그 시작 사과

// 게임 초기화
function initGame() {
    createGameBoard();
    updateDisplay();
    addEventListeners();
}

// 게임 보드 생성
function createGameBoard() {
    gameBoard.innerHTML = '';
    gameState.gameBoard = [];
    
    for (let row = 0; row < 12; row++) {
        gameState.gameBoard[row] = [];
        for (let col = 0; col < 12; col++) {
            const apple = createAppleElement(row, col);
            gameBoard.appendChild(apple);
            gameState.gameBoard[row][col] = apple;
        }
    }
}

// 연속된 숫자 방지를 위한 변수
let lastGeneratedNumbers = [];

// 연속되지 않는 랜덤 숫자 생성
function generateNonConsecutiveNumber() {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    // 마지막 3개 숫자와 다른 숫자 선택
    const availableNumbers = numbers.filter(num => 
        !lastGeneratedNumbers.includes(num)
    );
    
    // 사용 가능한 숫자가 없으면 마지막 숫자만 제외
    if (availableNumbers.length === 0) {
        const lastNumber = lastGeneratedNumbers[lastGeneratedNumbers.length - 1];
        const filteredNumbers = numbers.filter(num => num !== lastNumber);
        const randomIndex = Math.floor(Math.random() * filteredNumbers.length);
        const selectedNumber = filteredNumbers[randomIndex];
        
        // 히스토리 업데이트
        lastGeneratedNumbers.push(selectedNumber);
        if (lastGeneratedNumbers.length > 3) {
            lastGeneratedNumbers.shift();
        }
        
        return selectedNumber;
    }
    
    // 사용 가능한 숫자 중에서 랜덤 선택
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const selectedNumber = availableNumbers[randomIndex];
    
    // 히스토리 업데이트
    lastGeneratedNumbers.push(selectedNumber);
    if (lastGeneratedNumbers.length > 3) {
        lastGeneratedNumbers.shift();
    }
    
    return selectedNumber;
}

// 사과 요소 생성
function createAppleElement(row, col) {
    const apple = document.createElement('button');
    apple.className = 'apple';
    apple.dataset.row = row;
    apple.dataset.col = col;
    
    // 연속되지 않는 랜덤 숫자 생성
    const number = generateNonConsecutiveNumber();
    apple.dataset.number = number;
    
    // 이모지와 숫자 추가
    apple.innerHTML = `
        <div class="apple-emoji">🍎</div>
        <div class="apple-number">${number}</div>
    `;
    
    return apple;
}

// 이벤트 리스너 추가
function addEventListeners() {
    // 마우스 이벤트
    gameBoard.addEventListener('mousedown', handleMouseDown);
    gameBoard.addEventListener('mouseover', handleMouseOver);
    gameBoard.addEventListener('mouseup', handleMouseUp);
    
    // 터치 이벤트 (모바일 최적화)
    gameBoard.addEventListener('touchstart', handleTouchStart, { passive: false });
    gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameBoard.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // 게임 보드 컨테이너에 드래그 방지 이벤트 추가
    const gameBoardContainer = document.querySelector('.game-board-container');
    gameBoardContainer.addEventListener('mousedown', preventDragOutside);
    gameBoardContainer.addEventListener('touchstart', preventDragOutside, { passive: false });
    
    // 버튼 이벤트
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    
    // 모달 이벤트
    document.querySelector('.restart-btn').addEventListener('click', restartGame);
    document.querySelector('.home-btn').addEventListener('click', goHome);
    copyBtn.addEventListener('click', copyResult);
    
    // 모달 외부 클릭으로 닫기
    gameOverModal.addEventListener('click', (e) => {
        if (e.target === gameOverModal) {
            gameOverModal.style.display = 'none';
        }
    });
    
    // 키보드 이벤트 (접근성)
    document.addEventListener('keydown', handleKeyDown);
}

// 사과판 밖에서 드래그 방지
function preventDragOutside(e) {
    const target = e.target;
    // 사과판(.game-board) 내부가 아닌 경우 드래그 방지
    if (!target.closest('.game-board')) {
        e.preventDefault();
        e.stopPropagation();
            isDragging = false;
}
}

// 마우스 이벤트 핸들러
function handleMouseDown(e) {
    const apple = e.target.closest('.apple');
    if (!apple) return;
    
    e.preventDefault();
    isDragging = true;
    dragStartApple = apple;
    dragPath = [apple];
    selectApple(apple);
}

function handleMouseOver(e) {
    if (!isDragging) return;
    
    const apple = e.target.closest('.apple');
    if (!apple) return;
    
    e.preventDefault();
    
    // 드래그 경로에 추가
    if (!dragPath.some(pathApple => pathApple === apple)) {
        dragPath.push(apple);
        selectApple(apple);
    }
}

function handleMouseUp(e) {
    if (!isDragging) return;
    
    isDragging = false;
    
    // 드래그 경로의 모든 사과 선택
    selectDragPath();
    
    if (gameState.isGameActive) {
        checkSum();
    }
    
    // 드래그 상태 초기화
    dragPath = [];
    dragStartApple = null;
}

// 터치 이벤트 핸들러 (모바일 최적화)
function handleTouchStart(e) {
    e.preventDefault();
    isDragging = true;
    
    const touch = e.touches[0];
    touchStartPos = { x: touch.clientX, y: touch.clientY };
    lastTouchTime = Date.now();
    
    const apple = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.apple');
    if (apple) {
        dragStartApple = apple;
        dragPath = [apple];
        selectApple(apple);
    }
}

function handleTouchMove(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    const apple = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.apple');
    
    if (apple) {
        // 드래그 경로에 추가
        if (!dragPath.some(pathApple => pathApple === apple)) {
            dragPath.push(apple);
            selectApple(apple);
        }
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    isDragging = false;
    
    // 드래그 경로의 모든 사과 선택
    selectDragPath();
    
    if (gameState.isGameActive) {
        checkSum();
    }
    
    // 드래그 상태 초기화
    dragPath = [];
    dragStartApple = null;
}

// 드래그 경로의 모든 사과 선택
function selectDragPath() {
    // 기존 선택 해제
    gameState.selectedApples.forEach(apple => {
        const appleElement = gameState.gameBoard[apple.row][apple.col];
        if (appleElement) {
            appleElement.classList.remove('selected');
        }
    });
    gameState.selectedApples = [];
    
    // 드래그 경로의 모든 사과 선택
    dragPath.forEach(apple => {
        const row = parseInt(apple.dataset.row);
        const col = parseInt(apple.dataset.col);
        const number = parseInt(apple.dataset.number);
        
        apple.classList.add('selected');
        gameState.selectedApples.push({ row, col, number });
    });
    
    if (gameState.isGameActive) {
        updateGameMessage();
    }
}

// 키보드 이벤트 핸들러 (접근성)
function handleKeyDown(e) {
    if (!gameState.isGameActive) return;
    
    switch(e.key) {
        case 'Escape':
            resetGame();
            break;
        case ' ':
            e.preventDefault();
            // 스페이스바로 현재 선택된 사과들 확인
            if (gameState.selectedApples.length > 0) {
                checkSum();
            }
            break;
    }
}

// 사과 선택 (드래그 중에는 선택만, 드래그 끝날 때 경로 전체 선택)
function selectApple(apple) {
    const row = parseInt(apple.dataset.row);
    const col = parseInt(apple.dataset.col);
    const number = parseInt(apple.dataset.number);
    
    // 드래그 중에는 선택만 (해제는 드래그 끝날 때)
    if (isDragging) {
        apple.classList.add('selected');
        // 중복 선택 방지
        const isAlreadySelected = gameState.selectedApples.some(
            selected => selected.row === row && selected.col === col
        );
        if (!isAlreadySelected) {
            gameState.selectedApples.push({ row, col, number });
        }
    } else {
        // 드래그가 아닐 때는 기존 방식 (개별 선택/해제)
        const isAlreadySelected = gameState.selectedApples.some(
            selected => selected.row === row && selected.col === col
        );
        
        if (isAlreadySelected) {
            // 선택 해제
            apple.classList.remove('selected');
            gameState.selectedApples = gameState.selectedApples.filter(
                selected => !(selected.row === row && selected.col === col)
            );
        } else {
            // 선택
            apple.classList.add('selected');
            gameState.selectedApples.push({ row, col, number });
        }
    }
    
    // 모바일에서 시각적 피드백 강화
    if ('ontouchstart' in window) {
        apple.style.transform = 'scale(1.15)';
        setTimeout(() => {
            apple.style.transform = '';
        }, 150);
    }
    
    if (gameState.isGameActive && !isDragging) {
        updateGameMessage();
    }
}

// 합계 확인
function checkSum() {
    if (gameState.selectedApples.length === 0) return;
    
    const sum = gameState.selectedApples.reduce((total, apple) => total + apple.number, 0);
    
    if (sum === gameState.targetSum) {
        // 정답!
        gameState.score += gameState.selectedApples.length * 10;
        
        // 선택된 사과들 제거
        gameState.selectedApples.forEach(apple => {
            const appleElement = gameState.gameBoard[apple.row][apple.col];
            appleElement.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                appleElement.classList.add('removed');
                appleElement.innerHTML = ''; // 내용 제거
                gameState.gameBoard[apple.row][apple.col] = null;
            }, 300);
        });
        
        gameMessage.textContent = `정답! +${gameState.selectedApples.length * 10}점`;
        gameMessage.style.color = '#4CAF50';
        
        // 모바일에서 더 명확한 피드백
        if ('ontouchstart' in window) {
            gameMessage.style.fontSize = '1.3em';
            gameMessage.style.fontWeight = '700';
            setTimeout(() => {
                gameMessage.style.fontSize = '';
                gameMessage.style.fontWeight = '';
            }, 1000);
        }
    } else {
        // 오답
        gameMessage.textContent = `합계: ${sum} (목표: ${gameState.targetSum})`;
        gameMessage.style.color = '#f44336';
    }
    
    // 선택 해제
    gameState.selectedApples.forEach(apple => {
        const appleElement = gameState.gameBoard[apple.row][apple.col];
        if (appleElement) {
            appleElement.classList.remove('selected');
        }
    });
    gameState.selectedApples = [];
    
    updateDisplay();
    
    // 메시지 초기화
    setTimeout(() => {
        gameMessage.textContent = '합이 10이 되는 사과들을 선택하세요!';
        gameMessage.style.color = '#fff';
    }, 2000);
}



// 게임 시작
function startGame() {
    if (gameState.isGameActive) return;
    
    gameState.isGameActive = true;
    gameState.timeLeft = 60;
    gameState.score = 0;
    gameState.selectedApples = [];
    
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    
    gameMessage.textContent = '합이 10이 되는 사과들을 선택하세요!';
    gameMessage.style.color = '#fff';
    
    // 타이머 시작
    gameState.gameTimer = setInterval(() => {
        gameState.timeLeft--;
        updateDisplay();
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    updateDisplay();
}

// 게임 종료
function endGame() {
    gameState.isGameActive = false;
    clearInterval(gameState.gameTimer);
    
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    
    // 게임 오버 모달 표시
    finalScoreElement.textContent = gameState.score;
    gameOverModal.style.display = 'flex';
    
    // 모바일에서 모달 스크롤 방지
    document.body.style.overflow = 'hidden';
}

// 게임 리셋
function resetGame() {
    gameState.isGameActive = false;
    clearInterval(gameState.gameTimer);
    
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    
    gameState.score = 0;
    gameState.timeLeft = 60;
    gameState.selectedApples = [];
    
    // 연속 숫자 히스토리 초기화
    lastGeneratedNumbers = [];
    
    // 선택된 사과들 해제
    document.querySelectorAll('.apple.selected').forEach(apple => {
        apple.classList.remove('selected');
    });
    
    createGameBoard();
    updateDisplay();
    
    gameMessage.textContent = '시작 버튼을 눌러 게임을 시작하세요!';
    gameMessage.style.color = '#fff';
}

// 게임 재시작
function restartGame() {
    gameOverModal.style.display = 'none';
    document.body.style.overflow = '';
    resetGame();
    startGame();
}

// 홈으로 이동
function goHome() {
    gameOverModal.style.display = 'none';
    document.body.style.overflow = '';
    window.location.href = '../../index.html';
}

// 결과 복사
function copyResult() {
    const text = `🍎 사과 합계 게임에서 ${gameState.score}점을 획득했습니다!\n\n🎮 https://onlineminigame.kro.kr/ 에서 도전해보세요!`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyNotification();
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

// 복사 성공 알림
function showCopyNotification() {
    const notification = document.querySelector('.copy-notification');
    notification.textContent = '결과가 복사되었습니다! 📋';
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

// 폴백 복사 방법
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showCopyNotification();
}

// 게임 메시지 업데이트
function updateGameMessage() {
    if (gameState.selectedApples.length === 0) {
        gameMessage.textContent = '합이 10이 되는 사과들을 선택하세요!';
        gameMessage.style.color = '#fff';
    } else {
        const sum = gameState.selectedApples.reduce((total, apple) => total + apple.number, 0);
        gameMessage.textContent = `선택된 사과: ${gameState.selectedApples.length}개, 합계: ${sum}`;
        
        if (sum === gameState.targetSum) {
            gameMessage.style.color = '#4CAF50';
        } else if (sum > gameState.targetSum) {
            gameMessage.style.color = '#f44336';
        } else {
            gameMessage.style.color = '#FF9800';
        }
    }
}

// 화면 업데이트
function updateDisplay() {
    // 타이머 바 업데이트
    const percentage = (gameState.timeLeft / 60) * 100;
    timerBar.style.width = `${percentage}%`;
    
    // 타이머 색상 변경
    if (gameState.timeLeft <= 10) {
        timerBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff4757)';
    } else if (gameState.timeLeft <= 30) {
        timerBar.style.background = 'linear-gradient(90deg, #feca57, #ff9ff3)';
    }
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', initGame);

// 페이지 떠날 때 타이머 정리
window.addEventListener('beforeunload', () => {
    if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
    }
});

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.8);
        }
    }
`;
document.head.appendChild(style);