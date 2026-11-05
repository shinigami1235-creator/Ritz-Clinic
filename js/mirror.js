// The vanity mirror: real before-and-after cases from the clinic, split out of their review cards.
import { CASES } from './media.js';
import { t } from './i18n.js';
import { $, $$, esc, ritzSay } from './core.js';

export function mountMirror(host, { service = null, thumbs = 12, link = true } = {}) {
  const groups = CASES.filter((g) => g.items.some((i) => i[0]) && (!service || g.service === service));
  if (!groups.length) { host.closest('section')?.setAttribute('hidden', ''); return; }
  host.innerHTML = `
    <div class="vanity reveal in">
      <div class="bulbs" aria-hidden="true"></div>
      <div class="mirror">
        <img class="m-before" alt="">
        <img class="m-after" alt="">
        <span class="m-tag m-tag-b">${t('before')}</span>
        <span class="m-tag m-tag-a">${t('after')}</span>
        <span class="m-line" aria-hidden="true"><i></i></span>
        <input type="range" min="0" max="100" value="50" aria-label="${t('handle')}">
      </div>
    </div>
    <div class="mirror-side">
      <h3 class="m-title"></h3>
      <p class="mirror-meta"></p>
      ${groups.length > 1 ? `<div class="chips m-chips" role="group" aria-label="${t('rFilter')}">${groups.map((g, i) => `<button type="button" data-g="${i}" aria-pressed="false">${esc(g.program)} <small>${g.items.filter((x) => x[0]).length}</small></button>`).join('')}</div>` : ''}
      <div class="case-thumbs"></div>
      <div class="mirror-actions"><button type="button" class="btn-ghost m-card">${t('viewCard')}</button>${link ? '' : ''}</div>
      <p class="mirror-note">${t('resultsNote')}</p>
    </div>
    <dialog class="case-dialog"><button type="button">${t('dClose')}</button><img alt=""></dialog>`;
  const mirror = $('.mirror', host), range = $('input', mirror), before = $('.m-before', host), after = $('.m-after', host);
  const set = (v) => mirror.style.setProperty('--cut', v + '%');
  range.addEventListener('input', () => set(range.value));
  mirror.addEventListener('pointerdown', (e) => {
    const move = (ev) => { const r = mirror.getBoundingClientRect(); const v = Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100)); range.value = v; set(v); };
    move(e); mirror.setPointerCapture(e.pointerId);
    mirror.addEventListener('pointermove', move);
    mirror.addEventListener('pointerup', () => mirror.removeEventListener('pointermove', move), { once: true });
    ritzSay('mirror');
  });
  const bulbs = [];
  for (let i = 0; i < 7; i++) bulbs.push([10 + i * 80 / 6, 0]);
  for (let i = 0; i < 5; i++) { const y = 18 + i * 74 / 4; bulbs.push([0, y], [100, y]); }
  $('.bulbs', host).innerHTML = bulbs.map(([x, y], i) => `<i style="left:${x}%;top:${y}%;--d:${(i % 5) * 0.4}s"></i>`).join('');

  let g = 0, k = 0;
  const pairs = (gi) => groups[gi].items.filter((x) => x[0]);
  function show(gi, ki, sweep) {
    g = gi; k = ki;
    const it = pairs(g)[k];
    before.src = it[0]; after.src = it[1];
    $('.m-title', host).textContent = groups[g].program;
    $('.mirror-meta', host).textContent = t('caseOf', { n: k + 1, total: pairs(g).length });
    $$('.m-chips button', host).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.g === g)));
    const list = pairs(g).slice(0, thumbs);
    $('.case-thumbs', host).innerHTML = list.map((p, i) => `<button type="button" data-k="${i}" aria-pressed="${i === k}" aria-label="${esc(groups[g].program)} ${i + 1}"><img src="${p[1]}" alt="" loading="lazy"></button>`).join('');
    if (sweep && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // a slow sweep shows what the mirror does
      const t0 = performance.now();
      (function step(now) { const p = Math.min(1, (now - t0) / 1600); const v = 50 + Math.sin(p * Math.PI * 2) * 35 * (1 - p); range.value = v; set(v); if (p < 1) requestAnimationFrame(step); })(t0);
    }
  }
  host.addEventListener('click', (e) => {
    const c = e.target.closest('.m-chips button'); if (c) { show(+c.dataset.g, 0, true); return; }
    const th = e.target.closest('.case-thumbs button'); if (th) { show(g, +th.dataset.k, true); return; }
    if (e.target.closest('.m-card')) { const d = $('.case-dialog', host); $('img', d).src = pairs(g)[k][2]; d.showModal(); }
  });
  const dlg = $('.case-dialog', host);
  $('button', dlg).addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  set(50);
  show(0, 0, false);
  let swept = false;
  new IntersectionObserver((es) => { if (es[0].isIntersecting && !swept) { swept = true; show(g, k, true); } }, { threshold: 0.6 }).observe(mirror);
  return { show };
}
