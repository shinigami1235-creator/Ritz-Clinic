// Doctors page: founder, the staff board with each doctor's week and profile card, the duty board.
import { DOCTORS, SCHEDULE, BRANCHES } from './data.js';
import { DOCTOR_INFO, FOUNDER, SCHEDULE_IMAGE } from './media.js';
import { LANG, t } from './i18n.js';
import { $, esc, bname, todayIdx, sendToLine, ritzSay } from './core.js';
import { mountDuty } from './duty.js';
import { wp, media, text } from './wp.js';

mountDuty();

const info = (d) => DOCTOR_INFO[d.th] || {};
const nameOf = (d) => t('dr') + (LANG === 'en' ? d.en : d.th);
const week = (d) => [0, 1, 2, 3, 4, 5, 6].map((day) => BRANCHES.filter((b) => SCHEDULE[b.id][day].includes(d.th)));
const DAYS = t('days');
const SHORT = t('daysShort');

let doctors = [...DOCTORS];
const founder = doctors.find((d) => d.founder);
$('#founderImg').src = FOUNDER[1] || FOUNDER[0] || info(founder).photo;
$('#scheduleImg').src = SCHEDULE_IMAGE;
$('#scheduleImg').alt = t('dSchedule');

function todayLine(d) {
  const w = week(d);
  if (!w.some((x) => x.length)) return { text: t('dAppt'), on: false };
  const at = w[todayIdx()];
  return at.length ? { text: t('dToday', { b: at.map(bname).join(', ') }), on: true } : { text: t('dOff'), on: false };
}

function renderGrid() {
  $('#staffGrid').innerHTML = doctors.filter((d) => !d.founder).map((d, i) => {
    const s = todayLine(d);
    return `<li class="reveal in" style="--d:${(i % 4) * 0.06}s"><button type="button" class="doc" data-id="${d.id}" aria-haspopup="dialog">
      <span class="doc-photo"><img src="${esc(info(d).photo || d.img)}" alt="" width="640" height="640" loading="lazy"></span>
      <span class="doc-plate"><b>${esc(nameOf(d))}</b><small>${esc(info(d).license || '')}</small><span class="doc-status${s.on ? ' on' : ''}">${esc(s.text)}</span></span>
    </button></li>`;
  }).join('');
}
renderGrid();

/* profile dialog: the clinic's own profile card plus this week's branches */
const dlg = $('#docDialog');
let open = null;
function openDoc(d) {
  open = d;
  const w = week(d);
  $('#docImg').src = info(d).profile || info(d).photo || d.img;
  $('#docImg').alt = `${nameOf(d)}, ${t('dProfile')}`;
  $('#docName').textContent = nameOf(d);
  $('#docFull').textContent = [info(d).full, info(d).license].filter(Boolean).join(' · ');
  $('#docToday').textContent = todayLine(d).text;
  $('#docWeek').innerHTML = w.map((at, i) => `<li class="${i === todayIdx() ? 'today' : ''}${at.length ? '' : ' off'}"><abbr title="${DAYS[i]}">${SHORT[i]}</abbr><span>${at.length ? at.map(bname).join(', ') : '–'}</span></li>`).join('');
  $('#docBook').textContent = t('dBook', { n: nameOf(d) });
  $('#docCopied').textContent = '';
  $('.dlg-profile').classList.remove('big');
  dlg.showModal();
  $('.dlg-card').scrollTop = 0;
  ritzSay('doctor');
}
$('#staffGrid').addEventListener('click', (e) => { const b = e.target.closest('.doc'); if (b) openDoc(doctors.find((d) => String(d.id) === b.dataset.id)); });
$('#founderProfile').addEventListener('click', () => openDoc(founder));
$('#docClose').addEventListener('click', () => dlg.close());
// tap the profile sheet to see it at full size
$('#docImg').addEventListener('click', () => { if (innerWidth < 1420) $('.dlg-profile').classList.toggle('big'); });
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
$('#docBook').addEventListener('click', () => sendToLine(t('dBookMsg', { n: nameOf(open) }), $('#docCopied')));

// A doctor added in WordPress later appears here with their photo.
const known = new Set(DOCTORS.map((d) => d.id));
wp('physicians', { per_page: 100, _embed: 'wp:featuredmedia', _fields: 'id,title,_links,_embedded' }).then(({ items }) => {
  const fresh = items.filter((x) => !known.has(x.id)).map((x) => {
    const th = text(x.title.rendered).replace(/^หมอ/, '');
    return { id: x.id, th, en: th, img: media(x) };
  });
  if (!fresh.length) return;
  doctors = [...doctors, ...fresh];
  renderGrid();
}).catch(() => {});
