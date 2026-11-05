// Promotion placards with the clinic's own posters, shared by the lobby and the treatments page.
import { PROMOS } from './data.js';
import { PROMO_POSTERS } from './media.js';
import { t, pick } from './i18n.js';

export function mountPromos(el) {
  if (!el) return;
  el.innerHTML = PROMOS.map((p, i) => `
  <a class="placard glass reveal in" href="${p.url}">
    <span class="poster">${PROMO_POSTERS[i] ? `<img src="${PROMO_POSTERS[i]}" alt="" loading="lazy">` : ''}</span>
    <span class="pbody">
      <span class="placard-kicker">${t('specialsKicker')}</span>
      <h3>${pick(p, 'title')}</h3>
      <p class="n">${pick(p, 'note')}</p>
      <span class="price foil"><small>${pick(p, 'unit')}</small>${p.price}<span>${t('baht')}</span></span>
    </span>
  </a>`).join('');
}
