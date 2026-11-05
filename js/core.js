// Shared helpers for every page: language, Bangkok time, chibi poses, LINE hand-off.
import { DOCTOR_EN, LINE_URL } from './data.js';
import { LANG, t, applyStatic } from './i18n.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const bname = (b) => (LANG === 'en' ? b.en : b.th);

export function bangkokNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
}
export const todayIdx = () => (bangkokNow().getDay() + 6) % 7; // Monday = 0
export const hhmm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
const minutes = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
export function isOpen(b) {
  const d = bangkokNow(); const now = d.getHours() * 60 + d.getMinutes();
  return now >= minutes(b.open) && now < minutes(b.close);
}
export const drName = (n) => t('dr') + (LANG === 'en' ? DOCTOR_EN[n] || n : n);
export const doctors = (list) => (list.length ? list.map(drName).join(', ') : t('noDoctor'));

/* flip-board tile: swap the text halfway through the flip */
export function flip(tile, apply, delay = 0) {
  if (reduced) return apply();
  setTimeout(() => {
    tile.classList.remove('flip'); void tile.offsetWidth; tile.classList.add('flip');
    setTimeout(apply, 220);
  }, delay);
}

/* chibi Dr. Ritz */
export const pose = (p) => new URL(`../assets/chibi/${p}.webp`, import.meta.url).href;
export function mountChibi(el) {
  const img = document.createElement('img');
  img.alt = ''; img.src = pose(el.dataset.pose); img.decoding = 'async';
  el.appendChild(img);
  el._img = img;
  el.setPose = (p) => { el.dataset.pose = p; img.src = pose(p); };
}
export function blinkLoop(el) {
  if (reduced) return;
  setInterval(() => {
    if (el.dataset.pose !== 'stand') return;
    el._img.src = pose('blink');
    setTimeout(() => { if (el.dataset.pose === 'stand') el._img.src = pose('stand'); }, 150);
  }, 3800 + Math.random() * 1200);
}

/* copy a message, then open the clinic's LINE chat */
export async function sendToLine(text, statusEl) {
  try { await navigator.clipboard.writeText(text); if (statusEl) statusEl.textContent = t('copied'); }
  catch { if (statusEl) statusEl.textContent = text; }
  window.open(LINE_URL, '_blank', 'noopener');
}

/* boot: runs on every page */
applyStatic();
$$('.chibi').forEach(mountChibi);
const fl = $('.float-line');
if (fl && !reduced) setTimeout(() => { fl.classList.add('hello'); setTimeout(() => fl.classList.remove('hello'), 3500); }, 3500);
