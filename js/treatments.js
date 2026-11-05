// Treatments page: programmes, showroom, the 5-Layer Lift, the directory board with its
// lit pedestal, the concierge and promotions.
import { CATS, SERVICES, SERVICE_SKIP, FLOORS } from './data.js';
import { CAT_BANNERS } from './media.js';
import { LANG, t } from './i18n.js';
import { $, $$, esc, sendToLine, renderOf, ritzSay, reduced } from './core.js';
import { mountElevator } from './elevator.js';
import { mountConcierge } from './concierge.js';
import { mountShelf } from './showroom.js';
import { mountPromos } from './promos.js';
import { wp, media, text } from './wp.js';

mountElevator();
mountConcierge();
mountShelf($('#shelf'));
mountPromos($('#placards'));

const catName = (c) => (LANG === 'en' ? c.en : c.th);

/* ---------- programmes: the clinic's own category banners ---------- */
$('#programs').innerHTML = CATS.filter((c) => CAT_BANNERS[c.id]).map((c) => `<button type="button" class="program" data-cat="${c.id}"><img src="${CAT_BANNERS[c.id]}" alt="" loading="lazy"><span>${esc(catName(c))}</span></button>`).join('');
$('#programs').addEventListener('click', (e) => {
  const b = e.target.closest('.program'); if (!b) return;
  const g = $(`.lb-group[data-cat="${b.dataset.cat}"]`);
  const first = SERVICES.find((s) => s.cat === b.dataset.cat);
  $('#directory').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  if (first) setTimeout(() => select(first.id), 400);
  g?.classList.add('flash'); setTimeout(() => g?.classList.remove('flash'), 1600);
});

/* ---------- directory board ---------- */
const board = $('#letterboard');
const card = $('#roomCard');
const narrow = matchMedia('(max-width: 900px)');
let services = [...SERVICES];
let current = null;
const floorTag = (s) => (s.floor ? t('dirFloor', { n: s.floor }) : s.cat === 'lift' ? t('dirNoFloor') : '');
const ico = (s) => { const r = s.render || renderOf(s.id); return r ? `<img class="${r.kind === 'product' ? '' : 'ph'}" src="${r.src}" alt="" loading="lazy">` : ''; };

function renderBoard() {
  const cats = [...CATS];
  if (services.some((s) => s.cat === 'new')) cats.push({ id: 'new', en: t('newFromSite'), th: t('newFromSite') });
  board.innerHTML = cats.map((c) => {
    const rows = services.filter((s) => s.cat === c.id);
    if (!rows.length) return '';
    return `<div class="lb-group" data-cat="${c.id}">
      <h3 class="lb-cat">${esc(catName(c))}</h3>
      <ul>${rows.map((s) => `<li><button type="button" class="lb-row" data-id="${s.id}" aria-pressed="false" aria-controls="roomCard"><span class="lb-ico">${ico(s)}</span><span class="lb-name">${esc(s.name)}</span><span class="lb-dots" aria-hidden="true"></span><span class="lb-floor">${floorTag(s)}</span></button></li>`).join('')}</ul>
    </div>`;
  }).join('');
}

function renderCard(s) {
  const f = FLOORS.find((x) => x.n === s.floor);
  const cat = CATS.find((c) => c.id === s.cat);
  const r = s.render || renderOf(s.id);
  const bars = [1, 2, 3, 4, 5].map((n) => `<i class="${n === s.floor ? 'on' : ''}"></i>`).join('');
  card.innerHTML = `
    <div class="pd-stage">${r ? (r.kind === 'product' ? `<img class="prod" src="${esc(r.src)}" alt="">` : `<img class="ph" src="${esc(r.src)}" alt="">`) : ''}</div>
    <div class="pd-body">
      <p class="pd-cat">${esc(cat ? catName(cat) : t('newFromSite'))}</p>
      <h3>${esc(s.name)}</h3>
      <p class="pd-desc">${esc(LANG === 'en' ? s.en : s.th)}</p>
      <div class="pd-layer"><span class="pd-bars" aria-hidden="true">${bars}</span><span><b>${t('layerLabel')}</b> ${f ? `${t('dirFloor', { n: f.n })}, ${esc(LANG === 'en' ? f.en : f.th)}` : t('layerNone')}</span></div>
      <div class="pd-actions">
        <a class="btn-gold" href="${esc(s.url)}">${t('readGuide')}</a>
        <button type="button" class="btn-ghost" id="rcAsk">${t('askThis')}</button>
      </div>
      <p class="copied" id="rcCopied" role="status"></p>
    </div>`;
  card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
  $('#rcAsk').addEventListener('click', () => sendToLine(t('lineMsg', { c: s.name, list: s.name }), $('#rcCopied')));
}

function select(id, { scroll = false } = {}) {
  const s = services.find((x) => String(x.id) === String(id));
  if (!s || s === current) return;
  current = s;
  $$('.lb-row', board).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === String(id))));
  renderCard(s);
  const row = $(`.lb-row[data-id="${s.id}"]`, board);
  if (narrow.matches && row) { row.parentElement.after(card); if (scroll) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  else if (card.parentElement !== $('.dir-wrap')) $('.dir-wrap').appendChild(card);
}

board.addEventListener('click', (e) => { const b = e.target.closest('.lb-row'); if (b) { current = null; select(b.dataset.id, { scroll: true }); } });
board.addEventListener('mouseover', (e) => { const b = e.target.closest('.lb-row'); if (b && !narrow.matches) select(b.dataset.id); });
narrow.addEventListener('change', () => { if (current) { const id = current.id; current = null; select(id); } });

// the product on the pedestal turns toward the pointer
card.addEventListener('pointermove', (e) => {
  const img = $('.pd-stage .prod', card); if (!img || reduced) return;
  const r = card.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
  img.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
});
card.addEventListener('pointerleave', () => { const img = $('.pd-stage .prod', card); if (img) img.style.transform = ''; });

$('#dirQ').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  let shown = 0, firstHit = null;
  $$('.lb-row', board).forEach((b) => {
    const s = services.find((x) => String(x.id) === b.dataset.id);
    const hit = !q || `${s.name} ${s.en} ${s.th}`.toLowerCase().includes(q);
    b.parentElement.hidden = !hit; if (hit) { shown++; firstHit = firstHit || s; }
  });
  $$('.lb-group', board).forEach((g) => { g.hidden = !g.querySelector('li:not([hidden])'); });
  $('#dirNone').hidden = shown > 0;
  if (q && firstHit) { select(firstHit.id); ritzSay('found'); } else if (q && !shown) ritzSay('nothing');
});

renderBoard();
select(SERVICES[0].id);

// Anything the clinic adds in WordPress later shows up under "New on the website".
const known = new Set([...SERVICES.map((s) => s.id), ...SERVICE_SKIP]);
wp('service', { per_page: 100, _embed: 'wp:featuredmedia', _fields: 'id,title,link,_links,_embedded' }).then(({ items }) => {
  const fresh = items.filter((x) => !known.has(x.id)).map((x) => ({
    id: x.id, cat: 'new', floor: 0, name: text(x.title.rendered), en: t('thaiOnly'), th: '', url: x.link, render: media(x) ? { kind: 'photo', src: media(x) } : null,
  }));
  if (!fresh.length) return;
  services = [...services, ...fresh];
  const id = current?.id; current = null;
  renderBoard(); if (id) select(id);
}).catch(() => {});
