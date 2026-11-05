"""Turns the harvested theritzclinic.com files into web-ready assets and data for the new site."""
import json, re, os, glob, hashlib, pathlib
from PIL import Image
from bs4 import BeautifulSoup, Comment
H = pathlib.Path('/home/claude/harvest'); R = pathlib.Path('/home/claude/ritz-clinic')
A = R / 'assets/site'; D = R / 'data'
CUT = pathlib.Path('/home/claude/cut'); CASES = pathlib.Path('/home/claude/cases')
UP = 'https://theritzclinic.com/wp-content/uploads/'
J = lambda n: json.load(open(H / 'data' / f'{n}.json'))

def webp(src, dst, max_w=None, max_h=None, q=82, keep_alpha=True):
    dst = A / dst; dst.parent.mkdir(parents=True, exist_ok=True)
    im = src if isinstance(src, Image.Image) else Image.open(src)
    im = im.convert('RGBA') if (keep_alpha and (im.mode in ('RGBA', 'LA', 'P'))) else im.convert('RGB')
    if im.mode == 'RGBA' and im.getextrema()[3][0] == 255: im = im.convert('RGB')
    w, h = im.size; s = 1
    if max_w and w > max_w: s = min(s, max_w / w)
    if max_h and h > max_h: s = min(s, max_h / h)
    if s < 1: im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=q, method=6)
    return 'assets/site/' + str(dst.relative_to(A)).replace(os.sep, '/')

def find(rel):
    for p in H.glob('img/*/' + rel):
        return p
    return None

# ---------- 1. service renders ----------
PRODUCTS = {746488, 746486, 746484, 746481, 682515, 562000, 557783, 557518, 557139, 4341, 395880, 395018, 516296, 516098, 515783, 4211, 509437, 509619}
services = J('services')
render = {}
for s in services:
    sid = s['id']
    if sid in PRODUCTS:
        im = Image.open(CUT / f'cut-{sid}.png'); bb = im.getbbox(); im = im.crop(bb)
        pad = int(max(im.size) * 0.04); c = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad)); c.paste(im, (pad, pad))
        render[sid] = {'kind': 'product', 'src': webp(c, f'products/{sid}.webp', max_h=640, q=86)}
    else:
        render[sid] = {'kind': 'photo', 'src': webp(CUT / f'inner-{sid}.jpg', f'treat/{sid}.webp', max_w=640)}

