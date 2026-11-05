// Approximate map of the 12 branches, drawn from their latitude and longitude.
import { BRANCHES } from './data.js';
import { t } from './i18n.js';
import { isOpen } from './core.js';

const px = (b) => [20 + (b.lng - 100.40) / 0.30 * 360, 20 + (14.02 - b.lat) / 0.40 * 400];
const RIVER = [[14.02, 100.53], [13.93, 100.50], [13.85, 100.50], [13.80, 100.495], [13.76, 100.50], [13.72, 100.51], [13.70, 100.535], [13.68, 100.52], [13.64, 100.545], [13.60, 100.56]];
const LABEL = { pinklao: ['end', -10, 4], ari: ['start', 10, -4], bangkapi: ['middle', 0, 18], townintown: ['middle', 0, -12], seacon: ['end', -10, 4], bangna: ['end', -10, 4], ics: ['start', 10, 6], siam: ['start', 10, 6] };

export function drawMap(svg, { onPick } = {}) {
  const river = RIVER.map(([lat, lng]) => px({ lat, lng }));
  let s = `<path class="river" d="M${river.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L')}"/>`;
  s += BRANCHES.map((b) => {
    const [x, y] = px(b); const [anchor, dx, dy] = LABEL[b.id] || ['start', 10, 4];
    return `<g class="pin${isOpen(b) ? ' open' : ''}" data-id="${b.id}"${onPick ? ' tabindex="0" role="button"' : ''} aria-label="${b.en}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"/><text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}">${b.en}</text></g>`;
  }).join('');
  s += `<text class="note" x="390" y="430" text-anchor="end">${t('mapNote')}</text>`;
  svg.innerHTML = s;
  if (onPick) {
    const go = (e) => { const g = e.target.closest('.pin'); if (g) onPick(g.dataset.id); };
    svg.addEventListener('click', go);
    svg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(e); } });
  }
  return {
    highlight(id) { svg.querySelectorAll('.pin').forEach((p) => p.classList.toggle('on', p.dataset.id === id)); },
  };
}
