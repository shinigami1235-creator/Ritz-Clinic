// The showroom: one small room per programme, built in real 3D with CSS. Every room is laid out
// symmetrically: the machines and products stand in a half circle on a raised dais, the ones at
// the back raised higher so nothing hides behind anything, and each turned toward the middle.
// Treatment photos hang as framed portraits on the side walls. Tap anything and the camera moves
// in on it while a card slides out with what it is.
import { SERVICES, CATS, FLOORS } from './data.js';
import { CAT_BANNERS } from './media.js';
import { LANG, t } from './i18n.js';
import { $, $$, esc, renderOf, ritzSay, reduced, sendToLine } from './core.js';

// which way each machine faces in its picture: F front, L turned to the viewer's left, R to the right
const FACE = { 682515: 'F', 509619: 'F', 516098: 'F', 4341: 'R', 562000: 'R', 509437: 'F', 557783: 'L', 515783: 'F', 4211: 'L' };
// machines with no readable lettering can be mirrored; the rest carry their names and stay as shot
const FLIP_OK = new Set([509619, 516098]);
// boxes, vials and small hand pieces stand on slim columns at eye level instead of floor plinths
const SMALL = new Set([395323, 395880, 395018, 557139, 746481, 746484, 746486, 746488]);
// angles around the half circle for 1 to 5 pieces, 0 is the back middle
const ARC = { 1: [0], 2: [-38, 38], 3: [-58, 0, 58], 4: [-68, -22, 22, 68], 5: [-74, -37, 0, 37, 74] };
const FLOOR_Y = 510;
const nameOf = (c) => (LANG === 'en' ? c.en : c.th);

// the best way to seat pieces around the arc: on the left they should face right, on the right
// face left, in the middle face front. Tries every order (at most 5 pieces) and every allowed mirror.
function seat(pieces, angles) {
  const cost = (deg, f) => {
    if (deg === 0) return f === 'F' ? 0 : 1;
    const want = deg < 0 ? 'R' : 'L';
    return f === want ? 0 : f === 'F' ? 1 : 4;
  };
  let best = null;
  const perm = (rest, done) => {
    if (!rest.length) {
      let total = 0; const out = [];
      done.forEach((p, i) => {
        const f = FACE[p.id] || 'F', alt = f === 'L' ? 'R' : f === 'R' ? 'L' : 'F';
        const a = cost(angles[i], f), b = FLIP_OK.has(p.id) ? cost(angles[i], alt) : Infinity;
        total += Math.min(a, b); out.push([p, b < a]);
      });
      if (!best || total < best.total) best = { total, out };
      return;
    }
    rest.forEach((p, i) => perm([...rest.slice(0, i), ...rest.slice(i + 1)], [...done, p]));
  };
  perm(pieces, []);
  return best ? best.out : [];
}

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
  const pieces = items.filter((s) => renderOf(s.id).kind === 'product');
  const photos = items.filter((s) => renderOf(s.id).kind !== 'product');
  const n = Math.min(pieces.length, 5), angles = ARC[n] || [];
  const seated = seat(pieces.slice(0, 5), angles);
  const slotBtn = (s, inner, cls, style) => `<button type="button" class="it ${cls}" data-id="${s.id}" aria-label="${esc(s.name)}" style="${style}">${inner}</button>`;

  // the half circle on the dais
  const arc = seated.map(([s, flip], i) => {
    const deg = angles[i], r = (deg * Math.PI) / 180, small = SMALL.has(s.id);
    const x = 600 + 360 * Math.sin(r), z = -200 + 240 * (1 - Math.cos(r)), cos = Math.cos(r);
    const w = small ? 92 : 180, d = small ? 92 : 130;
    const h = Math.round(small ? 150 + 80 * cos : 46 + 100 * cos * cos);
    const ih = small ? 140 : 228, iw = small ? 160 : 260;
    const top = FLOOR_Y - 18 - h;                       // the dais lifts everything 18
    return `<i class="cone" style="left:${x - 150}px;top:-120px;height:${top - ih + 150}px;transform:translateZ(${z}px)"></i>
      <span class="stand" style="left:${x - w / 2}px;top:${top}px;transform:translateZ(${z}px) rotateY(${(-deg * 0.55).toFixed(1)}deg)">${box({ w, d, h, cls: small ? 'col' : '', front: `<span class="plate">${esc(s.name)}</span>` })}</span>
      ${slotBtn(s, `<img class="prod${flip ? ' flip' : ''}" src="${renderOf(s.id).src}" alt="" loading="lazy" draggable="false">`, small ? 'on-col' : 'on-floor', `left:${x - iw / 2}px;width:${iw}px;top:${top - ih}px;height:${ih}px;transform:translateZ(${z}px);--k:${i}`)}`;
  }).join('');

  // portraits: the same number on each side wall, an odd one goes in the middle of the back wall
  const per = Math.floor(photos.length / 2), mid = photos.length % 2 ? photos[photos.length - 1] : null;
  const frame = (s, style) => slotBtn(s, `<i class="pic-light"></i><span class="frame"><img src="${renderOf(s.id).src}" alt="" loading="lazy" draggable="false"></span><span class="plate">${esc(s.name)}</span>`, 'portrait', style);
  const wing = (side) => {
    const list = side === 'l' ? photos.slice(0, per) : photos.slice(per, per * 2);
    const xs = list.length === 1 ? [190] : [100, 290];
    return `<div class="rwall wing wing-${side}"><i class="trim"></i><i class="dado"></i><i class="led"></i>
      ${list.length ? list.map((s, i) => frame(s, `left:${side === 'l' ? xs[i] : 520 - 140 - xs[i]}px;top:226px`)).join('') : '<span class="emblem"><img src="assets/brand/r-mark.svg" alt=""></span>'}
    </div>`;
  };
  const centre = mid ? frame(mid, 'left:308px;top:226px')
    : n <= 2 ? `<span class="poster"><img src="${CAT_BANNERS[c.id]}" alt="" loading="lazy"></span>`
    : '<span class="flutes"><img src="assets/brand/r-mark.svg" alt=""></span>';

  return `<section class="room" data-i="${b}" aria-label="${esc(nameOf(c))}">
    <div class="world">
      <div class="floor"></div>
      <div class="dais"></div>
      <div class="rwall back"><i class="trim"></i><i class="dado"></i><i class="led"></i>
        <p class="room-sign"><small>${String(b + 1).padStart(2, '0')}</small>${esc(nameOf(c))}</p>
        ${[150, 378, 606].map((x) => `<i class="fixture" style="left:${x}px"></i>`).join('')}
        <i class="pool" style="left:128px;top:120px;width:500px;height:380px"></i>
        ${centre}
      </div>
      ${wing('l')}${wing('r')}
      ${arc}
      ${n ? '' : `<span class="stand" style="left:${600 - 120}px;top:${FLOOR_Y - 18 - 70}px;transform:translateZ(40px)">${box({ w: 240, d: 150, h: 70, front: `<span class="plaque"><b>${esc(nameOf(c))}</b><small>${t('progCount', { n: items.length })}</small></span>` })}</span>`}
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
