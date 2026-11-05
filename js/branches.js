// Branches page: map plus a card for every branch with address, hours and doctors today.
import { BRANCHES, ADDR, SCHEDULE } from './data.js';
import { LANG, t, pick } from './i18n.js';
import { $, $$, esc, bname, bangkokNow, hhmm, isOpen, doctors, todayIdx } from './core.js';
import { drawMap } from './branchmap.js';

const list = $('#brList');
let picked = null;
const mapsUrl = (b) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('THE RITZ CLINIC ' + b.en)}`;

function render() {
  const d = bangkokNow();
  $('#clockLine').textContent = t('openNow', { t: hhmm(d), n: BRANCHES.filter(isOpen).length });
  list.innerHTML = BRANCHES.map((b, i) => {
    const a = ADDR[b.id]; const open = isOpen(b);
    const go = pick(a, 'go');
    return `<li class="br-card${open ? ' open' : ''}${b.id === picked ? ' on' : ''}" id="br-${b.id}" tabindex="-1">
      <span class="br-tag" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <div class="br-body">
        <h2>${esc(bname(b))} <span class="br-state">${open ? t('bOpenNowShort') : t('bClosedNow')}</span></h2>
        <p class="br-addr">${esc(LANG === 'en' ? a.en : a.th)}</p>
        <dl>
          <div><dt>${t('bHours')}</dt><dd>${b.open}${t('to')}${b.close}</dd></div>
          <div><dt>${t('bPhone')}</dt><dd><a href="tel:${b.phone.replace(/-/g, '')}">${b.phone}</a></dd></div>
          <div><dt>${t('bDocsToday')}</dt><dd>${esc(doctors(SCHEDULE[b.id][todayIdx()]))}</dd></div>
          ${go ? `<div><dt>${t('bGetThere')}</dt><dd>${esc(go)}</dd></div>` : ''}
        </dl>
        <a class="br-maps" href="${mapsUrl(b)}" target="_blank" rel="noopener">${t('bMaps')}</a>
      </div>
    </li>`;
  }).join('');
}
render();
setInterval(() => { render(); document.querySelectorAll('#map .pin').forEach((p) => p.classList.toggle('open', isOpen(BRANCHES.find((b) => b.id === p.dataset.id)))); }, 60000);

const map = drawMap($('#map'), {
  onPick(id) {
    picked = id;
    map.highlight(id);
    const el = $('#br-' + id);
    $$('.br-card').forEach((c) => c.classList.toggle('on', c === el));
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.focus({ preventScroll: true });
  },
});
// Hovering a card lights up its pin.
list.addEventListener('mouseover', (e) => { const c = e.target.closest('.br-card'); if (c) map.highlight(c.id.slice(3)); });
