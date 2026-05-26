// ისტორიის ქვიზის აპლიკაცია

const state = {
  currentChapter: null,
  currentQuestion: 0,
  score: 0,
  questions: [],
  wrongAnswers: [],
  answered: false,
  mode: 'quiz' // 'quiz' or 'study'
};

// DOM ელემენტები
const chaptersScreen = document.getElementById('chapters-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const studyScreen = document.getElementById('study-screen');
const chaptersList = document.getElementById('chapters-list');
const chaptersHeading = document.getElementById('chapters-heading');
const chaptersSubhead = document.getElementById('chapters-subhead');
const chapterTitle = document.getElementById('chapter-title');
const qCounter = document.getElementById('q-counter');
const scoreEl = document.getElementById('score');
const progressFill = document.getElementById('progress-fill');
const questionText = document.getElementById('question-text');
const answersEl = document.getElementById('answers');
const feedbackEl = document.getElementById('feedback');
const feedbackIcon = document.getElementById('feedback-icon');
const feedbackText = document.getElementById('feedback-text');
const feedbackExplanation = document.getElementById('feedback-explanation');
const nextBtn = document.getElementById('next-btn');
const backBtn = document.getElementById('back-btn');
const finalScore = document.getElementById('final-score');
const finalTotal = document.getElementById('final-total');
const resultMessage = document.getElementById('result-message');
const resultPercentage = document.getElementById('result-percentage');
const retryBtn = document.getElementById('retry-btn');
const homeBtn = document.getElementById('home-btn');
const wrongAnswersDiv = document.getElementById('wrong-answers');
const allChaptersBtn = document.getElementById('all-chapters-btn');
const modeQuizBtn = document.getElementById('mode-quiz-btn');
const modeStudyBtn = document.getElementById('mode-study-btn');
const studyTitle = document.getElementById('study-title');
const studyContent = document.getElementById('study-content');
const studyBackBtn = document.getElementById('study-back-btn');
const studyToQuizBtn = document.getElementById('study-to-quiz-btn');

// ეკრანების გადართვა
function showScreen(screen) {
  [chaptersScreen, quizScreen, resultsScreen, studyScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// რეჟიმის შეცვლა
function setMode(mode) {
  state.mode = mode;
  modeQuizBtn.classList.toggle('active', mode === 'quiz');
  modeStudyBtn.classList.toggle('active', mode === 'study');
  if (mode === 'quiz') {
    chaptersHeading.textContent = 'აირჩიე თავი';
    chaptersSubhead.textContent = 'დააწკაპუნე თავზე ქვიზის დასაწყებად';
    allChaptersBtn.style.display = '';
  } else {
    chaptersHeading.textContent = 'სასწავლო მასალა';
    chaptersSubhead.textContent = 'დააწკაპუნე თავზე პასუხების სანახავად';
    allChaptersBtn.style.display = 'none';
  }
  renderChapters();
}

// თავების სიის რენდერი
function renderChapters() {
  chaptersList.innerHTML = '';
  QUIZ_DATA.forEach(chapter => {
    const card = document.createElement('button');
    card.className = 'chapter-card' + (state.mode === 'study' ? ' study-mode' : '');
    const meta = state.mode === 'quiz'
      ? `${chapter.description} · ${chapter.questions.length} კითხვა`
      : `${chapter.description} · მასალის ნახვა`;
    card.innerHTML = `
      <div class="chapter-number">${chapter.id}</div>
      <div class="chapter-title">${chapter.title}</div>
      <div class="chapter-meta">${meta}</div>
    `;
    card.addEventListener('click', () => {
      if (state.mode === 'quiz') {
        startChapter(chapter);
      } else {
        showStudy(chapter.id);
      }
    });
    chaptersList.appendChild(card);
  });
}

// სასწავლო მასალის ჩვენება
function showStudy(chapterId) {
  const data = STUDY_DATA[chapterId];
  if (!data) return;

  state.currentStudyChapter = chapterId;
  studyTitle.textContent = `📖 თავი ${chapterId}: ${data.title}`;
  studyContent.innerHTML = '';

  data.sections.forEach(section => {
    const div = document.createElement('div');
    div.className = 'study-section';
    const ul = document.createElement('ul');
    section.facts.forEach(fact => {
      const li = document.createElement('li');
      // **bold** მარკდაუნი HTML-ად
      li.innerHTML = fact.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      ul.appendChild(li);
    });
    div.innerHTML = `<h3>${section.heading}</h3>`;
    div.appendChild(ul);
    studyContent.appendChild(div);
  });

  showScreen(studyScreen);
}

// Fisher-Yates არევა
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// თავის დაწყება
function startChapter(chapter) {
  state.currentChapter = chapter;
  state.currentQuestion = 0;
  state.score = 0;
  state.wrongAnswers = [];
  state.questions = shuffle(chapter.questions);
  chapterTitle.textContent = chapter.title;
  showScreen(quizScreen);
  renderQuestion();
}

// ყველა თავი ერთად
function startAllChapters() {
  const allQuestions = [];
  QUIZ_DATA.forEach(ch => {
    ch.questions.forEach(q => allQuestions.push({ ...q, chapterTitle: ch.title }));
  });
  state.currentChapter = {
    title: "ყველა თავი ერთად",
    questions: allQuestions
  };
  state.currentQuestion = 0;
  state.score = 0;
  state.wrongAnswers = [];
  state.questions = shuffle(allQuestions);
  chapterTitle.textContent = "🎯 ყველა თავი ერთად";
  showScreen(quizScreen);
  renderQuestion();
}

// კითხვის რენდერი
function renderQuestion() {
  state.answered = false;
  const q = state.questions[state.currentQuestion];
  const total = state.questions.length;

  qCounter.textContent = `${state.currentQuestion + 1} / ${total}`;
  scoreEl.textContent = state.score;
  progressFill.style.width = `${(state.currentQuestion / total) * 100}%`;

  questionText.textContent = q.q;
  answersEl.innerHTML = '';

  // შერეული პასუხები — შევინარჩუნოთ რომელია სწორი
  const indexed = q.options.map((opt, i) => ({ opt, isCorrect: i === q.correct }));
  const shuffled = shuffle(indexed);

  const letters = ['ა', 'ბ', 'გ', 'დ'];
  shuffled.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `<span class="answer-letter">${letters[i]}</span>${item.opt}`;
    btn.addEventListener('click', () => selectAnswer(btn, item.isCorrect, q));
    answersEl.appendChild(btn);
  });

  feedbackEl.classList.add('hidden');
}

// პასუხის არჩევა
function selectAnswer(btn, isCorrect, q) {
  if (state.answered) return;
  state.answered = true;

  const allButtons = answersEl.querySelectorAll('.answer-btn');

  if (isCorrect) {
    btn.classList.add('correct');
    state.score++;
    scoreEl.textContent = state.score;
    showFeedback(true, q);
  } else {
    btn.classList.add('incorrect');
    // აღვნიშნოთ სწორი პასუხი
    allButtons.forEach(b => {
      const text = b.textContent.trim();
      // შევადაროთ წერტილოვნად ტექსტი სწორ პასუხს
      if (text.endsWith(q.options[q.correct])) {
        b.classList.add('correct');
      }
    });
    state.wrongAnswers.push({
      question: q.q,
      yourAnswer: btn.textContent.replace(/^[აბგდ]/, '').trim(),
      correctAnswer: q.options[q.correct],
      explanation: q.explanation
    });
    showFeedback(false, q);
  }

  // ყველა ღილაკის გათიშვა
  allButtons.forEach(b => b.disabled = true);
}

// უკუკავშირის ჩვენება
function showFeedback(isCorrect, q) {
  feedbackEl.classList.remove('hidden', 'correct', 'incorrect');
  feedbackEl.classList.add(isCorrect ? 'correct' : 'incorrect');

  if (isCorrect) {
    feedbackIcon.textContent = '✅';
    feedbackText.textContent = 'სწორი პასუხია!';
  } else {
    feedbackIcon.textContent = '❌';
    feedbackText.textContent = `არასწორი პასუხია. სწორი იყო: ${q.options[q.correct]}`;
  }
  feedbackExplanation.textContent = q.explanation;

  // ბოლო კითხვაზე ღილაკის ტექსტის შეცვლა
  const isLast = state.currentQuestion === state.questions.length - 1;
  nextBtn.textContent = isLast ? 'შედეგების ნახვა →' : 'შემდეგი კითხვა →';
}

// შემდეგ კითხვაზე გადასვლა
function nextQuestion() {
  state.currentQuestion++;
  if (state.currentQuestion >= state.questions.length) {
    showResults();
  } else {
    renderQuestion();
  }
}

// შედეგების ჩვენება
function showResults() {
  const total = state.questions.length;
  const percentage = Math.round((state.score / total) * 100);

  finalScore.textContent = state.score;
  finalTotal.textContent = total;
  resultPercentage.textContent = `${percentage}% სწორი პასუხი`;

  let message = '';
  if (percentage === 100) {
    message = '🏆 სრულყოფილი შედეგი! ბრავო!';
  } else if (percentage >= 80) {
    message = '🌟 შესანიშნავი შედეგი!';
  } else if (percentage >= 60) {
    message = '👍 კარგი შედეგი, მაგრამ კიდევ მეცადინეობა გვინდა.';
  } else if (percentage >= 40) {
    message = '📚 უნდა გავიმეოროთ მასალა.';
  } else {
    message = '💪 არ ნებდები — სცადე კიდევ!';
  }
  resultMessage.textContent = message;

  // არასწორი პასუხების ჩვენება
  if (state.wrongAnswers.length > 0) {
    wrongAnswersDiv.innerHTML = '<h3>📝 არასწორი პასუხები:</h3>';
    state.wrongAnswers.forEach(w => {
      const item = document.createElement('div');
      item.className = 'wrong-item';
      item.innerHTML = `
        <div class="wrong-q">${w.question}</div>
        <div class="wrong-a">შენი პასუხი: ${w.yourAnswer}</div>
        <div class="correct-a">სწორი პასუხი: ${w.correctAnswer}</div>
        <div style="margin-top:8px; font-size:0.9rem; color:#475569;">${w.explanation}</div>
      `;
      wrongAnswersDiv.appendChild(item);
    });
  } else {
    wrongAnswersDiv.innerHTML = '<p style="color:#10b981; font-weight:600;">🎉 ყველა პასუხი სწორი იყო!</p>';
  }

  showScreen(resultsScreen);
}

// ღილაკების ლისტენერები
nextBtn.addEventListener('click', nextQuestion);
backBtn.addEventListener('click', () => showScreen(chaptersScreen));
retryBtn.addEventListener('click', () => {
  if (state.currentChapter) {
    if (state.currentChapter.title === "ყველა თავი ერთად") {
      startAllChapters();
    } else {
      startChapter(state.currentChapter);
    }
  }
});
homeBtn.addEventListener('click', () => showScreen(chaptersScreen));
allChaptersBtn.addEventListener('click', startAllChapters);
modeQuizBtn.addEventListener('click', () => setMode('quiz'));
modeStudyBtn.addEventListener('click', () => setMode('study'));
studyBackBtn.addEventListener('click', () => showScreen(chaptersScreen));
studyToQuizBtn.addEventListener('click', () => {
  const chapter = QUIZ_DATA.find(c => c.id === state.currentStudyChapter);
  if (chapter) startChapter(chapter);
});

// კლავიატურის მართვა
document.addEventListener('keydown', (e) => {
  if (quizScreen.classList.contains('active')) {
    if (state.answered && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      nextQuestion();
    } else if (!state.answered && ['1', '2', '3', '4'].includes(e.key)) {
      const buttons = answersEl.querySelectorAll('.answer-btn');
      const index = parseInt(e.key) - 1;
      if (buttons[index]) buttons[index].click();
    }
  }
});

// ინიციალიზაცია
renderChapters();
