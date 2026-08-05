/* Lock&Learn site behaviors. Kept deliberately small:
   header state, masked line reveals, reveal-on-scroll, a light hero
   parallax, and (family page only) the world switcher that crossfades
   the hero between the six app worlds. */

(function () {
  // ---- header ----------------------------------------------------------
  const top = document.querySelector('.top');
  const onScroll = () => top.classList.toggle('scrolled', window.scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- masked headline lines ------------------------------------------
  // Double rAF: guarantees one painted frame in the hidden state so the
  // rise animates. Not gated on fonts; a swap mid-rise is invisible.
  requestAnimationFrame(() =>
    requestAnimationFrame(() =>
      document.querySelectorAll('.lines').forEach((el) => el.classList.add('in'))
    )
  );

  // ---- reveal on scroll ------------------------------------------------
  // #all skips the scroll choreography (full-page screenshots, sharing).
  if (location.hash === '#all') {
    document.querySelectorAll('.reveal, .lines').forEach((el) => el.classList.add('in'));
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // ---- hero phone parallax --------------------------------------------
  const stage = document.querySelector('.hero .phone-stage');
  if (stage && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let raf = null;
    addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        stage.style.transform = `translateY(${Math.min(window.scrollY, 900) * 0.07}px)`;
        raf = null;
      });
    }, { passive: true });
  }

  // ---- launch-announcement modal (App Store + Play Store buttons) -------
  const launchModal = document.getElementById('launchModal');
  if (launchModal) {
    const openers = document.querySelectorAll('[data-open-modal="launch"]');
    const closers = launchModal.querySelectorAll('[data-close-modal]');
    let lastFocused = null;

    const open = (e) => {
      e.preventDefault();
      lastFocused = document.activeElement;
      launchModal.hidden = false;
      requestAnimationFrame(() => launchModal.classList.add('on'));
      launchModal.querySelector('.modal-close').focus();
    };
    const close = () => {
      launchModal.classList.remove('on');
      setTimeout(() => { launchModal.hidden = true; }, 250);
      if (lastFocused) lastFocused.focus();
    };

    openers.forEach((el) => el.addEventListener('click', open));
    closers.forEach((el) => el.addEventListener('click', close));
    launchModal.addEventListener('click', (e) => { if (e.target === launchModal) close(); });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && launchModal.classList.contains('on')) close();
    });
  }

  // ---- world switcher (family page only) -------------------------------
  const hero = document.getElementById('worldHero');
  if (!hero) return;

  const WORLDS = {
    trivia: {
      line: 'A question waits on the widget. You guess; the verified fact is one tap away. <a href="trivia/">Explore &rarr;</a>',
      widget: `
        <div class="wchip"><span class="dot"></span>SPACE</div>
        <div class="wq">On which planets does it rain diamonds?</div>
        <div class="whint">Tap to reveal the answer</div>`,
      floats: [
        { cls: 'f1', html: '<div class="fq">Which sea creature has three hearts?</div><div class="fm">Ocean</div>' },
        { cls: 'f2', html: '<div class="fq">How long is a day on Venus?</div><div class="fm">Space</div>' },
        { cls: 'f3', html: '<div class="fq">Which muscle never rests?</div><div class="fm">Human body</div>' },
      ],
    },
    chinese: {
      line: 'The full HSK syllabus, one glance at a time. Pinyin on the question, meaning on the tap. <a href="chinese/">Explore &rarr;</a>',
      widget: `
        <div class="wchip"><span class="dot"></span>HSK 1</div>
        <div class="whanzi">电影</div>
        <div class="wreading">diàn yǐng</div>
        <div class="whint">Tap for the meaning</div>`,
      floats: [
        { cls: 'f1', html: '<div class="fh">下雨</div><div class="fr">xià yǔ</div><div class="fm">to rain</div>' },
        { cls: 'f2', html: '<div class="fh">医生</div><div class="fr">yīshēng</div><div class="fm">doctor</div>' },
        { cls: 'f3', html: '<div class="fh">不客气</div><div class="fr">bù kèqì</div><div class="fm">you’re welcome</div>' },
      ],
    },
    japanese: {
      line: 'JLPT vocabulary, the way the test asks. Kanji first; the reading arrives on the tap. <a href="japanese/">Explore &rarr;</a>',
      widget: `
        <div class="wchip"><span class="dot"></span>JLPT N5</div>
        <div class="whanzi">自転車</div>
        <div class="whint">Tap for the reading &amp; meaning</div>`,
      floats: [
        { cls: 'f1', html: '<div class="fh">水</div><div class="fr">みず</div><div class="fm">water</div>' },
        { cls: 'f2', html: '<div class="fh">天気</div><div class="fr">てんき</div><div class="fm">weather</div>' },
        { cls: 'f3', html: '<div class="fh">友達</div><div class="fr">ともだち</div><div class="fm">friend</div>' },
      ],
    },
    arabic: {
      line: 'Modern Standard Arabic from A1 to C2, fully vocalized, romanized on every card. <a href="arabic/">Explore &rarr;</a>',
      widget: `
        <div class="wchip"><span class="dot"></span>CEFR A2</div>
        <div class="whanzi" lang="ar">قَمَر</div>
        <div class="wreading">qamar</div>
        <div class="whint">Tap for the meaning</div>`,
      floats: [
        { cls: 'f1', html: '<div class="fh" lang="ar">ماء</div><div class="fr">māʾ</div><div class="fm">water</div>' },
        { cls: 'f2', html: '<div class="fh" lang="ar">باب</div><div class="fr">bāb</div><div class="fm">door</div>' },
        { cls: 'f3', html: '<div class="fh" lang="ar">لُغَة</div><div class="fr">lugha</div><div class="fm">language</div>' },
      ],
    },
    korean: {
      line: 'TOPIK vocabulary from beginner to advanced. Hangul with its romanization; the meaning on the tap. <a href="korean/">Explore &rarr;</a>',
      widget: `
        <div class="wchip"><span class="dot"></span>TOPIK I</div>
        <div class="whanzi" lang="ko">하늘</div>
        <div class="wreading">haneul</div>
        <div class="whint">Tap for the meaning</div>`,
      floats: [
        { cls: 'f1', html: '<div class="fh" lang="ko">바다</div><div class="fr">bada</div><div class="fm">sea</div>' },
        { cls: 'f2', html: '<div class="fh" lang="ko">노래</div><div class="fr">norae</div><div class="fm">song</div>' },
        { cls: 'f3', html: '<div class="fh" lang="ko">꿈</div><div class="fr">kkum</div><div class="fm">a dream</div>' },
      ],
    },
    spanish: {
      line: 'Spanish words and expressions from A1 to C2, straight from the Cervantes curriculum. <a href="spanish/">Explore &rarr;</a>',
      widget: `
        <div class="wchip"><span class="dot"></span>CEFR A2</div>
        <div class="whanzi" lang="es">luna</div>
        <div class="whint">Tap for the meaning</div>`,
      floats: [
        { cls: 'f1', html: '<div class="fh" lang="es">agua</div><div class="fm">water</div>' },
        { cls: 'f2', html: '<div class="fh" lang="es">puerta</div><div class="fm">door</div>' },
        { cls: 'f3', html: '<div class="fh" lang="es">música</div><div class="fm">music</div>' },
      ],
    },
  };
  const ORDER = ['trivia', 'chinese', 'japanese', 'arabic', 'korean', 'spanish'];

  const layers = hero.querySelectorAll('.wall-layer');
  const tabs = hero.querySelectorAll('.w-tab');
  const line = document.getElementById('worldLine');
  const lockword = document.getElementById('worldWidget');
  const floatWrap = document.getElementById('worldFloats');
  const phoneScreen = document.getElementById('worldScreen');
  let current = 'trivia';

  function paint(key) {
    const w = WORLDS[key];
    layers.forEach((l) => l.classList.toggle('on', l.dataset.app === key));
    tabs.forEach((t) => t.classList.toggle('on', t.dataset.app === key));
    [phoneScreen, lockword, floatWrap, line].forEach((el) => (el.dataset.app = key));
    lockword.innerHTML = w.widget;
    floatWrap.innerHTML = w.floats
      .map((f) => `<div class="float-card ${f.cls}">${f.html}</div>`)
      .join('');
    line.innerHTML = w.line;
  }

  function go(key) {
    if (key === current) return;
    current = key;
    [lockword, floatWrap, line].forEach((el) => el.classList.add('fade'));
    setTimeout(() => {
      paint(key);
      [lockword, floatWrap, line].forEach((el) => el.classList.remove('fade'));
    }, 320);
  }

  paint(current);

  // Gently cycle worlds until the visitor takes the wheel.
  let auto = setInterval(() => {
    go(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);
  }, 6000);

  tabs.forEach((t) =>
    t.addEventListener('click', () => {
      clearInterval(auto);
      go(t.dataset.app);
    })
  );
})();
