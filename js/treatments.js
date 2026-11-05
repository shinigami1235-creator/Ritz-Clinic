// Treatments page: programmes, showroom, the 5-Layer Lift, the directory board with its
// lit pedestal, the concierge and promotions.
import { CATS, SERVICES, SERVICE_SKIP, FLOORS } from './data.js';
import { CAT_BANNERS } from './media.js';
import { LANG, t } from './i18n.js';
import { $, $$, esc, sendToLine, renderOf, ritzSay, reduced } from './core.js';
import { mountElevator } from './elevator.js';
import { mountConcierge } from './concierge.js';
import { mountBooth } from './booth.js';
import { mountPromos } from './promos.js';
import { wp, media, text } from './wp.js';

mountElevator();
mountConcierge();
mountBooth($('#booth'));
mountPromos($('#placards'));

const catName = (c) => (LANG === 'en' ? c.en : c.th);
const narrow = matchMedia('(max-width: 900px)');

/* ---------- programmes: a corridor of eight panels. One stands open with its banner, its
   treatments and their machines; the rest are closed doors you can open. It moves on by
   itself every few seconds until someone touches it. ---------- */
const SHORT = { lift: ['Lifting', 'ยกกระชับ'], laser: ['Laser', 'เลเซอร์'], design: ['Facial design', 'ปรับรูปหน้า'], boost: ['Boosters', 'บำรุงผิว'], bio: ['Collagen', 'คอลลาเจน'], body: ['Body', 'รูปร่าง'], hair: ['Hair removal', 'กำจัดขน'], well: ['Wellness', 'เวลเนส'] };
const progCats = CATS.filter((c) => CAT_BANNERS[c.id]);
const progEl = $('#programs');
progEl.innerHTML = progCats.map((c, i) => {
  const list = SERVICES.filter((s) => s.cat === c.id);
  const kit = list.map((s) => renderOf(s.id)).filter((r) => r && r.kind === 'product').slice(0, 4);
  const no = String(i + 1).padStart(2, '0');
  return `<div class="pg" data-cat="${c.id}" style="--i:${i}">
    <button type="button" class="pg-door" aria-expanded="false" aria-controls="pg-${c.id}">
      <span class="pg-strip"><img src="${CAT_BANNERS[c.id]}" alt="" loading="lazy"></span>
      <span class="pg-tag"><small>${no}</small><b>${esc(SHORT[c.id]?.[LANG === 'en' ? 0 : 1] || catName(c))}</b></span>
    </button>
    <div class="pg-room" id="pg-${c.id}">
      <div class="pg-banner"><img src="${CAT_BANNERS[c.id]}" alt="${esc(catName(c))}" loading="lazy"><i class="pg-sheen"></i></div>
      <div class="pg-info">
        <p class="pg-no">${t('progNo', { n: no })}</p>
        <h3>${esc(catName(c))}</h3>
        <p class="pg-count">${t('progCount', { n: list.length })}</p>
        <div class="pg-kit">${kit.map((r, k) => `<img src="${r.src}" alt="" loading="lazy" style="--k:${k}">`).join('')}</div>
        <button type="button" class="btn-gold pg-go" data-cat="${c.id}">${t('progGo')}</button>
      </div>
    </div>
    <i class="pg-timer"></i>
  </div>`;
}).join('');

const pgs = $$('.pg', progEl);
let pgOpen = -1, pgAuto = 0, pgUser = false;
function openPg(i, focus) {
  if (i === pgOpen) return;
  pgOpen = (i + pgs.length) % pgs.length;
  pgs.forEach((p, k) => { p.classList.toggle('open', k === pgOpen); $('.pg-door', p).setAttribute('aria-expanded', String(k === pgOpen)); });
  if (focus) $('.pg-go', pgs[pgOpen]).focus({ preventScroll: true });
  sizePg();
}
function sizePg() {
  // the open panel's banner keeps its own width while it opens, so it slides into view instead of squashing
  const gaps = (pgs.length - 1) * 8, w = progEl.clientWidth;
  if (!w) return;
  if (narrow.matches) progEl.style.removeProperty('--open-w');
  else progEl.style.setProperty('--open-w', `${Math.round(((w - gaps) / (pgs.length + 6)) * 7)}px`);
  if (narrow.matches) pgs.forEach((p) => { p.style.height = p.classList.contains('open') ? `${$('.pg-room', p).scrollHeight}px` : ''; });
}
function stopAuto() { pgUser = true; clearInterval(pgAuto); progEl.classList.add('held'); }
function startAuto() {
  if (reduced || pgUser) return;
  clearInterval(pgAuto);
  pgAuto = setInterval(() => { if (!document.hidden) openPg(pgOpen + 1); }, 5200);
}
progEl.addEventListener('click', (e) => {
  const go = e.target.closest('.pg-go');
  if (go) {
    const g = $(`.lb-group[data-cat="${go.dataset.cat}"]`);
    const first = SERVICES.find((s) => s.cat === go.dataset.cat);
    $('#directory').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    if (first) setTimeout(() => select(first.id), 400);
    g?.classList.add('flash'); setTimeout(() => g?.classList.remove('flash'), 1600);
    return;
  }
  const door = e.target.closest('.pg-door');
  if (door) { stopAuto(); openPg(pgs.indexOf(door.closest('.pg')), true); ritzSay('floor'); }
});
progEl.addEventListener('keydown', (e) => {
  const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (!k || !e.target.closest('.pg')) return;
  e.preventDefault(); stopAuto(); openPg(pgOpen + k); $('.pg-door', pgs[pgOpen]).focus();
});
progEl.addEventListener('pointerenter', () => { if (!pgUser) clearInterval(pgAuto); });
progEl.addEventListener('pointerleave', () => startAuto());
addEventListener('resize', sizePg);
narrow.addEventListener('change', () => { pgs.forEach((p) => { p.style.height = ''; }); sizePg(); });
openPg(0);
// the doors swing open one after another the first time the corridor comes into view
new IntersectionObserver((es, io) => {
  if (!es[0].isIntersecting) return;
  io.disconnect(); progEl.classList.add('in'); startAuto();
}, { threshold: 0.25 }).observe(progEl);

/* ---------- directory board ---------- */
const board = $('#letterboard');
const card = $('#roomCard');
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
