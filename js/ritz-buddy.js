/* Chibi Dr. Ritz, the site's concierge. Same engine as Nong Tape on the Apex Slim site:
   he always lives on the screen (position fixed), picks the perch nearest the reading line
   (42% down the screen) and follows it with a damped spring every frame, so scrolling drags
   him along. Perches are the things worth standing next to (the flip board, the lift panel,
   the key card, the duty board...) plus the end of each section heading. With no perch on
   screen he waits in the bottom-left corner.
   Other scripts tell him what happened with ritzSay('card') or
   document.dispatchEvent(new CustomEvent('ritz', { detail: 'card' })).
   Rules that keep him cute and out of the way:
   - he only talks on big moments, never in the first 3 seconds, and at most once every 15 seconds
   - each line is said once per visit; the rest of the time he reacts with a face and a move
   - he never comments on anyone's face or body
   - perches sit in empty space beside the content */
import { createRitz } from './ritz-rig.js';
import { LANG } from './i18n.js';

const TH = LANG === 'th';
const L = (en, th) => (TH ? th : en);
const NAME = L('Dr. Ritz', 'หมอริท');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const phone = () => innerWidth < 760;
const store = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch (e) { return null; } };
const said = new Set((() => { try { return JSON.parse(sessionStorage.getItem('ritz-said') || '[]'); } catch (e) { return []; } })());
const remember = (k) => { said.add(k); try { sessionStorage.setItem('ritz-said', JSON.stringify([...said])); } catch (e) {} };

/* what each event does: pose, face, how long, an optional line, and a body move */
const EVENTS = {
  hello: { pose: 'wave', expr: 'happy', ms: 2400, move: 'wiggle', line: L("Sawasdee krub! I'm Dr. Ritz.", 'สวัสดีครับ ผมหมอริทครับ') },
  bell: { pose: 'wai', expr: 'proud', ms: 2600, move: 'bob', line: L('Ding! How can I help?', 'ติ๊ง! ให้ผมช่วยอะไรดีครับ') },
  floor: { pose: 'point', expr: 'curious', ms: 1600, move: 'hop' },
  thinking: { pose: 'think', expr: 'happy', ms: 0 },
  card: { pose: 'card', expr: 'excited', ms: 3200, move: 'hop', line: L("Here's your key card.", 'นี่คีย์การ์ดของคุณครับ') },
  sent: { pose: 'thumbs', expr: 'proud', ms: 3000, move: 'hop', line: L('See you on LINE!', 'เจอกันใน LINE ครับ') },
  doctor: { pose: 'welcome', expr: 'proud', ms: 1800, move: 'bob' },
  review: { pose: 'wai', expr: 'shy', ms: 1600 },
  mirror: { pose: 'idle', expr: 'surprised', ms: 1200 },
  search: { pose: 'think', expr: 'happy', ms: 1400 },
  found: { pose: 'point', expr: 'excited', ms: 1400, move: 'hop' },
  nothing: { pose: 'idle', expr: 'worried', ms: 1800 },
  branch: { pose: 'point', expr: 'happy', ms: 1500, move: 'hop' },
  love: { pose: 'welcome', expr: 'love', ms: 1800, move: 'bob' },
};

/* perches. at: in-bl = inside the bottom-left corner, in-br = inside the bottom-right corner,
   out-r / out-l = beside it with bottoms lined up, end = standing on the right end,
   text = right after a heading's text (or on top of it when there's no room).
   bonus pulls him toward the perches that matter. desk: desktop only. */
const PERCHES = [
  { sel: '.page-sign .sign-plate', at: 'out-r', dx: 34, dy: 0, face: 'left', bonus: 60, arrive: { pose: 'wave', expr: 'happy', ms: 1400 } },
  { sel: '.board-frame', at: 'out-r', dx: 18, dy: 0, face: 'left', bonus: 70, desk: true, arrive: { pose: 'welcome', expr: 'proud', ms: 1400 } },
  { sel: '.lift-panel', at: 'out-r', dx: -10, dy: 12, face: 'left', bonus: 80, arrive: { pose: 'point', expr: 'curious', ms: 1600 } },
  { sel: '.concierge-form .chips', at: 'out-l', dx: -24, dy: 30, face: 'right', bonus: 50, desk: true, arrive: { pose: 'think', expr: 'happy', ms: 1600 } },
  { sel: '#keycard:not([hidden])', at: 'out-r', dx: 16, dy: 0, face: 'left', bonus: 90, arrive: { pose: 'card', expr: 'excited', ms: 1800 } },
  { sel: '.duty-board', at: 'out-r', dx: 14, dy: 0, face: 'left', desk: true, bonus: 30 },
  { sel: '.placards', at: 'out-r', dx: 14, dy: 0, face: 'left', desk: true, bonus: 30, arrive: { pose: 'thumbs', expr: 'excited', ms: 1600 } },
  { sel: '.book', at: 'out-r', dx: 14, dy: 0, face: 'left', desk: true, bonus: 40, arrive: { pose: 'wai', expr: 'shy', ms: 1400 } },
  { sel: '.room-card', at: 'out-r', dx: 14, dy: 0, face: 'left', desk: true, bonus: 50 },
  { sel: '.vanity', at: 'out-r', dx: 18, dy: 0, face: 'left', desk: true, bonus: 60, arrive: { pose: 'idle', expr: 'curious', ms: 1400 } },
  { sel: '.br-map', at: 'in-br', dx: -8, dy: -6, face: 'left', bonus: 50, desk: true },
  { sel: '.dir-grid .gmap-wrap', at: 'in-br', dx: -8, dy: -6, face: 'left', bonus: 40 },
  { sel: '.founder-photo', at: 'out-r', dx: -60, dy: 0, face: 'left', desk: true, bonus: 40, arrive: { pose: 'welcome', expr: 'proud', ms: 1400 } },
  { sel: 'main section h2', at: 'text', dx: 16, dy: 2, face: 'left', all: true },
];