# ---------- 2. sanitised articles ----------
KEEP = {'p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'blockquote', 'br'}
svc_by_slug = {s['link'].rstrip('/').split('/')[-1]: s['id'] for s in services}
def localise_img(src, folder):
    m = re.search(r'wp-content/uploads/(.+)$', src or '')
    if not m: return src
    rel = re.sub(r'-\d{2,4}x\d{2,4}(?=\.\w+$)', '', requests_unquote(m.group(1)))
    p = find(rel)
    if not p: return src
    name = hashlib.md5(rel.encode()).hexdigest()[:10]
    try: return webp(p, f'{folder}/{name}.webp', max_w=1100, keep_alpha=False)
    except Exception: return src
from urllib.parse import unquote as requests_unquote
def clean(html, folder=None):
    soup = BeautifulSoup(html or '', 'html.parser')
    for c in soup.find_all(string=lambda t: isinstance(t, Comment)): c.extract()
    for t in soup(['script', 'style', 'noscript', 'iframe', 'form', 'button', 'svg', 'input', 'select', 'video', 'audio', 'source']): t.decompose()
    for t in list(soup.find_all(True)):
        if t.name not in KEEP: t.unwrap(); continue
        attrs = {}
        if t.name == 'a' and t.get('href'):
            href = t['href']; slug = href.rstrip('/').split('/')[-1]
            if '/service/' in href and requests_unquote(slug) in {requests_unquote(k) for k in svc_by_slug}:
                sid = [v for k, v in svc_by_slug.items() if requests_unquote(k) == requests_unquote(slug)][0]
                href = f'treatment.html?id={sid}'
            attrs['href'] = href
        if t.name == 'img':
            src = t.get('src') or t.get('data-src') or ''
            attrs['src'] = localise_img(src, folder) if folder else src
            attrs['alt'] = t.get('alt', ''); attrs['loading'] = 'lazy'
        for k in ('colspan', 'rowspan'):
            if t.get(k): attrs[k] = t[k]
        t.attrs = attrs
    for p in soup.find_all('p'):
        if not p.get_text(strip=True) and not p.find('img'): p.decompose()
    out = re.sub(r'\n{2,}', '\n', str(soup)).replace('&nbsp;', ' ')
    return out.strip()

tax = J('taxonomies'); scat = {str(c['id']): c['name'] for c in tax['service_cat']}
(D / 'services').mkdir(parents=True, exist_ok=True)
svc_index = []
for s in services:
    title = BeautifulSoup(s['title']['rendered'], 'html.parser').get_text()
    html = clean(s['content']['rendered'], 'svc')
    json.dump({'id': s['id'], 'title': title, 'link': s['link'], 'html': html, 'modified': s['modified'], 'render': render[s['id']]},
              open(D / 'services' / f"{s['id']}.json", 'w'), ensure_ascii=False)
    svc_index.append({'id': s['id'], 'title': title, 'cats': [scat.get(str(c), '') for c in s.get('service_cat', [])], 'render': render[s['id']]})
json.dump(svc_index, open(D / 'services.json', 'w'), ensure_ascii=False, indent=0)

# ---------- 3. doctors ----------
about = {p['slug']: p for p in J('pages')}['about-us']
txt = BeautifulSoup(about['content']['rendered'], 'html.parser').get_text('\n')
lines = [l.strip() for l in txt.split('\n') if l.strip()]
names = {}
for i, l in enumerate(lines):
    if l.startswith('หมอ') and i + 2 < len(lines) and lines[i + 2].startswith('ว.'):
        names[l[3:]] = {'full': lines[i + 1], 'license': lines[i + 2]}
docs = []
nick_file = {'ปาล์ม': 'ปาม', 'แม็ก': 'แม๊ก'}
prof_file = {'ปาล์ม': 'ปล์าม', 'แม็ก': 'แมก', 'แพรแพร': 'หนอแพรแพร'}
for p in J('physicians'):
    nick = BeautifulSoup(p['title']['rendered'], 'html.parser').get_text().replace('หมอ', '', 1)
    pop = next(iter(glob.glob(str(H / f"img/*/*/*/Pop-Up-หมอ{nick_file.get(nick, nick)}.jpg"))), None)
    pf = prof_file.get(nick, 'หมอ' + nick)
    prof = next(iter(sorted(glob.glob(str(H / f'img/*/*/*/Profile-Template-{pf}*.jpg')))), None)
    if nick == 'แพรแพร': prof = next(iter(glob.glob(str(H / 'img/*/*/*/Profile-Template-หนอแพรแพร.jpg'))), None)
    d = {'id': p['id'], 'th': nick, **names.get(nick, {})}
    if pop: d['photo'] = webp(pop, f"doctors/{p['id']}.webp", max_w=640, keep_alpha=False)
    if prof: d['profile'] = webp(prof, f"doctors/profile-{p['id']}.webp", max_w=1400, keep_alpha=False)
    docs.append(d)
sched = find('2026/11/ตารางแพทย์2026-พฤศจิกายน.jpg')
json.dump({'doctors': docs, 'schedule': webp(sched, 'doctors/schedule-2026-11.webp', max_w=1600, keep_alpha=False) if sched else None},
          open(D / 'doctors.json', 'w'), ensure_ascii=False, indent=0)

# ---------- 4. reviews ----------
rv = []
for r in J('review_slider'):
    m = [x for x in H.glob('img/reviews/*/*/*') if x.stem in r.get('photo', '') or (r.get('photo') or '').endswith(x.name)]
    p = find(r['photo']) if r.get('photo') else None
    rv.append({'id': r['id'], 'photo': webp(p, f"reviews/{r['id']}.webp", max_w=600, keep_alpha=False) if p else None})
json.dump(rv, open(D / 'review-photos.json', 'w'), indent=0)

# ---------- 5. before and after ----------
pairs = json.load(open(CASES / 'pairs.json'))
cases = {c['id']: c for c in J('cases')}
groups = {}
for k, p in enumerate(pairs):
    c = cases[p['case']]; title = BeautifulSoup(c['title']['rendered'], 'html.parser').get_text()
    src = H / 'img/cases' / p['card']
    item = {'card': webp(src, f"cases/card-{k}.webp", max_w=900, keep_alpha=False)}
    if p['pair']:
        im = Image.open(src).convert('RGB')
        item['before'] = webp(im.crop(p['pair'][0]), f'cases/{k}-b.webp', max_w=560, keep_alpha=False)
        item['after'] = webp(im.crop(p['pair'][1]), f'cases/{k}-a.webp', max_w=560, keep_alpha=False)
    groups.setdefault(title, []).append(item)
json.dump([{'program': t, 'items': v} for t, v in groups.items()], open(D / 'cases.json', 'w'), ensure_ascii=False, indent=0)

# ---------- 6. brands, banners, promotions, clinic photos ----------
home = {p['slug']: p for p in J('pages')}['home']
brands = []
for rel in home['images']:
    if rel.startswith('2023/11/') and rel.endswith('.png') or 'restylane' in rel:
        p = find(rel)
        if p: brands.append({'name': pathlib.Path(rel).stem, 'src': webp(p, f'brands/{pathlib.Path(rel).stem}.webp', max_h=160, q=90)})
banners = {}
for rel in home['images'] + about['images']:
    if re.search(r'services-\d+|Hoempage-banner|Banner-WELLNESS|cover-1900|ประวัติ-1900|Personalized-|VitilityDNA', rel):
        p = find(rel)
        if p: banners[pathlib.Path(rel).stem] = webp(p, f'banners/{hashlib.md5(rel.encode()).hexdigest()[:8]}.webp', max_w=1600, keep_alpha=False)
promos = {}
for rel in ['2022/09/Promotion-1040-1040.jpg', '2025/04/UltheraPrime-จองวันนี้.jpg']:
    p = find(rel)
    if p: promos[pathlib.Path(rel).stem] = webp(p, f'promos/{hashlib.md5(rel.encode()).hexdigest()[:8]}.webp', max_w=1000, keep_alpha=False)
founder = [webp(p, f'doctors/founder-{i}.webp', max_w=900) for i, p in enumerate(sorted(H.glob('img/home/elementor/thumbs/*')))]
json.dump({'brands': brands, 'banners': banners, 'promos': promos, 'founder': founder}, open(D / 'media.json', 'w'), ensure_ascii=False, indent=0)

# ---------- 7. articles ----------
(D / 'posts').mkdir(parents=True, exist_ok=True)
cats = {str(c['id']): c['name'] for c in tax['categories']}
index = []
for p in J('posts'):
    title = BeautifulSoup(p['title']['rendered'], 'html.parser').get_text()
    img = None
    if p.get('image'):
        f = find(p['image'])
        if f:
            try: img = webp(f, f"posts/{p['id']}.webp", max_w=800, keep_alpha=False)
            except Exception: img = None
    ex = BeautifulSoup(p['excerpt']['rendered'], 'html.parser').get_text(' ', strip=True)[:220]
    index.append({'id': p['id'], 'date': p['date'], 'slug': requests_unquote(p['slug']), 'link': p['link'], 'title': title, 'excerpt': ex,
                  'cats': [cats.get(str(c), '') for c in p.get('categories', [])], 'image': img})
    json.dump({'id': p['id'], 'date': p['date'], 'modified': p['modified'], 'title': title, 'link': p['link'], 'image': img, 'html': clean(p['content']['rendered'])},
              open(D / 'posts' / f"{p['id']}.json", 'w'), ensure_ascii=False)
json.dump(index, open(D / 'posts.json', 'w'), ensure_ascii=False)
print('services', len(svc_index), 'doctors', len(docs), 'case groups', len(groups), 'brands', len(brands), 'banners', len(banners), 'posts', len(index))
