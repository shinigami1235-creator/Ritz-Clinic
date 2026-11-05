// Real Google Maps, embedded without an API key. Searching "THE RITZ CLINIC" shows every branch
// as a pin; searching one branch opens its place card with directions and its Google rating.
// Branch searches as Google knows them. Town in Town sits in the Headquarters Ekkamai-Ladprao project.
const NAME = { townintown: 'Town in Town Ladprao 94', bangna: 'The Glass Market Bangna', northville: 'Central Northville Rattanathibet', seacon: 'Seacon Square' };
const Q = (b) => (b ? `THE RITZ CLINIC ${NAME[b.id] || b.en}` : 'THE RITZ CLINIC');
export const gmapSrc = (b) => `https://maps.google.com/maps?q=${encodeURIComponent(Q(b))}${b ? '&z=16' : '&ll=13.80,100.56&z=10'}&hl=en&output=embed`;
export function mountGmap(frame, allBtn) {
  frame.src = gmapSrc(null);
  const api = {
    show(b) { frame.src = gmapSrc(b); if (allBtn) allBtn.hidden = !b; },
  };
  if (allBtn) { allBtn.hidden = true; allBtn.addEventListener('click', () => api.show(null)); }
  return api;
}
