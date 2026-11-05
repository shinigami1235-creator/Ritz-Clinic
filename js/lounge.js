// The lounge: Instagram stories and the latest Facebook posts, drawn in the site's own design.
// Live data comes from data/social.json, which tools/social.py writes from Meta's API once the
// clinic's admin connects the accounts. Until then the row and the feed use the clinic's own
// website content, and say so.
import { CASES, CAT_BANNERS, PROMO_POSTERS, RENDERS } from './media.js';
import { t } from './i18n.js';
import { $, $$, esc } from './core.js';
import { loadPosts, postHref, fmtDate } from './posts.js';

const ACCOUNTS = [
  { handle: 'theritzclinic_official', label: 'igMain', avatar: 'assets/brand/r-mark.svg' },
  { handle: 'theritz.lifting', label: 'igLift', avatar: RENDERS[682515].src, cover: CAT_BANNERS.lift, cases: ['Ulthera SPT', 'Ultraformer MPT', 'New Thermage FLX'] },
  { handle: 'theritz.skinandlaser', label: 'igSkin', avatar: RENDERS[4341].src, cover: CAT_BANNERS.laser, cases: ['PICO-SCAR', 'PICO Smooth / Bright', 'PICO Expert'] },
  { handle: 'theritz.filler', label: 'igFiller', avatar: RENDERS[395018].src, cover: CAT_BANNERS.design, cases: ['Filler', 'Botulinum Toxin', 'Sculptra'] },
  { handle: 'resize_bytheritz', label: 'igResize', avatar: RENDERS[516098].src, cover: CAT_BANNERS.body, cases: [] },
  { handle: 'theritz_hairremoval', label: 'igHair', avatar: RENDERS[515783].src, cover: CAT_BANNERS.hair, cases: ['Moveo Red Laser'] },
];
const igUrl = (h) => `https://www.instagram.com/${h}/`;

async function social() {
  try { const r = await fetch('data/social.json', { cache: 'no-store' }); if (r.ok) return await r.json(); } catch {}
  return null;
}

// stories made from the clinic's own website, used until the accounts are connected
function previewStories(posts) {
  const cardsOf = (names) => CASES.filter((g) => names.includes(g.program)).flatMap((g) => g.items.slice(0, 2).map((i) => i[2]));
  return Object.fromEntries(ACCOUNTS.map((a, i) => {
    let frames;
    if (i === 0) frames = [...PROMO_POSTERS, ...posts.slice(0, 3).map((p) => p.image).filter(Boolean)];
    else frames = [a.cover, ...cardsOf(a.cases)].filter(Boolean);
    return [a.handle, frames.slice(0, 5).map((src) => ({ src, link: igUrl(a.handle) }))];
  }));
}

export async function mountLounge() {
  const row = $('#stories'); if (!row) return;
  const [data, { posts }] = await Promise.all([social(), loadPosts()]);
  const live = !!(data && data.instagram);
  const stories = live ? Object.fromEntries(Object.entries(data.instagram).map(([h, v]) => [h, (v.stories?.length ? v.stories : v.media || []).map((m) => ({ src: m.media_url || m.thumbnail_url, video: m.media_type === 'VIDEO', link: m.permalink }))])) : previewStories(posts);

  row.innerHTML = ACCOUNTS.map((a, i) => {
    return `<li><button type="button" class="story" data-i="${i}" aria-label="@${esc(a.handle)} ${t('storyOpen')}">
      <span class="ring"><span class="av${i ? ' prod' : ''}"><img src="${esc(a.avatar)}" alt="" loading="lazy"></span></span>
      <b>@${esc(a.handle)}</b><small>${t(a.label)}</small></button></li>`;
  }).join('');

  /* full-screen viewer: progress bars, tap right or left, auto-advance */
  const dlg = $('#storyViewer');
  let acc = 0, k = 0, timer = 0, t0 = 0;
  const DUR = 5000;
  function frames() { return stories[ACCOUNTS[acc].handle] || []; }
  function show() {
    const f = frames(); if (!f.length) return next();
    const fr = f[k];
    $('.sv-bars', dlg).innerHTML = f.map((_, i) => `<i><b style="width:${i < k ? 100 : 0}%"></b></i>`).join('');
    $('.sv-who', dlg).textContent = '@' + ACCOUNTS[acc].handle;
    $('.sv-media', dlg).innerHTML = fr.video ? `<video src="${esc(fr.src)}" autoplay muted playsinline></video>` : `<img src="${esc(fr.src)}" alt="">`;
    $('.sv-link', dlg).href = fr.link || igUrl(ACCOUNTS[acc].handle);
    $('.sv-note', dlg).textContent = live ? '' : t('storyPreview');
    cancelAnimationFrame(timer); t0 = performance.now();
    const bar = $$('.sv-bars i b', dlg)[k];
    (function tick(now) { const p = Math.min(1, (now - t0) / DUR); bar.style.width = p * 100 + '%'; if (p < 1) timer = requestAnimationFrame(tick); else next(); })(t0);
  }
  function next() { if (k < frames().length - 1) k++; else if (acc < ACCOUNTS.length - 1) { acc++; k = 0; } else return close(); show(); }
  function prev() { if (k > 0) k--; else if (acc > 0) { acc--; k = Math.max(0, frames().length - 1); } show(); }
  function close() { cancelAnimationFrame(timer); dlg.close(); }
  row.addEventListener('click', (e) => { const b = e.target.closest('.story'); if (!b) return; acc = +b.dataset.i; k = 0; dlg.showModal(); show(); b.classList.add('seen'); });
  $('.sv-next', dlg).addEventListener('click', next);
  $('.sv-prev', dlg).addEventListener('click', prev);
  $('.sv-close', dlg).addEventListener('click', close);
  dlg.addEventListener('close', () => cancelAnimationFrame(timer));
  dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); });

  /* the feed: live Facebook posts, or the newest news from the website */
  const feed = $('#fbFeed');
  const items = data?.facebook?.length
    ? data.facebook.slice(0, 4).map((p) => ({ img: p.full_picture, text: (p.message || '').slice(0, 160), date: p.created_time, link: p.permalink_url }))
    : posts.slice(0, 4).map((p) => ({ img: p.image, text: p.title, date: p.date, link: postHref(p) }));
  feed.innerHTML = items.map((p) => `<li><a href="${esc(p.link)}"${data?.facebook ? ' target="_blank" rel="noopener"' : ''}>
    ${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : ''}<span><time>${p.date ? fmtDate(p.date) : ''}</time><b>${esc(p.text)}</b></span></a></li>`).join('');
  $('#fbNote').textContent = data?.facebook?.length ? '' : t('feedPreview');
}
