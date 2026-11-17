import { searchIcons } from './_icons.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=86400');
  res.json(searchIcons(req.query.q));
}
