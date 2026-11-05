// Doctors page: founder, staff board with each doctor's week, and the duty board.
import { DOCTORS, SCHEDULE, BRANCHES } from './data.js';
import { LANG, t } from './i18n.js';
import { $, esc, bname, todayIdx, sendToLine } from './core.js';
import { mountDuty } from './duty.js';
import { wp, media, text } from './wp.js';

mountDuty();

const nameOf = (d) => t('dr') + (LANG === 'en' ? d.en : d.th);
// Which branch a doctor is at on each day, from the monthly schedule.
const week = (d) => [0, 1, 2, 3, 4, 5, 6].map((day) => BRANCHES.filter((b) => SCHEDULE[b.id][day].includes(d.th)));
const DAYS = t('days');
const SHORT = t('daysShort');

let doctors = [...DOCTORS];
const founder = doctors.find((d) => d.founder);
$('#founderImg').src = founder.img;

function todayLine(d) {
  const w = week(d);
  if (!w.some((x) => x.length)) return { text: t('dAppt'), on: false };
  const at = w[todayIdx()];
  return at.length ? { text: t('dToday', { b: at.map(bname).join(', ') }), on: true } : { text: t('dOff'), on: false };
}

function renderGrid() {
  $('#staffGrid').innerHTML = doctors.filter((d) => !d.founder).map((d) => {
    const s = todayLine(d);
    return `<li><button type="button" class="doc" data-id="${d.id}" aria-haspopup="dialog">
      <span class="doc-photo"><img src="${esc(d.img)}" alt="" width="768" height="768" loading="lazy"></span>
      <span class="doc-plate"><b>${esc(nameOf(d))}</b><span class="doc-status${s.on ? ' on' : ''}">${esc(s.text)}</span></span>
    </button></li>`;
  }).join('');
}
renderGrid();

/* profile dialog */
const dlg = $('#docDialog');
let open = null;
$('#staffGrid').addEventListener('click', (e) => {
  const b = e.target.closest('.doc'); if (!b) return;
  open = doctors.find((d) => String(d.id) === b.dataset.id);
  const w = week(open);
  $('#docImg').src = open.img;
  $('#docImg').alt = nameOf(open);
  $('#docName').textContent = nameOf(open);
  $('#docToday').textContent = todayLine(open).text;
  $('#docWeek').innerHTML = w.map((at, i) => `<li class="${i === todayIdx() ? 'today' : ''}${at.length ? '' : ' off'}"><abbr title="${DAYS[i]}">${SHORT[i]}</abbr><span>${at.length ? at.map(bname).join(', ') : '–'}</span></li>`).join('');
  $('#docBook').textContent = t('dBook', { n: nameOf(open) });
  $('#docCopied').textContent = '';
  dlg.showModal();
});
$('#docClose').addEventListener('click', () => dlg.close());
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
$('#docBook').addEventListener('click', () => sendToLine(t('dBookMsg', { n: nameOf(open) }), $('#docCopied')));

// A doctor added in WordPress later appears here with their photo.
const known = new Set(DOCTORS.map((d) => d.id));
wp('physicians', { per_page: 100, _embed: 'wp:featuredmedia' }).then(({ items }) => {
  const fresh = items.filter((x) => !known.has(x.id)).map((x) => {
    const th = text(x.title.rendered).replace(/^หมอ/, '');
    return { id: x.id, th, en: th, img: media(x) };
  });
  if (!fresh.length) return;
  doctors = [...doctors, ...fresh];
  renderGrid();
}).catch(() => {});
