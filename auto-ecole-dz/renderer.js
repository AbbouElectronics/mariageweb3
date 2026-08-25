(() => {
  'use strict';

  const CATEGORY_LABELS = {
    danger: 'إشارات الخطر',
    interdiction: 'إشارات المنع',
    obligation: 'إشارات الإجباري',
    priorite: 'الأولوية وقواعد المرور',
    zones: 'تعليمات خاصة بالمناطق',
    securite: 'السياقة الآمنة',
    documents: 'الوثائق والتأمين',
    mecanique: 'الميكانيك العامة'
  };

  const SECONDS_PER_QUESTION = 45;

  // --- عناصر DOM ---
  const screens = {
    start: document.getElementById('screen-start'),
    quiz: document.getElementById('screen-quiz'),
    result: document.getElementById('screen-result')
  };

  const el = {
    numQuestions: document.getElementById('numQuestions'),
    category: document.getElementById('category'),
    passThreshold: document.getElementById('passThreshold'),
    passThresholdValue: document.getElementById('passThresholdValue'),
    timerToggle: document.getElementById('timerToggle'),
    startBtn: document.getElementById('startBtn'),

    progressFill: document.getElementById('progressFill'),
    progressLabel: document.getElementById('progressLabel'),
    timerBox: document.getElementById('timerBox'),
    timerLabel: document.getElementById('timerLabel'),
    questionCategory: document.getElementById('questionCategory'),
    questionText: document.getElementById('questionText'),
    questionImage: document.getElementById('questionImage'),
    optionsList: document.getElementById('optionsList'),
    nextBtn: document.getElementById('nextBtn'),
    scoreBadge: document.getElementById('scoreBadge'),

    resultIcon: document.getElementById('resultIcon'),
    resultTitle: document.getElementById('resultTitle'),
    resultSub: document.getElementById('resultSub'),
    statCorrect: document.getElementById('statCorrect'),
    statWrong: document.getElementById('statWrong'),
    statPercent: document.getElementById('statPercent'),
    reviewBtn: document.getElementById('reviewBtn'),
    restartBtn: document.getElementById('restartBtn'),
    reviewList: document.getElementById('reviewList')
  };

  // --- حالة الاختبار ---
  let state = null;
  let timerInterval = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[name].classList.remove('hidden');
  }

  el.passThreshold.addEventListener('input', () => {
    el.passThresholdValue.textContent = el.passThreshold.value + '%';
  });

  el.startBtn.addEventListener('click', startQuiz);
  el.nextBtn.addEventListener('click', nextQuestion);
  el.restartBtn.addEventListener('click', () => {
    stopTimer();
    el.scoreBadge.classList.add('hidden');
    showScreen('start');
  });
  el.reviewBtn.addEventListener('click', toggleReview);

  function startQuiz() {
    const catFilter = el.category.value;
    let pool = QUESTIONS.filter(q => catFilter === 'all' || q.category === catFilter);
    pool = shuffle(pool);

    const n = parseInt(el.numQuestions.value, 10);
    const count = n === 0 ? pool.length : Math.min(n, pool.length);
    const selected = pool.slice(0, count);

    state = {
      questions: selected,
      index: 0,
      answers: new Array(selected.length).fill(null),
      passThreshold: parseInt(el.passThreshold.value, 10),
      timerEnabled: el.timerToggle.checked,
      secondsLeft: selected.length * SECONDS_PER_QUESTION,
      finished: false
    };

    el.timerBox.classList.toggle('hidden', !state.timerEnabled);
    showScreen('quiz');
    renderQuestion();

    if (state.timerEnabled) startTimer();
  }

  function startTimer() {
    stopTimer();
    updateTimerLabel();
    timerInterval = setInterval(() => {
      state.secondsLeft--;
      updateTimerLabel();
      if (state.secondsLeft <= 0) {
        stopTimer();
        finishQuiz();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  function updateTimerLabel() {
    const s = Math.max(0, state.secondsLeft);
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    el.timerLabel.textContent = `${m}:${sec}`;
    el.timerBox.classList.toggle('low', s <= 30);
  }

  function renderQuestion() {
    const q = state.questions[state.index];
    const total = state.questions.length;

    el.progressFill.style.width = `${(state.index / total) * 100}%`;
    el.progressLabel.textContent = `السؤال ${state.index + 1} من ${total}`;

    el.questionCategory.textContent = CATEGORY_LABELS[q.category] || q.category;
    el.questionText.textContent = q.text;

    if (q.image) {
      el.questionImage.innerHTML = '';
      const img = document.createElement('img');
      img.src = q.image;
      img.alt = '';
      img.draggable = false;
      el.questionImage.appendChild(img);
      el.questionImage.classList.remove('hidden');
    } else {
      el.questionImage.innerHTML = '';
      el.questionImage.classList.add('hidden');
    }

    el.optionsList.innerHTML = '';
    const letters = ['أ', 'ب', 'ج', 'د'];
    q.options.forEach((optText, i) => {
      const div = document.createElement('div');
      div.className = 'option';
      div.dataset.index = String(i);

      const letterSpan = document.createElement('span');
      letterSpan.className = 'opt-letter';
      letterSpan.textContent = letters[i] || String(i + 1);

      const textSpan = document.createElement('span');
      textSpan.textContent = optText;

      div.appendChild(letterSpan);
      div.appendChild(textSpan);
      div.addEventListener('click', () => selectAnswer(i));
      el.optionsList.appendChild(div);
    });

    const prevAnswer = state.answers[state.index];
    if (prevAnswer !== null) {
      lockOptions(prevAnswer);
    } else {
      el.nextBtn.disabled = true;
    }

    el.nextBtn.textContent = state.index === total - 1 ? 'إنهاء الاختبار وعرض النتيجة' : 'السؤال التالي';

    const existingExplain = el.optionsList.parentElement.querySelector('.explain-box');
    if (existingExplain) existingExplain.remove();
  }

  function selectAnswer(i) {
    if (state.answers[state.index] !== null) return;
    state.answers[state.index] = i;
    lockOptions(i);
  }

  function lockOptions(chosenIndex) {
    const q = state.questions[state.index];
    const opts = el.optionsList.querySelectorAll('.option');
    opts.forEach(opt => {
      const idx = parseInt(opt.dataset.index, 10);
      opt.classList.add('disabled');
      if (idx === q.correct) opt.classList.add('correct');
      if (idx === chosenIndex && chosenIndex !== q.correct) opt.classList.add('wrong');
    });

    if (q.explain) {
      const box = document.createElement('div');
      box.className = 'explain-box';
      box.textContent = q.explain;
      el.optionsList.parentElement.appendChild(box);
    }

    el.nextBtn.disabled = false;
  }

  function nextQuestion() {
    if (state.index < state.questions.length - 1) {
      state.index++;
      renderQuestion();
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    if (state.finished) return;
    state.finished = true;
    stopTimer();

    let correct = 0;
    state.questions.forEach((q, i) => {
      if (state.answers[i] === q.correct) correct++;
    });
    const total = state.questions.length;
    const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
    const passed = percent >= state.passThreshold;

    el.statCorrect.textContent = String(correct);
    el.statWrong.textContent = String(total - correct);
    el.statPercent.textContent = `${percent}%`;

    if (passed) {
      el.resultIcon.textContent = '✅';
      el.resultTitle.textContent = 'ناجح - مبروك!';
      el.resultSub.textContent = `لقد تجاوزت الحد الأدنى للنجاح (${state.passThreshold}%). واصل المراجعة لترسيخ معلوماتك.`;
    } else {
      el.resultIcon.textContent = '❌';
      el.resultTitle.textContent = 'راسب - حاول مجددًا';
      el.resultSub.textContent = `لم تصل بعد إلى الحد الأدنى للنجاح (${state.passThreshold}%). راجع الأسئلة الخاطئة أدناه وأعد المحاولة.`;
    }

    el.scoreBadge.textContent = `${correct} / ${total} (${percent}%)`;
    el.scoreBadge.classList.remove('hidden');

    el.reviewList.innerHTML = '';
    el.reviewList.classList.add('hidden');
    el.reviewBtn.textContent = 'مراجعة الإجابات';

    showScreen('result');
  }

  function toggleReview() {
    if (!el.reviewList.classList.contains('hidden')) {
      el.reviewList.classList.add('hidden');
      el.reviewBtn.textContent = 'مراجعة الإجابات';
      return;
    }

    el.reviewList.innerHTML = '';
    const letters = ['أ', 'ب', 'ج', 'د'];

    state.questions.forEach((q, i) => {
      const userAnswer = state.answers[i];
      const isCorrect = userAnswer === q.correct;

      const item = document.createElement('div');
      item.className = `review-item ${isCorrect ? 'correct' : 'wrong'}`;

      const qLine = document.createElement('div');
      qLine.className = 'review-q';
      qLine.textContent = `${i + 1}. ${q.text}`;
      item.appendChild(qLine);

      const correctLine = document.createElement('div');
      correctLine.className = 'review-answer correct-ans';
      correctLine.textContent = `الإجابة الصحيحة: ${letters[q.correct]}) ${q.options[q.correct]}`;
      item.appendChild(correctLine);

      if (!isCorrect) {
        const wrongLine = document.createElement('div');
        wrongLine.className = 'review-answer wrong-ans';
        wrongLine.textContent = userAnswer === null
          ? 'لم تتم الإجابة على هذا السؤال'
          : `إجابتك: ${letters[userAnswer]}) ${q.options[userAnswer]}`;
        item.appendChild(wrongLine);
      }

      if (q.explain) {
        const explainLine = document.createElement('div');
        explainLine.className = 'review-answer';
        explainLine.textContent = q.explain;
        item.appendChild(explainLine);
      }

      el.reviewList.appendChild(item);
    });

    el.reviewList.classList.remove('hidden');
    el.reviewBtn.textContent = 'إخفاء المراجعة';
  }

  showScreen('start');
})();
