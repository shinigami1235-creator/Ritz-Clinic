// Articles: the copy saved with the site (data/posts.json), topped up with anything newer
// from the clinic's WordPress, so a new article shows up without touching this site.
import { LANG } from './i18n.js';
import { wp, media, text } from './wp.js';

export const fmtDate = (iso) => new Date(iso).toLocaleDateString(LANG === 'en' ? 'en-GB' : 'th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
export const postHref = (p) => (p.local ? `article.html?id=${p.id}` : p.link);

let cache = null;
export function loadPosts() {
  if (cache) return cache;
  cache = (async () => {
    let saved = [];
    try { saved = (await (await fetch('data/posts.json')).json()).map((p) => ({ ...p, local: true })); } catch {}
    let fresh = [];
    try {
      const { items } = await wp('posts', { per_page: 10, _embed: 'wp:featuredmedia', _fields: 'id,date,link,title,excerpt,categories,_links,_embedded' });
      const known = new Set(saved.map((p) => p.id));
      fresh = items.filter((x) => !known.has(x.id)).map((x) => ({ id: x.id, date: x.date, link: x.link, title: text(x.title.rendered), excerpt: text(x.excerpt?.rendered).slice(0, 220), image: media(x), cats: (x.categories || []).map((c) => ({ 1: 'Update and News', 44: 'Tips and Trick' })[c] || ''), local: false }));
    } catch {}
    const posts = [...fresh, ...saved].sort((a, b) => b.date.localeCompare(a.date));
    return { posts, total: posts.length };
  })();
  return cache;
}
