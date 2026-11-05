// The lobby (index.html).
import { BRANCHES, SCHEDULE, PROMOS, REVIEWS } from './data.js';
import { BRANDS, PROMO_POSTERS, REVIEW_PHOTOS } from './media.js';
import { LANG, t, pick } from './i18n.js';
import { $, reduced, bname, bangkokNow, todayIdx, hhmm, isOpen, doctors, flip, esc, ritzSay } from './core.js';
import { mountElevator } from './elevator.js';
import { mountConcierge } from './concierge.js';
import { mountDuty } from './duty.js';
import { mountBooth } from './booth.js';
import { mountMirror } from './mirror.js';
import { mountGmap } from './gmap.js';
import { mountLounge } from './lounge.js';
import { loadPosts, postHref, fmtDate } from './posts.js';

const DAYS = t('days');

/* ---------- lobby flip board ---------- */
const boardRows = $('#boardRows');
let latestTitle = 'Vitality DNA Code';
function boardPages() {
  const d = todayIdx();
  const open = BRANCHES.filter(isOpen).length;
  const feature = ['siam', 'ari', 'rama2', 'ics'].map((id) => BRANCHES.find((b) => b.id === id));
  return [
    [
      [t('bPromo'), t('bLift'), t('bToday')],
      [t('bPromo'), t('bUlthera'), t('bFree')],
      [t('bBranches'), t('bOpen', { n: open }), open ? t('bIsOpen') : t('bClosed'), !!open],
      [t('bArticle'), esc(latestTitle), t('bNewTag')],
    ],
    feature.map((b) => [t('bDoctors'), `${bname(b)}: ${doctors(SCHEDULE[b.id][d])}`, t('bUntil', { t: b.close }), isOpen(b)]),
    [
      [t('bReview'), t('bFilm'), 'Friend of The Ritz'],
      [t('bReview'), t('bBeer'), 'Friend of The Ritz'],
      [t('bNew'), 'Personalized IV Therapy', 'Vitality Lab'],
      ['Call Center', '088-892-2666', 'LINE @theritzclinic'],
    ],
  ];
}
for (let r = 0; r < 4; r++) {
  const row = document.createElement('div');
  row.className = 'board-row';
  row.innerHTML = ['k', 'd', 's'].map((c) => `<div class="tile ${c}"><span class="face"></span></div>`).join('');
  boardRows.appendChild(row);
}
let page = 0;
function showPage(i, animate = true) {
  const pages = boardPages();
  page = (i + pages.length) % pages.length;
  const data = pages[page];
  [...boardRows.children].forEach((row, r) => {
    [...row.children].forEach((tile, c) => {
      const live = c === 2 && data[r][3] === true;
      const apply = () => { tile.firstChild.innerHTML = live ? `<span class="live">${data[r][c]}</span>` : data[r][c]; };
      animate ? flip(tile, apply, (r * 3 + c) * 70) : apply();
    });
  });
  $('#boardPager').innerHTML = pages.map((_, k) => `<i class="${k === page ? 'on' : ''}"></i>`).join('');
}
showPage(0, false);
setTimeout(() => showPage(0, true), 300);
if (!reduced) setInterval(() => showPage(page + 1), 7000);
const tickClock = () => { $('#boardClock').textContent = `${DAYS[todayIdx()]}  ${hhmm(bangkokNow())}`; };
tickClock(); setInterval(tickClock, 15000);

/* sunburst rays */
(function rays() {
  let s = '';
  for (let a = 10; a <= 170; a += 6) {
    const r = a * Math.PI / 180, long = a % 12 === 4 ? 186 : 176;
    s += `<line x1="${(200 + Math.cos(r) * 150).toFixed(1)}" y1="${(200 - Math.sin(r) * 150).toFixed(1)}" x2="${(200 + Math.cos(r) * long).toFixed(1)}" y2="${(200 - Math.sin(r) * long).toFixed(1)}"/>`;
  }
  $('.sunburst .rays').innerHTML = s;
})();

