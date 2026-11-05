/* Chibi Dr. Ritz, rigged from the Gemini drawings.
   The drawings were cut into layers (tools: assets/chibi/rig/*.webp): one shared head with the
   eyes and mouth painted out, a body per pose, two legs. The face is drawn here in SVG in the
   same style, so he can blink, look at the cursor and change expression on any pose.
   Coordinates are the rig's own canvas: 300 x 475. */

const INK = '#37140F';
const BASE = new URL('../assets/chibi/rig/', import.meta.url).href;
const G = { w: 300, h: 475, neck: [160.5, 202.5], eyeL: [125, 143], eyeR: [195.5, 143], mouth: [160.5, 175], hipL: [135.5, 398], hipR: [185.5, 398] };

// Poses drawn as a body image. 'full' poses are whole drawings with their own face.
export const POSES = ['idle', 'wave', 'point', 'card', 'wai', 'thumbs', 'welcome', 'think', 'peek', 'walkA', 'walkB', 'hop', 'cheer', 'sing'];
const BODY = { idle: 'stand', wave: 'wave', point: 'point', card: 'card', wai: 'wai', thumbs: 'thumbs', welcome: 'welcome', walkA: 'stand', walkB: 'stand', hop: 'stand', cheer: 'welcome', sing: 'wai' };
const FULL = { think: 'think', peek: 'peek' };
// legs: rotation of each leg in degrees, lift in px
const LEGS = { walkA: [-12, 10, 0, -6], walkB: [10, -12, -6, 0], hop: [-6, 6, -4, -4] };

export const EXPRESSIONS = ['happy', 'blink', 'wink', 'excited', 'proud', 'curious', 'surprised', 'shy', 'love', 'sleepy', 'oops', 'dizzy', 'worried', 'sing', 'singO'];

