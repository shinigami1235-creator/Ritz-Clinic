# THE RITZ CLINIC website concept

A redesign concept for theritzclinic.com, built as a grand hotel. The lobby has a flip board, the clinic's machines stand in a 3D showroom, one room per programme (tap one and the camera moves in), treatments live on five floors of an elevator, real before-and-after cases sit in a vanity mirror, doctors wear brass name plates and Dr. Ritz walks around every page as a chibi concierge you can tap, pick up and drop.

English for now. To switch to Thai, open `js/i18n.js` and change `LANG` to `'th'`.

## Pages

| Page | File | What it does |
| --- | --- | --- |
| Lobby | `index.html` | Flip board, 5-Layer Lift, Ask Dr. Ritz, doctors on duty, promotions, guest book, latest articles, branch map, Facebook window |
| Treatments | `treatments.html` | Programmes, showroom, the elevator, a directory board of all 30 treatments with a lit pedestal, Ask Dr. Ritz, promotions |
| One treatment | `treatment.html?id=…` | The render on its plinth, the clinic's full article, real results, related treatments |
| Doctors | `doctors.html` | Founder, 16 doctors with where each one works this week, duty board |
| Reviews | `reviews.html` | Friend of The Ritz wall with filters, and every before-and-after result at the mirror |
| Articles | `journal.html` | All 260 articles with search, categories and load more |
| One article | `article.html?id=…` | The full article, saved with the site |
| Branches | `branches.html` | Map, address, hours, phone, directions and doctors today for all 12 branches |

## Live content

The site reads the clinic's WordPress at `theritzclinic.com/wp-json/wp/v2/`, so the clinic keeps posting the way it does now:

- New articles show up on the Articles page and the lobby.
- A new doctor or review added in WordPress shows up on its page.
- A new service shows up under "New on the website" on the Treatments page.

Every page keeps a saved copy in `js/data.js`, so nothing breaks if WordPress is down.

## Dr. Ritz, the concierge

He is the chibi from Gemini, cut into layers in `assets/chibi/rig/`: one head with the eyes and mouth painted out, a body per pose and two legs. `js/ritz-rig.js` draws his face live, so he blinks, looks at the cursor and changes expression on any pose. `js/ritz-buddy.js` is the same engine as Nong Tape on the Apex Slim site: he walks to the perch next to whatever you're reading, fidgets, yawns, falls asleep and floats off in a bubble, reacts to taps, and can be picked up and dropped. Pages tell him what happened with `ritzSay('card')` and similar.

Drop him in the middle of the screen and he pulls out a mic and sings. The words come from `data/song.txt`, one speech bubble per line, about 3 seconds each, and the song lasts as long as the lyrics do. Lines starting with `#` are skipped. Tapping him stops the song.

## Stories and Facebook

Facebook's own page window needs third-party cookies, which Chrome, Brave and in-app browsers block, so it shows blank for many visitors. The lounge draws the feed and an Instagram stories row in the site's own design instead. They read `data/social.json`, which `tools/social.py` writes from Meta's API once the clinic's admin connects the Facebook page and the six Instagram accounts (setup steps are at the top of the script). Until then the stories use the clinic's own website content and say so.

The Facebook box works the way the CICM site does. Facebook still fills single-post embeds when it blanks the page window, so `data/facebook.json` holds a list of post links and the lounge embeds the first 6 in a row you can swipe. To add a new post, open it on Facebook, copy its link (Share, then Copy link, or the photo's address) and paste it at the top of the `posts` list. If a visitor's browser blocks Facebook altogether, the box falls back to the newest articles from the website after 10 seconds. Reels don't embed reliably, so stick to photo and text posts.

## Maps

Branches use the Google Maps embed, which needs no API key: the overview searches "THE RITZ CLINIC" and shows every branch as a pin, and picking a branch opens its Google place card with directions.

## Content from theritzclinic.com

Every image and piece of content was copied from the clinic's public WordPress on 5 Nov 2026: 32 service articles, 17 doctors with their profile cards, 10 reviews, 335 before-and-after cards (split into before and after photos for the mirror), promotion posters, category banners, brand logos and 260 articles. The images are in `assets/site/`, the text in `data/`. `tools/media.py` is the script that converted them.

## Editing

- Text for both languages: `js/i18n.js`
- Branches, schedule, treatments, doctors, reviews, promotions: `js/data.js`
- Header and footer are shared. Edit them in `tools/shell.py`, then run `python3 tools/shell.py`.
- Colours and fonts: the top of `css/site.css`

No build step. Any static host works, including GitHub Pages.

## Still needed from the clinic

- Confirm the before-and-after cases can be shown this way (they are the clinic's own published cards, split into two photos)
- Check the English spelling of the doctors' nicknames and the treatment to layer placement
- PDPA cookie banner and privacy page before going live
