// "Ask Dr. Ritz": two questions deal a key card of matching treatments, sent to LINE.
import { CONCERNS, FLOORS, T } from './data.js';
import { LANG, t } from './i18n.js';
import { $, sendToLine } from './core.js';

export function mountConcierge() {
  const chibi = $('#chibiConcierge');
  if (!chibi) return;
  const floorOf = (k) => FLOORS.find((f) => f.items.includes(k))?.n;
  let area = null, picked = null;
  $('#qArea').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    area = b.dataset.area; picked = null;
    [...$('#qArea').children].forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $('#qConcernWrap').disabled = false;
    $('#qConcern').innerHTML = CONCERNS[area].map((c, i) => `<button type="button" data-i="${i}" aria-pressed="false">${LANG === 'en' ? c.en : c.th}</button>`).join('');
    $('#keycard').hidden = true;
    chibi.setPose('think');
  });
  $('#qConcern').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    picked = CONCERNS[area][+b.dataset.i];
    [...$('#qConcern').children].forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $('#keycardList').innerHTML = picked.items.map((k) => `<li><a href="${T[k].url}">${T[k].name}</a><span>${t('floorShort', { n: floorOf(k) })}</span></li>`).join('');
    const card = $('#keycard'); card.hidden = false; card.classList.remove('deal'); void card.offsetWidth; card.classList.add('deal');
    $('#copied').textContent = '';
    chibi.setPose('card');
  });
  $('#sendLine').addEventListener('click', () => {
    const text = t('lineMsg', { c: LANG === 'en' ? picked.en.toLowerCase() : picked.th, list: picked.items.map((k) => T[k].name).join(', ') });
    sendToLine(text, $('#copied'));
  });
}
