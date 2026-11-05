# THE RITZ CLINIC website concept

A redesign concept for theritzclinic.com, built as a grand hotel. The lobby has a flip board, treatments live on five floors of an elevator, doctors wear brass name plates, reviews sit in a guest book and Dr. Ritz walks around the site as a chibi concierge.

English for now. To switch to Thai, open `js/i18n.js` and change `LANG` to `'th'`.

## Pages

| Page | File | What it does |
| --- | --- | --- |
| Lobby | `index.html` | Flip board, 5-Layer Lift, Ask Dr. Ritz, doctors on duty, promotions, guest book, latest articles, branch map, Facebook window |
| Treatments | `treatments.html` | The elevator, a directory board of all 30 treatments, Ask Dr. Ritz, promotions |
| Doctors | `doctors.html` | Founder, 16 doctors with where each one works this week, duty board |
| Reviews | `reviews.html` | Friend of The Ritz wall with filters, before and after mirror (demo) |
| Articles | `journal.html` | Every article from the clinic's WordPress, with search, categories and load more |
| Branches | `branches.html` | Map, address, hours, phone, directions and doctors today for all 12 branches |

## Live content

The site reads the clinic's WordPress at `theritzclinic.com/wp-json/wp/v2/`, so the clinic keeps posting the way it does now:

- New articles show up on the Articles page and the lobby.
- A new doctor or review added in WordPress shows up on its page.
- A new service shows up under "New on the website" on the Treatments page.

Every page keeps a saved copy in `js/data.js`, so nothing breaks if WordPress is down.

## Editing

- Text for both languages: `js/i18n.js`
- Branches, schedule, treatments, doctors, reviews, promotions: `js/data.js`
- Header and footer are shared. Edit them in `tools/shell.py`, then run `python3 tools/shell.py`.
- Colours and fonts: the top of `css/site.css`

No build step. Any static host works, including GitHub Pages.

## Still needed from the clinic

- Before and after photos approved for advertising (the mirror uses chibi Dr. Ritz as a demo)
- Check the English spelling of the doctors' nicknames and the treatment to layer placement
- PDPA cookie banner and privacy page before going live
