// Shared helpers for every page: language, Bangkok time, the Dr. Ritz buddy, reveals and gold dust.
import { DOCTOR_EN, LINE_URL } from './data.js';
import { RENDERS } from './media.js';
import { LANG, t, applyStatic } from './i18n.js';
import { ritzSay } from './ritz-buddy.js';

export { ritzSay };
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

/* the render for a treatment: a cut-out product, or a photo when the clinic's picture shows a treatment */
export function renderOf(id) { return RENDERS[id] || null; }
export function renderImg(id, cls = '') {
  const r = renderOf(id); if (!r) return '';
  return r.kind === 'product' ? `<img class="prod ${cls}" src="${r.src}" alt="" loading="lazy">` : `<img class="ph ${cls}" src="${r.src}" alt="" loading="lazy">`;
}

/* flip-board tile: swap the text halfway through the flip */
export function flip(tile, apply, delay = 0) {
  if (reduced) return apply();
  setTimeout(() => {
    tile.classList.remove('flip'); void tile.offsetWidth; tile.classList.add('flip');
    setTimeout(apply, 220);
  }, delay);
}

/* copy a message, then open the clinic's LINE chat */
export async function sendToLine(text, statusEl) {
  try { await navigator.clipboard.writeText(text); if (statusEl) statusEl.textContent = t('copied'); }
  catch { if (statusEl) statusEl.textContent = text; }
  ritzSay('sent');
  window.open(LINE_URL, '_blank', 'noopener');
}

/* reveal sections as they scroll in */
export function reveal(root = document) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal:not(.in)', root).forEach((el) => io.observe(el));
}

/* drifting gold dust behind the dark headers */
function dust(canvas) {
  if (reduced) return;
  const ctx = canvas.getContext('2d');
  let w, h, dots;
  const size = () => {
    const r = canvas.parentElement.getBoundingClientRect(); w = canvas.width = r.width; h = canvas.height = r.height;
    dots = Array.from({ length: Math.round(w / 18) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + 0.4, s: Math.random() * 0.25 + 0.05, a: Math.random() * Math.PI * 2 }));
  };
  size(); addEventListener('resize', size);
  let on = true;
  new IntersectionObserver((es) => { on = es[0].isIntersecting; }).observe(canvas);
  (function tick() {
    requestAnimationFrame(tick); if (!on) return;
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      d.y -= d.s; d.a += 0.01; d.x += Math.sin(d.a) * 0.15;
      if (d.y < -4) { d.y = h + 4; d.x = Math.random() * w; }
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7);
      ctx.fillStyle = `rgba(240,214,150,${0.25 + 0.35 * Math.abs(Math.sin(d.a))})`; ctx.fill();
    }
  })();
}

/* boot: runs on every page */
applyStatic();
$$('.page-sign, .lobby').forEach((el) => { const c = document.createElement('canvas'); c.className = 'dust'; el.prepend(c); dust(c); });
reveal();