/* ---------- face parts ---------- */
const eyeOpen = ([x, y], s = 1) => `<g class="rz-eye"><ellipse cx="${x}" cy="${y}" rx="${9.5 * s}" ry="${12 * s}" fill="${INK}"/><circle cx="${x + 3.4 * s}" cy="${y - 4.6 * s}" r="${2.9 * s}" fill="#fff"/></g>`;
const eyeClosed = ([x, y]) => `<path d="M${x - 16} ${y + 2}q16 13 32 0q-16 6-32 0z" fill="${INK}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
const eyeHappy = ([x, y]) => `<path d="M${x - 13} ${y + 5}q13-15 26 0" fill="none" stroke="${INK}" stroke-width="4.2" stroke-linecap="round"/>`;
const eyeFlat = ([x, y]) => `<path d="M${x - 12} ${y + 3}h24" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M${x - 11} ${y - 1}q11-4 22 0" fill="none" stroke="${INK}" stroke-width="2" opacity=".55"/>`;
const eyeSquint = ([x, y], dir) => `<path d="M${x - 10 * dir} ${y - 8}l${18 * dir} 8l${-18 * dir} 8" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
const eyeHeart = ([x, y]) => `<path transform="translate(${x} ${y + 1}) scale(1.05)" d="M0 10C-4 6-13 2-13-5c0-5 4-8 8-8 3 0 5 2 5 4 0-2 2-4 5-4 4 0 8 3 8 8 0 7-9 11-13 15z" fill="#E0465E" stroke="${INK}" stroke-width="1.6"/><circle cx="${x - 5}" cy="${y - 5}" r="2.2" fill="#fff" opacity=".9"/>`;
const eyeSpiral = ([x, y]) => `<path transform="translate(${x} ${y})" d="M0 0c2 0 3 2 2 3-1 3-5 2-5-1 0-4 5-6 8-4 4 2 4 8 0 10-5 3-11 0-11-5 0-7 7-11 13-8" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
const eyeUp = ([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9.5" ry="12" fill="${INK}"/><circle cx="${x + 2}" cy="${y - 6.5}" r="3.2" fill="#fff"/>`;

const [mx, my] = G.mouth;
const M = {
  smile: `<path d="M${mx - 19} ${my - 3}q19 13 38 0" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`,
  open: `<path d="M${mx - 22} ${my - 6}q22-3 44 0q-3 19-22 19t-22-19z" fill="#7B2A26" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>
         <path d="M${mx - 19} ${my - 5}q19-2 38 0l-2 4q-17 2-34 0z" fill="#fff"/>
         <path d="M${mx - 11} ${my + 9}q11-8 22 0q-11 6-22 0z" fill="#F08A93"/>`,
  o: `<ellipse cx="${mx}" cy="${my + 2}" rx="6" ry="7.5" fill="#7B2A26" stroke="${INK}" stroke-width="2.6"/>`,
  small: `<path d="M${mx - 9} ${my}q9 6 18 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  wavy: `<path d="M${mx - 14} ${my + 2}q3.5-5 7 0t7 0t7 0t7 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  flat: `<path d="M${mx - 10} ${my + 1}h20" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  cat: `<path d="M${mx - 14} ${my - 2}q7 8 14 0q7 8 14 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
};
const blush = `<ellipse cx="${G.eyeL[0] - 8}" cy="${G.eyeL[1] + 22}" rx="11" ry="6" fill="#F59AA6" opacity=".55"/><ellipse cx="${G.eyeR[0] + 8}" cy="${G.eyeR[1] + 22}" rx="11" ry="6" fill="#F59AA6" opacity=".55"/>`;
const sweat = `<path d="M232 108c6 9 8 14 4 18s-11 1-10-5c1-4 4-8 6-13z" fill="#9FD3F2" stroke="#4A90C2" stroke-width="1.5"/>`;
const sparkle = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0-9 2-2 9 0 2 2 0 9-2 2-9 0-2-2z" fill="#E2CCA5"/>`;

function faceSVG(expr) {
  const L = G.eyeL, R = G.eyeR;
  switch (expr) {
    case 'blink': return eyeClosed(L) + eyeClosed(R) + M.smile;
    case 'wink': return eyeOpen(L) + eyeHappy(R) + M.smile + sparkle(232, 128, 0.8);
    case 'excited': return eyeOpen(L, 1.08) + eyeOpen(R, 1.08) + M.open + sparkle(86, 118) + sparkle(236, 112, 0.8);
    case 'proud': return eyeHappy(L) + eyeHappy(R) + M.smile;
    case 'curious': return eyeOpen(L) + eyeOpen(R, 1.1) + M.o;
    case 'surprised': return eyeOpen(L, 1.2) + eyeOpen(R, 1.2) + M.o;
    case 'shy': return eyeHappy(L) + eyeHappy(R) + blush + M.wavy;
    case 'love': return eyeHeart(L) + eyeHeart(R) + blush + M.open;
    case 'sleepy': return eyeFlat(L) + eyeFlat(R) + M.small;
    case 'oops': return eyeSquint(L, 1) + eyeSquint(R, -1) + M.wavy + sweat;
    case 'giggle': return eyeHappy(L) + eyeHappy(R) + blush + M.open;
    case 'dizzy': return eyeSpiral(L) + eyeSpiral(R) + M.wavy;
    case 'worried': return eyeUp(L) + eyeUp(R) + M.flat + sweat;
    case 'sing': return eyeHappy(L) + eyeHappy(R) + blush + M.open;
    case 'singO': return eyeHappy(L) + eyeHappy(R) + blush + M.o;
    default: return eyeOpen(L) + eyeOpen(R) + M.smile;   // happy
  }
}

/* ---------- the rig ---------- */
export function createRitz(host, size = 120) {
  const k = size / G.w;
  host.innerHTML = `
    <div class="rz" style="width:${size}px;height:${Math.round(G.h * k)}px">
      <div class="rz-in" style="width:${G.w}px;height:${G.h}px;transform:scale(${k})">
        <img class="rz-leg rz-leg-l" src="${BASE}leg-l.webp" alt="" draggable="false" style="transform-origin:${G.hipL[0]}px ${G.hipL[1]}px">
        <img class="rz-leg rz-leg-r" src="${BASE}leg-r.webp" alt="" draggable="false" style="transform-origin:${G.hipR[0]}px ${G.hipR[1]}px">
        <div class="rz-torso" style="transform-origin:${G.w / 2}px ${G.hipL[1]}px">
          <img class="rz-body" src="${BASE}body-stand.webp" alt="" draggable="false">
          <svg class="rz-mic rz-mic-handle" viewBox="0 0 ${G.w} ${G.h}" aria-hidden="true"><defs><linearGradient id="rzh" x1="0" x2="1"><stop offset="0" stop-color="#111"/><stop offset=".45" stop-color="#4a4a4a"/><stop offset="1" stop-color="#111"/></linearGradient></defs><path d="M156.8 205h7.4l-1.4 98h-4.6z" fill="url(#rzh)" stroke="${INK}" stroke-width="1.2"/></svg>
          <img class="rz-mic rz-hands" src="${BASE}hands-wai.webp" alt="" draggable="false">
          <div class="rz-head" style="transform-origin:${G.neck[0]}px ${G.neck[1]}px">
            <img src="${BASE}head.webp" alt="" draggable="false">
            <svg class="rz-face" viewBox="0 0 ${G.w} ${G.h}" aria-hidden="true"><g class="rz-look"></g></svg>
          </div>
          <svg class="rz-mic rz-mic-head" viewBox="0 0 ${G.w} ${G.h}" aria-hidden="true"><defs><radialGradient id="rzb" cx=".35" cy=".3"><stop offset="0" stop-color="#F4F4F4"/><stop offset=".55" stop-color="#9DA3AA"/><stop offset="1" stop-color="#4C5157"/></radialGradient><pattern id="rzm" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 0h3M0 0v3" stroke="#3A3E43" stroke-width=".5" opacity=".55"/></pattern></defs><rect x="154.5" y="205" width="12" height="7" rx="1.8" fill="#D9B566" stroke="${INK}" stroke-width="1"/><circle cx="160.5" cy="192" r="15" fill="url(#rzb)" stroke="${INK}" stroke-width="2"/><circle cx="160.5" cy="192" r="15" fill="url(#rzm)"/><circle cx="155" cy="185.5" r="3.4" fill="#fff" opacity=".8"/></svg>
        </div>
        <img class="rz-full" src="${BASE}full-think.webp" alt="" draggable="false" hidden>
      </div>
    </div>`;
  const $ = (s) => host.querySelector(s);
  const torso = $('.rz-torso'), head = $('.rz-head'), look = $('.rz-look'), full = $('.rz-full');
  const body = $('.rz-body');
  const legL = $('.rz-leg-l'), legR = $('.rz-leg-r');
  let curBody = 'stand';
  // preload
  [...new Set(Object.values(BODY))].forEach((b) => { const i = new Image(); i.src = `${BASE}body-${b}.webp`; });
  Object.values(FULL).forEach((b) => { const i = new Image(); i.src = `${BASE}full-${b}.webp`; });
  { const i = new Image(); i.src = `${BASE}hands-wai.webp`; }

  const state = { pose: 'idle', expr: 'happy', turn: 0 };
  let blinking = false, lookX = 0, lookY = 0;

  function drawFace() {
    look.innerHTML = faceSVG(blinking && /^(happy|curious|surprised|excited|worried)$/.test(state.expr) ? 'blink' : state.expr);
    look.querySelectorAll('.rz-eye').forEach((e) => { e.style.transform = `translate(${lookX * 3.2}px,${lookY * 2.4}px)`; });
  }
  function setBody(name, ms) {
    if (name === curBody) return;
    curBody = name;
    // one body image, swapped in place: every pose is preloaded, so there is never a second body on screen
    body.src = `${BASE}body-${name}.webp`;
    // a quick squash sells the change of pose
    torso.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.03,.96)' }, { transform: 'scale(.99,1.02)' }, { transform: 'scale(1,1)' }], { duration: Math.max(180, ms || 260), easing: 'ease-out' });
  }

  const api = {
    get pose() { return state.pose; }, get expr() { return state.expr; }, get turn() { return state.turn; },
    set({ pose, expr, ms = 240, turn } = {}) {
      if (expr) state.expr = expr;
      if (turn != null) { state.turn = turn; host.style.setProperty('--turn', turn); }
      if (pose && pose !== state.pose) {
        state.pose = pose;
        if (FULL[pose]) { full.src = `${BASE}full-${FULL[pose]}.webp`; full.hidden = false; torso.style.display = 'none'; legL.style.display = legR.style.display = 'none'; }
        else {
          full.hidden = true; torso.style.display = ''; legL.style.display = legR.style.display = '';
          setBody(BODY[pose] || 'stand', ms);
        }
        host.classList.toggle('rz-singing', pose === 'sing');
        const [l, r, ly, ry] = LEGS[pose] || [0, 0, 0, 0];
        legL.style.transform = `translateY(${ly}px) rotate(${l}deg)`;
        legR.style.transform = `translateY(${ry}px) rotate(${r}deg)`;
        host.dataset.pose = pose;
      }
      host.dataset.expr = state.expr;
      drawFace();
    },
    look(x, y) {
      lookX = Math.max(-1, Math.min(1, x)); lookY = Math.max(-1, Math.min(1, y));
      head.style.transform = `translate(${lookX * 3}px,${lookY * 1.5}px) rotate(${lookX * 4}deg)`;
      look.querySelectorAll('.rz-eye').forEach((e) => { e.style.transform = `translate(${lookX * 3.2}px,${lookY * 2.4}px)`; });
    },
    blink() { blinking = true; drawFace(); setTimeout(() => { blinking = false; drawFace(); }, 140); },
  };
  api.set({ pose: 'idle', expr: 'happy' });
  return api;
}
