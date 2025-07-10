const ROWS = 8;
const COLS = 8;
const COLORS = 6;
const TIME_LIMIT = 10;
let boardArr = [];
let score = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let musicOn = true;
let isAnimating = false;

const board = document.getElementById('game-board');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');
const timerBar = document.getElementById('timer-bar');
const musicToggleBtn = document.getElementById('music-toggle');
const bgm = document.getElementById('bgm');
const gameoverDiv = document.getElementById('gameover');
const resetBoardBtn = document.getElementById('reset-board');

function randomColor() {
  return Math.floor(Math.random() * COLORS);
}

function createBoard() {
  boardArr = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      boardArr.push({ color: randomColor(), removed: false, idx: r * COLS + c });
    }
  }
}

function getIdx(row, col) {
  return row * COLS + col;
}

function getRowCol(idx) {
  return { row: Math.floor(idx / COLS), col: idx % COLS };
}

function renderBoard(animatingBlocks = {}) {
  board.innerHTML = '';
  boardArr.forEach((block, idx) => {
    if (block.removed) return;
    const div = document.createElement('div');
    div.className = 'block color-' + block.color;
    const { row, col } = getRowCol(idx);
    div.style.left = (col * 44 + 2 * col) + 'px';
    div.style.top = (row * 44 + 2 * row) + 'px';
    if (block.selected) div.classList.add('selected');
    if (block.removing) div.classList.add('removing');
    if (animatingBlocks[idx]) {
      div.classList.add('falling');
      div.style.transform = `translateY(${animatingBlocks[idx]}px)`;
      setTimeout(() => {
        div.style.transform = 'translateY(0)';
      }, 10);
    }
    div.addEventListener('mousedown', () => handleSelect(idx));
    div.addEventListener('touchstart', () => handleSelect(idx));
    board.appendChild(div);
  });
}

function handleSelect(idx) {
  if (isAnimating || boardArr[idx].removed) return;
  const color = boardArr[idx].color;
  // flood fill로 연결된 그룹 찾기
  let group = [];
  const toVisit = [idx];
  const visited = new Set();
  while (toVisit.length) {
    const current = toVisit.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    group.push(current);
    const { row, col } = getRowCol(current);
    // 상하좌우
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => {
      const nr = row + dr, nc = col + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        const nidx = getIdx(nr, nc);
        if (!visited.has(nidx) && !boardArr[nidx].removed && boardArr[nidx].color === color) {
          toVisit.push(nidx);
        }
      }
    });
  }
  if (group.length >= 3) {
    isAnimating = true;
    group.forEach(i => boardArr[i].removing = true);
    renderBoard();
    setTimeout(() => {
      group.forEach(i => {
        boardArr[i].removed = true;
        boardArr[i].removing = false;
      });
      const bonus = group.length * group.length;
      score += bonus;
      messageEl.textContent = `+${bonus}점!`;
      setTimeout(() => { messageEl.textContent = ''; }, 800);
      dropBlocksWithAnimation(() => {
        renderBoard();
        updateScore();
        isAnimating = false;
      });
    }, 350);
  } else {
    renderBoard();
  }
}

function dropBlocksWithAnimation(callback) {
  // 각 열마다 아래에서부터 빈 칸을 채움, 애니메이션 적용
  let animatingBlocks = {};
  for (let c = 0; c < COLS; c++) {
    let stack = [];
    // 위에서부터 아래로 블록을 모음
    for (let r = ROWS - 1; r >= 0; r--) {
      const idx = getIdx(r, c);
      if (!boardArr[idx].removed) {
        stack.push(boardArr[idx]);
      }
    }
    // 아래에서부터 채움
    for (let r = ROWS - 1; r >= 0; r--) {
      const idx = getIdx(r, c);
      let fromRow = null;
      if (stack.length > 0) {
        const block = stack.shift();
        fromRow = getRowCol(block.idx).row;
        animatingBlocks[idx] = (fromRow - r) * 46; // 44px+2px
        boardArr[idx] = { ...block, idx };
      } else {
        // 새 블록 생성
        boardArr[idx] = { color: randomColor(), removed: false, idx };
        animatingBlocks[idx] = -((ROWS) * 46); // 위에서 떨어지는 효과
      }
    }
  }
  renderBoard(animatingBlocks);
  setTimeout(callback, 250);
}

