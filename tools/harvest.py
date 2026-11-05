"""Copies the content and images of theritzclinic.com into this repo.

Runs on GitHub Actions (.github/workflows/harvest.yml), since the clinic's site is public and
GitHub's servers can reach it. It reads the public WordPress REST API, writes the content to
data/site/*.json and the images to assets/site/<group>/ as WebP. Service icons are also kept
as the original PNG in tools/raw/services/ for cutting out.

Article body images are not copied: articles keep pointing at the WordPress media library,
which stays in place when WordPress becomes the back end of the new site.
"""
import json, os, re, sys, io, time, pathlib, hashlib
from urllib.parse import unquote
import requests
from PIL import Image

API = 'https://theritzclinic.com/wp-json/wp/v2/'
UP = 'https://theritzclinic.com/wp-content/uploads/'
ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / 'data' / 'site'
ASSETS = ROOT / 'assets' / 'site'
RAW = ROOT / 'tools' / 'raw'
S = requests.Session()
S.headers['User-Agent'] = 'Mozilla/5.0 (compatible; site-migration)'
log = []


def get(path, **params):
    for attempt in range(4):
        try:
            r = S.get(API + path, params=params, timeout=60)
            if r.status_code == 400 and params.get('page', 1) > 1:
                return [], {}
            r.raise_for_status()
            return r.json(), r.headers
        except Exception as e:  # noqa
            if attempt == 3:
                raise
            time.sleep(3 * (attempt + 1))


def get_all(path, **params):
    out, page = [], 1
    while True:
        items, h = get(path, per_page=100, page=page, **params)
        out += items
        if not items or page >= int(h.get('X-WP-TotalPages', 1) or 1):
            return out
        page += 1


def text(html):
    html = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', html or '', flags=re.S)
    t = re.sub(r'<[^>]+>', ' ', html)
    for a, b in [('&nbsp;', ' '), ('&amp;', '&'), ('&#8211;', '–'), ('&#8217;', '’'), ('&#038;', '&'), ('&quot;', '"'), ('&#8220;', '“'), ('&#8221;', '”')]:
        t = t.replace(a, b)
    return re.sub(r'\s+', ' ', t).strip()


def original(rel):
    """2023/04/x-768x512.jpg -> 2023/04/x.jpg"""
    return re.sub(r'-\d{2,4}x\d{2,4}(?=\.\w+$)', '', rel)


def uploads_in(html):
    html = (html or '').replace('\\/', '/')
    found = re.findall(r'wp-content/uploads/([^"\'\s)>?]+?\.(?:jpe?g|png|webp|gif))', html, flags=re.I)
    seen, out = set(), []
    for rel in found:
        o = original(unquote(rel))
        if o not in seen:
            seen.add(o); out.append(o)
    return out


saved = {}


def save(rel, group, max_side=1600, keep_png=False):
    """Download uploads/<rel>, store as WebP. Returns the site path or None."""
    rel = unquote(rel)
    if rel in saved:
        return saved[rel]
    url = UP + rel
    try:
        r = S.get(url, timeout=90)
        if r.status_code == 404 and rel != original(rel):
            r = S.get(UP + original(rel), timeout=90)
        r.raise_for_status()
        im = Image.open(io.BytesIO(r.content))
        im.load()
    except Exception as e:  # noqa
        log.append(f'skip {rel}: {e}')
        saved[rel] = None
        return None
    stem = re.sub(r'[^\w.-]+', '-', pathlib.Path(rel).stem, flags=re.U).strip('-')[:60] or 'img'
    stem += '-' + hashlib.md5(rel.encode()).hexdigest()[:6]
    if keep_png:
        (RAW / group).mkdir(parents=True, exist_ok=True)
        (RAW / group / (stem + pathlib.Path(rel).suffix.lower())).write_bytes(r.content)
    im = im.convert('RGBA') if im.mode in ('P', 'LA', 'RGBA') else im.convert('RGB')
    if max(im.size) > max_side:
        im.thumbnail((max_side, max_side), Image.LANCZOS)
    out = ASSETS / group / (stem + '.webp')
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, 'WEBP', quality=82, method=6)
    path = out.relative_to(ROOT).as_posix()
    saved[rel] = path
    return path


def media_map(ids):
    ids = sorted({i for i in ids if i})
    m = {}
    for k in range(0, len(ids), 100):
        items, _ = get('media', include=','.join(map(str, ids[k:k + 100])), per_page=100)
        for it in items:
            m[it['id']] = it['source_url'].split('/wp-content/uploads/')[-1]
    return m


def dump(name, obj):
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / f'{name}.json').write_text(json.dumps(obj, ensure_ascii=False, indent=1), encoding='utf-8')


