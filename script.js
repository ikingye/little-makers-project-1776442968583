const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const restartBtn = document.getElementById('restartBtn');
let board = [];
let score = 0;
let best = Number(localStorage.getItem('maker-2048-best') || '0');

function render() {
  scoreEl.textContent = String(score);
  bestEl.textContent = String(best);
  boardEl.innerHTML = '';
  board.forEach(value => {
    const tile = document.createElement('div');
    tile.className = 'tile ' + (value ? 'tile-' + value : '');
    tile.textContent = value || '';
    boardEl.appendChild(tile);
  });
}

function emptyBoard() {
  return Array.from({ length: 16 }, () => 0);
}

function randomEmptyIndex(list) {
  const empty = list.map((value, index) => value === 0 ? index : -1).filter(index => index >= 0);
  return empty.length ? empty[Math.floor(Math.random() * empty.length)] : -1;
}

function spawn(list) {
  const index = randomEmptyIndex(list);
  if (index >= 0) list[index] = Math.random() < 0.9 ? 2 : 4;
}

function reset() {
  board = emptyBoard();
  score = 0;
  spawn(board);
  spawn(board);
  render();
}

function merge(line) {
  const compact = line.filter(Boolean);
  const merged = [];
  for (let i = 0; i < compact.length; i += 1) {
    if (compact[i] === compact[i + 1]) {
      const value = compact[i] * 2;
      merged.push(value);
      score += value;
      i += 1;
    } else {
      merged.push(compact[i]);
    }
  }
  while (merged.length < 4) merged.push(0);
  return merged;
}

function move(dir) {
  const next = [...board];
  let changed = false;
  const readLine = line => {
    if (dir === 'left' || dir === 'right') {
      const row = next.slice(line * 4, line * 4 + 4);
      return dir === 'right' ? row.reverse() : row;
    }
    const col = [next[line], next[line + 4], next[line + 8], next[line + 12]];
    return dir === 'down' ? col.reverse() : col;
  };
  const writeLine = (line, values) => {
    const normalized = (dir === 'right' || dir === 'down') ? [...values].reverse() : values;
    normalized.forEach((value, index) => {
      const pos = (dir === 'left' || dir === 'right') ? line * 4 + index : line + index * 4;
      if (next[pos] !== value) changed = true;
      next[pos] = value;
    });
  };
  for (let line = 0; line < 4; line += 1) writeLine(line, merge(readLine(line)));
  if (!changed) return;
  spawn(next);
  board = next;
  best = Math.max(best, score, ...board);
  localStorage.setItem('maker-2048-best', String(best));
  render();
}

restartBtn.addEventListener('click', reset);
document.querySelectorAll('[data-dir]').forEach(button => button.addEventListener('click', () => move(button.dataset.dir)));
window.addEventListener('keydown', event => {
  const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
  const dir = map[event.key];
  if (dir) move(dir);
});
reset();