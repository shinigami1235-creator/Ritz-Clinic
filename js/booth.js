// The showroom: one small room per programme, built in real 3D with CSS. A back wall with lit
// niches (or the programme's poster), two side walls angled toward you with screens on
// cabinets, and plinths on the floor. Each machine stands on a plinth turned the same way
// the machine was photographed, so a machine shot from its side faces the middle of the room.
// Tap anything and the camera moves in on it while a card slides out with what it is.
import { SERVICES, CATS, FLOORS } from './data.js';
import { CAT_BANNERS } from './media.js';
import { LANG, t } from './i18n.js';
import { $, $$, esc, renderOf, ritzSay, reduced, sendToLine } from './core.js';

// which way each machine faces in its picture: F front, L turned to the viewer's left, R to the right
const FACE = { 682515: 'L', 509619: 'F', 516098: 'R', 4341: 'R', 562000: 'L', 509437: 'F', 557783: 'L', 515783: 'L', 4211: 'R' };
// boxes, vials and small hand pieces go on shelves; the rest stand on the floor
const SMALL = new Set([395323, 395880, 395018, 557139, 746481, 746484, 746486, 746488]);

const HERO = new Set([746484, 557139]);
const FLOOR_Y = 510;                       // world y of the floor
const SLOTS = {                            // floor plinths: x, z, plinth size, turn
  C: { x: 600, z: 40, w: 210, d: 150, h: 64, a: 0, ih: 250 },
  L: { x: 335, z: -40, w: 170, d: 130, h: 104, a: 30, ih: 230 },
  R: { x: 865, z: -40, w: 170, d: 130, h: 92, a: -30, ih: 230 },
  BL: { x: 470, z: -250, w: 140, d: 110, h: 132, a: 16, ih: 190 },
  BR: { x: 730, z: -250, w: 140, d: 110, h: 120, a: -16, ih: 190 },
};
const nameOf = (c) => (LANG === 'en' ? c.en : c.th);

function box({ w, d, h, cls = '', front = '' }) {
  return `<span class="bx ${cls}" style="width:${w}px;height:${h}px">
    <i class="bx-top" style="width:${w}px;height:${d}px;top:${-d / 2}px"></i>
    <i class="bx-l" style="width:${d}px;height:${h}px;left:${(w - d) / 2}px;transform:rotateY(-90deg) translateZ(${w / 2}px)"></i>
    <i class="bx-r" style="width:${d}px;height:${h}px;left:${(w - d) / 2}px;transform:rotateY(90deg) translateZ(${w / 2}px)"></i>
    <span class="bx-f" style="transform:translateZ(${d / 2}px)">${front}</span>
  </span>`;
}
const plate = (s) => `<span class="plate">${esc(s.name)}</span>`;

