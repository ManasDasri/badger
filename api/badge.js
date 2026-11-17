import { getIcon } from './_icons.js';
import { fetchStats, STATS } from './_github.js';
import { render } from '../lib/render.js';

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
  res.end(render(q, getIcon(q.icon)));
}
