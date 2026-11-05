// Real Google Maps, embedded without an API key. Searching "THE RITZ CLINIC" shows every branch
// as a pin; searching one branch opens its place card with directions and its Google rating.
const Q = (b) => (b ? `THE RITZ CLINIC สาขา${b.th}` : 'THE RITZ CLINIC');
export const gmapSrc = (b) => `https://maps.google.com/maps?q=${encodeURIComponent(Q(b))}${b ? `&ll=${b.lat},${b.lng}&z=16` : '&ll=13.80,100.56&z=10'}&hl=en&output=embed`;
export function mountGmap(frame, allBtn) {
  frame.src = gmapSrc(null);
  const api = {
    show(b) { frame.src = gmapSrc(b); if (allBtn) allBtn.hidden = !b; },
  };
  if (allBtn) { allBtn.hidden = true; allBtn.addEventListener('click', () => api.show(null)); }
  return api;
}