function room(c, b) {
  const items = SERVICES.filter((s) => s.cat === c.id && renderOf(s.id));
  const prods = items.filter((s) => renderOf(s.id).kind === 'product');
  let devices = prods.filter((s) => !SMALL.has(s.id)), smalls = prods.filter((s) => SMALL.has(s.id));
  const photos = items.filter((s) => renderOf(s.id).kind !== 'product');
  if (!devices.length && smalls.length) {                              // a shelf-only room puts its showpiece on the podium
    const hero = smalls.find((s) => HERO.has(s.id)) || smalls[0];
    devices = [hero]; smalls = smalls.filter((s) => s !== hero);
  }

  // devices to floor slots by the way they face
  const free = new Set(Object.keys(SLOTS)), floor = [];
  const take = (pref) => { for (const k of pref) if (free.has(k)) { free.delete(k); return k; } return null; };
  for (const s of devices) {
    const f = FACE[s.id] || 'F';
    const k = take(f === 'L' ? ['R', 'BR', 'C', 'L', 'BL'] : f === 'R' ? ['L', 'BL', 'C', 'R', 'BR'] : ['C', 'L', 'R', 'BL', 'BR']);
    if (k) floor.push([k, s]);
  }
  const plaque = !floor.some(([k]) => k === 'C');

  // photos to the screens on the side walls, back slot first
  const wings = { l: [], r: [] };
  photos.forEach((s, i) => (i % 2 ? wings.r : wings.l).push(s));
  const slotBtn = (s, inner, cls, style) => `<button type="button" class="it ${cls}" data-id="${s.id}" aria-label="${esc(s.name)}" style="${style}">${inner}</button>`;

  const wing = (side, list) => {
    const xs = side === 'l' ? [300, 90] : [50, 260];
    const cab = list.length ? box({ w: 460, d: 70, h: 120, cls: 'cab', front: list.map((s, i) => `<span class="plate" style="left:${xs[i] - 30 + 85 - 45}px">${esc(s.name)}</span>`).join('') }) : '';
    return `<div class="rwall wing wing-${side}">
      <i class="trim"></i><i class="led"></i>
      ${list.length ? list.map((s, i) => `<i class="pool" style="left:${xs[i] - 40}px;top:120px;width:250px;height:300px"></i>` + slotBtn(s, `<span class="screen"><img src="${renderOf(s.id).src}" alt="" loading="lazy" draggable="false"></span>`, 'on-wing', `left:${xs[i]}px;top:262px`)).join('')
        : `<span class="emblem"><img src="assets/brand/r-mark.svg" alt=""></span>`}
      ${cab ? `<span class="cab-wrap" style="left:30px;top:510px">${cab}</span>` : ''}
    </div>`;
  };

  // the back wall: niches with shelves for the small things, or the programme poster
  const shelfItems = smalls.slice(0, 8);
  const back = shelfItems.length ? `
      ${[0, 1].map((n) => `<span class="niche" style="left:${n ? 500 : 46}px"><i class="niche-light"></i>
        ${[0, 1].map((r) => `<i class="nshelf" style="top:${r ? 412 : 182}px"></i>`).join('')}
        ${((list) => list.map((s, j) => { const two = list.length <= 2, x = two ? 60 : (j % 2) * 100 + 10, up = two ? j === 0 : j < 2; return slotBtn(s, `<img class="prod" src="${renderOf(s.id).src}" alt="" loading="lazy" draggable="false">${plate(s)}`, 'on-shelf', `left:${x}px;bottom:${up ? 250 : 20}px;--k:${j}`); }).join(''))(shelfItems.filter((_, i) => i % 2 === n))}
      </span>`).join('')}`
    : `<span class="poster"><i class="pool" style="left:-40px;top:-80px;width:560px;height:360px"></i><img src="${CAT_BANNERS[c.id]}" alt="" loading="lazy"></span>`;

  return `<section class="room" data-i="${b}" aria-label="${esc(nameOf(c))}">
    <div class="world">
      <div class="floor"></div>
      <div class="rwall back"><i class="trim"></i><i class="led"></i>
        <p class="room-sign"><small>${String(b + 1).padStart(2, '0')}</small>${esc(nameOf(c))}</p>
        ${[150, 378, 606].map((x) => `<i class="fixture" style="left:${x}px"></i>`).join('')}
        ${back}
      </div>
      ${wing('l', wings.l)}${wing('r', wings.r)}
      ${floor.map(([k, s], n) => {
        const p = SLOTS[k], src = renderOf(s.id).src;
        return `<i class="cone" style="left:${p.x - 150}px;top:-120px;height:${FLOOR_Y - p.h - p.ih + 140}px;transform:translateZ(${p.z}px)"></i>
          <span class="stand" style="left:${p.x - p.w / 2}px;top:${FLOOR_Y - p.h}px;transform:translateZ(${p.z}px) rotateY(${p.a}deg)">${box({ w: p.w, d: p.d, h: p.h, front: plate(s) })}</span>
          ${slotBtn(s, `<img class="prod" src="${src}" alt="" loading="lazy" draggable="false">`, 'on-floor', `left:${p.x - 130}px;top:${FLOOR_Y - p.h - p.ih}px;height:${p.ih}px;transform:translateZ(${p.z}px);--k:${n}`)}`;
      }).join('')}
      ${plaque ? `<span class="stand" style="left:${600 - 120}px;top:${FLOOR_Y - 70}px;transform:translateZ(40px)">${box({ w: 240, d: 150, h: 70, front: `<span class="plaque"><b>${esc(nameOf(c))}</b><small>${t('progCount', { n: items.length })}</small></span>` })}</span>` : ''}
    </div>
  </section>`;
}