/* the desk bell calls Dr. Ritz */
const bubble = $('#lobbyBubble');
$('#deskBell').addEventListener('click', (e) => {
  const b = e.currentTarget; b.classList.remove('ring'); void b.offsetWidth; b.classList.add('ring');
  ritzSay('bell');
  bubble.hidden = false;
  bubble.innerHTML = t('bubble');
  clearTimeout(bubble._t);
  bubble._t = setTimeout(() => { bubble.hidden = true; }, 6000);
});

mountBooth($('#booth'));
mountElevator();
mountConcierge();
mountMirror($('[data-mirror]'));
mountDuty();

/* ---------- specials, with the clinic's own posters ---------- */
$('#placards').innerHTML = PROMOS.map((p, i) => `
  <a class="placard glass reveal in" href="${p.url}">
    <span class="poster">${PROMO_POSTERS[i] ? `<img src="${PROMO_POSTERS[i]}" alt="" loading="lazy">` : ''}</span>
    <span class="pbody">
      <span class="placard-kicker">${t('specialsKicker')}</span>
      <h3>${pick(p, 'title')}</h3>
      <p class="n">${pick(p, 'note')}</p>
      <span class="price foil"><small>${pick(p, 'unit')}</small>${p.price}<span>${t('baht')}</span></span>
    </span>
  </a>`).join('');

/* ---------- guest book ---------- */
let rv = 0;
const book = $('.book');
function showReview(i) {
  rv = (i + REVIEWS.length) % REVIEWS.length;
  const r = REVIEWS[rv];
  $('#bookImg').src = REVIEW_PHOTOS[r.id] || r.img;
  $('#bookProgram').textContent = r.program;
  $('#bookWho').textContent = pick(r, 'who');
  $('#bookText').textContent = pick(r, 'text');
  $('#bookCount').textContent = `${rv + 1} / ${REVIEWS.length}`;
  book.classList.remove('turn'); void book.offsetWidth; book.classList.add('turn');
}
showReview(0);
$('#bookPrev').addEventListener('click', () => showReview(rv - 1));
$('#bookNext').addEventListener('click', () => { showReview(rv + 1); ritzSay('review'); });

/* ---------- brands belt (twice, so it loops) ---------- */
const chips = BRANDS.map((b) => `<span class="brand-chip"><img src="${b}" alt="${esc(b.split('/').pop().replace('.webp', ''))}" loading="lazy"></span>`).join('');
$('#brandBelt').innerHTML = chips + chips;

/* ---------- journal: the three newest posts ---------- */
const jl = $('#journalList');
loadPosts().then(({ posts, total }) => {
  if (!posts.length) return;
  latestTitle = posts[0].title;
  jl.innerHTML = posts.slice(0, 3).map((p, i) => `<li class="jcard reveal in" style="--d:${i * 0.1}s"><a class="glass" href="${postHref(p)}">
    <span class="j-img">${p.image ? `<img src="${p.image}" alt="" loading="lazy">` : ''}</span>
    <span class="jb"><time>${fmtDate(p.date)}</time><b>${esc(p.title)}</b></span></a></li>`).join('');
  $('#journalCount').textContent = '· ' + t('jCount', { n: total });
});

/* ---------- directory ---------- */
const gmap = mountGmap($('#gmap'), $('#gmapAll'));
const list = $('#branchList');
$('#openNowLine').textContent = t('openNow', { t: hhmm(bangkokNow()), n: BRANCHES.filter(isOpen).length });
list.innerHTML = BRANCHES.map((b) => `<li class="${isOpen(b) ? 'open' : ''}"><button type="button" data-id="${b.id}" aria-pressed="false"><span class="dot"></span><span><b>${bname(b)}</b><span class="meta">${b.open}${t('to')}${b.close} &nbsp; ${b.phone}</span></span></button></li>`).join('');
list.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const on = b.getAttribute('aria-pressed') !== 'true';
  list.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  gmap.show(on ? BRANCHES.find((x) => x.id === b.dataset.id) : null);
  if (on) ritzSay('branch');
});

mountLounge();

/* ---------- 3D brass R ---------- */
const canWebGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (canWebGL) import('./brass-r.js').then((m) => m.mountBrassR($('#brassR'), { still: reduced })).catch(() => {});
