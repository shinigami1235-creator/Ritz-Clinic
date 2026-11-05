// Real Google Maps, embedded without an API key. The search "THE RITZ CLINIC" shows every branch
// as a pin with its Google name; picking a branch zooms to that part of the city, where its own
// pin sits in the middle with the clinic's name on it.
export const gmapSrc = (b) => `https://maps.google.com/maps?q=${encodeURIComponent('THE RITZ CLINIC')}&ll=${b ? `${b.lat},${b.lng}&z=15` : '13.80,100.56&z=10'}&hl=en&output=embed`;
export function mountGmap(frame, allBtn) {
  frame.src = gmapSrc(null);
  const api = { show(b) { frame.src = gmapSrc(b); if (allBtn) allBtn.hidden = !b; } };
  if (allBtn) { allBtn.hidden = true; allBtn.addEventListener('click', () => api.show(null)); }
  return api;
}