function updateScore() {
  scoreEl.textContent = `점수: ${score}`;
}

function updateTimer() {
  timerEl.textContent = `남은 시간: ${timeLeft}`;
  if (timerBar) {
    const percent = Math.max(0, (timeLeft / TIME_LIMIT) * 100);
    timerBar.style.width = percent + '%';
  }
}

function setMusic(on) {
  musicOn = on;
  if (musicOn) {
    bgm.volume = 0.5;
    bgm.play();
    musicToggleBtn.textContent = '🔊 배경음악 끄기';
  } else {
    bgm.pause();
    musicToggleBtn.textContent = '🔇 배경음악 켜기';
  }
}

musicToggleBtn.onclick = () => setMusic(!musicOn);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) bgm.pause();
  else if (musicOn) bgm.play();
});

resetBoardBtn.onclick = () => {
  score = 0;
  timeLeft = TIME_LIMIT;
  createBoard();
  renderBoard();
  updateScore();
  updateTimer();
  messageEl.textContent = '';
};

function showGameover() {
  gameoverDiv.innerHTML = `
    <div class="gameover-score">최종 점수<br>${score}</div>
    <button class="gameover-btn" id="retry-btn">다시하기</button>
    <button class="gameover-btn" id="othergame-btn">다른 게임하기</button>
    <button class="share-btn" id="share-btn">🔗 친구에게 공유하기</button>
  `;
  gameoverDiv.style.display = 'flex';
  document.getElementById('game-board').style.opacity = 0.2;
  document.getElementById('message').style.display = 'none';
  document.getElementById('info').style.opacity = 0.2;
  document.getElementById('timer-bar-wrapper').style.opacity = 0.2;
  document.getElementById('retry-btn').onclick = () => {
    gameoverDiv.style.display = 'none';
    document.getElementById('game-board').style.opacity = 1;
    document.getElementById('message').style.display = '';
    document.getElementById('info').style.opacity = 1;
    document.getElementById('timer-bar-wrapper').style.opacity = 1;
    startGame();
  };
  document.getElementById('othergame-btn').onclick = () => {
    window.location.href = '../../index.html';
  };
  document.getElementById('share-btn').onclick = async () => {
    const shareText = `🎮 순발력 테스트에서 ${score}점을 획득했어요!\n\n🎯 당신의 순발력은 어떠신가요? 지금 도전해보세요!\n\n🔗 https://onlineminigame.kro.kr/`;
    try {
      await navigator.clipboard.writeText(shareText);
      alert('클립보드에 복사되었습니다! 친구들에게 공유해보세요 😊');
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      alert('클립보드 복사에 실패했습니다. 직접 링크를 복사해주세요.');
    }
  };
}

function startGame() {
  score = 0;
  timeLeft = TIME_LIMIT;
  createBoard();
  renderBoard();
  updateScore();
  updateTimer();
  messageEl.textContent = '';
  gameoverDiv.style.display = 'none';
  document.getElementById('game-board').style.opacity = 1;
  document.getElementById('message').style.display = '';
  document.getElementById('info').style.opacity = 1;
  document.getElementById('timer-bar-wrapper').style.opacity = 1;
  if (timerInterval) clearInterval(timerInterval);
  if (musicOn) setTimeout(() => bgm.play(), 200);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showGameover();
      board.innerHTML = '';
    }
  }, 1000);
}

window.onload = () => {
  setMusic(true);
  startGame();
}; 