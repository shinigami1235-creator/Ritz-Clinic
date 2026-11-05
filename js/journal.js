// Articles page: all 260 articles from theritzclinic.com plus anything newer, searchable and by category.
import { t } from './i18n.js';
import { $, $$, esc, ritzSay } from './core.js';
import { loadPosts, postHref, fmtDate } from './posts.js';

const PER = 12;
let all = [], list = [], shown = 0;
const state = { cat: '', q: '' };
const status = $('#jStatus');

function cardHTML(p, no, feature) {
  return `<a class="glass" href="${postHref(p)}">
    <span class="j-img">${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy">` : ''}</span>
    <span class="jt">
      <span class="j-meta">${no ? `<span class="j-no">No. ${no}</span>` : ''}<time datetime="${esc(p.date)}">${fmtDate(p.date)}</time></span>
      <b>${esc(p.title)}</b>
      ${feature && p.excerpt ? `<span class="j-ex">${esc(p.excerpt)}…</span>` : ''}
    </span>
  </a>`;
}

function apply() {
  const q = state.q.toLowerCase();
  list = all.filter((p) => (!state.cat || (p.cats || []).includes(state.cat)) && (!q || `${p.title} ${p.excerpt}`.toLowerCase().includes(q)));
  shown = 0;
  $('#jFeature').innerHTML = ''; $('#jGrid').innerHTML = '';
  more();
  status.textContent = list.length ? `${t('jCount', { n: list.length })}. ${t('jThai')}` : t('jEmpty');
  if (state.q) ritzSay(list.length ? 'found' : 'nothing');
}
function more() {
  const plain = !state.cat && !state.q;
  const no = (i) => (plain ? all.length - i : null);
  if (!shown && list.length) { $('#jFeature').innerHTML = cardHTML(list[0], no(0), true); shown = 1; }
  const next = list.slice(shown, shown + PER);
  $('#jGrid').insertAdjacentHTML('beforeend', next.map((p, i) => `<li class="reveal in" style="--d:${(i % 3) * 0.06}s">${cardHTML(p, no(shown + i))}</li>`).join(''));
  shown += next.length;
  $('#jMore').hidden = shown >= list.length;
}

$('#jCats').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#jCats button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  state.cat = b.dataset.cat; apply();
});
$('#jSearch').addEventListener('submit', (e) => { e.preventDefault(); state.q = $('#jQ').value.trim(); apply(); });
$('#jMore').addEventListener('click', more);

status.textContent = t('jLoading');
loadPosts().then(({ posts }) => { all = posts; apply(); });
