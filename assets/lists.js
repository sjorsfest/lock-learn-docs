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
  const headRow = document.querySelector('.list-head .store-row, .list-hero .store-row');
  if (sticky && headRow) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      sticky.classList.toggle('on', !e.isIntersecting && e.boundingClientRect.top < 0);
    }), { threshold: 0 });
    io.observe(headRow);
  }

  // ---- practice quiz -------------------------------------------------------
  // Played the way the app's QuizCard plays: a beat line ("Do you know this
  // one?") that turns into "You knew it." / "N in a row." on a hit and
  // "Now you know." on a miss; lettered capsules that land A, B, C; the
  // winner lit in the app's known green with a check and a few sparks, the
  // wrong pick shaken red with the truth lighting a beat later; a seeded
  // one-in-six jackpot (stableHash(id:jackpot) % 6 == 0, like the app) with
  // a bigger pop and a light sweep; and the next round arriving on its own
  // after the app's beats (0.9s hit, 1.2s jackpot, 1.5s miss). Keys 1-3 or
  // A-C answer too. No clock, as the page promises.
  const quiz = document.getElementById('quiz');
  const deckEl = document.getElementById('deck');
  if (quiz && deckEl) {
    let deck = [];
    try { deck = JSON.parse(deckEl.textContent); } catch (e) { deck = []; }
    const readingOnQuestion = quiz.dataset.reading === 'question';
    const level = quiz.dataset.level || 'this level';
    const N = Math.min(20, deck.length);
    const GLOSS_MAX = 36;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = (id) => document.getElementById(id);
    const card = el('qcard'), end = el('qend'), pos = el('qpos'), scoreEl = el('qscore'), streakEl = el('qstreak');
    const bar = el('qbar'), roundEl = el('qround'), word = el('qword'), reading = el('qreading'), line = el('qline'), opts = el('qopts');
    const result = el('qresult'), verdict = el('qverdict'), again = el('qagain'), ring = el('qringfill'), pct = el('qpct'), best = el('qbest');
    if (!card || !roundEl || N === 0) return;

    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    // QuizBuilder.stableHash: FNV-1a over the UTF-8 bytes, so the same words
    // sparkle here as in the app.
    const stableHash = (str) => {
      let h = 0x811c9dc5;
      for (const b of new TextEncoder().encode(str)) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
      return h;
    };
    const jackpotFor = (f) => stableHash(f.i + ':jackpot') % 6 === 0;

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

    let rounds = [], idx = 0, score = 0, streak = 0, bestStreak = 0, open = false, timer = null;

    const pop = (node) => { node.classList.remove('pop'); void node.offsetWidth; node.classList.add('pop'); };
    const sparks = (btn, gold) => {
      if (reduce) return;
      const n = gold ? 18 : 10;
      for (let i = 0; i < n; i++) {
        const sp = document.createElement('i');
        sp.className = 'q-spark' + (gold && i % 2 ? ' gold' : '');
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
        const r = (gold ? 70 : 48) + Math.random() * 40;
        sp.style.setProperty('--x', Math.cos(a) * r + 'px');
        sp.style.setProperty('--y', Math.sin(a) * r * 0.7 + 'px');
        sp.style.setProperty('--d', Math.round(Math.random() * 120) + 'ms');
        btn.appendChild(sp);
        sp.addEventListener('animationend', () => sp.remove());
      }
    };

    const start = () => {
      clearTimeout(timer);
      rounds = shuffle(deck.slice()).map(round).filter(Boolean).slice(0, N);
      idx = 0; score = 0; streak = 0; bestStreak = 0;
      end.hidden = true; card.hidden = false;
      scoreEl.textContent = 'Score 0';
      streakEl.hidden = true;
      show();
    };

    const show = () => {
      const r = rounds[idx];
      pos.textContent = 'Question ' + (idx + 1) + ' of ' + rounds.length;
      if (bar) bar.style.width = ((idx / rounds.length) * 100).toFixed(1) + '%';
      word.textContent = r.f.w;
      reading.textContent = readingOnQuestion ? (r.f.r || '') : '';
      line.textContent = 'Do you know this one?';
      line.className = 'q-line';
      opts.innerHTML = '';
      r.options.forEach((o, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'q-opt'; b.style.setProperty('--i', i);
        b.innerHTML = '<i>' + String.fromCharCode(65 + i) + '</i><span></span>'
          + '<svg class="qck" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5 10 17.5 19 7"/></svg>';
        b.querySelector('span').textContent = o;
        b.addEventListener('click', () => answer(b, o, r));
        opts.appendChild(b);
      });
      roundEl.classList.remove('out');
      open = true;
    };

    const answer = (btn, chosen, r) => {
      if (!open) return;
      open = false;
      const right = chosen === r.correct;
      const jackpot = right && jackpotFor(r.f);
      const buttons = Array.from(opts.children);
      buttons.forEach((b) => { b.disabled = true; });
      if (!readingOnQuestion && r.f.r) reading.textContent = r.f.r;
      if (right) {
        score++; streak++; bestStreak = Math.max(bestStreak, streak);
        btn.classList.add('right');
        if (jackpot) btn.classList.add('big');
        buttons.forEach((b) => { if (b !== btn) b.classList.add('dim'); });
        sparks(btn, jackpot);
        line.textContent = streak >= 2 ? streak + ' in a row.' : 'You knew it.';
        line.className = 'q-line hit';
        scoreEl.textContent = 'Score ' + score; pop(scoreEl);
        if (streak >= 2) { streakEl.hidden = false; streakEl.textContent = streak + ' in a row'; pop(streakEl); }
      } else {
        streak = 0; streakEl.hidden = true;
        btn.classList.add('wrong');
        line.textContent = 'Now you know.';
        line.className = 'q-line miss';
        // the flush lands first; the truth lights up a beat later
        setTimeout(() => {
          buttons.forEach((b) => {
            if (b.querySelector('span').textContent === r.correct) b.classList.add('right');
            else if (b !== btn) b.classList.add('dim');
          });
        }, reduce ? 0 : 350);
      }
      if (bar) bar.style.width = (((idx + 1) / rounds.length) * 100).toFixed(1) + '%';
      const beat = right ? (jackpot ? 1200 : 900) : 1500;
      clearTimeout(timer);
      timer = setTimeout(advance, beat + 250);
    };

    const advance = () => {
      idx++;
      if (idx >= rounds.length) { finish(); return; }
      roundEl.classList.add('out');
      setTimeout(show, reduce ? 0 : 180);
    };

    const finish = () => {
      card.hidden = true; end.hidden = false;
      const total = rounds.length, p = score / total;
      result.textContent = 'You got ' + score + ' of ' + total + '.';
      if (pct) pct.textContent = Math.round(p * 100) + '%';
      if (ring) { ring.style.strokeDashoffset = '276.5'; requestAnimationFrame(() => requestAnimationFrame(() => { ring.style.strokeDashoffset = (276.5 * (1 - p)).toFixed(1); })); }
      if (best) best.textContent = bestStreak >= 2 ? 'Best run: ' + bestStreak + ' in a row' : '';
      // the verdict answers the page's question: are you ready for this level?
      verdict.textContent = p >= 0.9 ? 'Ready. The ' + level + ' vocabulary is not going to be the problem. Time to look at the next level.'
        : p >= 0.7 ? 'Ready for ' + level + '. A few more glances and the last words will stick too.'
        : p >= 0.4 ? 'Halfway to ' + level + '. Flip the list into flashcards and come back tomorrow.'
        : 'Early days for ' + level + '. Read the list once, then let the widget do the rest.';
      end.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (p >= 0.7) sparks(end.querySelector('.q-ring') || end, p >= 0.9);
    };

    addEventListener('keydown', (e) => {
      if (!open || card.hidden || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const k = e.key.toUpperCase();
      const i = '123'.indexOf(k) >= 0 ? '123'.indexOf(k) : 'ABC'.indexOf(k);
      if (i < 0) return;
      const b = opts.children[i];
      if (b) { e.preventDefault(); b.click(); }
    });
    if (again) again.addEventListener('click', start);
    start();
  }
})();
