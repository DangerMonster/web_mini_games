const CARD_PAIRS = 15;
const TOTAL_CARDS = CARD_PAIRS * 2;
const SHOW_TIME = 5; // 5초 전체 공개
const GAME_TIME = 60; // 실제 게임 제한시간(초)
const EMOJIS = [
  '🍎','🍌','🍇','🍉','🍒','🍋','🍑','🍍','🥝','🥑','🍓','🍊','🍈','🥥','🍐'
];
let cards = [];
let flipped = [];
let matched = [];
let canFlip = false;
let score = 0;
let timeLeft = 0;
let timerInterval = null;
let musicOn = true;
let gameStarted = false;

const board = document.getElementById('game-board');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');
const musicToggleBtn = document.getElementById('music-toggle');
const bgm = document.getElementById('bgm');
const gameoverDiv = document.getElementById('gameover');
const resetBoardBtn = document.getElementById('reset-board');

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createCards() {
  const emojiPairs = shuffle([...EMOJIS, ...EMOJIS]).slice(0, TOTAL_CARDS);
  cards = shuffle(emojiPairs.map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false
  })));
  flipped = [];
  matched = [];
}

function renderBoard() {
  board.innerHTML = '';
  cards.forEach((card, idx) => {
    const div = document.createElement('div');
    div.className = 'card' + (card.flipped ? ' flipped' : '') + (card.matched ? ' matched' : '');
    div.innerHTML = `
      <div class="card-inner">
        <div class="card-front">${card.emoji}</div>
        <div class="card-back">?</div>
      </div>
    `;
    div.addEventListener('click', () => handleFlip(idx));
    board.appendChild(div);
  });
}

function handleFlip(idx) {
  if (!canFlip) return;
  if (cards[idx].flipped || cards[idx].matched) return;
  if (flipped.length === 2) return;
  
  cards[idx].flipped = true;
  flipped.push(idx);
  renderBoard();
  
  if (flipped.length === 2) {
    canFlip = false;
    setTimeout(() => {
      const [i, j] = flipped;
      if (cards[i].emoji === cards[j].emoji) {
        // 매치 성공
        cards[i].matched = true;
        cards[j].matched = true;
        score += 10;
        updateScore();
        messageEl.textContent = '🎉 매치 성공! +10점';
        messageEl.style.color = '#6bcf7f';
        setTimeout(() => { 
          messageEl.textContent = ''; 
          messageEl.style.color = '#fff';
        }, 1000);
        
        // 모든 카드가 매치되었는지 확인
        if (cards.every(card => card.matched)) {
          setTimeout(() => {
            showGameover();
          }, 500);
          return;
        }
      } else {
        // 매치 실패
        cards[i].flipped = false;
        cards[j].flipped = false;
        messageEl.textContent = '❌ 틀렸습니다! 다시 시도하세요';
        messageEl.style.color = '#ff6b6b';
        setTimeout(() => { 
          messageEl.textContent = ''; 
          messageEl.style.color = '#fff';
        }, 1000);
      }
      flipped = [];
      renderBoard();
      canFlip = true;
    }, 1000);
  }
}

function updateScore() {
  scoreEl.textContent = `점수: ${score}`;
}

function updateTimerBar() {
  const timerBar = document.getElementById('timer-bar');
  if (!timerBar) return;
  let percent = 100;
  if (!gameStarted) {
    percent = Math.max(0, (timeLeft / SHOW_TIME) * 100);
  } else {
    percent = Math.max(0, (timeLeft / GAME_TIME) * 100);
  }
  timerBar.style.width = percent + '%';
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
  startGame();
};

function showGameover() {
  canFlip = false;
  gameStarted = false;
  if (timerInterval) clearInterval(timerInterval);
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
  document.getElementById('retry-btn').onclick = () => {
    gameoverDiv.style.display = 'none';
    document.getElementById('game-board').style.opacity = 1;
    document.getElementById('message').style.display = '';
    document.getElementById('info').style.opacity = 1;
    startGame();
  };
  document.getElementById('othergame-btn').onclick = () => {
    window.location.href = '../../index.html';
  };
  document.getElementById('share-btn').onclick = async () => {
    const shareText = `🧠 기억력 게임에서 ${score}점을 획득했어요!\n\n🎯 당신의 기억력은 어떠신가요? 지금 도전해보세요!\n\n🔗 https://onlineminigame.kro.kr/`;
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
  timeLeft = SHOW_TIME;
  gameStarted = false;
  createCards();
  cards.forEach(card => card.flipped = true);
  renderBoard();
  updateScore();
  messageEl.textContent = '카드를 외우세요!';
  canFlip = false;
  gameoverDiv.style.display = 'none';
  document.getElementById('game-board').style.opacity = 1;
  document.getElementById('message').style.display = '';
  document.getElementById('info').style.opacity = 1;
  timerEl.textContent = `외우기 시간: ${timeLeft}`;
  updateTimerBar();
  if (timerInterval) clearInterval(timerInterval);
  if (musicOn) setTimeout(() => bgm.play(), 200);
  timerInterval = setInterval(() => {
    timeLeft--;
    if (!gameStarted) {
      timerEl.textContent = `외우기 시간: ${timeLeft}`;
      updateTimerBar();
      if (timeLeft <= 0) {
        cards.forEach(card => card.flipped = false);
        renderBoard();
        messageEl.textContent = '두 장을 선택하세요!';
        canFlip = true;
        timeLeft = GAME_TIME;
        gameStarted = true;
        updateTimerBar();
      }
    } else {
      timerEl.textContent = `남은 시간: ${timeLeft}`;
      updateTimerBar();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        showGameover();
      }
    }
  }, 1000);
}

window.onload = () => {
  setMusic(true);
  startGame();
}; 