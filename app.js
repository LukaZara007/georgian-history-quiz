// ისტორიის ქვიზის აპლიკაცია (free-text)

const state = {
  currentChapter: null,
  currentQuestion: 0,
  score: 0,
  questions: [],
  wrongAnswers: [],
  answered: false,
  mode: 'quiz', // 'quiz' or 'study'
  currentStudyChapter: null
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
  const data = typeof STUDY_DATA !== 'undefined' ? STUDY_DATA[chapterId] : null;
  if (!data) {
    // Fallback: build study material from quiz data
    const chapter = QUIZ_DATA.find(c => c.id === chapterId);
    if (!chapter) return;
    state.currentStudyChapter = chapterId;
    studyTitle.textContent = `📖 თავი ${chapterId}: ${chapter.title}`;
    studyContent.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'study-section';
    div.innerHTML = `<h3>${chapter.title}</h3>`;
    const ul = document.createElement('ul');
    chapter.questions.forEach(q => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${q.q}</strong><br>➜ ${q.answer}<br><span style="color:#475569; font-size:0.9rem;">${q.explanation}</span>`;
      ul.appendChild(li);
    });
    div.appendChild(ul);
    studyContent.appendChild(div);
    showScreen(studyScreen);
    return;
  }

  state.currentStudyChapter = chapterId;
  studyTitle.textContent = `📖 თავი ${chapterId}: ${data.title}`;
  studyContent.innerHTML = '';

  data.sections.forEach(section => {
    const div = document.createElement('div');
    div.className = 'study-section';
    const ul = document.createElement('ul');
    section.facts.forEach(fact => {
      const li = document.createElement('li');
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

// ტექსტის ნორმალიზაცია — ლეთინი ქვედარეგისტრში, პუნქტუაცია მოშორებული, ფართები ერთად
function normalize(s) {
  if (!s) return '';
  return s
    .toLowerCase()
    .replace(/[.,!?;:"„""«»() –—\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// პასუხის შემოწმება — ნებისმიერი accept-დან ერთი დამთხვევა საკმარისია
function isAnswerCorrect(userInput, question) {
  const userNorm = normalize(userInput);
  if (!userNorm) return false;
  const candidates = question.accept && question.accept.length
    ? question.accept
    : [question.answer];
  for (const cand of candidates) {
    const candNorm = normalize(cand);
    if (!candNorm) continue;
    if (userNorm === candNorm) return true;
    // მომხმარებლის შეყვანა შეიცავს კანდიდატს (გრძელი პასუხებისთვის)
    if (userNorm.includes(candNorm)) return true;
    // ან კანდიდატი შეიცავს მომხმარებლის შეყვანას (მოკლე ფორმისთვის)
    if (candNorm.includes(userNorm) && userNorm.length >= 3) return true;
  }
  return false;
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

  // შემქმნა ტექსტური შესაყვანი + სუბმიტ ღილაკი
  const inputWrap = document.createElement('div');
  inputWrap.className = 'input-wrap';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'answer-input';
  input.placeholder = 'შენი პასუხი...';
  input.autocomplete = 'off';
  input.autocapitalize = 'off';
  input.spellcheck = false;
  input.id = 'answer-input';

  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn btn-primary submit-btn';
  submitBtn.id = 'submit-btn';
  submitBtn.textContent = 'შემოწმება';

  const hint = document.createElement('div');
  hint.className = 'input-hint';
  hint.textContent = '↵ Enter — შემოწმება';

  inputWrap.appendChild(input);
  inputWrap.appendChild(submitBtn);
  answersEl.appendChild(inputWrap);
  answersEl.appendChild(hint);

  const submit = () => {
    if (state.answered) return;
    const value = input.value;
    if (!value.trim()) {
      input.focus();
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 400);
      return;
    }
    handleSubmit(value, q, input, submitBtn);
  };

  submitBtn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  });

  feedbackEl.classList.add('hidden');

  // ფოკუსი შემოყვანის ველზე
  setTimeout(() => input.focus(), 50);
}

// პასუხის გადამოწმება
function handleSubmit(value, q, input, submitBtn) {
  state.answered = true;
  input.disabled = true;
  submitBtn.disabled = true;

  const correct = isAnswerCorrect(value, q);
  if (correct) {
    input.classList.add('correct');
    state.score++;
    scoreEl.textContent = state.score;
    showFeedback(true, q, value);
  } else {
    input.classList.add('incorrect');
    state.wrongAnswers.push({
      question: q.q,
      yourAnswer: value,
      correctAnswer: q.answer,
      explanation: q.explanation
    });
    showFeedback(false, q, value);
  }
}

// უკუკავშირის ჩვენება
function showFeedback(isCorrect, q, userValue) {
  feedbackEl.classList.remove('hidden', 'correct', 'incorrect');
  feedbackEl.classList.add(isCorrect ? 'correct' : 'incorrect');

  if (isCorrect) {
    feedbackIcon.textContent = '✅';
    feedbackText.textContent = 'სწორი პასუხია!';
  } else {
    feedbackIcon.textContent = '❌';
    feedbackText.innerHTML = `არასწორი პასუხია.<br>სწორი იყო: <strong>${q.answer}</strong>`;
  }
  feedbackExplanation.textContent = q.explanation;

  const isLast = state.currentQuestion === state.questions.length - 1;
  nextBtn.textContent = isLast ? 'შედეგების ნახვა →' : 'შემდეგი კითხვა →';

  // ფოკუსი შემდეგი ღილაკზე — Enter-ით გადასვლა
  setTimeout(() => nextBtn.focus(), 50);
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

  if (state.wrongAnswers.length > 0) {
    wrongAnswersDiv.innerHTML = '<h3>📝 არასწორი პასუხები:</h3>';
    state.wrongAnswers.forEach(w => {
      const item = document.createElement('div');
      item.className = 'wrong-item';
      item.innerHTML = `
        <div class="wrong-q">${w.question}</div>
        <div class="wrong-a">შენი პასუხი: ${w.yourAnswer || '(ცარიელი)'}</div>
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

// კლავიატურის მართვა — Enter შემდეგი კითხვისთვის
document.addEventListener('keydown', (e) => {
  if (quizScreen.classList.contains('active') && state.answered) {
    if (e.key === 'Enter') {
      // თუ ფოკუსი არ არის input-ზე
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      e.preventDefault();
      nextQuestion();
    }
  }
});

// ინიციალიზაცია
renderChapters();
