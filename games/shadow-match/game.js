const EMOJIS = [
  '🍎','🍌','🍇','🍉','🍒','🍋','🍑','🍍','🥝','🥑','🍓','🍊','🍈','🥥','🍐',
  '🍔','🍕','🍟','🌭','🍿','🍩','🍪','🍰','🍦','🍤','🍗','🍖','🍕','🍔','🍟','🍣','🍙','🍚','🍛','🍜','🍝','🍞','🥨','🥐','🥯','🥞','🧇','🥓','🥩','🍗','🍖','🍤','🍣','🍱','🍛','🍜','🍲','🍥','🥟','🍙','🍚','🍘','🍢','🍡','🍧','🍨','🍦','🥧','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🥠','🥮','🍯','🥛','🍼','☕','🍵','🥤','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🍾','🥄','🍴','🍽️','🥢','🥡','🧂'
];
const DIFFICULTY = {
  easy: { time: 60, choices: 4, label: '쉬움' },
  normal: { time: 45, choices: 6, label: '보통' },
  hard: { time: 30, choices: 8, label: '어려움' }
};
let currentDifficulty = 'easy';
let score = 0;
let timeLeft = 0;
let timerInterval = null;
let musicOn = true;
let question = null;
let gameStarted = false;

const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const timerBar = document.getElementById('timer-bar');
const questionImg = document.getElementById('question-img');
const shadowChoices = document.getElementById('shadow-choices');
const messageEl = document.getElementById('message');
const musicToggleBtn = document.getElementById('music-toggle');
const bgm = document.getElementById('bgm');
const gameoverDiv = document.getElementById('gameover');
const resetBoardBtn = document.getElementById('reset-board');
const difficultySel = document.getElementById('difficulty');

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function newQuestion() {
  const n = DIFFICULTY[currentDifficulty].choices;
  const emojis = shuffle([...EMOJIS]).slice(0, n);
  const answerIdx = Math.floor(Math.random() * n);
  question = {
    emoji: emojis[answerIdx],
    choices: emojis,
    answer: answerIdx
  };
  renderQuestion();
}

function renderQuestion() {
  questionImg.innerHTML = question.emoji;
  shadowChoices.innerHTML = '';
  question.choices.forEach((em, i) => {
    const div = document.createElement('div');
    div.className = 'shadow-choice';
    div.innerHTML = `<span class='shadow-emoji'>${em}</span>`;
    div.onclick = () => handleChoice(i);
    shadowChoices.appendChild(div);
  });
}

function handleChoice(idx) {
  if (!gameStarted) return;
  const choices = shadowChoices.querySelectorAll('.shadow-choice');
  choices.forEach((el, i) => el.classList.remove('selected'));
  choices[idx].classList.add('selected');
  
  if (idx === question.answer) {
    score += 10;
    updateScore();
    messageEl.textContent = '정답! +10점';
    choices[idx].classList.add('correct');
    setTimeout(() => { 
      messageEl.textContent = ''; 
      choices[idx].classList.remove('correct');
    }, 700);
    setTimeout(() => newQuestion(), 700);
  } else {
    score = Math.max(0, score - 5);
    updateScore();
    messageEl.textContent = '오답! -5점';
    choices[idx].classList.add('wrong');
    setTimeout(() => { 
      messageEl.textContent = ''; 
      choices[idx].classList.remove('wrong');
    }, 700);
    setTimeout(() => newQuestion(), 700);
  }
}

function updateScore() {
  scoreEl.textContent = `점수: ${score}`;
}

function updateTimerBar() {
  if (!timerBar) return;
  const maxTime = DIFFICULTY[currentDifficulty].time;
  const percent = Math.max(0, (timeLeft / maxTime) * 100);
  timerBar.style.width = percent + '%';
}

function setMusic(on) {
  musicOn = on;
  if (musicOn) {
    bgm.volume = 0.5;
    bgm.muted = false;
    bgm.play();
    musicToggleBtn.textContent = '🔊 배경음악 끄기';
  } else {
    bgm.muted = true;
    bgm.pause();
    musicToggleBtn.textContent = '🔇 배경음악 켜기';
  }
}

musicToggleBtn.onclick = () => setMusic(!musicOn);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    bgm.pause();
  } else if (musicOn) {
    bgm.muted = false;
    bgm.play();
  }
});

// 페이지 로드 시 자동 재생을 위한 이벤트 리스너 추가
document.addEventListener('click', function initAudio() {
  if (musicOn) {
    bgm.muted = false;
    bgm.play();
  }
  document.removeEventListener('click', initAudio);
}, { once: true });

resetBoardBtn.onclick = () => {
  startGame();
};
difficultySel.onchange = () => {
  currentDifficulty = difficultySel.value;
  levelEl.textContent = `난이도: ${DIFFICULTY[currentDifficulty].label}`;
  startGame();
};

function showGameover() {
  gameStarted = false;
  if (timerInterval) clearInterval(timerInterval);
  gameoverDiv.innerHTML = `
    <div class="gameover-score">최종 점수<br>${score}</div>
    <button class="gameover-btn" id="retry-btn">다시하기</button>
    <button class="gameover-btn" id="othergame-btn">다른 게임하기</button>
    <button class="share-btn" id="share-btn">🔗 친구에게 공유하기</button>
  `;
  gameoverDiv.style.display = 'flex';
  document.getElementById('question-area').style.opacity = 0.2;
  document.getElementById('message').style.display = 'none';
  document.getElementById('info').style.opacity = 0.2;
  document.getElementById('timer-bar-wrapper').style.opacity = 0.2;
  document.getElementById('retry-btn').onclick = () => {
    gameoverDiv.style.display = 'none';
    document.getElementById('question-area').style.opacity = 1;
    document.getElementById('message').style.display = '';
    document.getElementById('info').style.opacity = 1;
    document.getElementById('timer-bar-wrapper').style.opacity = 1;
    startGame();
  };
  document.getElementById('othergame-btn').onclick = () => {
    window.location.href = '../../index.html';
  };
  document.getElementById('share-btn').onclick = async () => {
    const difficultyText = DIFFICULTY[currentDifficulty].label;
    const shareText = `🖼️ 그림자 찾기 게임 ${difficultyText} 난이도에서 ${score}점을 획득했어요!\n\n🎯 당신의 관찰력은 어떠신가요? 지금 도전해보세요!\n\n🔗 https://onlineminigame.kro.kr/`;
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
  timeLeft = DIFFICULTY[currentDifficulty].time;
  gameStarted = true;
  updateScore();
  levelEl.textContent = `난이도: ${DIFFICULTY[currentDifficulty].label}`;
  messageEl.textContent = '';
  gameoverDiv.style.display = 'none';
  document.getElementById('question-area').style.opacity = 1;
  document.getElementById('message').style.display = '';
  document.getElementById('info').style.opacity = 1;
  document.getElementById('timer-bar-wrapper').style.opacity = 1;
  updateTimerBar();
  newQuestion();
  timerEl.textContent = `남은 시간: ${timeLeft}`;
  if (timerInterval) clearInterval(timerInterval);
  if (musicOn) setTimeout(() => bgm.play(), 200);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `남은 시간: ${timeLeft}`;
    updateTimerBar();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showGameover();
    }
  }, 1000);
}

window.onload = () => {
  setMusic(true);
  startGame();
}; 