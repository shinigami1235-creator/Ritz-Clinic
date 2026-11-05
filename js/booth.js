// The showroom booth: one lit bay per programme, built like a trade-show stand. Machines and
// medicines stand on plinths under their own downlight, treatment photos hang as screens on
// the wall. Pick a programme and the camera pans to its bay; tap an item and the camera
// moves in on it while a card slides out with what it is and what it treats.
import { SERVICES, CATS, FLOORS } from './data.js';
import { LANG, t } from './i18n.js';
import { $, $$, esc, renderOf, ritzSay, reduced, sendToLine } from './core.js';

const HEIGHTS = [96, 136, 64, 116, 80, 150, 104];
const nameOf = (c) => (LANG === 'en' ? c.en : c.th);

export function mountBooth(host) {
  const cats = CATS.map((c) => ({ c, items: SERVICES.filter((s) => s.cat === c.id && renderOf(s.id)) })).filter((x) => x.items.length);
  host.innerHTML = `
    <div class="booth-tabs" role="tablist">${cats.map(({ c, items }, i) => `<button type="button" role="tab" data-i="${i}" aria-selected="${i === 0}">${esc(nameOf(c))}<small>${items.length}</small></button>`).join('')}</div>
    <div class="booth-view">
      <div class="booth-cam">
        ${cats.map(({ c, items }, b) => `
        <section class="bay" data-i="${b}" aria-label="${esc(nameOf(c))}" style="--n:${items.length}">
          <p class="bay-sign"><small>${String(b + 1).padStart(2, '0')}</small>${esc(nameOf(c))}</p>
          <div class="bay-slots">
            ${items.map((s, k) => {
              const r = renderOf(s.id), screen = r.kind !== 'product';
              return `<button type="button" class="slot${screen ? ' is-screen' : ''}" data-id="${s.id}" style="--h:${screen ? 108 : HEIGHTS[k % HEIGHTS.length]}px;--k:${k}" aria-label="${esc(s.name)}">
                <i class="fixture"></i><i class="cone"></i><i class="pool"></i>
                <span class="item">${screen ? `<span class="screen"><img src="${r.src}" alt="" loading="lazy" draggable="false"></span>` : `<img class="prod" src="${r.src}" alt="" loading="lazy" draggable="false">`}</span>
                <span class="plinth"><span class="plate">${esc(s.name)}</span></span>
              </button>`;
            }).join('')}
          </div>
          <i class="bay-floor"></i>
        </section>`).join('')}
      </div>
      <button type="button" class="booth-nav prev" aria-label="Previous programme">‹</button>
      <button type="button" class="booth-nav next" aria-label="Next programme">›</button>
      <aside class="booth-card" aria-live="polite" hidden>
        <button type="button" class="bc-close" aria-label="${esc(t('dClose'))}">×</button>
        <p class="bc-cat"></p>
        <h3 class="bc-name"></h3>
        <p class="bc-layer"></p>
        <p class="bc-desc"></p>
        <div class="bc-acts"><a class="btn-gold bc-more" href="#">${esc(t('readGuide'))}</a><button type="button" class="btn-ghost bc-ask">${esc(t('askThis'))}</button></div>
        <p class="bc-note" role="status"></p>
        <div class="bc-step"><button type="button" class="bc-prev" aria-label="Previous">‹</button><span class="bc-pos"></span><button type="button" class="bc-next" aria-label="Next">›</button></div>
      </aside>
    </div>`;

  const view = $('.booth-view', host), cam = $('.booth-cam', host), card = $('.booth-card', host);
  const tabs = $$('.booth-tabs button', host), bays = $$('.bay', host);
  let bay = 0, focus = null;

  function fit() {
    // phones stack a bay's items three to a row, so the booth grows with the busiest row count
    const n = +bays[bay].style.getPropertyValue('--n'), rows = n <= 2 ? 1 : Math.ceil(n / 3);
    if (view.clientWidth < 700) { view.style.height = `${rows * 250 + 110}px`; host.style.setProperty('--rows', rows); }
    else { view.style.height = ''; host.style.removeProperty('--rows'); }
  }
  function place(animate = true) {
    cam.classList.toggle('still', !animate || reduced);
    const W = view.clientWidth;
    if (!focus) { cam.style.transform = `translate3d(${-bay * W}px,0,0)`; return; }
    // move in on the item: scale the camera and put the item left of the card (or above it on phones)
    const slot = focus.el, b = bays[bay];
    const sx = bay * W + slot.offsetLeft + slot.offsetParent.offsetLeft + slot.offsetWidth / 2;
    const it = $('.item', slot);
    const sy = b.offsetTop + slot.offsetParent.offsetTop + slot.offsetTop + (it.offsetTop + 40 + slot.offsetHeight) / 2;   // the item and its plinth
    const phone = W < 700, z = phone ? 1.5 : 1.55;
    const fx = phone ? W / 2 : (W - card.offsetWidth - 18) / 2, fy = phone ? view.clientHeight * 0.26 : view.clientHeight * 0.5;
    cam.style.transform = `translate3d(${fx - sx * z}px,${fy - sy * z}px,0) scale(${z})`;
  }
  function goBay(i) {
    close(false);
    bay = (i + bays.length) % bays.length;
    tabs.forEach((x, k) => x.setAttribute('aria-selected', String(k === bay)));
    bays.forEach((x, k) => x.classList.toggle('here', k === bay));
    fit();
    tabs[bay].scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
    place();
  }
  function open(el) {
    const s = SERVICES.find((x) => x.id === +el.dataset.id); if (!s) return;
    focus = { el, s };
    $$('.slot.on', host).forEach((x) => x.classList.remove('on'));
    el.classList.add('on'); view.classList.add('zoomed');
    const c = CATS.find((x) => x.id === s.cat), f = FLOORS.find((x) => x.n === s.floor);
    $('.bc-cat', card).textContent = c ? nameOf(c) : '';
    $('.bc-name', card).textContent = s.name;
    $('.bc-layer', card).innerHTML = `<span class="pd-bars" aria-hidden="true">${[1, 2, 3, 4, 5].map((n) => `<i class="${n === s.floor ? 'on' : ''}"></i>`).join('')}</span><span>${f ? `${t('dirFloor', { n: f.n })}, ${esc(LANG === 'en' ? f.en : f.th)}` : t('layerNone')}</span>`;
    $('.bc-desc', card).textContent = LANG === 'en' ? s.en : s.th;
    $('.bc-more', card).href = s.url;
    $('.bc-note', card).textContent = '';
    const list = $$('.slot', bays[bay]);
    $('.bc-pos', card).textContent = `${list.indexOf(el) + 1} / ${list.length}`;
    card.hidden = false; requestAnimationFrame(() => card.classList.add('in'));
    place();
    ritzSay('found');
  }
  function close(animate = true) {
    if (!focus) return;
    focus.el.classList.remove('on'); focus = null;
    view.classList.remove('zoomed'); card.classList.remove('in');
    setTimeout(() => { if (!focus) card.hidden = true; }, 400);
    place(animate);
  }
  function step(d) {
    if (!focus) return;
    const list = $$('.slot', bays[bay]);
    open(list[(list.indexOf(focus.el) + d + list.length) % list.length]);
  }

  host.addEventListener('click', (e) => {
    const tab = e.target.closest('.booth-tabs button'); if (tab) { goBay(+tab.dataset.i); return; }
    const slot = e.target.closest('.slot');
    if (slot) { focus?.el === slot ? close() : open(slot); return; }
    if (e.target.closest('.booth-nav')) { goBay(bay + (e.target.closest('.next') ? 1 : -1)); return; }
    if (e.target.closest('.bc-close')) { close(); return; }
    if (e.target.closest('.bc-prev')) { step(-1); return; }
    if (e.target.closest('.bc-next')) { step(1); return; }
    if (e.target.closest('.bc-ask')) { sendToLine(t('lineMsg', { c: focus.s.name, list: focus.s.name }), $('.bc-note', card)); return; }
    if (focus && !e.target.closest('.booth-card')) close();
  });
  host.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && focus) { close(); return; }
    if (focus && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); }
    else if (e.target.closest('.booth-tabs') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); goBay(bay + (e.key === 'ArrowRight' ? 1 : -1)); tabs[bay].focus(); }
  });
  // swipe between bays on touch screens
  let tx = null;
  view.addEventListener('touchstart', (e) => { tx = focus ? null : e.touches[0].clientX; }, { passive: true });
  view.addEventListener('touchend', (e) => {
    if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) goBay(bay + (dx < 0 ? 1 : -1));
  });
  addEventListener('resize', () => { fit(); place(false); });
  goBay(0); place(false);
  // the lights come up the first time the booth is on screen
  new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { io.disconnect(); host.classList.add('lit'); } }, { threshold: 0.3 }).observe(host);
}
