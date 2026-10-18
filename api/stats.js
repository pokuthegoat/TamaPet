// /api/stats — public. { saved }: real animals saved by all players together (sum of every cloud save's
// `saved`, i.e. levels gained). Cached briefly at the edge so the live counter can poll it cheaply.
import { db, send } from './_lib.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // public number (lets the local test server read it too)
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const rows = await db('saves?select=saved&saved=gt.0&limit=100000');
    const saved = rows.reduce((sum, r) => sum + (Number(r.saved) || 0), 0);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
    return res.end(JSON.stringify({ saved, players: rows.length }));
  } catch (err) {
    return send(res, err.status || 500, { error: err.status ? err.message : 'Server error' });
  }
}
