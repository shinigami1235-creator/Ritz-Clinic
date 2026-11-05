// The showroom shelf: every machine and medicine cut out of the clinic's own pictures,
// floating on lit plinths. Drag sideways on desktop, swipe on phones.
import { SERVICES, CATS } from './data.js';
import { LANG } from './i18n.js';
import { esc, renderOf, ritzSay } from './core.js';

export function mountShelf(shelf, { only = 'product' } = {}) {
  const list = SERVICES.filter((s) => { const r = renderOf(s.id); return r && (!only || r.kind === only); });
  shelf.innerHTML = list.map((s, i) => {
    const r = renderOf(s.id); const cat = CATS.find((c) => c.id === s.cat);
    return `<a class="exhibit" href="${s.url}" style="--d:${(i % 5) * -1.1}s" draggable="false">
      <span class="stage">${r.kind === 'product' ? `<img class="prod" src="${r.src}" alt="" loading="lazy" draggable="false">` : `<img class="photo-prod" src="${r.src}" alt="" loading="lazy" draggable="false">`}<span class="plinth"></span></span>
      <span class="label"><b>${esc(s.name)}</b><span>${esc(cat ? (LANG === 'en' ? cat.en : cat.th) : '')}</span></span>
    </a>`;
  }).join('');
  // drag to scroll with a little momentum
  let down = false, sx = 0, sl = 0, moved = false, v = 0, lx = 0, lt = 0;
  shelf.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = lx = e.clientX; sl = shelf.scrollLeft; lt = performance.now(); v = 0; });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; shelf.classList.add('drag'); }
    shelf.scrollLeft = sl - dx;
    const now = performance.now(); v = (e.clientX - lx) / Math.max(1, now - lt); lx = e.clientX; lt = now;
  });
  addEventListener('pointerup', () => {
    if (!down) return; down = false; shelf.classList.remove('drag');
    let vel = -v * 16;
    (function glide() { if (Math.abs(vel) < 0.5) return; shelf.scrollLeft += vel; vel *= 0.93; requestAnimationFrame(glide); })();
  });
  shelf.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
  // the product under the pointer tilts toward it
  shelf.addEventListener('pointermove', (e) => {
    const ex = e.target.closest('.exhibit'); if (!ex) return;
    const img = ex.querySelector('.prod'); if (!img) return;
    const r = ex.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5;
    img.style.transform = `translateY(-14px) scale(1.04) rotateY(${x * 18}deg)`;
  });
  shelf.addEventListener('pointerout', (e) => { const img = e.target.closest('.exhibit')?.querySelector('.prod'); if (img && !e.relatedTarget?.closest?.('.exhibit')) img.style.transform = ''; });
  let told = false;
  new IntersectionObserver((es) => { if (es[0].isIntersecting && !told) { told = true; ritzSay('found'); } }, { threshold: 0.5 }).observe(shelf);
}
