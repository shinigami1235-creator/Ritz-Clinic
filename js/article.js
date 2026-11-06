// One article from the clinic, saved with the site.
import { t } from './i18n.js';
import { $, esc, cleanHtml } from './core.js';
import { loadPosts, postHref, fmtDate } from './posts.js';

const id = +new URLSearchParams(location.search).get('id');

(async () => {
  try {
    if (!id) throw new Error('no id');
    const res = await fetch(`data/posts/${id}.json`);
    if (!res.ok) throw new Error(res.status);
    const p = await res.json();
    document.title = `${p.title} | THE RITZ CLINIC`;
    $('#page-title').textContent = p.title;
    $('#aMeta').textContent = fmtDate(p.date);
    if (p.image) { $('#aImg').src = p.image; $('#aImg').hidden = false; }
    $('#aBody').innerHTML = cleanHtml(p.html);
    $('#aOrig').href = p.link;
  } catch {
    document.title = `${t('aNotFound')} | THE RITZ CLINIC`;
    $('#page-title').textContent = t('aNotFound');
    $('#aBody').innerHTML = '';
    $('#aOrig').parentElement.hidden = true;
  }
  const { posts } = await loadPosts();
  $('#journalList').innerHTML = posts.filter((x) => x.id !== id).slice(0, 3).map((x) => `<li class="jcard"><a class="glass" href="${postHref(x)}">
    <span class="j-img">${x.image ? `<img src="${x.image}" alt="" loading="lazy">` : ''}</span>
    <span class="jb"><time>${fmtDate(x.date)}</time><b>${esc(x.title)}</b></span></a></li>`).join('');
})();