def main():
    # taxonomies
    service_cat = {c['id']: c['name'] for c in get_all('service_cat')}
    review_cat = {c['id']: c['name'] for c in get_all('review_cat')}
    categories = {c['id']: c['name'] for c in get_all('categories')}
    dump('taxonomies', {'service_cat': service_cat, 'review_cat': review_cat, 'categories': categories})

    services = get_all('service')
    physicians = get_all('physicians')
    sliders = get_all('review_slider')
    cases = get_all('review')
    products = get_all('product')
    posts = get_all('posts', _fields='id,date,modified,slug,link,title,excerpt,content,categories,featured_media')
    pages = get_all('pages', _fields='id,slug,link,title,content')

    feat = media_map([x.get('featured_media') for x in services + physicians + sliders + products + posts])

    # services: icon (kept as PNG for cutouts), content and its images
    out = []
    for s in services:
        rel = feat.get(s['featured_media'])
        imgs = [p for p in (save(r, 'service-content') for r in uploads_in(s['content']['rendered'])) if p]
        out.append({'id': s['id'], 'slug': unquote(s['slug']), 'link': s['link'], 'title': text(s['title']['rendered']),
                    'cats': [service_cat.get(c, c) for c in s.get('service_cat', [])],
                    'icon': save(rel, 'services', keep_png=True) if rel else None,
                    'images': imgs, 'html': s['content']['rendered'], 'text': text(s['content']['rendered'])[:4000]})
    dump('services', out)

    dump('physicians', [{'id': p['id'], 'title': text(p['title']['rendered']), 'link': p['link'],
                         'photo': save(feat.get(p['featured_media']), 'doctors', 1200) if feat.get(p['featured_media']) else None}
                        for p in physicians])

    dump('review_slider', [{'id': r['id'], 'who': text(r['title']['rendered']), 'cats': [review_cat.get(c, c) for c in r.get('review_cat', [])],
                            'text': text(r['content']['rendered']),
                            'photo': save(feat.get(r['featured_media']), 'reviews', 1000) if feat.get(r['featured_media']) else None}
                           for r in sliders])

    # before-and-after cases: each "review" post holds its photos as attachments
    case_out = []
    for c in cases:
        att = get_all('media', parent=c['id'], _fields='id,source_url,alt_text,title')
        case_out.append({'id': c['id'], 'title': text(c['title']['rendered']), 'cats': [review_cat.get(x, x) for x in c.get('review_cat', [])],
                         'photos': [p for p in (save(a['source_url'].split('/wp-content/uploads/')[-1], 'cases', 1400) for a in att) if p]})
    dump('cases', case_out)

    dump('products', [{'id': p['id'], 'title': text(p['title']['rendered']), 'link': p['link'],
                       'image': save(feat.get(p['featured_media']), 'promotions') if feat.get(p['featured_media']) else None,
                       'text': text(p.get('content', {}).get('rendered', ''))[:3000],
                       'images': [x for x in (save(r, 'promotions') for r in uploads_in(p.get('content', {}).get('rendered', ''))) if x]}
                      for p in products])

    page_out = []
    for p in pages:
        slug = unquote(p['slug'])
        if slug in ('cart', 'checkout', 'my-account', 'products', 'articles'):
            continue
        imgs = [x for x in (save(r, 'pages/' + re.sub(r'[^\w-]+', '-', slug)[:30]) for r in uploads_in(p['content']['rendered'])) if x]
        page_out.append({'id': p['id'], 'slug': slug, 'link': p['link'], 'title': text(p['title']['rendered']),
                         'images': imgs, 'text': text(p['content']['rendered'])[:20000]})
    dump('pages', page_out)

    dump('posts', [{'id': p['id'], 'date': p['date'], 'modified': p['modified'], 'slug': unquote(p['slug']), 'link': p['link'],
                    'title': text(p['title']['rendered']), 'excerpt': text(p['excerpt']['rendered'])[:400],
                    'cats': [categories.get(c, c) for c in p.get('categories', [])],
                    'image': save(feat.get(p['featured_media']), 'posts', 1000) if feat.get(p['featured_media']) else None,
                    'html': p['content']['rendered']}
                   for p in posts])

    # header logo and favicon from the home page markup
    try:
        home = S.get('https://theritzclinic.com/', timeout=60).text
        for rel in uploads_in(home):
            if re.search(r'logo|icon|favicon', rel, re.I):
                save(rel, 'brand', 1600, keep_png=True)
    except Exception as e:  # noqa
        log.append(f'home: {e}')

    (DATA / 'harvest-log.txt').write_text('\n'.join(log) or 'no problems', encoding='utf-8')
    n = sum(1 for v in saved.values() if v)
    print(f'saved {n} images, {len(log)} problems')


if __name__ == '__main__':
    sys.exit(main())
