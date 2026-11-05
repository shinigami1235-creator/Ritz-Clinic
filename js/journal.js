// Articles page: every post from theritzclinic.com, live, with search and categories.
import { ARTICLES } from './data.js';
import { LANG, t, pick } from './i18n.js';
import { $, $$, esc } from './core.js';
import { wp, media, text } from './wp.js';

const PER = 10;
let state = { cat: '', q: '', page: 1, total: 0, pages: 0, shown: 0 };
const fmt = (iso) => new Date(iso).toLocaleDateString(LANG === 'en' ? 'en-GB' : 'th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
const status = $('#jStatus');

function cardHTML(p, no) {
  const img = media(p, 'medium_large');
  const excerpt = text(p.excerpt?.rendered).slice(0, 150);
  return `<a href="${esc(p.link)}">
    <span class="j-img">${img ? `<img src="${esc(img)}" alt="" width="768" height="512" loading="lazy">` : ''}</span>
    <span class="j-meta">${no ? `<span class="j-no">No. ${no}</span>` : ''}<time datetime="${esc(p.date)}">${fmt(p.date)}</time></span>
    <b>${esc(text(p.title.rendered))}</b>
    ${excerpt ? `<span class="j-ex">${esc(excerpt)}…</span>` : ''}
  </a>`;
}

async function load(reset) {
  if (reset) { state.page = 1; state.shown = 0; $('#jFeature').innerHTML = ''; $('#jGrid').innerHTML = ''; }
  status.textContent = t('jLoading');
  $('#jMore').hidden = true;
  try {
    const { items, total, pages } = await wp('posts', {
      per_page: PER, page: state.page, search: state.q, categories: state.cat,
      _embed: 'wp:featuredmedia', _fields: 'id,date,link,title,excerpt,_links,_embedded',
    });
    state.total = total; state.pages = pages;
    // "No." counts down from the newest article, like a library card.
    const no = (i) => (state.q || state.cat ? null : total - state.shown - i);
    let list = items;
    if (state.page === 1 && list.length) {
      $('#jFeature').innerHTML = cardHTML(list[0], no(0));
      state.shown++;
      list = list.slice(1);
    }
    $('#jGrid').insertAdjacentHTML('beforeend', list.map((p, i) => `<li>${cardHTML(p, no(i))}</li>`).join(''));
    state.shown += list.length;
    status.textContent = total ? `${t('jCount', { n: total })}. ${t('jThai')}` : t('jEmpty');
    $('#jMore').hidden = state.page >= pages;
  } catch {
    // Offline or blocked: show the articles saved with the site.
    $('#jGrid').innerHTML = ARTICLES.map((a) => `<li><a href="${a.url}"><span class="j-meta"><time>${pick(a, 'date')}</time></span><b>${pick(a, 'title')}</b></a></li>`).join('');
    status.textContent = t('jOffline');
  }
}

$('#jCats').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#jCats button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  state.cat = b.dataset.cat;
  load(true);
});
$('#jSearch').addEventListener('submit', (e) => {
  e.preventDefault();
  state.q = $('#jQ').value.trim();
  load(true);
});
$('#jMore').addEventListener('click', () => { state.page++; load(false); });
load(true);
