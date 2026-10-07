(() => {
  const puzzles = [
    { word: 'ชอบ', clue: 'คำที่บอกความรู้สึกดี ๆ', hint: 'ใช้เมื่อรู้สึกถูกใจ' },
    { word: 'น้อง', clue: 'คำเรียกคนที่อายุน้อยกว่า', hint: 'คนพิเศษของพี่' },
    { word: 'มิน', clue: 'ชื่อคนพิเศษของเรา', hint: 'มี 3 ตัวอักษร' },
    { word: 'ชอบน้องมิน', clue: 'ประโยคพิเศษที่อยากบอก', hint: 'เรียงคำว่า ชอบ น้อง และ มิน ให้ติดกัน' }
  ];
  const $ = (id) => document.getElementById(id);
  const ui = { score: $('score'), streak: $('streak'), level: $('level-pill'), progress: $('progress-fill'), clue: $('clue'), hint: $('hint-text'), answer: $('answer-zone'), bank: $('letter-bank'), message: $('message'), modal: $('win-modal'), final: $('final-score'), winCopy: $('win-copy') };
  let current = 0, score = 0, streak = 0, picked = [], letters = [], hintShown = false, locked = false;
  const shuffle = (items) => items.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value);
  const chars = (word) => Array.from(word).filter(char => char !== ' ');
  function render() {
    const puzzle = puzzles[current];
    const target = chars(puzzle.word);
    if (!letters.length) letters = shuffle(target.map((char, index) => ({ char, index, used: false })));
    ui.level.textContent = `ด่าน ${current + 1} / ${puzzles.length}`;
    ui.progress.style.width = `${((current + 1) / puzzles.length) * 100}%`;
    ui.clue.textContent = puzzle.clue;
    ui.hint.textContent = hintShown ? `คำใบ้: ${puzzle.hint}` : 'คำใบ้: แตะปุ่มหลอดไฟเมื่อต้องการตัวช่วย';
    ui.score.textContent = score;
    ui.streak.textContent = streak;
    ui.answer.innerHTML = target.map((_, slot) => `<button class="answer-slot ${picked[slot] !== undefined ? 'filled' : ''}" data-slot="${slot}" aria-label="ลบตัวอักษรช่อง ${slot + 1}">${picked[slot] ?? ''}</button>`).join('');
    ui.bank.innerHTML = letters.map((letter, index) => `<button class="letter" data-index="${index}" ${letter.used || locked ? 'disabled' : ''}>${letter.char}</button>`).join('');
    ui.answer.querySelectorAll('.filled').forEach(button => button.addEventListener('click', () => removeLetter(Number(button.dataset.slot))));
    ui.bank.querySelectorAll('.letter').forEach(button => button.addEventListener('click', () => chooseLetter(Number(button.dataset.index))));
  }
  function say(text, type = '') { ui.message.textContent = text; ui.message.className = `message ${type}`; }
  function chooseLetter(index) { if (locked || letters[index].used) return; letters[index].used = true; picked.push(letters[index].char); render(); if (picked.length === chars(puzzles[current].word).length) check(); }
  function removeLetter(slot) { if (locked) return; const letter = picked[slot]; const item = letters.find(x => x.char === letter && x.used); if (item) item.used = false; picked.splice(slot, 1); say('ลองเรียงใหม่ได้นะ ♡'); render(); }
  function check() {
    const correct = picked.join('') === chars(puzzles[current].word).join('');
    if (!correct) { streak = 0; say('เกือบแล้ว ลองสลับดูอีกนิดนะ', 'error'); setTimeout(() => { picked = []; letters.forEach(x => x.used = false); render(); }, 700); return; }
    locked = true; streak += 1; score += hintShown ? 10 : 20; say('ถูกต้องแล้ว! เก่งมากกก ✨', 'success'); render(); setTimeout(nextPuzzle, 900);
  }
  function nextPuzzle() {
    current += 1;
    if (current >= puzzles.length) { ui.final.textContent = score; ui.winCopy.textContent = `เธอพิชิตครบ ${puzzles.length} คำ และมี streak สวย ๆ แล้ว!`; ui.modal.classList.remove('hidden'); return; }
    picked = []; letters = []; hintShown = false; locked = false; say('แตะตัวอักษรเพื่อเรียงคำให้ถูกนะ ♡'); render();
  }
  $('hint-button').addEventListener('click', () => { if (!hintShown) { hintShown = true; say('คำใบ้มาแล้ว ใช้คะแนนน้อยลงนิดนึงนะ 💡'); render(); } });
  $('reset-button').addEventListener('click', () => { if (locked) return; picked = []; letters.forEach(x => x.used = false); say('เริ่มเรียงใหม่ได้เลย ✨'); render(); });
  $('play-again').addEventListener('click', () => { current = score = streak = 0; picked = []; letters = []; hintShown = locked = false; ui.modal.classList.add('hidden'); say('แตะตัวอักษรเพื่อเรียงคำให้ถูกนะ ♡'); render(); });
  render();
})();
