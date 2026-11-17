const TITLES = [[90, 'Deity'], [75, 'Legend'], [60, 'Master'], [50, 'Elite'], [40, 'Veteran'], [30, 'Tracker'], [20, 'Burrower'], [12, 'Scout'], [5, 'Cub'], [0, 'Hatchling']];

// Made-up, just-for-fun formula. Shown as such in the UI.
export function level({ stars, followers, repos, forks, years }) {
  const score = stars + followers * 2 + repos * 0.5 + forks * 0.5 + years * 3;
  const lv = Math.min(99, Math.floor(2.5 * Math.sqrt(score)));
  return { lv, title: TITLES.find(([min]) => lv >= min)[1] };
}

const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k' : String(n));

export const STATS = {
  stars: { label: 'Stars', icon: 'star', get: (s) => fmt(s.stars) },
  followers: { label: 'Followers', icon: 'heart', get: (s) => fmt(s.followers) },
  repos: { label: 'Repos', icon: 'github', get: (s) => fmt(s.repos) },
  forks: { label: 'Forks', icon: 'git', get: (s) => fmt(s.forks) },
  gists: { label: 'Gists', icon: 'code', get: (s) => fmt(s.gists) },
  language: { label: 'Top language', icon: 'code', get: (s) => s.language || 'n/a' },
  joined: { label: 'Coding since', icon: 'commit', get: (s) => String(s.joined) },
  rank: { label: 'Badger rank', icon: 'rankup', get: (s) => `Lv.${s.lv} ${s.title}` },
};

const cache = new Map(); // ponytail: per-instance memory cache; move to Vercel KV if rate limits bite

async function gh(path) {
  const headers = { 'User-Agent': 'badger-badges', Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const r = await fetch('https://api.github.com' + path, { headers });
  if (!r.ok) throw new Error(r.status === 404 ? 'user not found' : r.status === 403 ? 'rate limited' : 'github ' + r.status);
  return r.json();
}

export async function fetchStats(user) {
  if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(user)) throw new Error('bad username');
  const key = user.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 30 * 60e3) return hit.data;

  const u = await gh(`/users/${user}`);
  const repos = [];
  // ponytail: first 300 owned repos only; enough for nearly everyone
  for (let p = 1; p <= 3; p++) {
    const page = await gh(`/users/${user}/repos?per_page=100&type=owner&page=${p}`);
    repos.push(...page);
    if (page.length < 100) break;
  }
  const own = repos.filter((r) => !r.fork);
  const langs = {};
  for (const r of own) if (r.language) langs[r.language] = (langs[r.language] || 0) + 1;
  const s = {
    login: u.login,
    followers: u.followers,
    repos: u.public_repos,
    gists: u.public_gists,
    stars: own.reduce((a, r) => a + r.stargazers_count, 0),
    forks: own.reduce((a, r) => a + r.forks_count, 0),
    language: Object.entries(langs).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    joined: new Date(u.created_at).getFullYear(),
  };
  s.years = new Date().getFullYear() - s.joined;
  const { lv, title } = level(s);
  s.lv = lv;
  s.title = title;
  cache.set(key, { at: Date.now(), data: s });
  return s;
}
