// Reviews page: the Friends of The Ritz guest register and every before-and-after result at the mirror.
import { REVIEWS } from './data.js';
import { REVIEW_PHOTOS } from './media.js';
import { t, pick } from './i18n.js';
import { $, esc, ritzSay } from './core.js';
import { mountMirror } from './mirror.js';
import { wp, media, text } from './wp.js';

let reviews = [...REVIEWS];
let filter = '';

// The guest register: one large guest card at a time, the next two waiting in the stack behind.
// Swipe or drag the top card away, use the arrows or keys, or tap a face in the row below.
let at = 0;
const list = () => reviews.filter((r) => !filter || r.program === filter);
const photo = (r) => REVIEW_PHOTOS[r.id] || r.img;

function render() {
  const programs = [...new Set(reviews.map((r) => r.program))];
  $('#wallFilter').innerHTML = [`<button type="button" data-p="" aria-pressed="${!filter}">${t('rAll')}</button>`]
    .concat(programs.map((p) => `<button type="button" data-p="${esc(p)}" aria-pressed="${p === filter}">${esc(p)}</button>`)).join('');
  const L = list(); at = Math.min(at, L.length - 1);
  $('#wall').innerHTML = `
    <div class="gc-stack" aria-roledescription="carousel" aria-label="${esc(t('rTitle'))}">
      ${L.map((r, i) => `
      <article class="gcard" data-i="${i}" aria-roledescription="slide" aria-label="${i + 1} / ${L.length}">
        <div class="gc-photo"><img src="${esc(photo(r))}" alt="${esc(pick(r, 'who'))}" loading="${i < 3 ? 'eager' : 'lazy'}" draggable="false"></div>
        <div class="gc-paper">
          <p class="gc-head"><span>THE RITZ CLINIC</span><span>${t('rCardNo', { n: String(i + 1).padStart(2, '0') })}</span></p>
          <p class="gc-program">${esc(r.program)}</p>
          <blockquote>${esc(pick(r, 'text'))}</blockquote>
          <p class="gc-sign"><small>${t('rSigned')}</small>${esc(pick(r, 'who'))}</p>
          <img class="gc-seal" src="assets/brand/r-mark.svg" alt="">
        </div>
      </article>`).join('')}
    </div>
    <div class="gc-nav">
      <button type="button" class="gc-prev" aria-label="${esc(t('prev'))}">‹</button>
      <ol class="gc-faces">${L.map((r, i) => `<li><button type="button" data-go="${i}" aria-label="${esc(pick(r, 'who'))}"><img src="${esc(photo(r))}" alt="" loading="lazy"></button></li>`).join('')}</ol>
      <button type="button" class="gc-next" aria-label="${esc(t('next'))}">›</button>
    </div>`;
  place();
}
function place() {
  const L = list(), cards = [...document.querySelectorAll('.gcard')];
  cards.forEach((c, i) => {
    const d = (i - at + L.length) % L.length;               // 0 on top, then the cards waiting behind
    c.style.setProperty('--d', Math.min(d, 3));
    c.classList.toggle('top', d === 0);
    c.setAttribute('aria-hidden', String(d !== 0));
    c.style.zIndex = String(50 - d);
  });
  document.querySelectorAll('.gc-faces button').forEach((b, i) => b.setAttribute('aria-current', String(i === at)));
  document.querySelector('.gc-faces [aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
}
function step(d) {
  const L = list(); if (L.length < 2) return;
  const top = document.querySelector('.gcard.top');
  if (top && d > 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    top.classList.add('away'); top.style.removeProperty('--dx');
    setTimeout(() => top.classList.remove('away'), 650);
  }
  at = (at + d + L.length) % L.length; place(); ritzSay('review');
}
render();
$('#wallFilter').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  filter = b.dataset.p; at = 0; render(); ritzSay('review');
});
$('#wall').addEventListener('click', (e) => {
  if (e.target.closest('.gc-next')) step(1);
  else if (e.target.closest('.gc-prev')) step(-1);
  else { const g = e.target.closest('[data-go]'); if (g) { at = +g.dataset.go; place(); } }
});
$('#wall').addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
// drag the top card: it follows the finger and tilts; let go past a third of its width to send it on
let drag = null;
$('#wall').addEventListener('pointerdown', (e) => {
  const c = e.target.closest('.gcard.top'); if (!c) return;
  drag = { c, x: e.clientX, w: c.offsetWidth }; c.setPointerCapture(e.pointerId); c.classList.add('dragging');
});
$('#wall').addEventListener('pointermove', (e) => { if (drag) drag.c.style.setProperty('--dx', `${e.clientX - drag.x}px`); });
const drop = (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, c = drag.c; drag = null; c.classList.remove('dragging');
  if (Math.abs(dx) > c.offsetWidth / 3) { c.style.setProperty('--fly', dx > 0 ? 1 : -1); step(1); setTimeout(() => c.style.removeProperty('--fly'), 650); }
  else c.style.removeProperty('--dx');
};
$('#wall').addEventListener('pointerup', drop);
$('#wall').addEventListener('pointercancel', drop);

mountMirror($('[data-mirror]'), { thumbs: 80 });

// New reviews added in WordPress appear at the top, in Thai until someone translates them.
const known = new Set(REVIEWS.map((r) => r.id));
Promise.all([wp('review_slider', { per_page: 100, _embed: 'wp:featuredmedia' }), wp('review_cat', { per_page: 100 })]).then(([rv, rc]) => {
  const cats = Object.fromEntries(rc.items.map((c) => [c.id, text(c.name)]));
  const fresh = rv.items.filter((x) => !known.has(x.id)).map((x) => ({
    id: x.id, program: cats[x.review_cat?.[0]] || 'THE RITZ', who: text(x.title.rendered), text: text(x.content.rendered), img: media(x, 'medium'),
  }));
  if (!fresh.length) return;
  reviews = [...fresh, ...reviews];
  render();
}).catch(() => {});
