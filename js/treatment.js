// One treatment: the render on its plinth, the clinic's full article, real results and related treatments.
import { SERVICES, CATS, FLOORS } from './data.js';
import { LANG, t } from './i18n.js';
import { $, esc, renderOf, sendToLine } from './core.js';
import { mountMirror } from './mirror.js';
import { mountShelf } from './showroom.js';
import { fmtDate } from './posts.js';

const id = +new URLSearchParams(location.search).get('id');
const s = SERVICES.find((x) => x.id === id);
const r = renderOf(id);
const catName = (c) => (LANG === 'en' ? c.en : c.th);

if (r) $('#tStage').insertAdjacentHTML('afterbegin', r.kind === 'product' ? `<img class="prod" src="${r.src}" alt="">` : `<img class="ph" src="${r.src}" alt="">`);

async function article() {
  try {
    const d = await (await fetch(`data/services/${id}.json`)).json();
    if (!s) { $('#page-title').textContent = d.title; document.title = `${d.title} | THE RITZ CLINIC`; }
    $('#tArticle').innerHTML = d.html;
    $('#tMeta').innerHTML = `${t('tUpdated', { d: fmtDate(d.modified) })}${t('tThaiNote') ? ` · <span class="lang-note">${t('tThaiNote')}</span>` : ''}`;
  } catch {
    $('#tArticle').innerHTML = `<p>${t('tNotFound')}</p>`;
  }
}

if (s) {
  const cat = CATS.find((c) => c.id === s.cat);
  const f = FLOORS.find((x) => x.n === s.floor);
  document.title = `${s.name} | THE RITZ CLINIC`;
  $('meta[name="description"]').setAttribute('content', `${s.name} at THE RITZ CLINIC. ${s.en}`);
  $('#page-title').textContent = s.name;
  $('#tCat').textContent = cat ? catName(cat) : '';
  $('#tDesc').textContent = LANG === 'en' ? s.en : s.th;
  $('#tLayer').innerHTML = `<span class="pd-bars" aria-hidden="true">${[1, 2, 3, 4, 5].map((n) => `<i class="${n === s.floor ? 'on' : ''}"></i>`).join('')}</span><span><b>${t('layerLabel')}</b> ${f ? `${t('dirFloor', { n: f.n })}, ${esc(LANG === 'en' ? f.en : f.th)}` : t('layerNone')}</span>`;
  $('#tAsk').textContent = t('askThis');
  $('#tAsk').addEventListener('click', () => sendToLine(t('lineMsg', { c: s.name, list: s.name }), $('#tCopied')));
}
article();
mountMirror($('[data-mirror]'), { service: id });

// related: the rest of the same programme on the showroom shelf
const shelf = $('#shelf');
if (s) {
  mountShelf(shelf, { only: null });
  [...shelf.children].forEach((a) => { const sid = +new URL(a.href).searchParams.get('id'); const o = SERVICES.find((x) => x.id === sid); if (!o || o.cat !== s.cat || o.id === s.id) a.remove(); });
  if (!shelf.children.length) shelf.closest('section').hidden = true;
} else shelf.closest('section').hidden = true;
