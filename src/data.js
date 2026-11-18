import { render as draw } from '../lib/render.js';

export const STATS = { stars: 'Stars', followers: 'Followers', repos: 'Repos', forks: 'Forks', gists: 'Gists', language: 'Top language', joined: 'Coding since', rank: 'Badger rank' };
export const KEYS = ['label', 'value', 'style', 'size', 'labelColor', 'color', 'color2', 'icon', 'iconColor', 'iconPos', 'gh', 'stat'];
export const DEFAULT = { label: 'dev level', value: 'Lv.42 Code Wizard', style: 'pixel', size: 'lg', color: '7fb59b' };
export const SWATCHES = ['3fb950', '7fb59b', '39c5bb', '58a6ff', 'a371f7', 'db61a2', 'f85149', 'f78166', 'e3b341', '555555', '22272e', 'ffffff'];

export const PRESETS = [
  ['Level up', DEFAULT],
  ['8-bit HP', { label: 'HP', value: '99/99', style: 'pixel', size: 'lg', icon: 'heart', color: 'ff5d8f' }],
  ['Player 1', { label: 'player 1', value: 'ready', style: 'pixel', size: 'md', icon: 'badger', color: '3fb950' }],
  ['Coins', { label: 'coins', value: 'x 9,999', style: 'pixel', size: 'md', icon: 'star', labelColor: '1a2232', color: 'ffd23f' }],
  ['Tier chip', { label: 'tier', value: 'Pro', style: 'outline', size: 'lg', icon: 'rankup', iconPos: 'value', color: '39c5bb' }],
  ['Classic', { label: 'build', value: 'passing', style: 'flat', size: 'sm', icon: 'githubactions', iconColor: 'ffffff' }],
  ['For the badge', { label: 'made with', value: 'rust', style: 'square', size: 'md', icon: 'rust', iconColor: 'ffffff', color: 'f78166' }],
  ['Neon pill', { label: 'TypeScript', value: 'strict', style: 'pill', size: 'md', icon: 'typescript', color: 'a371f7', color2: 'db61a2' }],
  ['Streak', { label: 'streak', value: '120 days', style: 'outline', size: 'lg', icon: 'flame', color: 'f78166' }],
  ['Icon only', { label: '', value: '', style: 'pill', size: 'xl', icon: 'badger', color: '22272e' }],
  ['Sponsor', { label: 'sponsor', value: '♥ me', style: 'glass', size: 'md', icon: 'githubsponsors', color: 'db61a2' }],
  ['Stack', { label: '', value: 'Next.js', style: 'pill', size: 'md', icon: 'nextdotjs', color: '000000', iconColor: 'ffffff' }],
  ['Live rank', { label: '', value: '', style: 'glass', size: 'lg', gh: 'torvalds', stat: 'rank', color: '7fb59b' }],
  ['Live stars', { style: 'outline', size: 'md', gh: 'sindresorhus', stat: 'stars', color: 'e3b341' }],
  ['Crowned', { label: 'open source', value: 'royalty', style: 'glass', size: 'lg', icon: 'crown', labelColor: '161b22', color: 'e3b341', color2: 'f78166' }],
];

export const MARQUEE = PRESETS.map(([, s]) => s).filter((s) => !s.gh).concat([
  { label: 'badges', value: 'with bite', icon: 'badger', style: 'pixel', color: '3fb950' },
  { label: 'insert', value: 'coin', icon: 'star', style: 'pixel', color: 'ffd23f' },
  { label: 'python', value: '3.13', icon: 'python', style: 'glass', color: '3776ab' },
  { label: '', value: 'docker', icon: 'docker', style: 'outline', color: '58a6ff' },
  { label: 'license', value: 'MIT', style: 'flat', color: 'e3b341' },
]);

export function params(s, overrides = {}) {
  const p = new URLSearchParams();
  const o = { ...s, ...overrides };
  for (const k of KEYS) {
    const v = o[k];
    const text = k === 'label' || k === 'value';
    if (v == null || (v === '' && !text)) continue;
    if (o.gh && text && (k === 'value' || !v)) continue; // live stat fills these
    p.set(k, v);
  }
  if (!o.gh) p.delete('stat');
  return p.toString().replace(/%2C/g, ',');
}

export const badgeUrl = (s, o) => `${location.origin}/api/badge?${params(s, o)}`;
export const altText = (s) => (s.gh ? `${s.gh} ${STATS[s.stat] || ''}`.trim() : [s.label, s.value].filter(Boolean).join(': ') || 'badge');

// Static badges render in the browser (instant); live GitHub ones need the server.
export const badgeSrc = (icons, s, o = {}) =>
  s.gh ? badgeUrl(s, o) : 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(draw({ ...s, ...o }, icons[s.icon] || null));

export function snippet(s, t) {
  const url = badgeUrl(s);
  if (t === 'url') return url;
  if (t === 'html') return `<img src="${url}" alt="${altText(s).replace(/"/g, '&quot;')}">`;
  return `![${altText(s).replace(/[[\]]/g, '')}](${url})`;
}

export function fromHash() {
  const h = new URLSearchParams(location.hash.slice(1)).get('b');
  if (!h) return null;
  const s = {};
  for (const [k, v] of new URLSearchParams(h)) if (KEYS.includes(k)) s[k] = v;
  return { style: 'glass', ...s }; // shared links without style get the API default
}