/* quips: one when he lands in a section, at most once per section per visit (or again after 4 minutes),
   never within 25 seconds of another line. The next visit starts from the next quip in the list. */
const QUIPS = TH ? {
  top: ['ยินดีต้อนรับสู่เดอะริทซ์ครับ', 'ลองกดกระดิ่งดูสิครับ'],
  floors: ['ผิวมี 5 ชั้นนะครับ', 'ขึ้นลิฟต์กันครับ'],
  concierge: ['อยากดูแลเรื่องไหนครับ', 'ตอบแค่สองข้อครับ'],
  duty: ['วันนี้หมอคนไหนอยู่นะ', 'เช็กก่อนไปได้เลยครับ'],
  guestbook: ['ขอบคุณทุกคนครับ', 'เพื่อนของเดอะริทซ์'],
  journal: ['บทความจากทีมหมอครับ', 'มีเรื่องใหม่ทุกเดือน'],
  directory: ['มีสาขาใกล้บ้านไหมครับ', '12 สาขาครับ'],
  directory2: ['เลือกสาขาได้เลยครับ'],
} : {
  top: ['Welcome to THE RITZ!', 'Try the desk bell.', 'Hello again!'],
  floors: ['Skin has five layers.', 'Going up!', 'Pick a floor.'],
  directory: ['So many treatments!', 'Take your time.'],
  concierge: ['Tell me what bothers you.', 'Just two questions.'],
  duty: ["Who's in today?", 'Check before you go.'],
  guestbook: ['Our friends say hi!', 'Thank you, everyone.'],
  wall: ['Our friends say hi!', 'Read a few.'],
  journal: ['Fresh from our doctors.', 'Learning is fun!'],
  reading: ['Fresh from our doctors.', 'So many notes!'],
  branches: ['One near you?', 'Twelve branches!'],
  staff: ['Meet the team!', 'They are the best.'],
  'mirror-section': ['Ooh, a mirror!', 'Looking good!'],
};
const QUIP_GAP = 25000, QUIP_AGAIN = 240000;
const quipped = (() => { try { return JSON.parse(sessionStorage.getItem('ritz-quipped') || '{}'); } catch (e) { return {}; } })();
function quip(el) {
  const sec = el && el.closest('section[id], section[class]'); if (!sec) return;
  const key = sec.id || sec.classList[0], list = QUIPS[key]; if (!list) return;
  const t = Date.now();
  if (t - born < 6000 || t - lastSay < QUIP_GAP || root.classList.contains('talking')) return;
  if (quipped[key] && t - quipped[key] < QUIP_AGAIN) return;
  let n = 0; try { n = +(localStorage.getItem('ritz-q-' + key) || 0); } catch (e) {}
  quipped[key] = t; try { sessionStorage.setItem('ritz-quipped', JSON.stringify(quipped)); localStorage.setItem('ritz-q-' + key, n + 1); } catch (e) {}
  speak(list[n % list.length]);
}

/* ---------- build ---------- */
const root = document.createElement('div');
root.className = 'buddy';
root.innerHTML = `<div class="buddy-turn"><button class="buddy-body" type="button" aria-label="${NAME}, ${L('tap to say hi', 'แตะเพื่อทักทาย')}"><span class="buddy-art"></span></button></div>
  <span class="buddy-float" aria-hidden="true"></span>
  <span class="buddy-nap" aria-hidden="true"><b>z</b><b>z</b><b>Z</b></span>
  <p class="buddy-say" aria-hidden="true"></p>
  <button class="buddy-x" type="button" aria-label="${L('Hide', 'ซ่อน')} ${NAME}">×</button>`;
document.body.append(root);
const turn = root.querySelector('.buddy-turn'), body = root.querySelector('.buddy-body'), bubble = root.querySelector('.buddy-say'), hideBtn = root.querySelector('.buddy-x');
const SIZE = () => (phone() ? 80 : 124);                 // width in px; height follows the drawing
const RATIO = 475 / 300;
let rigSize = SIZE(), rig = createRitz(root.querySelector('.buddy-art'), rigSize);
const W = () => SIZE(), H = () => SIZE() * RATIO;
const viewH = () => (window.visualViewport ? visualViewport.height : innerHeight);

let base = { pose: 'idle', expr: 'happy' };
let actTimer = 0, sayTimer = 0, lastSay = 0, lastInput = Date.now(), asleep = false, held = false, facing = 1;
const born = Date.now();

