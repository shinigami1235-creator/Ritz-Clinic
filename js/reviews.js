// Reviews page: the Friend of The Ritz wall and the before-and-after mirror.
import { REVIEWS } from './data.js';
import { LANG, t, pick } from './i18n.js';
import { $, $$, esc } from './core.js';
import { wp, media, text } from './wp.js';

let reviews = [...REVIEWS];
let filter = '';

function render() {
  const programs = [...new Set(reviews.map((r) => r.program))];
  $('#wallFilter').innerHTML = [`<button type="button" data-p="" aria-pressed="${!filter}">${t('rAll')}</button>`]
    .concat(programs.map((p) => `<button type="button" data-p="${esc(p)}" aria-pressed="${p === filter}">${esc(p)}</button>`)).join('');
  $('#wall').innerHTML = reviews.filter((r) => !filter || r.program === filter).map((r) => `
    <li class="note-card">
      <img src="${esc(r.img)}" alt="" width="300" height="300" loading="lazy">
      <div class="note-body">
        <p class="note-program">${esc(r.program)}</p>
        <blockquote>${esc(pick(r, 'text'))}</blockquote>
        <p class="note-who">${esc(pick(r, 'who'))}</p>
      </div>
    </li>`).join('');
}
render();
$('#wallFilter').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  filter = b.dataset.p; render();
});

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

/* ---------- vanity mirror ---------- */
const mirror = $('#mirror');
const range = $('#mirrorRange');
const set = (v) => mirror.style.setProperty('--cut', v + '%');
range.addEventListener('input', () => set(range.value));
set(range.value);
// Let the handle follow a finger or mouse anywhere on the glass.
mirror.addEventListener('pointerdown', (e) => {
  const move = (ev) => {
    const r = mirror.getBoundingClientRect();
    const v = Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100));
    range.value = v; set(v);
  };
  move(e);
  mirror.setPointerCapture(e.pointerId);
  mirror.addEventListener('pointermove', move);
  mirror.addEventListener('pointerup', () => mirror.removeEventListener('pointermove', move), { once: true });
});
// bulbs around the mirror
const bulbs = [];
for (let i = 0; i < 7; i++) bulbs.push([10 + i * 80 / 6, 0]);
for (let i = 0; i < 5; i++) { const y = 18 + i * 74 / 4; bulbs.push([0, y], [100, y]); }
$('.bulbs').innerHTML = bulbs.map(([x, y], i) => `<i style="left:${x}%;top:${y}%;--d:${(i % 5) * 0.4}s"></i>`).join('');
