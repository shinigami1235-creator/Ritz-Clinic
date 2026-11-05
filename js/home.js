// The lobby (index.html).
import { BRANCHES, SCHEDULE, PROMOS, REVIEWS, ARTICLES } from './data.js';
import { LANG, t, pick } from './i18n.js';
import { $, reduced, bname, bangkokNow, todayIdx, hhmm, isOpen, doctors, flip, blinkLoop, esc } from './core.js';
import { mountElevator } from './elevator.js';
import { mountConcierge } from './concierge.js';
import { mountDuty } from './duty.js';
import { drawMap } from './branchmap.js';
import { wp, text } from './wp.js';

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
      [t('bArticle'), esc(latestTitle), t('bDate')],
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
  for (let a = 10; a <= 170; a += 8) {
    const r = a * Math.PI / 180;
    s += `<line x1="${(200 + Math.cos(r) * 150).toFixed(1)}" y1="${(200 - Math.sin(r) * 150).toFixed(1)}" x2="${(200 + Math.cos(r) * 178).toFixed(1)}" y2="${(200 - Math.sin(r) * 178).toFixed(1)}"/>`;
  }
  $('.sunburst .rays').innerHTML = s;
})();

/* concierge stand in the lobby */
const chibiLobby = $('#chibiLobby');
const bubble = $('#lobbyBubble');
setTimeout(() => chibiLobby.setPose('stand'), reduced ? 0 : 2600);
blinkLoop(chibiLobby);
$('#deskBell').addEventListener('click', () => {
  chibiLobby.setPose('wai');
  bubble.hidden = false;
  bubble.innerHTML = t('bubble');
  clearTimeout(bubble._t);
  bubble._t = setTimeout(() => { chibiLobby.setPose('stand'); bubble.hidden = true; }, 6000);
});

mountElevator();
mountConcierge();
mountDuty();

/* ---------- specials ---------- */
$('#placards').innerHTML = PROMOS.map((p) => `
  <a class="placard" href="${p.url}">
    <p class="placard-kicker">${t('specialsKicker')}</p>
    <h3>${pick(p, 'title')}</h3>
    <p class="price"><small>${pick(p, 'unit')}</small>${p.price}<span>${t('baht')}</span></p>
    <p class="n">${pick(p, 'note')}</p>
  </a>`).join('');

/* ---------- guest book ---------- */
let rv = 0;
const book = $('.book');
function showReview(i) {
  rv = (i + REVIEWS.length) % REVIEWS.length;
  const r = REVIEWS[rv];
  $('#bookImg').src = r.img;
  $('#bookProgram').textContent = r.program;
  $('#bookWho').textContent = pick(r, 'who');
  $('#bookText').textContent = pick(r, 'text');
  $('#bookCount').textContent = `${rv + 1} / ${REVIEWS.length}`;
  book.classList.remove('turn'); void book.offsetWidth; book.classList.add('turn');
}
showReview(0);
$('#bookPrev').addEventListener('click', () => showReview(rv - 1));
$('#bookNext').addEventListener('click', () => showReview(rv + 1));

/* ---------- journal: the three newest posts, live ---------- */
const jl = $('#journalList');
const fmt = (iso) => new Date(iso).toLocaleDateString(LANG === 'en' ? 'en-GB' : 'th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
jl.innerHTML = ARTICLES.map((a) => `<li><a href="${a.url}"><time>${pick(a, 'date')}</time><b>${pick(a, 'title')}</b></a></li>`).join('');
wp('posts', { per_page: 3, _fields: 'title,date,link' }).then(({ items, total }) => {
  if (!items.length) return;
  latestTitle = text(items[0].title.rendered);
  jl.innerHTML = items.map((p) => `<li><a href="${esc(p.link)}"><time>${fmt(p.date)}</time><b>${esc(text(p.title.rendered))}</b></a></li>`).join('');
  if (total) $('#journalCount').textContent = t('jCount', { n: total });
}).catch(() => {});

/* ---------- directory ---------- */
const map = drawMap($('#map'));
const list = $('#branchList');
const d = bangkokNow();
$('#openNowLine').textContent = t('openNow', { t: hhmm(d), n: BRANCHES.filter(isOpen).length });
list.innerHTML = BRANCHES.map((b) => `<li class="${isOpen(b) ? 'open' : ''}"><button type="button" data-id="${b.id}" aria-pressed="false"><span class="dot"></span><span><b>${bname(b)}</b><span class="meta">${b.open}${t('to')}${b.close} &nbsp; ${b.phone}</span></span></button></li>`).join('');
list.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const on = b.getAttribute('aria-pressed') !== 'true';
  list.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  map.highlight(on ? b.dataset.id : null);
});

/* ---------- Facebook window: preview hosts block it ---------- */
if (/claude|localhost|127\.0\.0\.1/.test(location.hostname)) { $('.fb-window iframe')?.remove(); $('.fb-demo').hidden = false; }

/* ---------- 3D brass R ---------- */
const canWebGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (canWebGL) import('./brass-r.js').then((m) => m.mountBrassR($('#brassR'), { still: reduced })).catch(() => {});
