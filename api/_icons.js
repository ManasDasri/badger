import * as si from 'simple-icons';

// Hand-drawn icons, 24x24 viewBox, single path (evenodd).
export const CUSTOM = {
  badger: { title: 'Badger', hex: 'E6EDF3', path: 'M4.2 2.6c1.4 0 2.4.7 2.9 1.6A10 10 0 0 1 12 3c1.8 0 3.5.4 4.9 1.2.5-.9 1.5-1.6 2.9-1.6 1.6 0 2.8 1.3 2.8 2.9 0 1.2-.6 2.1-1.5 2.6.6 1.2.9 2.5.9 3.9 0 5.4-4.3 9.6-10 9.6S2 17.4 2 12c0-1.4.3-2.7.9-3.9C2 7.6 1.4 6.7 1.4 5.5c0-1.6 1.2-2.9 2.8-2.9zM7.3 7.5c-.9.1-1.4.9-1.1 1.8l2.9 6.4c.4.9 1.5 1 2 .2l-2-7.4c-.3-.7-1-1.1-1.8-1zm9.4 0c-.8-.1-1.5.3-1.8 1l-2 7.4c.5.8 1.6.7 2-.2l2.9-6.4c.3-.9-.2-1.7-1.1-1.8zM12 15.8c-1 0-1.8.5-1.8 1.2s.8 1.4 1.8 1.4 1.8-.7 1.8-1.4-.8-1.2-1.8-1.2z' },
  star: { title: 'Star', hex: 'E3B341', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  flame: { title: 'Flame', hex: 'F78166', path: 'M12 23c-4.4 0-8-3.1-8-7.5 0-3.3 2-5.6 4-7.5.4 1.8 1.4 3 2.6 3.4C10.2 7.6 11.5 4 15 1c-.3 3.5 1.2 5.6 2.8 7.6C19.2 10.4 20 12.6 20 15.5 20 19.9 16.4 23 12 23z' },
  bolt: { title: 'Bolt', hex: 'F2CC60', path: 'M13 2L3 14h7l-1 8 10-12h-7l1-8z' },
  heart: { title: 'Heart', hex: 'DB61A2', path: 'M12 21l-1.45-1.32C5.4 15.03 2 11.95 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.45-3.4 6.53-8.55 11.19L12 21z' },
  rankup: { title: 'Rank up', hex: '3FB950', path: 'M12 2.5l8.5 6.4v3.4L12 5.9l-8.5 6.4V8.9L12 2.5zm0 7.6l8.5 6.4v3.4L12 13.5l-8.5 6.4v-3.4l8.5-6.4z' },
  trophy: { title: 'Trophy', hex: 'E3B341', path: 'M7 3h10v2h4v3a5 5 0 0 1-5 5h-.3A5 5 0 0 1 13 15.9V18h3v3H8v-3h3v-2.1A5 5 0 0 1 8.3 13H8a5 5 0 0 1-5-5V5h4V3zm-2 4v1a3 3 0 0 0 3 3V7H5zm14 0h-3v4a3 3 0 0 0 3-3V7z' },
  crown: { title: 'Crown', hex: 'E3B341', path: 'M2 18h20v3H2v-3zm0-12l5.5 4L12 3l4.5 7L22 6l-2 10H4L2 6z' },
  sparkle: { title: 'Sparkle', hex: 'A371F7', path: 'M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z' },
  code: { title: 'Code', hex: '58A6FF', path: 'M8.7 16.6L4.1 12l4.6-4.6L7.3 6l-6 6 6 6 1.4-1.4zm6.6 0l4.6-4.6-4.6-4.6L16.7 6l6 6-6 6-1.4-1.4z' },
  check: { title: 'Check', hex: '3FB950', path: 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z' },
  commit: { title: 'Commit', hex: 'F78166', path: 'M12 7a5 5 0 0 1 4.9 4H23v2h-6.1a5 5 0 0 1-9.8 0H1v-2h6.1A5 5 0 0 1 12 7zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z' },
};

const BRANDS = Object.values(si).filter((i) => i && i.slug);
const BY_SLUG = new Map(BRANDS.map((i) => [i.slug, i]));

const POPULAR = ['github', 'git', 'react', 'typescript', 'javascript', 'python', 'rust', 'go', 'nodedotjs', 'nextdotjs', 'docker', 'linux', 'neovim', 'svelte', 'tailwindcss', 'kotlin', 'swift', 'cplusplus', 'githubactions', 'vercel'];

export function getIcon(name) {
  if (!name) return null;
  const k = String(name).toLowerCase();
  return CUSTOM[k] || BY_SLUG.get(k) || null;
}

export function searchIcons(q, limit = 40) {
  q = String(q || '').toLowerCase().trim();
  const custom = Object.entries(CUSTOM).map(([slug, i]) => ({ slug, title: i.title, hex: i.hex, path: i.path, custom: true }));
  const hit = (i) => !q || i.slug.includes(q) || i.title.toLowerCase().includes(q);
  const brands = q ? [] : POPULAR.map((s) => BY_SLUG.get(s)).map((i) => ({ slug: i.slug, title: i.title, hex: i.hex, path: i.path }));
  // ponytail: linear scan of ~3.3k icons per query, fine at this size
  for (const i of BRANDS) {
    if (brands.length >= limit) break;
    if (q && hit(i)) brands.push({ slug: i.slug, title: i.title, hex: i.hex, path: i.path });
  }
  return [...custom.filter(hit), ...brands].slice(0, limit);
}
