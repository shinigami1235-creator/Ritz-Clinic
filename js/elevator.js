// The 5-Layer Lift: brass panel, dial needle and doors that close and open between floors.
import { FLOORS, T } from './data.js';
import { LANG, t, pick } from './i18n.js';
import { $, reduced } from './core.js';

const ANG = (n) => -64 + (n - 1) * 32;
const LAYER_COLORS = ['#F6DECB', '#EBC3AA', '#F1E2B5', '#D8C6B6', '#C98A7C'];

export function mountElevator(root = document) {
  const shaft = $('.lift-shaft', root);
  if (!shaft) return;
  const btnWrap = $('#liftButtons', root);
  let s = '';
  for (let n = 1; n <= 5; n++) {
    const a = (ANG(n) - 90) * Math.PI / 180;
    s += `<text x="${(110 + Math.cos(a) * 82).toFixed(1)}" y="${(116 + Math.sin(a) * 82 + 5).toFixed(1)}" text-anchor="middle">${n}</text>`;
  }
  $('#dialTicks', root).innerHTML = s;
  $('#layers', root).innerHTML = FLOORS.map((f, i) => `<div style="background:${LAYER_COLORS[i]}">${LANG === 'en' ? f.en : f.th}</div>`).join('');
  FLOORS.forEach((f) => {
    const b = document.createElement('button');
    b.className = 'lift-btn'; b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.n = f.n;
    b.innerHTML = LANG === 'en' ? `<span class="num">${f.n}</span><span class="lbl">${f.en}</span>` : `<span class="num">${f.n}</span><span class="lbl">${f.th}<small>${f.en}</small></span>`;
    b.addEventListener('click', () => goFloor(f.n));
    btnWrap.appendChild(b);
  });

  let floor = 0; let moving = false;
  function renderFloor(n) {
    const f = FLOORS.find((x) => x.n === n);
    $('#roomFloor', root).textContent = t('floorOf', { n: f.n });
    $('#roomTitle', root).innerHTML = LANG === 'en' ? f.en : `${f.th}<small>${f.en}</small>`;
    $('#roomNote', root).textContent = pick(f, 'note');
    $('#roomKeys', root).innerHTML = f.items.map((k, i) => `<li style="transition-delay:${120 + i * 50}ms"><a href="${T[k].url}">${T[k].name}</a></li>`).join('');
    [...$('#layers', root).children].forEach((el, i) => el.classList.toggle('on', i === n - 1));
    [...btnWrap.children].forEach((b) => b.setAttribute('aria-selected', String(+b.dataset.n === n)));
    $('#needle', root).style.transform = `rotate(${ANG(n)}deg)`;
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
  new IntersectionObserver((es, o) => {
    if (es[0].isIntersecting) { goFloor(1); o.disconnect(); }
  }, { threshold: 0.35 }).observe(shaft);
  return { goFloor };
}
