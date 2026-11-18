import gsap from 'gsap';

// Per-viewer conveniences only; the page works without storage.
export const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('badger-' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('badger-' + k, JSON.stringify(v)); } catch {} },
};

/* ---------- notifications (toast + achievements), rendered by App ---------- */
let listener = () => {};
export const onNotify = (fn) => (listener = fn);
export const toast = (text = 'Copied!') => listener({ type: 'toast', text });

/* ---------- 8-bit sound ---------- */
let ac;
let muted = store.get('muted', false);
export const isMuted = () => muted;
export const setMuted = (m) => { muted = m; store.set('muted', m); };
export const SFX = {
  click: [[660, 0.05]], select: [[880, 0.05]], coin: [[988, 0.08], [1319, 0.28]],
  up: [[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.22]], err: [[220, 0.12], [160, 0.22]], drop: [[784, 0.06], [523, 0.1]],
};
export function beep(notes) {
  if (muted) return;
  try {
    ac ||= new AudioContext();
    let t = ac.currentTime;
    for (const [f, d] of notes) {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'square';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.035, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(ac.destination);
      o.start(t);
      o.stop(t + d);
      t += d * 0.85;
    }
  } catch {}
}

/* ---------- coin burst ---------- */
let lastPt = { x: innerWidth / 2, y: innerHeight / 2 };
addEventListener('pointerdown', (e) => (lastPt = { x: e.clientX, y: e.clientY }));
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function burst(label = '+1', { x, y } = lastPt) {
  if (calm()) return;
  const coins = Array.from({ length: 12 }, () => {
    const el = Object.assign(document.createElement('i'), { className: 'coin' });
    el.style.cssText = `left:${x - 4}px;top:${y - 4}px`;
    return el;
  });
  const plus = Object.assign(document.createElement('span'), { className: 'plus', textContent: label });
  plus.style.cssText = `left:${x - 12}px;top:${y - 30}px`;
  document.body.append(...coins, plus);
  coins.forEach((el, i) => {
    const a = (i / coins.length) * Math.PI * 2;
    const r = 40 + Math.random() * 45;
    gsap.timeline({ onComplete: () => el.remove() })
      .to(el, { x: Math.cos(a) * r, y: Math.sin(a) * r - 30, duration: 0.35, ease: 'steps(4)' })
      .to(el, { y: '+=60', opacity: 0, duration: 0.35, ease: 'steps(4)' });
  });
  gsap.to(plus, { y: -44, opacity: 0, duration: 0.8, ease: 'steps(8)', onComplete: () => plus.remove() });
}

/* ---------- achievements ---------- */
const ACH = { copy: 'First badge copied', scan: 'Profile scanned', readme: 'README started', five: 'Collector: 5 badges', styles: 'Tried every style' };
const got = new Set(store.get('ach', []));
export function unlock(k) {
  if (got.has(k)) return;
  got.add(k);
  store.set('ach', [...got]);
  beep(SFX.up);
  listener({ type: 'ach', text: ACH[k] });
}

export async function copy(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
    toast(msg);
    beep(SFX.coin);
    burst();
    unlock('copy');
  } catch {
    prompt('Copy this:', text);
  }
}
