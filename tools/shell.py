"""Copies the shared header and footer into every page.

Edit TOP or FOOT below, then run from the repo folder:
    python3 tools/shell.py
Each page keeps its own content; only the parts between the shell markers are replaced.
"""
import pathlib, re

PAGES = [
    ('index.html', 'navHome', 'Lobby'),
    ('treatments.html', 'navTreat', 'Treatments'),
    ('doctors.html', 'navDoctors', 'Doctors'),
    ('reviews.html', 'navReviews', 'Reviews'),
    ('journal.html', 'navJournal', 'Articles'),
    ('branches.html', 'navBranches', 'Branches'),
]

def nav(current):
    links = []
    for href, key, label in PAGES[1:]:
        cur = ' aria-current="page"' if href == current else ''
        links.append(f'    <a href="{href}" data-t="{key}"{cur}>{label}</a>')
    return '\n'.join(links)

TOP = '''<a class="skip" href="#main" data-t="skip">Skip to content</a>

<div class="topline">
  <span data-t="topHours">Open daily 10:00 to 20:30</span>
  <span data-t="topBranches">12 branches in Bangkok and nearby</span>
  <a href="tel:0888922666">Call Center 088-892-2666</a>
</div>

<header class="masthead">
  <a class="brand" href="index.html" aria-label="THE RITZ CLINIC home">
    <img src="assets/brand/r-mark.svg" alt="" width="34" height="40">
    <span class="brand-word">THE RITZ<small>CLINIC</small></span>
  </a>
  <nav class="nav" aria-label="Main menu">
{nav}
  </nav>
  <a class="btn-line" href="https://line.me/ti/p/@theritzclinic" target="_blank" rel="noopener" data-t="lineBtn">Ask a doctor on LINE</a>
</header>'''

FOOT = '''<footer class="foot">
  <div class="foot-inner">
    <div class="chibi chibi-wai" data-pose="wai" role="img" aria-label="Dr. Ritz giving a wai"></div>
    <div>
      <p class="foot-brand">THE RITZ CLINIC</p>
      <p data-t="address">Head office: 345/6 Headquarters Ekkamai-Ladprao, Soi Ladprao 94 (Panjamit), Phlapphla, Wang Thonglang, Bangkok 10310</p>
      <p>Call Center <a href="tel:0888922666">088-892-2666</a> &nbsp; LINE <a href="https://line.me/ti/p/@theritzclinic" target="_blank" rel="noopener">@theritzclinic</a></p>
      <nav class="foot-nav" aria-label="Footer menu">
        <a href="index.html" data-t="navHome">Lobby</a>
{footnav}
      </nav>
      <p class="permit" data-t="permit">Advertising permit ฆสพ.สบส 1827/2566</p>
      <p class="small">© 2026 THE RITZ CLINIC</p>
    </div>
  </div>
</footer>

<a class="float-line" href="https://line.me/ti/p/@theritzclinic" target="_blank" rel="noopener" aria-label="Chat with a doctor on LINE">
  <span class="peek" aria-hidden="true"></span>
  <span class="float-label" data-t="float">Ask a doctor</span>
</a>'''

root = pathlib.Path(__file__).resolve().parent.parent
for href, _, _ in PAGES:
    p = root / href
    if not p.exists():
        continue
    s = p.read_text(encoding='utf-8')
    top = TOP.replace('{nav}', nav(href))
    foot = FOOT.replace('{footnav}', '\n'.join(f'        <a href="{h}" data-t="{k}">{l}</a>' for h, k, l in PAGES[1:]))
    s = re.sub(r'<!-- shell:top -->.*?<!-- /shell:top -->', lambda m: f'<!-- shell:top -->\n{top}\n<!-- /shell:top -->', s, flags=re.S)
    s = re.sub(r'<!-- shell:foot -->.*?<!-- /shell:foot -->', lambda m: f'<!-- shell:foot -->\n{foot}\n<!-- /shell:foot -->', s, flags=re.S)
    p.write_text(s, encoding='utf-8')
    print('updated', href)
