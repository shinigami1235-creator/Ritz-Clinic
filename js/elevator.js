// The 5-Layer Lift: brass panel, dial needle and doors that close and open between floors.
import { FLOORS, T } from './data.js';
import { LANG, t, pick } from './i18n.js';
import { $, $$, reduced, renderImg, ritzSay } from './core.js';

const ANG = (n) => -64 + (n - 1) * 32;
const LAYER_COLORS = ['#F6DECB', '#EBC3AA', '#EBDFC9', '#D8C6B6', '#C98A7C'];

export function mountElevator(root = document) {
  const shaft = $('.lift-shaft', root);
  if (!shaft) return;
  const btnWrap = $('#liftButtons', root);
  // the floor indicator: brass bezel, enamel face, ticks, a lamp per floor and a counterweighted needle
  const C = { x: 120, y: 126 }, at = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return [C.x + Math.cos(a) * r, C.y + Math.sin(a) * r].map((v) => v.toFixed(1)); };
  const arc = (r) => { const [x0, y0] = at(-90, r), [x1, y1] = at(90, r); return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`; };
  let ticks = '', marks = '', lamps = '';
  for (let d = -80; d <= 80; d += 4) {
    const major = FLOORS.some((f) => ANG(f.n) === d), mid = d % 16 === 0;
    const [x0, y0] = at(d, major ? 86 : mid ? 91 : 94), [x1, y1] = at(d, 99);
    ticks += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke-width="${major ? 1.8 : mid ? 1 : .6}"/>`;
  }
  FLOORS.forEach((f) => {
    const [tx, ty] = at(ANG(f.n), 76), [lx, ly] = at(ANG(f.n), 106.5);
    marks += `<text x="${tx}" y="${(+ty + 6).toFixed(1)}" text-anchor="middle">${f.n}</text>`;
    lamps += `<circle class="lamp" data-n="${f.n}" cx="${lx}" cy="${ly}" r="2.6"/>`;
  });
  $('#dial', root).innerHTML = `<defs>
      <linearGradient id="dBrass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6EBD4"/><stop offset=".35" stop-color="#C9B08C"/><stop offset=".6" stop-color="#8E7650"/><stop offset=".85" stop-color="#E3D0AA"/><stop offset="1" stop-color="#A88E62"/></linearGradient>
      <radialGradient id="dFace" cx=".5" cy=".95" r=".95"><stop offset="0" stop-color="#FFFCF5"/><stop offset=".7" stop-color="#F4EADA"/><stop offset="1" stop-color="#E4D5BC"/></radialGradient>
      <linearGradient id="dGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <radialGradient id="dCap" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFF6DF"/><stop offset=".5" stop-color="#C9B08C"/><stop offset="1" stop-color="#6A5638"/></radialGradient>
      <filter id="dShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="1.5" dy="2" stdDeviation="1.2" flood-color="#2B231E" flood-opacity=".45"/></filter>
    </defs>
    <path d="${arc(114)} L234 140 L6 140 Z" fill="url(#dBrass)"/>
    <path d="${arc(111)} L231 137 L9 137 Z" fill="none" stroke="#FFF6DF" stroke-opacity=".6" stroke-width=".8"/>
    <path d="${arc(103)} Z" fill="url(#dFace)" stroke="#6A5638" stroke-width="1"/>
    <path d="${arc(60)}" fill="none" stroke="#AC9359" stroke-width=".6" stroke-dasharray="1 3"/>
    <g class="ticks" stroke="#4A3C30">${ticks}</g>
    <g class="marks">${marks}</g>
    <g class="lamps">${lamps}</g>
    <g id="needle" filter="url(#dShadow)">
      <path d="M118.6 126 L119.3 74 L120 64 L120.7 74 L121.4 126 Z" fill="#2B231E"/>
      <path d="M120 72 L116 82 L120 79 L124 82 Z" fill="#2B231E"/>
      <path d="M118.4 126 L118.4 138 L121.6 138 L121.6 126 Z" fill="#2B231E"/>
      <circle cx="120" cy="141" r="4.2" fill="#2B231E"/>
    </g>
    <circle cx="120" cy="126" r="9" fill="url(#dCap)" stroke="#5A4A32" stroke-width=".8"/>
    <circle cx="120" cy="126" r="3.4" fill="#3A2F27"/>
    <path d="${arc(103)} Z" fill="url(#dGlass)" pointer-events="none"/>
    <rect x="6" y="137" width="228" height="9" rx="1.5" fill="url(#dBrass)"/>
    ${[22, 218].map((x) => `<circle cx="${x}" cy="141.5" r="2.4" fill="url(#dCap)" stroke="#5A4A32" stroke-width=".5"/><line x1="${x - 1.6}" y1="${141.5 - 1.6}" x2="${x + 1.6}" y2="${141.5 + 1.6}" stroke="#5A4A32" stroke-width=".6"/>`).join('')}`;
  $('#layers', root).innerHTML = FLOORS.map((f, i) => `<div style="background:${LAYER_COLORS[i]}">${LANG === 'en' ? f.en : f.th}</div>`).join('');
  FLOORS.forEach((f) => {
    const b = document.createElement('button');
    b.className = 'lift-btn'; b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.n = f.n;
    b.innerHTML = LANG === 'en' ? `<span class="num">${f.n}</span><span class="lbl">${f.en}</span>` : `<span class="num">${f.n}</span><span class="lbl">${f.th}<small>${f.en}</small></span>`;
    b.addEventListener('click', () => { goFloor(f.n); ritzSay('floor'); });
    btnWrap.appendChild(b);
  });

  let floor = 0; let moving = false;
  function renderFloor(n) {
    const f = FLOORS.find((x) => x.n === n);
    $('#roomFloor', root).textContent = t('floorOf', { n: f.n });
    $('#roomTitle', root).innerHTML = LANG === 'en' ? f.en : `${f.th}<small>${f.en}</small>`;
    $('#roomNote', root).textContent = pick(f, 'note');
    const keys = $('#roomKeys', root), cols = Math.max(3, Math.ceil(f.items.length / 2));
    keys.style.setProperty('--cols', cols); keys.classList.toggle('dense', cols > 4);   // never more than two rows, so the busy floor stays as short as the rest
    keys.innerHTML = f.items.map((k, i) => `<li style="transition-delay:${140 + i * 60}ms"><a href="${T[k].url}"><span class="thumb">${renderImg(T[k].id)}</span><b>${T[k].name}</b></a></li>`).join('');
    [...$('#layers', root).children].forEach((el, i) => el.classList.toggle('on', i === n - 1));
    [...btnWrap.children].forEach((b) => b.setAttribute('aria-selected', String(+b.dataset.n === n)));
    $('#needle', root).style.transform = `rotate(${ANG(n)}deg)`;
    $$('.lamp', root).forEach((l) => l.classList.toggle('on', +l.dataset.n === n));
    $('#liftNo', root).textContent = f.n;
    $('#liftName', root).textContent = LANG === 'en' ? f.en : f.th;
  }
  function goFloor(n) {
    if (n === floor || moving) return;
    moving = true;
    shaft.classList.remove('open');
    setTimeout(() => {
      renderFloor(n); floor = n;
      setTimeout(() => { shaft.classList.add('open'); moving = false; }, reduced ? 0 : 1000);
    }, reduced || !floor ? 0 : 900);
  }
  // every floor gets the height of the tallest one, so the lift never changes size between floors
  const room = $('.lift-room', root);
  function settle() {
    room.style.minHeight = '';
    let max = 0;
    FLOORS.forEach((f) => { renderFloor(f.n); max = Math.max(max, room.scrollHeight); });
    room.style.minHeight = shaft.style.minHeight = `${max}px`;
    renderFloor(floor || 1);
  }
  settle();
  document.fonts?.ready.then(settle);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(settle, 200); });
  new IntersectionObserver((es, o) => {
    if (es[0].isIntersecting) { goFloor(1); o.disconnect(); }
  }, { threshold: 0.35 }).observe(shaft);
  return { goFloor };
}