const MOVES = ['m-hop', 'm-wiggle', 'm-bob', 'm-startle', 'm-giggle', 'm-spin', 'm-boing', 'm-wobble', 'm-trip'];
const move = (m) => { if (reduce || !m) return; body.classList.remove(...MOVES); void body.offsetWidth; body.classList.add('m-' + m); };
body.addEventListener('animationend', (e) => { if (/buddy-(hop|wiggle|bob|startle|giggle|spin|boing|wobble|trip)/.test(e.animationName)) body.classList.remove(...MOVES); });
const setFace = (dir) => { if (dir === facing) return; facing = dir; turn.classList.toggle('flip', dir < 0); };
const rest = () => { if (!held && !asleep && !flying) rig.set(base); };

function act(name) {
  const e = EVENTS[name]; if (!e || root.classList.contains('away') || mode !== 'follow') return;
  if (asleep) wake();
  stopFidget(); clearTimeout(actTimer);
  rig.set({ pose: e.pose, expr: e.expr }); move(e.move);
  held = e.ms === 0;                       // 0 means hold this until another event or 'done'
  if (!held) actTimer = setTimeout(() => { busyUntil = 0; rest(); }, e.ms);
  busyUntil = held ? Infinity : Date.now() + e.ms;
  if (e.line) say(name, e.line);
}
let busyUntil = 0;
const sideOfBubble = () => root.classList.toggle('say-left', pos.x + W() + 230 > innerWidth);
function say(key, text) {
  const t = Date.now();
  if (said.has(key) || t - born < 2900 || t - lastSay < 15000) return;
  remember(key); speak(text);
}
function speak(text) {
  lastSay = Date.now();
  bubble.textContent = text; sideOfBubble();
  root.classList.add('talking');
  clearTimeout(sayTimer); sayTimer = setTimeout(() => root.classList.remove('talking'), Math.min(5500, 2600 + text.length * 45));
}
function done() { held = false; busyUntil = 0; clearTimeout(actTimer); rig.set(base); }

/* blink every few seconds */
(function blink() { setTimeout(() => { if (!held && !asleep && !flying) rig.blink(); blink(); }, 2600 + Math.random() * 3400); })();

