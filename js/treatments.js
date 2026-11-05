// Treatments page: the 5-Layer Lift, the directory board, the concierge and promotions.
import { CATS, SERVICES, SERVICE_SKIP, FLOORS, PROMOS } from './data.js';
import { LANG, t, pick } from './i18n.js';
import { $, $$, esc, sendToLine } from './core.js';
import { mountElevator } from './elevator.js';
import { mountConcierge } from './concierge.js';
import { wp, media, text } from './wp.js';

mountElevator();
mountConcierge();

$('#placards').innerHTML = PROMOS.map((p) => `
  <a class="placard" href="${p.url}">
    <p class="placard-kicker">${t('specialsKicker')}</p>
    <h3>${pick(p, 'title')}</h3>
    <p class="price"><small>${pick(p, 'unit')}</small>${p.price}<span>${t('baht')}</span></p>
    <p class="n">${pick(p, 'note')}</p>
  </a>`).join('');

/* ---------- directory board ---------- */
const board = $('#letterboard');
const card = $('#roomCard');
const narrow = matchMedia('(max-width: 900px)');
let services = [...SERVICES];
let current = null;

const catName = (c) => (LANG === 'en' ? c.en : c.th);
const floorTag = (s) => (s.floor ? t('dirFloor', { n: s.floor }) : s.cat === 'lift' ? t('dirNoFloor') : '');

function renderBoard() {
  const cats = [...CATS];
  if (services.some((s) => s.cat === 'new')) cats.push({ id: 'new', en: t('newFromSite'), th: t('newFromSite') });
  board.innerHTML = cats.map((c) => {
    const rows = services.filter((s) => s.cat === c.id);
    if (!rows.length) return '';
    return `<div class="lb-group" data-cat="${c.id}">
      <h3 class="lb-cat">${esc(catName(c))}</h3>
      <ul>${rows.map((s) => `<li><button type="button" class="lb-row" data-id="${s.id}" aria-pressed="false" aria-controls="roomCard"><span class="lb-name">${esc(s.name)}</span><span class="lb-dots" aria-hidden="true"></span><span class="lb-floor">${floorTag(s)}</span></button></li>`).join('')}</ul>
    </div>`;
  }).join('');
}

function renderCard(s) {
  const f = FLOORS.find((x) => x.n === s.floor);
  const cat = CATS.find((c) => c.id === s.cat);
  const layers = [1, 2, 3, 4, 5].map((n) => `<i class="${n === s.floor ? 'on' : ''}"></i>`).join('');
  card.innerHTML = `
    <div class="rc-img">${s.img ? `<img src="${esc(s.img)}" alt="" width="768" height="768" loading="lazy">` : ''}</div>
    <div class="rc-body">
      <p class="rc-cat">${esc(cat ? catName(cat) : t('newFromSite'))}</p>
      <h3>${esc(s.name)}</h3>
      <p class="rc-desc">${esc(LANG === 'en' ? s.en : s.th)}</p>
      <div class="rc-layer"><span class="rc-bars" aria-hidden="true">${layers}</span><span><b>${t('layerLabel')}</b> ${f ? `${t('dirFloor', { n: f.n })}, ${esc(LANG === 'en' ? f.en : f.th)}` : t('layerNone')}</span></div>
      <div class="rc-actions">
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
  if (!s) return;
  current = s;
  $$('.lb-row', board).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === String(id))));
  renderCard(s);
  // On phones the card opens right under the row you tapped.
  const row = $(`.lb-row[data-id="${s.id}"]`, board);
  if (narrow.matches && row) { row.parentElement.after(card); if (scroll) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  else if (card.parentElement !== $('.dir-wrap')) $('.dir-wrap').appendChild(card);
}

board.addEventListener('click', (e) => { const b = e.target.closest('.lb-row'); if (b) select(b.dataset.id, { scroll: true }); });
board.addEventListener('mouseover', (e) => { const b = e.target.closest('.lb-row'); if (b && !narrow.matches) select(b.dataset.id); });
narrow.addEventListener('change', () => current && select(current.id));

$('#dirQ').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  let shown = 0;
  $$('.lb-row', board).forEach((b) => {
    const s = services.find((x) => String(x.id) === b.dataset.id);
    const hit = !q || `${s.name} ${s.en} ${s.th}`.toLowerCase().includes(q);
    b.parentElement.hidden = !hit; if (hit) shown++;
  });
  $$('.lb-group', board).forEach((g) => { g.hidden = !g.querySelector('li:not([hidden])'); });
  $('#dirNone').hidden = shown > 0;
});

renderBoard();
select(SERVICES[0].id);

// Anything the clinic adds in WordPress later shows up under "New on the website".
const known = new Set([...SERVICES.map((s) => s.id), ...SERVICE_SKIP]);
wp('service', { per_page: 100, _embed: 'wp:featuredmedia' }).then(({ items }) => {
  const fresh = items.filter((x) => !known.has(x.id)).map((x) => ({
    id: x.id, cat: 'new', floor: 0, name: text(x.title.rendered), en: t('thaiOnly'), th: '', url: x.link, img: media(x),
  }));
  if (!fresh.length) return;
  services = [...services, ...fresh];
  renderBoard();
  if (current) select(current.id);
}).catch(() => {});
