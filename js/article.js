// One article from the clinic, saved with the site.
import { t } from './i18n.js';
import { $, esc } from './core.js';
import { loadPosts, postHref, fmtDate } from './posts.js';

const id = +new URLSearchParams(location.search).get('id');

(async () => {
  try {
    const p = await (await fetch(`data/posts/${id}.json`)).json();
    document.title = `${p.title} | THE RITZ CLINIC`;
    $('#page-title').textContent = p.title;
    $('#aMeta').textContent = fmtDate(p.date);
    if (p.image) { $('#aImg').src = p.image; $('#aImg').hidden = false; }
    $('#aBody').innerHTML = p.html;
    $('#aOrig').href = p.link;
  } catch {
    $('#page-title').textContent = t('aNotFound');
    $('#aBody').innerHTML = '';
  }
  const { posts } = await loadPosts();
  $('#journalList').innerHTML = posts.filter((x) => x.id !== id).slice(0, 3).map((x) => `<li class="jcard"><a class="glass" href="${postHref(x)}">
    <span class="j-img">${x.image ? `<img src="${x.image}" alt="" loading="lazy">` : ''}</span>
    <span class="jb"><time>${fmtDate(x.date)}</time><b>${esc(x.title)}</b></span></a></li>`).join('');
})();
