// One treatment: the render on its plinth, the clinic's full article, real results and related treatments.
import { SERVICES, CATS, FLOORS } from './data.js';
import { LANG, t } from './i18n.js';
import { $, $$, esc, renderOf, sendToLine, cleanHtml } from './core.js';
import { mountMirror } from './mirror.js';
import { mountShelf } from './showroom.js';
import { fmtDate } from './posts.js';

const id = +new URLSearchParams(location.search).get('id');
const s = SERVICES.find((x) => x.id === id);
const r = renderOf(id);
const catName = (c) => (LANG === 'en' ? c.en : c.th);

if (r) $('#tStage').insertAdjacentHTML('afterbegin', r.kind === 'product' ? `<img class="prod" src="${r.src}" alt="">` : `<img class="ph" src="${r.src}" alt="">`);

// a contents list beside the article: the clinic's own headings, the current one lit as you read
function contents() {
  const heads = $$('#tArticle h2');
  if (heads.length < 3) return;
  const art = $('#about .article');
  const wrap = document.createElement('div'); wrap.className = 'article-wrap';
  art.before(wrap); wrap.append(art);
  const nav = document.createElement('nav'); nav.className = 'toc'; nav.setAttribute('aria-label', t('tContents'));
  nav.innerHTML = `<p class="toc-title">${t('tContents')}</p><i class="toc-bar"><b></b></i><ol>${heads.map((h, i) => { h.id = h.id || `sec-${i + 1}`; return `<li><a href="#${h.id}">${esc(h.textContent.trim())}</a></li>`; }).join('')}</ol>`;
  wrap.prepend(nav);
  const links = $$('a', nav), bar = $('.toc-bar b', nav);
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { const i = heads.indexOf(e.target); links.forEach((a, k) => a.classList.toggle('on', k === i)); }
  }, { rootMargin: '-20% 0px -70% 0px' });
  heads.forEach((h) => io.observe(h));
  addEventListener('scroll', () => {
    const r = art.getBoundingClientRect();
    bar.style.height = `${Math.min(100, Math.max(0, (innerHeight * 0.3 - r.top) / r.height * 100))}%`;
  }, { passive: true });
}

function notFound() {
  document.title = `${t('tNotFound')} | THE RITZ CLINIC`;
  $('#page-title').textContent = t('tNotFound');
  $('.t-crumb').hidden = true;
  $('.pd-actions').innerHTML = `<a class="btn-gold" href="treatments.html">${t('seeAllTreat')}</a>`;
  ['#about', '#results'].forEach((q) => { $(q).hidden = true; });
}
async function article() {
  try {
    if (!id) throw new Error('no id');
    const res = await fetch(`data/services/${id}.json`);
    if (!res.ok) throw new Error(res.status);
    const d = await res.json();
    if (!s) { $('#page-title').textContent = d.title; document.title = `${d.title} | THE RITZ CLINIC`; }
    $('#tArticle').innerHTML = cleanHtml(d.html);
    contents();
    $('#tMeta').innerHTML = `${t('tUpdated', { d: fmtDate(d.modified) })}${t('tThaiNote') ? ` · <span class="lang-note">${t('tThaiNote')}</span>` : ''}`;
  } catch {
    if (s) $('#tArticle').innerHTML = `<p>${t('tNotFound')}</p>`;
    else notFound();
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
if (s || id) mountMirror($('[data-mirror]'), { service: id });

// related: the rest of the same programme on the showroom shelf
const shelf = $('#shelf');
if (s) {
  mountShelf(shelf, { only: null });
  [...shelf.children].forEach((a) => { const sid = +new URL(a.href).searchParams.get('id'); const o = SERVICES.find((x) => x.id === sid); if (!o || o.cat !== s.cat || o.id === s.id) a.remove(); });
  if (!shelf.children.length) shelf.closest('section').hidden = true;
} else shelf.closest('section').hidden = true;
