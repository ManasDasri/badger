import { fetchStats } from './_github.js';

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 'public, s-maxage=1800');
    res.json(await fetchStats(String(req.query.user || '')));
  } catch (e) {
    res.status(e.message === 'user not found' ? 404 : 400).json({ error: e.message });
  }
}