/* dozes off after 45 seconds with nothing happening */
let bubbleT = 0, floatT0 = 0;
function sleep() {
  asleep = true; root.classList.add('napping'); rig.set({ pose: 'idle', expr: 'sleepy', ms: 900 }); rig.look(0.5, 0.9); body.classList.add('m-sleep');
  // after a few breaths a bubble grows around him and he floats off in it
  clearTimeout(bubbleT);
  if (!reduce) bubbleT = setTimeout(() => { if (asleep && mode === 'follow') { root.classList.add('bubbled'); mode = 'float'; floatT0 = performance.now(); } }, 6500);
}
function popFloat() {
  clearTimeout(bubbleT); popBubble();
  asleep = false; root.classList.remove('napping', 'bubbled'); body.classList.remove('m-sleep');
  mode = 'fall'; vel.x = 0; vel.y = -120; stopFidget(); clearTimeout(actTimer); busyUntil = Infinity; lastInput = Date.now();
  rig.look(0, 0); rig.set({ pose: 'welcome', expr: 'surprised', ms: 160 }); move('startle');
}
function wakeByTap() {
  clearTimeout(bubbleT);
  asleep = false; root.classList.remove('napping'); popBubble(); body.classList.remove('m-sleep'); stopFidget(); clearTimeout(actTimer);
  lastInput = Date.now(); yawned = false; rig.look(0, 0);
  rig.set({ pose: 'welcome', expr: 'surprised', ms: 160 }); move('startle');
  busyUntil = Date.now() + 1900;
  actTimer = setTimeout(() => {
    rig.set({ pose: 'wai', expr: 'proud', ms: 260 }); move('bob');
    actTimer = setTimeout(() => { busyUntil = 0; rest(); }, 1200);
  }, 650);
}
function hehe(text) {
  if (reduce) return;
  const h = document.createElement('span'); h.className = 'buddy-hehe'; h.textContent = text;
  root.append(h); setTimeout(() => h.remove(), 1200);
}
function popBubble() { if (reduce) return; root.classList.add('pop'); setTimeout(() => root.classList.remove('pop'), 420); }
function wake() {
  asleep = false; root.classList.remove('napping'); body.classList.remove('m-sleep'); rig.look(0, 0);
  rig.set({ pose: 'idle', expr: 'surprised', ms: 300 });
  setTimeout(() => { if (!asleep && !held && rig.expr === 'surprised') rig.set(base); }, 600);
}
const poke = () => { lastInput = Date.now(); };   // a nap only ends with a tap on him or a real event
['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((t) => addEventListener(t, poke, { passive: true }));
setInterval(() => { if (mode === 'follow' && !asleep && !held && !flying && !fidgeting && Date.now() - lastInput > 45000) sleep(); }, 3000);

/* idle play: every 7 to 14 seconds of resting he does one small thing on his own.
   A yawn after 25 seconds with no input comes before the nap at 45. */
const FIDGETS = [
  [{ pose: 'idle', expr: 'curious', look: [-1, 0], ms: 900 }, { pose: 'idle', expr: 'curious', look: [1, 0], ms: 900 }, { pose: 'idle', expr: 'happy', look: [0, 0], ms: 300 }],
  [{ pose: 'thumbs', expr: 'excited', ms: 900, move: 'hop' }, { pose: 'idle', expr: 'happy', ms: 300 }],
  [{ pose: 'card', expr: 'proud', ms: 1300 }, { pose: 'idle', expr: 'happy', ms: 300 }],
  [{ pose: 'wave', expr: 'happy', ms: 1300, move: 'wiggle' }],
  [{ pose: 'hop', expr: 'wink', ms: 450, move: 'hop' }, { pose: 'hop', expr: 'happy', ms: 450, move: 'hop' }],
  [{ pose: 'idle', expr: 'curious', look: [0.4, -0.6], ms: 1200 }, { pose: 'idle', expr: 'surprised', ms: 400 }, { pose: 'thumbs', expr: 'proud', ms: 900 }],
  [{ pose: 'idle', expr: 'wink', ms: 900 }, { pose: 'idle', expr: 'happy', ms: 300 }],
  [{ pose: 'wai', expr: 'shy', ms: 1300 }, { pose: 'idle', expr: 'happy', ms: 300 }],
  [{ pose: 'welcome', expr: 'love', ms: 1300, move: 'bob' }],
  [{ pose: 'walkA', expr: 'happy', ms: 180 }, { pose: 'walkB', expr: 'happy', ms: 180 }, { pose: 'walkA', expr: 'happy', ms: 180 }, { pose: 'walkB', expr: 'happy', ms: 180 }, { pose: 'idle', expr: 'proud', ms: 300 }],
];
const YAWN = [{ pose: 'idle', expr: 'sleepy', ms: 1400, move: 'bob' }, { pose: 'idle', expr: 'happy', ms: 300 }];
let fidgeting = false, fidgetTimers = [], lastFidget = -1, yawned = false;
function stopFidget() { fidgetTimers.forEach(clearTimeout); fidgetTimers = []; if (fidgeting) { fidgeting = false; rig.look(0, 0); } }
function playFidget(seq) {
  fidgeting = true; let t = 0;
  seq.forEach((st) => {
    fidgetTimers.push(setTimeout(() => {
      rig.set({ pose: st.pose, expr: st.expr }); move(st.move);
      if (st.look) rig.look(st.look[0] * facing, st.look[1]);
    }, t));
    t += st.ms;
  });
  fidgetTimers.push(setTimeout(() => { fidgeting = false; rig.set(base); }, t));
}
(function idlePlay() {
  setTimeout(() => {
    const quiet = Date.now() - lastInput;
    const free = mode === 'follow' && !reduce && !held && !asleep && !flying && !fidgeting && Date.now() > busyUntil
      && !root.classList.contains('talking') && !root.classList.contains('away') && !document.hidden;
    if (free) {
      if (quiet > 25000 && !yawned) { yawned = true; playFidget(YAWN); }
      else if (quiet < 25000 || Math.random() < 0.5) {
        let i; do { i = Math.floor(Math.random() * FIDGETS.length); } while (i === lastFidget);
        lastFidget = i; playFidget(FIDGETS[i]);
      }
    }
    if (quiet < 25000) yawned = false;
    idlePlay();
  }, 7000 + Math.random() * 7000);
})();

/* eyes and head follow the mouse on desktop */
let near = false, nearT = 0;
if (fine) addEventListener('pointermove', (e) => {
  lastInput = Date.now(); if (asleep || fidgeting) return;
  const dx = e.clientX - (pos.x + W() / 2), dy = e.clientY - (pos.y + H() * 0.28);
  const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
  rig.look((dx / d) * k * facing, (dy / d) * k);
  // he lights up when the cursor comes close
  if (d < 150 && !near && mode === 'follow' && !held && Date.now() > busyUntil) { near = true; rig.set({ expr: 'excited' }); clearTimeout(nearT); nearT = setTimeout(() => { if (!held && !fidgeting) rig.set({ expr: base.expr }); }, 1100); }
  else if (d > 240) near = false;
}, { passive: true });

/* taps: a different little reaction each time; tapping fast makes him dizzy, keep going and he gives a heart */
const TAPS = [
  { pose: 'wai', expr: 'proud', ms: 1100, move: 'bob' },
  { pose: 'hop', expr: 'wink', ms: 700, move: 'hop' },
  { pose: 'idle', expr: 'excited', ms: 900, spin: true },
  { pose: 'thumbs', expr: 'excited', ms: 1000, move: 'boing' },
  { pose: 'wave', expr: 'happy', ms: 1100, move: 'wiggle' },
  { pose: 'wai', expr: 'shy', ms: 1100 },
  { pose: 'welcome', expr: 'surprised', ms: 800, move: 'boing' },
  { pose: 'card', expr: 'proud', ms: 1100 },
  { pose: 'point', expr: 'curious', ms: 1000, move: 'hop' },
];
let taps = [], lastTap = -1;
body.addEventListener('click', () => {
  if (mode === 'sing' && !grab.moved) { stopSinging(); return; }
  if (mode === 'float' && !grab.moved) { popFloat(); return; }
  if (grab.moved || mode !== 'follow') { grab.moved = false; return; }
  if (asleep) { wakeByTap(); return; }
  const t = Date.now(); taps = taps.filter((x) => t - x < 1800); taps.push(t);
  stopFidget(); clearTimeout(actTimer); lastInput = t;
  let r;
  if (taps.length >= 7) { taps = []; act('love'); hehe('♥'); return; }
  if (taps.length >= 4) r = { pose: 'idle', expr: 'oops', ms: 1400, move: 'wobble' };
  else { let i; do { i = Math.floor(Math.random() * TAPS.length); } while (i === lastTap); lastTap = i; r = TAPS[i]; }
  rig.set({ pose: r.pose, expr: r.expr }); move(r.move); if (r.hehe) hehe(r.hehe);
  if (r.spin && !reduce) { move('spin'); setTimeout(() => setFace(-facing), 260); setTimeout(() => setFace(-facing), 620); }
  busyUntil = t + r.ms; actTimer = setTimeout(() => { busyUntil = 0; rest(); }, r.ms);
});

/* hide and bring back */
const peek = document.createElement('button');
peek.className = 'buddy-peek'; peek.type = 'button'; peek.setAttribute('aria-label', `${L('Bring back', 'เรียก')} ${NAME}`);
document.body.append(peek);
const setAway = (on) => { root.classList.toggle('away', on); peek.classList.toggle('on', on); store('ritz-away', on ? '1' : ''); };
hideBtn.addEventListener('click', () => setAway(true));
peek.addEventListener('click', () => { setAway(false); act('hello'); });

/* typing on a phone: the keyboard takes the bottom of the screen, so he steps aside to the corner */
let typing = false;
const field = 'input:not([type=checkbox]):not([type=radio]):not([type=range]),textarea,select';
document.addEventListener('focusin', (e) => { if (e.target.matches(field)) typing = true; });
document.addEventListener('focusout', () => { typing = false; });

/* ---------- perches ---------- */
const textRect = (el) => {
  const r = document.createRange(); r.selectNodeContents(el);
  const rs = [...r.getClientRects()]; return rs.length ? rs[rs.length - 1] : el.getBoundingClientRect();
};
function spotFor(p, el, vh) {
  const r = el.getBoundingClientRect(); if (!r.width || !r.height) return null;
  const w = W(), h = H(), room = innerWidth - w - (innerWidth >= 1000 ? 38 : 8);
  let x, y;
  if (p.at === 'in-bl' || p.at === 'in-br') {
    x = p.at === 'in-bl' ? r.left + p.dx : r.right - w + p.dx; y = r.bottom - h + p.dy;
    if (y + h > vh - 8) y = Math.max(r.top + 20, vh - h - 16);
    x = Math.max(6, Math.min(room, x));
  } else if (p.at === 'text') {
    const t = textRect(el);
    x = t.right + p.dx; y = t.bottom - h + p.dy;
    if (x > room) { x = Math.min(room, t.right - w); y = t.top - h + 8; }
  } else if (p.at === 'out-r') { x = r.right + p.dx; y = r.bottom - h + p.dy; if (x > room) return null; }
  else if (p.at === 'out-l') { x = r.left - w + p.dx; y = r.bottom - h + p.dy; if (x < 6) return null; }
  else { x = Math.min(room, r.right - w + p.dx); y = r.bottom - h + p.dy; }
  if (y < 70 || y + h > vh - 6) return null;                        // only perches fully on screen
  return { x, y };
}
/* he only stands where nothing is: sample his footprint and refuse any spot over text, a picture,
   a button or a field. Containers and backgrounds don't count. */
const SOLID = /^(IMG|VIDEO|IFRAME|CANVAS|INPUT|BUTTON|SELECT|TEXTAREA|PICTURE|svg)$/i;
function hitsText(el, x, y) {
  for (const n of el.childNodes) {
    if (n.nodeType !== 3 || !n.textContent.trim()) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    for (const b of r.getClientRects()) if (x >= b.left - 4 && x <= b.right + 4 && y >= b.top - 2 && y <= b.bottom + 2) return true;
  }
  return false;
}
// a panel, card or picture between him and the page background counts as taken
function boxed(el) {
  for (let e = el; e && e !== document.body; e = e.parentElement) {
    if (e.getBoundingClientRect().width >= innerWidth * 0.95) return false;     // reached a full-width section
    const cs = getComputedStyle(e);
    const bg = cs.backgroundColor.match(/[\d.]+/g);
    if (bg && (bg.length < 4 || +bg[3] > 0.05)) return true;
    if (cs.backgroundImage !== 'none' || parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') return true;
  }
  return false;
}
function isClear(x, y) {
  const w = W(), h = H();
  for (const fx of [0.3, 0.5, 0.7]) for (const fy of [0.12, 0.35, 0.6, 0.85]) {
    const px = x + w * fx, py = y + h * fy;
    for (const el of document.elementsFromPoint(px, py)) {
      if (root.contains(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.pointerEvents === 'none' && el.tagName === 'CANVAS') continue;   // the gold dust
      if (SOLID.test(el.tagName) || el.closest('svg') || el.closest('.float-ask')) return false;
      if (hitsText(el, px, py)) return false;
      if (boxed(el)) return false;
      break;                                                              // the page background: look no deeper
    }
  }
  return true;
}
let perch = null, perchEl = null, lastPick = 0, picked = null;
function choose(vh) {
  // a full search (with the emptiness check) runs a few times a second; between runs he tracks the same perch
  const now = performance.now();
  if (now - lastPick < 140 && picked !== undefined) {
    if (!picked) return null;
    if (!picked.p) return picked;
    const s = spotFor(picked.p, picked.el, vh);
    return s ? { ...picked, s } : null;
  }
  lastPick = now;
  picked = search(vh);
  return picked;
}
// no perch is free: try the screen edges, and if those are covered too, tuck in at the left edge
function corner(vh) {
  const w = W(), h = H(), room = innerWidth - w - 8;
  const spots = [[8, vh - h - 16], [8, vh * 0.5 - h / 2], [room, vh * 0.5 - h / 2], [8, 80]];
  for (const [x, y] of spots) if (isClear(x, y)) return { p: null, el: null, s: { x, y } };
  return { p: null, el: null, s: { x: -w * 0.72, y: vh - h - 16 }, tucked: true };
}
function search(vh) {
  const line = vh * 0.42, h = H();
  let best = null, bestScore = Infinity, cur = null;
  for (const p of PERCHES) {
    if (p.desk && phone()) continue;
    const els = p.all ? document.querySelectorAll(p.sel) : [document.querySelector(p.sel)];
    for (const el of els) {
      if (!el) continue;
      const s = spotFor(p, el, vh); if (!s) continue;
      if (!isClear(s.x, s.y)) continue;
      const score = Math.abs(s.y + h / 2 - line) - (p.bonus || 0);
      if (el === perchEl) cur = { p, el, s, score };
      if (score < bestScore) { bestScore = score; best = { p, el, s, score }; }
    }
  }
  if (cur && best && best.el !== cur.el && cur.score - best.score < 60) best = cur;   // stay put unless clearly better
  return best || corner(vh);
}

/* ---------- motion: a damped spring toward the perch, every frame ---------- */
const pos = { x: 8, y: 0 }, vel = { x: 0, y: 0 };
let flying = false, lean = 0, first = true, lastT = performance.now(), arrivedAt = null, stepT = 0;
let mode = 'follow', lastTY = 0;                    // follow, drag, fall, run, float
const draw = () => { root.style.transform = `translate3d(${pos.x.toFixed(1)}px,${pos.y.toFixed(1)}px,0) rotate(${lean.toFixed(2)}deg)`; };
function frame(now) {
  requestAnimationFrame(frame);
  if (document.hidden || root.classList.contains('away')) { lastT = now; return; }
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  if (SIZE() !== rigSize) { rigSize = SIZE(); rig = createRitz(root.querySelector('.buddy-art'), rigSize); }
  const vh = viewH();
  const c = typing && !fine ? null : choose(vh);
  perch = c ? c.p : null; perchEl = c ? c.el : null;
  const tx = c ? c.s.x : 8, ty = c ? c.s.y : vh - H() - 16;
  lastTY = ty;
  if (mode !== 'follow') { physics(dt, tx, ty); return; }
  if (first || reduce) { pos.x = tx; pos.y = ty; vel.x = vel.y = 0; first = false; }
  else {
    const k = 5.5;
    vel.x += ((tx - pos.x) * k * k - vel.x * 2 * k) * dt;
    vel.y += ((ty - pos.y) * k * k - vel.y * 2 * k) * dt;
    pos.x += vel.x * dt; pos.y += vel.y * dt;
  }
  const speed = Math.hypot(vel.x, vel.y);
  lean += ((reduce ? 0 : Math.max(-12, Math.min(12, vel.x * 0.02))) - lean) * Math.min(1, dt * 8);
  draw();

  // travelling: legs scissor and he faces the way he goes; landing: the perch's own move
  const free = !held && !asleep && Date.now() > busyUntil;
  if (!flying && speed > 140 && Math.hypot(tx - pos.x, ty - pos.y) > 30) {
    flying = true; root.classList.remove('talking'); stopFidget();
    if (free) { rig.set({ pose: 'walkA', expr: 'happy', ms: 160 }); body.classList.add('m-glide'); }
  }
  if (flying && free) { stepT += dt; if (stepT > 0.14) { stepT = 0; rig.set({ pose: rig.pose === 'walkA' ? 'walkB' : 'walkA' }); } }
  if (flying && Math.abs(vel.x) > 60) setFace(vel.x > 0 ? 1 : -1);
  if (flying && speed < 30) {
    flying = false; body.classList.remove('m-glide'); sideOfBubble();
    setFace(perch && perch.face === 'left' ? -1 : 1);
    land(free);
  } else if (!flying && speed < 30 && perchEl && perchEl !== arrivedAt) land(free);
}
function land(free) {
  const fresh = perchEl !== arrivedAt; arrivedAt = perchEl;
  if (!free) return;
  if (fresh) setTimeout(() => { if (!flying && perchEl === arrivedAt) quip(perchEl); }, 500);
  if (fresh && perch && perch.arrive && Date.now() - born > 2500) {
    const a = perch.arrive; rig.set({ pose: a.pose, expr: a.expr }); clearTimeout(actTimer);
    busyUntil = Date.now() + a.ms; actTimer = setTimeout(() => { busyUntil = 0; rest(); }, a.ms);
  } else rig.set({ pose: 'idle', expr: base.expr, ms: 380 });
}

/* ---------- picking him up: drag, drop, fall to his perch's level, then run back ---------- */
const grab = { id: null, dx: 0, dy: 0, sx: 0, sy: 0, moved: false, lx: 0, lt: 0, vx: 0 };
let run = null, legT = 0, windT = 0;
body.style.touchAction = 'none';
body.addEventListener('pointerup', () => setTimeout(() => body.blur(), 0));
root.querySelector('.buddy-float').addEventListener('click', () => { if (mode === 'float') popFloat(); });
body.addEventListener('pointerdown', (e) => {
  if (root.classList.contains('away')) return;
  grab.id = e.pointerId; grab.sx = e.clientX; grab.sy = e.clientY; grab.moved = false;
  grab.dx = e.clientX - pos.x; grab.dy = e.clientY - pos.y; grab.lx = e.clientX; grab.lt = performance.now(); grab.vx = 0;
});
addEventListener('pointermove', (e) => {
  if (grab.id !== e.pointerId) return;
  if (!grab.moved && Math.hypot(e.clientX - grab.sx, e.clientY - grab.sy) < 7) return;
  if (!grab.moved) {                     // picked up
    if (mode === 'sing') { clearInterval(mouthT); clearInterval(noteT); clearTimeout(singT); clearInterval(lineT); root.classList.remove('singing'); root.querySelector('.buddy-notes')?.remove(); }
    grab.moved = true; mode = 'drag'; run = null; flying = false; body.classList.remove('m-glide', 'm-run', 'm-sleep', 'm-hops');
    if (asleep) popBubble();
    clearTimeout(bubbleT); root.classList.remove('bubbled');
    asleep = false; root.classList.remove('napping'); stopFidget(); clearTimeout(actTimer); busyUntil = Infinity; root.classList.remove('talking');
    rig.look(0, -0.6); rig.set({ pose: 'welcome', expr: 'surprised', ms: 200 }); move('startle');
    try { body.setPointerCapture(e.pointerId); } catch (err) {}
    setTimeout(() => { if (mode === 'drag') rig.set({ pose: 'welcome', expr: Math.random() < 0.5 ? 'excited' : 'curious' }); }, 900);
  }
  const t = performance.now(), dt = Math.max(1, t - grab.lt);
  grab.vx = grab.vx * 0.7 + (((e.clientX - grab.lx) / dt) * 1000) * 0.3; grab.lx = e.clientX; grab.lt = t;
  pos.x = e.clientX - grab.dx; pos.y = e.clientY - grab.dy;
}, { passive: true });
const drop = (e) => {
  if (grab.id !== e.pointerId) return;
  grab.id = null;
  if (!grab.moved) return;
  vel.x = grab.vx * 0.25; vel.y = 0;
  const cx = pos.x + W() / 2, cy = pos.y + H() / 2;
  if (Math.abs(cx - innerWidth / 2) < innerWidth * 0.14 && Math.abs(cy - viewH() / 2) < viewH() * 0.18) { sing(); return; }
  if (pos.y > Math.min(lastTY, viewH() - H() - 6) + 4) {   // dropped below his level: he hops back up instead of falling
    mode = 'follow'; busyUntil = 0; rig.look(0, 0); rig.set({ pose: 'hop', expr: 'happy', ms: 200 }); return;
  }
  mode = 'fall'; rig.set({ pose: 'hop', expr: 'surprised', ms: 200 });
};
addEventListener('pointerup', drop); addEventListener('pointercancel', drop);

function physics(dt, tx, ty) {
  const h = H(), floor = Math.min(ty, viewH() - h - 6);
  if (mode === 'drag') {
    const swing = Math.max(-28, Math.min(28, -grab.vx * 0.03));
    lean += (swing - lean) * Math.min(1, dt * 10); grab.vx *= Math.pow(0.02, dt);
  } else if (mode === 'fall') {
    vel.y += 2600 * dt; vel.x *= Math.pow(0.4, dt);
    pos.x += vel.x * dt; pos.y += vel.y * dt; lean += (0 - lean) * Math.min(1, dt * 14);
    if (pos.y >= floor) {                // landed on the perch's level
      pos.y = floor; const hard = vel.y > 900; vel.x = vel.y = 0; lean = 0;
      mode = 'run'; run = { phase: 'shake', until: performance.now() + (hard ? 900 : 550), style: pickRun() };
      move('boing'); rig.look(0, 0); rig.set({ pose: 'idle', expr: hard ? 'surprised' : 'oops', ms: 160 });
    } else if (pos.y < floor - 400 && vel.y < 0) pos.y = floor - 400;
  } else if (mode === 'run') runStep(dt, tx, floor);
  else if (mode === 'sing') { /* stays where he was dropped */ }
  else if (mode === 'float') {                // drifting inside the bubble, near his spot
    const t = (performance.now() - floatT0) / 1000, w = W(), vh = viewH();
    const fx = Math.max(10, Math.min(innerWidth - w - 40, tx + Math.sin(t * 0.21) * 150 + Math.sin(t * 0.07) * 60));
    const fy = Math.max(84, Math.min(vh - h - 40, ty - 80 + Math.sin(t * 0.33) * 34));
    const k = 1.4;
    vel.x += ((fx - pos.x) * k * k - vel.x * 2 * k) * dt; vel.y += ((fy - pos.y) * k * k - vel.y * 2 * k) * dt;
    pos.x += vel.x * dt; pos.y += vel.y * dt;
    lean += (Math.sin(t * 0.9) * 6 + vel.x * 0.02 - lean) * Math.min(1, dt * 3);
  }
  draw();
}
function pickRun() { return 'hop'; }
/* after a drop he hops back to his spot, one neat hop at a time */
function runStep(dt, tx, floor) {
  const now = performance.now();
  pos.y += (floor - pos.y) * Math.min(1, dt * 10);
  if (run.phase === 'shake') {
    if (now < run.until) return;
    run.phase = 'go'; setFace(tx >= pos.x ? 1 : -1);
    rig.set({ pose: 'hop', expr: 'happy', ms: 160 }); body.classList.add('m-hops');
  }
  const dx = tx - pos.x, dir = Math.sign(dx) || 1;
  setFace(dir);
  lean += (dir * 3 - lean) * Math.min(1, dt * 8);
  legT += dt; if (legT > 0.21) { legT = 0; rig.set({ pose: rig.pose === 'walkA' ? 'walkB' : 'walkA' }); }
  pos.x += dir * Math.min(Math.abs(dx), 260 * dt);
  if (Math.abs(tx - pos.x) < 3) {                          // home
    body.classList.remove('m-hops'); mode = 'follow'; run = null; vel.x = vel.y = 0; lean = 0;
    busyUntil = 0; arrivedAt = null; flying = false;
    setFace(perch && perch.face === 'left' ? -1 : 1);
    rig.set({ pose: 'thumbs', expr: 'proud', ms: 300 }); move('hop');
    clearTimeout(actTimer); actTimer = setTimeout(rest, 900);
  }
}

/* easter egg: drop him in the middle of the screen and he sings */
// The words come from data/song.txt, one bubble per line. Empty file = the default hum.
let SONG = TH ? ['ดูแลผิว ด้วยใจ', 'ลา ลา ลา'] : ['Care with a smile', 'La la la'];
const LINE_MS = 3200;
fetch(new URL('../data/song.txt', import.meta.url), { cache: 'no-store' })
  .then((r) => (r.ok ? r.text() : ''))
  .then((txt) => { const l = txt.split(/\r?\n/).map((x) => x.trim()).filter((x) => x && !x.startsWith('#')); if (l.length) SONG = l; })
  .catch(() => {});
let singT = 0, noteT = 0, mouthT = 0, lineT = 0;
function sing() {
  mode = 'sing'; stopFidget(); clearTimeout(actTimer); busyUntil = Infinity; root.classList.add('singing');
  setFace(1); lean = 0; draw(); rig.look(0, -0.2);
  rig.set({ pose: 'sing', expr: 'sing', ms: 300 }); move('hop');
  const notes = document.createElement('span'); notes.className = 'buddy-notes'; root.append(notes);
  let open = true, line = 0;
  mouthT = setInterval(() => { open = !open; rig.set({ expr: open ? 'sing' : 'singO' }); }, 380);
  noteT = setInterval(() => {
    if (reduce) return;
    const n = document.createElement('i'); n.textContent = ['♪', '♫', '♩', '♬'][Math.floor(Math.random() * 4)];
    n.style.setProperty('--x', `${(Math.random() * 2 - 1) * 60}px`); n.style.left = `${(Math.random() * 2 - 1) * 24}px`;
    notes.append(n); setTimeout(() => n.remove(), 2400);
  }, 420);
  speak(`♪ ${SONG[0]} ♪`);
  lineT = setInterval(() => { line++; if (mode === 'sing' && line < SONG.length) speak(`♪ ${SONG[line]} ♪`); }, LINE_MS);
  singT = setTimeout(stopSinging, SONG.length * LINE_MS + 400);
}
function stopSinging() {
  clearInterval(mouthT); clearInterval(noteT); clearTimeout(singT); clearInterval(lineT);
  root.classList.remove('singing'); root.querySelector('.buddy-notes')?.remove(); root.classList.remove('talking');
  rig.set({ pose: 'wai', expr: 'proud', ms: 300 }); move('bob');
  setTimeout(() => { if (mode === 'sing') { mode = 'fall'; vel.x = 0; vel.y = -80; rig.set({ pose: 'hop', expr: 'happy' }); } }, 1300);
}

/* events from the rest of the site */
document.addEventListener('ritz', (e) => { e.detail === 'done' ? done() : act(e.detail); });
export const ritzSay = (name) => document.dispatchEvent(new CustomEvent('ritz', { detail: name }));

if (store('ritz-away')) { root.classList.add('away'); peek.classList.add('on'); }
else setTimeout(() => act('hello'), 3000);
requestAnimationFrame(frame);