export function mountBooth(host) {
  const cats = CATS.filter((c) => SERVICES.some((s) => s.cat === c.id && renderOf(s.id)));
  host.innerHTML = `
    <div class="booth-tabs" role="tablist">${cats.map((c, i) => `<button type="button" role="tab" data-i="${i}" aria-selected="${i === 0}">${esc(nameOf(c))}<small>${SERVICES.filter((s) => s.cat === c.id && renderOf(s.id)).length}</small></button>`).join('')}</div>
    <div class="booth-frame"><div class="booth-view">
      <div class="booth-pan"><div class="booth-stage"><div class="booth-cam">${cats.map(room).join('')}</div></div></div>
      <button type="button" class="booth-nav prev" aria-label="Previous programme">‹</button>
      <button type="button" class="booth-nav next" aria-label="Next programme">›</button>
      </div>
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

  const view = $('.booth-view', host), pan = $('.booth-pan', host), stage = $('.booth-stage', host), cam = $('.booth-cam', host), card = $('.booth-card', host);
  const tabs = $$('.booth-tabs button', host), rooms = $$('.room', host);
  let cur = 0, focus = null, scale = 1;

  function fit() {
    // the room is designed at 1200 x 660 and scaled to fit; phones keep it larger and let you pan across
    const W = view.clientWidth, phone = W < 700;
    scale = phone ? Math.max(W / 1200, 0.74) : W / 1200;
    host.style.setProperty('--s', scale);
    stage.style.width = `${1200 * scale}px`; stage.style.height = `${660 * scale}px`;
    view.style.height = `${660 * scale}px`;
    if (phone && !focus) pan.scrollLeft = (1200 * scale - W) / 2;
  }
  function aim(animate = true) {
    cam.classList.toggle('still', !animate || reduced);
    if (!focus) { cam.style.transform = ''; return; }
    // move in on the item: measure it with the camera at rest, then scale toward it
    const prev = cam.style.transform; cam.style.transform = 'none';
    const r = focus.el.getBoundingClientRect(), base = stage.getBoundingClientRect();
    cam.style.transform = prev; void cam.offsetWidth;
    const sx = r.left + r.width / 2 - base.left, sy = r.top + r.height * 0.55 - base.top;
    const W = view.clientWidth, H = view.clientHeight, phone = W < 700, z = phone ? 1.3 : 1.7;
    const fx = pan.scrollLeft + (phone ? W / 2 : (W - card.offsetWidth - 18) / 2), fy = H * 0.5;
    cam.style.transform = `translate3d(${fx - sx * z}px,${fy - sy * z}px,0) scale(${z})`;
  }
  function go(i) {
    close(false);
    const old = rooms[cur];
    cur = (i + rooms.length) % rooms.length;
    if (old !== rooms[cur]) { old.classList.remove('here'); old.classList.add('gone'); setTimeout(() => old.classList.remove('gone'), 900); }
    rooms[cur].classList.add('here');
    tabs.forEach((x, k) => x.setAttribute('aria-selected', String(k === cur)));
    tabs[cur].scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
    fit();
  }
  function open(el) {
    const s = SERVICES.find((x) => x.id === +el.dataset.id); if (!s) return;
    focus = { el, s };
    $$('.it.on', host).forEach((x) => x.classList.remove('on'));
    el.classList.add('on'); view.classList.add('zoomed');
    const c = CATS.find((x) => x.id === s.cat), f = FLOORS.find((x) => x.n === s.floor);
    $('.bc-cat', card).textContent = c ? nameOf(c) : '';
    $('.bc-name', card).textContent = s.name;
    $('.bc-layer', card).innerHTML = `<span class="pd-bars" aria-hidden="true">${[1, 2, 3, 4, 5].map((n) => `<i class="${n === s.floor ? 'on' : ''}"></i>`).join('')}</span><span>${f ? `${t('dirFloor', { n: f.n })}, ${esc(LANG === 'en' ? f.en : f.th)}` : t('layerNone')}</span>`;
    $('.bc-desc', card).textContent = LANG === 'en' ? s.en : s.th;
    $('.bc-more', card).href = s.url;
    $('.bc-note', card).textContent = '';
    const list = $$('.it', rooms[cur]);
    $('.bc-pos', card).textContent = `${list.indexOf(el) + 1} / ${list.length}`;
    card.hidden = false; requestAnimationFrame(() => card.classList.add('in'));
    aim();
    ritzSay('found');
  }
  function close(animate = true) {
    if (!focus) return;
    focus.el.classList.remove('on'); focus = null;
    view.classList.remove('zoomed'); card.classList.remove('in');
    setTimeout(() => { if (!focus) card.hidden = true; }, 400);
    aim(animate);
  }
  function step(d) {
    if (!focus) return;
    const list = $$('.it', rooms[cur]);
    open(list[(list.indexOf(focus.el) + d + list.length) % list.length]);
  }

  host.addEventListener('click', (e) => {
    const tab = e.target.closest('.booth-tabs button'); if (tab) { go(+tab.dataset.i); return; }
    const it = e.target.closest('.it');
    if (it) { focus?.el === it ? close() : open(it); return; }
    if (e.target.closest('.booth-nav')) { go(cur + (e.target.closest('.next') ? 1 : -1)); return; }
    if (e.target.closest('.bc-close')) { close(); return; }
    if (e.target.closest('.bc-prev')) { step(-1); return; }
    if (e.target.closest('.bc-next')) { step(1); return; }
    if (e.target.closest('.bc-ask')) { sendToLine(t('lineMsg', { c: focus.s.name, list: focus.s.name }), $('.bc-note', card)); return; }
    if (focus && !e.target.closest('.booth-card')) close();
  });
  host.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && focus) { close(); return; }
    if (focus && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); }
    else if (e.target.closest('.booth-tabs') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); go(cur + (e.key === 'ArrowRight' ? 1 : -1)); tabs[cur].focus(); }
  });
  // the room leans a little toward the pointer, as if you shifted where you stand
  view.addEventListener('pointermove', (e) => {
    if (focus || reduced || e.pointerType !== 'mouse') return;
    const r = view.getBoundingClientRect();
    host.style.setProperty('--lx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    host.style.setProperty('--ly', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  });
  view.addEventListener('pointerleave', () => { host.style.setProperty('--lx', 0); host.style.setProperty('--ly', 0); });
  addEventListener('resize', () => { fit(); aim(false); });
  go(0);
  new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { io.disconnect(); host.classList.add('lit'); } }, { threshold: 0.3 }).observe(host);
}
