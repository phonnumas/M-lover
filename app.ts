// TypeScript source for the word-order game. app.js is its browser-ready build.
type Puzzle = { word: string; clue: string; hint: string };
type Letter = { char: string; index: number; used: boolean };
type UI = Record<'score' | 'streak' | 'level' | 'progress' | 'clue' | 'hint' | 'answer' | 'bank' | 'message' | 'modal' | 'final' | 'winCopy', HTMLElement>;

const puzzles: Puzzle[] = [
  { word: 'ชอบ', clue: 'คำที่บอกความรู้สึกดี ๆ', hint: 'ใช้เมื่อรู้สึกถูกใจ' },
  { word: 'น้อง', clue: 'คำเรียกคนที่อายุน้อยกว่า', hint: 'คนพิเศษของพี่' },
  { word: 'มิน', clue: 'ชื่อคนพิเศษของเรา', hint: 'มี 3 ตัวอักษร' },
  { word: 'ชอบน้องมิน', clue: 'ประโยคพิเศษที่อยากบอก', hint: 'เรียงคำว่า ชอบ น้อง และ มิน ให้ติดกัน' },
];

const get = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const ui: UI = {
  score: get('score'), streak: get('streak'), level: get('level-pill'), progress: get('progress-fill'),
  clue: get('clue'), hint: get('hint-text'), answer: get('answer-zone'), bank: get('letter-bank'),
  message: get('message'), modal: get('win-modal'), final: get('final-score'), winCopy: get('win-copy'),
};

let current = 0;
let score = 0;
let streak = 0;
let picked: string[] = [];
let letters: Letter[] = [];
let hintShown = false;
let locked = false;

const chars = (word: string) => Array.from(word).filter(char => char !== ' ');
const shuffle = <T,>(items: T[]) => items.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value);
const say = (text: string, type = '') => { ui.message.textContent = text; ui.message.className = `message ${type}`; };

function render(): void {
  const puzzle = puzzles[current];
  const target = chars(puzzle.word);
  if (!letters.length) letters = shuffle(target.map((char, index) => ({ char, index, used: false })));
  ui.level.textContent = `ด่าน ${current + 1} / ${puzzles.length}`;
  ui.progress.style.width = `${((current + 1) / puzzles.length) * 100}%`;
  ui.clue.textContent = puzzle.clue;
  ui.hint.textContent = hintShown ? `คำใบ้: ${puzzle.hint}` : 'คำใบ้: แตะปุ่มหลอดไฟเมื่อต้องการตัวช่วย';
  ui.score.textContent = String(score);
  ui.streak.textContent = String(streak);
  ui.answer.innerHTML = target.map((_, slot) => `<button class="answer-slot ${picked[slot] !== undefined ? 'filled' : ''}" data-slot="${slot}">${picked[slot] ?? ''}</button>`).join('');
  ui.bank.innerHTML = letters.map((letter, index) => `<button class="letter" data-index="${index}" ${letter.used || locked ? 'disabled' : ''}>${letter.char}</button>`).join('');
  ui.answer.querySelectorAll<HTMLButtonElement>('.filled').forEach(button => button.addEventListener('click', () => removeLetter(Number(button.dataset.slot))));
  ui.bank.querySelectorAll<HTMLButtonElement>('.letter').forEach(button => button.addEventListener('click', () => chooseLetter(Number(button.dataset.index))));
}

function chooseLetter(index: number): void {
  if (locked || letters[index].used) return;
  letters[index].used = true;
  picked.push(letters[index].char);
  render();
  if (picked.length === chars(puzzles[current].word).length) check();
}

function removeLetter(slot: number): void {
  if (locked) return;
  const letter = picked[slot];
  const item = letters.find(entry => entry.char === letter && entry.used);
  if (item) item.used = false;
  picked.splice(slot, 1);
  say('ลองเรียงใหม่ได้นะ ♡');
  render();
}

function check(): void {
  if (picked.join('') !== chars(puzzles[current].word).join('')) {
    streak = 0;
    say('เกือบแล้ว ลองสลับดูอีกนิดนะ', 'error');
    window.setTimeout(() => { picked = []; letters.forEach(letter => letter.used = false); render(); }, 700);
    return;
  }
  locked = true;
  streak += 1;
  score += hintShown ? 10 : 20;
  say('ถูกต้องแล้ว! เก่งมากกก ✨', 'success');
  render();
  window.setTimeout(nextPuzzle, 900);
}

function nextPuzzle(): void {
  current += 1;
  if (current >= puzzles.length) {
    ui.final.textContent = String(score);
    ui.winCopy.textContent = `เธอพิชิตครบ ${puzzles.length} คำ และมี streak สวย ๆ แล้ว!`;
    ui.modal.classList.remove('hidden');
    return;
  }
  picked = []; letters = []; hintShown = false; locked = false;
  say('แตะตัวอักษรเพื่อเรียงคำให้ถูกนะ ♡');
  render();
}

get<HTMLButtonElement>('hint-button').addEventListener('click', () => { if (!hintShown) { hintShown = true; say('คำใบ้มาแล้ว ใช้คะแนนน้อยลงนิดนึงนะ 💡'); render(); } });
get<HTMLButtonElement>('reset-button').addEventListener('click', () => { if (!locked) { picked = []; letters.forEach(letter => letter.used = false); say('เริ่มเรียงใหม่ได้เลย ✨'); render(); } });
get<HTMLButtonElement>('play-again').addEventListener('click', () => { current = score = streak = 0; picked = []; letters = []; hintShown = locked = false; ui.modal.classList.add('hidden'); say('แตะตัวอักษรเพื่อเรียงคำให้ถูกนะ ♡'); render(); });
render();
