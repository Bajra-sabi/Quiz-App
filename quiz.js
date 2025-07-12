let questions = [];
let currentIndex = 0;
let score = 0;
let time = 10;
let timer;

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("next-btn");
const timerEl = document.getElementById("time");

async function fetchQuestions() {
  const res = await fetch("https://opentdb.com/api.php?amount=5&type=multiple");
  const data = await res.json();

  questions = data.results.map(q => ({
    question: decodeHTML(q.question),
    answers: shuffleArray([...q.incorrect_answers, q.correct_answer].map(decodeHTML)),
    correct: decodeHTML(q.correct_answer)
  }));

  showQuestion();
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function showQuestion() {
  resetState();

  const current = questions[currentIndex];
  questionEl.textContent = current.question;

  current.answers.forEach(answer => {
    const btn = document.createElement("button");
    btn.textContent = answer;
    btn.onclick = () => selectAnswer(btn);
    answersEl.appendChild(btn);
  });

  startTimer();
}

function resetState() {
  clearInterval(timer);
  time = 10;
  timerEl.textContent = time;
  nextBtn.style.display = "none";
  answersEl.innerHTML = "";
}

function startTimer() {
  timer = setInterval(() => {
    time--;
    timerEl.textContent = time;
    if (time === 0) {
      clearInterval(timer);
      autoFail();
    }
  }, 1000);
}

function autoFail() {
  const correct = questions[currentIndex].correct;
  Array.from(answersEl.children).forEach(btn => {
    btn.disabled = true;
    btn.style.backgroundColor = (btn.textContent === correct) ? "green" : "red";
  });
  nextBtn.style.display = "inline-block";
}

function selectAnswer(selectedBtn) {
  clearInterval(timer);
  const correct = questions[currentIndex].correct;

  if (selectedBtn.textContent === correct) {
    score++;
    selectedBtn.style.backgroundColor = "green";
  } else {
    selectedBtn.style.backgroundColor = "red";
  }

  Array.from(answersEl.children).forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correct) btn.style.backgroundColor = "green";
  });

  nextBtn.style.display = "inline-block";
}

nextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
});

function showScore() {
  resetState();
  const percent = ((score / questions.length) * 100).toFixed(0);
  questionEl.textContent = `Quiz Over! You scored ${score}/${questions.length} (${percent}%)`;
  nextBtn.textContent = "Play Again";
  nextBtn.style.display = "inline-block";
  nextBtn.onclick = () => location.reload();
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

fetchQuestions();
