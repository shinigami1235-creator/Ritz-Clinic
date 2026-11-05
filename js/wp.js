// Live content from the clinic's WordPress (theritzclinic.com). The clinic keeps editing
// WordPress as it does now; this site reads the public REST API, so new articles, doctors
// and reviews show up here on their own. Every caller keeps a saved copy as a fallback.
const API = 'https://theritzclinic.com/wp-json/wp/v2/';

export async function wp(path, params = {}) {
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(params)) if (v !== '' && v != null) url.searchParams.set(k, v);
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error('WordPress answered ' + r.status);
    return { items: await r.json(), total: +r.headers.get('x-wp-total') || 0, pages: +r.headers.get('x-wp-totalpages') || 0 };
  } finally { clearTimeout(timer); }
}

// Featured image at a given size, falling back to the closest size WordPress made.
export function media(item, size = 'medium_large') {
  const m = item._embedded?.['wp:featuredmedia']?.[0];
  if (!m || m.code) return '';
  const s = m.media_details?.sizes || {};
  return (s[size] || s.medium_large || s.large || s.medium || s.full || {}).source_url || m.source_url || '';
}

// WordPress titles arrive as HTML with entities like &amp; and &#8211;.
export function text(html) {
  const d = new DOMParser().parseFromString(html || '', 'text/html');
  return d.body.textContent.replace(/\s+/g, ' ').trim();
}
