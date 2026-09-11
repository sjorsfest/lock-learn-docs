/* Behaviors for the generated content pages (sitegen/build.py):
   list filter, flashcard mode, shuffle, the phone-width sticky store
   bar, and the practice quiz. Feature-gated on element presence; the
   product pages never load this file. site.js keeps handling the
   header, reveals and the launch modal. */

(function () {
  const fold = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

  // ---- vocabulary table --------------------------------------------------
  const table = document.querySelector('.vocab');
  if (table && table.tBodies[0]) {
    const body = table.tBodies[0];
    const rows = Array.from(body.rows).filter((r) => !r.classList.contains('divider'));
    const keys = rows.map((r) => fold(r.textContent));
    const total = rows.length;
    const input = document.getElementById('filter');
    const count = document.getElementById('count');
    const cardsBtn = document.getElementById('cards');
    const shuffleBtn = document.getElementById('shuffle');

    if (input && count) {
      let timer = null;
      const apply = () => {
        const q = fold(input.value);
        let n = 0;
        rows.forEach((r, i) => {
          const hit = !q || keys[i].includes(q);
          r.hidden = !hit;
          if (hit) n++;
        });
        count.textContent = q ? n + ' of ' + total : total + ' words';
      };
      input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(apply, 80); });
      input.addEventListener('search', apply);
    }

    if (cardsBtn) {
      const setCards = (on) => {
        table.classList.toggle('cards', on);
        cardsBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        rows.forEach((r) => {
          if (on) { r.tabIndex = 0; r.setAttribute('role', 'button'); }
          else { r.removeAttribute('tabindex'); r.removeAttribute('role'); r.classList.remove('open'); }
        });
      };
      cardsBtn.addEventListener('click', () => setCards(!table.classList.contains('cards')));
      body.addEventListener('click', (e) => {
        if (!table.classList.contains('cards')) return;
        const r = e.target.closest('tr');
        if (r) r.classList.toggle('open');
      });
      body.addEventListener('keydown', (e) => {
        if (!table.classList.contains('cards')) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const r = e.target.closest('tr');
        if (r) { e.preventDefault(); r.classList.toggle('open'); }
      });
      addEventListener('beforeprint', () => setCards(false));
    }

    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        const order = rows.slice();
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [order[i], order[j]] = [order[j], order[i]];
        }
        order.forEach((r) => body.appendChild(r));
        table.classList.add('shuffled');
        if (table.classList.contains('cards')) rows.forEach((r) => r.classList.remove('open'));
        window.scrollTo({ top: table.getBoundingClientRect().top + window.scrollY - 140, behavior: 'smooth' });
      });
    }
  }

  // ---- sticky store bar (phones) ------------------------------------------
  const sticky = document.querySelector('.sticky-cta');
  const headRow = document.querySelector('.list-head .store-row');
  if (sticky && headRow) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      sticky.classList.toggle('on', !e.isIntersecting && e.boundingClientRect.top < 0);
    }), { threshold: 0 });
    io.observe(headRow);
  }

  // ---- practice quiz -------------------------------------------------------
  const quiz = document.getElementById('quiz');
  const deckEl = document.getElementById('deck');
  if (quiz && deckEl) {
    let deck = [];
    try { deck = JSON.parse(deckEl.textContent); } catch (e) { deck = []; }
    const readingOnQuestion = quiz.dataset.reading === 'question';
    const N = Math.min(20, deck.length);
    const GLOSS_MAX = 36;
    const el = (id) => document.getElementById(id);
    const card = el('qcard'), end = el('qend'), pos = el('qpos'), scoreEl = el('qscore');
    const word = el('qword'), reading = el('qreading'), opts = el('qopts'), next = el('qnext');
    const result = el('qresult'), verdict = el('qverdict'), again = el('qagain');
    if (!card || N === 0) return;

    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

    // The app's word round (ios/Core/QuizCard.swift meaningRound): two
    // distractor glosses from the same deck, non-empty, at most 36 characters,
    // case-insensitively distinct from the answer and each other, the correct
    // answer at a random index among the three.
    const round = (f) => {
      const correct = f.g;
      const pool = shuffle(deck.filter((o) => o.i !== f.i && o.g && o.g.length <= GLOSS_MAX && o.g.toLowerCase() !== correct.toLowerCase()).map((o) => o.g));
      const d = [];
      for (const g of pool) {
        if (!d.some((x) => x.toLowerCase() === g.toLowerCase())) d.push(g);
        if (d.length === 2) break;
      }
      if (d.length < 2) return null;
      const options = d.slice();
      options.splice(Math.floor(Math.random() * 3), 0, correct);
      return { f, options, correct };
    };

    let rounds = [], idx = 0, score = 0;

    const start = () => {
      rounds = shuffle(deck.slice()).map(round).filter(Boolean).slice(0, N);
      idx = 0; score = 0;
      end.hidden = true; card.hidden = false;
      show();
    };

    const show = () => {
      const r = rounds[idx];
      pos.textContent = 'Question ' + (idx + 1) + ' of ' + rounds.length;
      scoreEl.textContent = 'Score ' + score;
      word.textContent = r.f.w;
      reading.textContent = readingOnQuestion ? (r.f.r || '') : '';
      opts.innerHTML = '';
      r.options.forEach((o) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'q-opt'; b.textContent = o;
        b.addEventListener('click', () => answer(b, o, r));
        opts.appendChild(b);
      });
      next.hidden = true;
    };

    const answer = (btn, chosen, r) => {
      const right = chosen === r.correct;
      if (right) score++;
      Array.from(opts.children).forEach((b) => {
        b.disabled = true;
        if (b.textContent === r.correct) b.classList.add('right');
        else if (b === btn) b.classList.add('wrong');
        else b.classList.add('dim');
      });
      if (!readingOnQuestion && r.f.r) reading.textContent = r.f.r;
      scoreEl.textContent = 'Score ' + score;
      next.hidden = false;
      next.textContent = idx + 1 < rounds.length ? 'Next →' : 'See result →';
      next.focus();
    };

    const finish = () => {
      card.hidden = true; end.hidden = false;
      result.textContent = 'You got ' + score + ' of ' + rounds.length + '.';
      const pct = score / rounds.length;
      verdict.textContent = pct >= 0.9 ? 'That list is yours. Time to move up a level.'
        : pct >= 0.7 ? 'A solid pass. A few more glances and the rest will stick.'
        : pct >= 0.4 ? 'Halfway there. Flip the list into flashcards and come back tomorrow.'
        : 'Early days. Read the list once, then let the widget do the rest.';
      end.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    next.addEventListener('click', () => { idx++; if (idx < rounds.length) show(); else finish(); });
    if (again) again.addEventListener('click', start);
    start();
  }
})();
