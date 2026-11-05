// Reviews page: the Friend of The Ritz wall and every before-and-after result at the mirror.
import { REVIEWS } from './data.js';
import { REVIEW_PHOTOS } from './media.js';
import { t, pick } from './i18n.js';
import { $, esc, ritzSay } from './core.js';
import { mountMirror } from './mirror.js';
import { wp, media, text } from './wp.js';

let reviews = [...REVIEWS];
let filter = '';

function render() {
  const programs = [...new Set(reviews.map((r) => r.program))];
  $('#wallFilter').innerHTML = [`<button type="button" data-p="" aria-pressed="${!filter}">${t('rAll')}</button>`]
    .concat(programs.map((p) => `<button type="button" data-p="${esc(p)}" aria-pressed="${p === filter}">${esc(p)}</button>`)).join('');
  $('#wall').innerHTML = reviews.filter((r) => !filter || r.program === filter).map((r) => `
    <li class="note-card glass">
      <img src="${esc(REVIEW_PHOTOS[r.id] || r.img)}" alt="" width="92" height="92" loading="lazy">
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
  filter = b.dataset.p; render(); ritzSay('review');
});

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
