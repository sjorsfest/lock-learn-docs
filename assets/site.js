/* Lock&Learn site behaviors: reveal-on-scroll everywhere, and the
   world switcher on the family page (crossfades the hero between the
   three app worlds and rewrites the phone's lock-screen widget). */

(function () {
  // ---- reveal on scroll -------------------------------------------------
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // ---- hero world switcher (index only) --------------------------------
  const hero = document.getElementById('worldHero');
  if (!hero) return;

  const dot = '<span class="dot"></span>';
  const tapHint = (txt) => `
    <div class="whint">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M9 4 v8 M9 12 c0 3 2 4 4 4 h3" stroke="white" stroke-width="2" stroke-linecap="round" opacity=".8"/>
        <path d="M14 13 l3 3 l-3 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".8"/>
      </svg>${txt}
    </div>`;

  const WORLDS = {
    trivia: {
      line: 'A trivia question waits on your widget. Guess, tap, and the verified fact behind the answer appears. <a href="trivia/">Explore Lock&amp;Learn &rarr;</a>',
      widget: `
        <div class="wchip">${dot}SPACE</div>
        <div class="wq">On which planets does it rain diamonds?</div>
        ${tapHint('Tap to reveal the answer')}`,
      floats: [
        { cls: 'f1', html: '<div class="fq">Which sea creature has three hearts?</div><div class="fm">OCEAN</div>' },
        { cls: 'f2', html: '<div class="fq">How long is a day on Venus?</div><div class="fm">SPACE</div>' },
        { cls: 'f3', html: '<div class="fq">Which muscle never rests?</div><div class="fm">HUMAN BODY</div>' },
      ],
    },
    chinese: {
      line: 'The full HSK syllabus, one glance at a time. Pinyin on the question, meaning on the tap. <a href="chinese/">Explore Lock&amp;Learn Chinese &rarr;</a>',
      widget: `
        <div class="wchip">${dot}HSK 1</div>
        <div class="whanzi">电影</div>
        <div class="wreading">diàn yǐng</div>
        ${tapHint('Tap for the meaning')}`,
      floats: [
        { cls: 'f1', html: '<div class="fh">下雨</div><div class="fr">xià yǔ</div><div class="fm">to rain</div>' },
        { cls: 'f2', html: '<div class="fh">医生</div><div class="fr">yīshēng</div><div class="fm">doctor</div>' },
        { cls: 'f3', html: '<div class="fh">不客气</div><div class="fr">bù kèqì</div><div class="fm">you’re welcome</div>' },
      ],
    },
    japanese: {
      line: 'JLPT vocabulary at a glance. The kanji shows first; the reading and meaning arrive on the tap, the way the test asks. <a href="japanese/">Explore Lock&amp;Learn Japanese &rarr;</a>',
      widget: `
        <div class="wchip">${dot}JLPT N5</div>
        <div class="whanzi">自転車</div>
        ${tapHint('Tap for the reading & meaning')}`,
      floats: [
        { cls: 'f1', html: '<div class="fh">水</div><div class="fr">みず</div><div class="fm">water</div>' },
        { cls: 'f2', html: '<div class="fh">天気</div><div class="fr">てんき</div><div class="fm">weather</div>' },
        { cls: 'f3', html: '<div class="fh">友達</div><div class="fr">ともだち</div><div class="fm">friend</div>' },
      ],
    },
  };
  const ORDER = ['trivia', 'chinese', 'japanese'];

  const layers = hero.querySelectorAll('.wall-layer');
  const chips = hero.querySelectorAll('.world-chip');
  const line = document.getElementById('worldLine');
  const lockword = document.getElementById('worldWidget');
  const floatWrap = document.getElementById('worldFloats');
  const phoneScreen = document.getElementById('worldScreen');
  let current = 'trivia';

  function paint(key) {
    const w = WORLDS[key];
    layers.forEach((l) => l.classList.toggle('on', l.dataset.app === key));
    chips.forEach((c) => c.classList.toggle('on', c.dataset.app === key));
    phoneScreen.dataset.app = key;
    lockword.dataset.app = key;
    floatWrap.dataset.app = key;
    line.dataset.app = key;
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
  layers.forEach((l) => l.classList.toggle('on', l.dataset.app === current));

  // Gently cycle worlds until the visitor takes the wheel.
  let auto = setInterval(() => {
    go(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);
  }, 5200);

  chips.forEach((c) =>
    c.addEventListener('click', () => {
      clearInterval(auto);
      auto = null;
      go(c.dataset.app);
    })
  );
})();
