let ballPosition = 0;
let gameEnded = false;
let canClick = false;

const cupElements = [
  document.getElementById('cup0'),
  document.getElementById('cup1'),
  document.getElementById('cup2'),
];

// 공 위치를 컵 위치에 맞춰 조정
function positionBall(index) {
  const cup = cupElements[index];
  const ball = document.getElementById("ball" + index);
  const cupLeft = parseInt(cup.style.left);
  ball.style.left = (cupLeft + 50) + "px"; // 컵 중앙
}

function resetGame() {
  document.getElementById("message").textContent = "공 위치를 확인하세요...";
  document.querySelectorAll('.ball').forEach(ball => ball.style.display = 'none');
  cupElements.forEach(cup => cup.classList.remove('lifted'));
  gameEnded = false;
  canClick = false;

  ballPosition = Math.floor(Math.random() * 3);
  const ball = document.getElementById("ball" + ballPosition);
  const cup = cupElements[ballPosition];

  positionBall(ballPosition);
  cup.classList.add('lifted');
  ball.style.display = "block";

  setTimeout(() => {
    ball.style.display = "none";
    cup.classList.remove('lifted');

    setTimeout(() => {
      document.getElementById("message").textContent = "컵을 섞는 중입니다...";
      shuffleCups();
    }, 500);
  }, 1000);
}

function shuffleCups() {
  const positions = [0, 150, 300];
  let currentOrder = [0, 1, 2];

  let shuffleCount = 5;
  let delay = 600;

  const shuffleStep = (i) => {
    if (i >= shuffleCount) {
      document.getElementById("message").textContent = "공이 숨겨졌습니다! 컵을 선택하세요.";
      canClick = true;
      return;
    }

    let a = Math.floor(Math.random() * 3);
    let b;
    do {
      b = Math.floor(Math.random() * 3);
    } while (b === a);

    [currentOrder[a], currentOrder[b]] = [currentOrder[b], currentOrder[a]];

    for (let j = 0; j < 3; j++) {
      cupElements[currentOrder[j]].style.left = positions[j] + "px";
    }

    setTimeout(() => shuffleStep(i + 1), delay);
  };

  shuffleStep(0);
}

function chooseCup(index) {
  if (gameEnded || !canClick) return;

  const selectedCup = cupElements[index];
  selectedCup.classList.add('lifted');

  const ball = document.getElementById("ball" + ballPosition);
  positionBall(ballPosition); // 혹시 섞인 후 위치가 바뀌었을 경우
  ball.style.display = "block";

  if (index === ballPosition) {
    document.getElementById("message").textContent = "정답입니다! 🎉";
  } else {
    document.getElementById("message").textContent = "틀렸습니다! 😢";
  }

  gameEnded = true;
}

function chooseCup(index) {
    if (gameEnded || !canClick) return;
  
    const selectedCup = cupElements[index];
    selectedCup.classList.add('lifted');
  
    const correctCup = cupElements[ballPosition];
    const ball = document.getElementById("ball" + ballPosition);
    positionBall(ballPosition);
    ball.style.display = "block";
  
    if (index === ballPosition) {
      document.getElementById("message").textContent = "정답입니다! 🎉";
    } else {
      document.getElementById("message").textContent = "틀렸습니다! 😢 정답은 여기에 있었어요.";
      if (!correctCup.classList.contains('lifted')) {
        // 정답 컵도 들어올림
        setTimeout(() => {
          correctCup.classList.add('lifted');
        }, 500); // 선택 컵보다 약간 늦게
      }
    }
  
    gameEnded = true;
  }
  

window.onload = resetGame;
