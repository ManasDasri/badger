import { getIcon } from './_icons.js';
import { fetchStats, STATS } from './_github.js';

export const SIZES = { xs: 16, sm: 20, md: 28, lg: 36, xl: 48, xxl: 64 };
export const STYLES = ['flat', 'pill', 'glass', 'outline', 'square'];

const NAMED = {
  green: '3fb950', blue: '58a6ff', red: 'f85149', orange: 'f78166', yellow: 'e3b341', purple: 'a371f7',
  pink: 'db61a2', grey: '555555', gray: '555555', black: '0d1117', white: 'ffffff', teal: '39c5bb', mint: '7fb59b',
};

// Only hex or whitelisted names reach the SVG: this is the injection boundary.
export function color(v, fallback) {
  if (!v) return fallback;
  v = String(v).replace(/^#/, '').toLowerCase();
  if (NAMED[v]) return '#' + NAMED[v];
  return /^([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(v) ? '#' + v : fallback;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// ponytail: per-char width heuristic (em units); textLength pins the result so renderers agree
export function textWidth(s, size, caps) {
  let w = 0;
  for (const ch of s) {
    if (/[ijl.,:;|!'`]/.test(ch)) w += 0.28;
    else if (/[ ftrI()\[\]\-]/.test(ch)) w += 0.34;
    else if (/[mwMW@%]/.test(ch)) w += 0.86;
    else if (/[A-Z]/.test(ch)) w += 0.68;
    else if (/[a-z0-9#$?*+=<>~^_]/.test(ch)) w += 0.56;
    else w += 1;
  }
  return w * size + (caps ? s.length * size * 0.1 : 0);
}

function luminance(hex) {
  const h = hex.slice(1, 7).replace(/^(.)(.)(.)$/, '$1$1$2$2$3$3');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ink = (bg) => (luminance(bg) > 0.4 ? '#1f2328' : '#ffffff');

export function render(o) {
  const style = STYLES.includes(o.style) ? o.style : 'glass';
  const h = Math.round(SIZES[o.size] || (+o.size ? Math.min(128, Math.max(12, +o.size)) : SIZES.sm));
  const outline = style === 'outline';
  const caps = style === 'square';
  const label = String(o.label ?? '').slice(0, 80);
  const value = String(o.value ?? '').slice(0, 80);
  const L = caps ? label.toUpperCase() : label;
  const V = caps ? value.toUpperCase() : value;

  const labelBg = color(o.labelColor, outline ? '#22272e' : '#555555');
  const valueBg = color(o.color, '#3fb950');
  const valueBg2 = color(o.color2, null);
  const font = h * (caps ? 0.4 : 0.5);
  const weight = caps || outline ? 700 : 500;
  const pad = h * (caps ? 0.55 : 0.42);
  const icon = getIcon(o.icon);
  const iconSize = h * 0.6;
  const gap = h * 0.22;
  const iconInValue = o.iconPos === 'value' || !label;
  const iconBg = iconInValue ? valueBg : labelBg;
  // brand color unless it would vanish on the badge background
  const brand = icon && Math.abs(luminance('#' + icon.hex) - luminance(iconBg)) > 0.12 ? '#' + icon.hex : ink(iconBg);
  const iconColor = color(o.iconColor, outline && iconInValue ? valueBg : brand);

  const seg = (text, withIcon) => {
    if (!text && !withIcon) return null;
    const tw = text ? textWidth(text, font, caps) : 0;
    return { text, tw, withIcon, w: pad * 2 + tw + (withIcon ? iconSize + (text ? gap : 0) : 0) };
  };
  const a = seg(L, icon && !iconInValue);
  const b = seg(V, icon && iconInValue);
  const lw = a ? a.w : 0;
  const vw = b ? b.w : 0;
  const W = Math.ceil(lw + vw);
  const r = style === 'pill' ? h / 2 : caps ? 0 : Math.max(2, h * (outline ? 0.22 : 0.18));

  const labelInk = color(o.labelText, outline ? '#e6edf3' : ink(labelBg));
  const valueInk = color(o.valueText, outline ? valueBg : ink(valueBg));
  const shadow = !outline;
  const baseline = h / 2 + font * 0.35;
  const parts = [];

  const draw = (s, x0, inkColor) => {
    let x = x0 + pad;
    if (s.withIcon) {
      parts.push(`<svg x="${x.toFixed(2)}" y="${((h - iconSize) / 2).toFixed(2)}" width="${iconSize.toFixed(2)}" height="${iconSize.toFixed(2)}" viewBox="0 0 24 24"><path fill="${iconColor}" fill-rule="evenodd" d="${icon.path}"/></svg>`);
      x += iconSize + (s.text ? gap : 0);
    }
    if (!s.text) return;
    const attrs = `x="${x.toFixed(2)}" textLength="${s.tw.toFixed(2)}" lengthAdjust="spacingAndGlyphs"`;
    if (shadow) parts.push(`<text ${attrs} y="${(baseline + h * 0.04).toFixed(2)}" fill="#010101" fill-opacity=".3">${esc(s.text)}</text>`);
    parts.push(`<text ${attrs} y="${baseline.toFixed(2)}" fill="${inkColor}">${esc(s.text)}</text>`);
  };
  if (a) draw(a, 0, labelInk);
  if (b) draw(b, lw, valueInk);

  const valueFill = outline ? valueBg : valueBg2 ? 'url(#v)' : valueBg;
  const title = esc([label, value].filter(Boolean).join(': '));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img" aria-label="${title}"><title>${title}</title><defs>${valueBg2 ? `<linearGradient id="v" x2="100%"><stop offset="0" stop-color="${valueBg}"/><stop offset="1" stop-color="${valueBg2}"/></linearGradient>` : ''}<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient><clipPath id="r"><rect width="${W}" height="${h}" rx="${r}"/></clipPath></defs><g clip-path="url(#r)"><rect width="${W}" height="${h}" fill="${labelBg}"/>${b ? `<rect x="${lw}" width="${W - lw}" height="${h}" fill="${valueFill}"${outline ? ' fill-opacity=".14"' : ''}/>` : ''}${style === 'glass' ? `<rect width="${W}" height="${h}" fill="url(#s)"/>` : ''}</g>${outline ? `<rect x=".5" y=".5" width="${W - 1}" height="${h - 1}" rx="${Math.max(0, r - 0.5)}" fill="none" stroke="#444c56"/>${a && b ? `<path d="M${lw} 0v${h}" stroke="#444c56"/>` : ''}` : ''}<g font-family="'Segoe UI',Helvetica,Arial,sans-serif" font-size="${font.toFixed(2)}" font-weight="${weight}">${parts.join('')}</g></svg>`;
}

export default async function handler(req, res) {
  const q = { ...req.query };
  let maxAge = 86400;
  if (q.gh && q.stat) {
    const stat = STATS[q.stat];
    try {
      if (!stat) throw new Error('unknown stat');
      const s = await fetchStats(q.gh);
      q.value = stat.get(s);
      q.label ??= stat.label;
      q.icon ??= stat.icon;
    } catch (e) {
      q.label ??= q.gh;
      q.value = e.message;
      q.color = 'f85149';
      q.color2 = '';
    }
    maxAge = 3600;
  }
  if (q.label == null && q.value == null) q.label = 'badger';
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', `public, max-age=${Math.min(maxAge, 1800)}, s-maxage=${maxAge}, stale-while-revalidate=86400`);
  res.end(render(q));
}
