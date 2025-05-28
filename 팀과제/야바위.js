let ballPosition = 0;
let gameEnded = false;
let canClick = false;

const cupElements = [
  document.getElementById('cup0'),
  document.getElementById('cup1'),
  document.getElementById('cup2'),
];


function positionBall(index) {
  const cup = cupElements[index];
  const ball = document.getElementById("ball" + index);
  const cupLeft = parseInt(cup.style.left);
  ball.style.left = (cupLeft + 50) + "px"; 
}

function startGame() {
  document.getElementById("startButton").classList.add("hidden");   
  document.getElementById("resetButton").classList.add("hidden");   
  resetGame();
}

function resetGame() {
  document.getElementById("resetButton").classList.add("hidden"); 
  document.getElementById("message").textContent = "고구마의 위치를 잘 확인하세요...";
  document.querySelectorAll('.ball').forEach(ball => ball.style.display = 'none');
  cupElements.forEach(cup => cup.classList.remove('lifted'));
  document.getElementById("chunsikImage").src = "춘식이.webp"; 
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
      document.getElementById("message").textContent = "어디에 있을까요?...";
      shuffleCups(() => {
        document.getElementById("resetButton").classList.remove("hidden");
      });
    }, 500);
  }, 1000);
}

function shuffleCups(callback) {
  const positions = [0, 150, 300];
  let currentOrder = [0, 1, 2];
  let shuffleCount = 10;
  let delay = 200;

  const shuffleStep = (i) => {
    if (i >= shuffleCount) {
      document.getElementById("message").textContent = "상자 속 고구마를 찾아보세요";
      canClick = true;
      if (callback) callback(); 
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

  const correctCup = cupElements[ballPosition];
  const ball = document.getElementById("ball" + ballPosition);
  const chunsikImg = document.getElementById("chunsikImage");

  positionBall(ballPosition);
  ball.style.display = "block";

  if (index === ballPosition) {
    document.getElementById("message").textContent = "춘식이가 고구마를 먹을 수 있겠어요!";
    chunsikImg.src = "성공.png";
  } else {
    document.getElementById("message").textContent = "춘식이는 다음 기회를 노려야겠어요...";
    chunsikImg.src = "실패.png";
    if (!correctCup.classList.contains('lifted')) {
      setTimeout(() => {
        correctCup.classList.add('lifted');
      }, 0);
    }
  }

  document.getElementById("resetButton").classList.remove("hidden");
  gameEnded = true;
}
