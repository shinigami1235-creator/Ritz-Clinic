// Doctors on duty: a flip board of branches for the chosen day of the week.
import { BRANCHES, SCHEDULE } from './data.js';
import { t } from './i18n.js';
import { $, bname, doctors, todayIdx, flip } from './core.js';

export function mountDuty() {
  const daysEl = $('#days'); const board = $('#dutyBoard');
  if (!board) return;
  const DAYS = t('days');
  let day = todayIdx();
  daysEl.innerHTML = DAYS.map((d, i) => `<button type="button" role="tab" data-d="${i}" aria-selected="${i === day}">${d}${i === todayIdx() ? t('today') : ''}</button>`).join('');
  board.innerHTML = BRANCHES.map((b) => `<div class="duty-row" data-id="${b.id}"><div class="tile k"><span class="face">${bname(b)}</span></div><div class="tile d"><span class="face"></span></div></div>`).join('');
  function render(animate) {
    [...board.children].forEach((row, i) => {
      const list = SCHEDULE[row.dataset.id][day];
      const tile = row.children[1];
      const apply = () => { tile.firstChild.textContent = doctors(list); tile.classList.toggle('off', !list.length); };
      animate ? flip(tile, apply, i * 45) : apply();
    });
  }
  render(false);
  daysEl.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    day = +b.dataset.d;
    [...daysEl.children].forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    render(true);
  });
}
