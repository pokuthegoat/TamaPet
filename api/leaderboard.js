// /api/leaderboard — public, read-only. Top 50 cloud saves.
//   GET                → ranked by real animals saved (then level)
//   GET ?game=SNAKE    → ranked by best score in that minigame
// Returns { rows: [{ name, animal, wallet, value }] }.
import { db, send } from './_lib.js';

const GAMES = ['SNAKE', 'PONG', 'BRICKS', 'FLAP', 'JUMP', 'SPACE', 'BLOCKS', 'MEMORY', 'RACER', 'CATCH'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // public data (lets the local test server read it too)
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const game = String(req.query?.game || new URL(req.url, 'http://x').searchParams.get('game') || '').toUpperCase();
    let rows;
    if (game) {
      if (!GAMES.includes(game)) return send(res, 400, { error: 'Unknown game' });
      const col = `data->best->${game}`;
      rows = await db(`saves?select=name,wallet,animal:data->animal,value:${col}&${col}=gt.0&order=${col}.desc,updated_at.asc&limit=50`);
    } else {
      rows = await db('saves?select=name,wallet,animal:data->animal,value:saved,level&name=not.is.null&order=saved.desc,level.desc,updated_at.asc&limit=50');
    }
    res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=60');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ rows: rows.map((r) => ({ name: r.name || '—', animal: r.animal ?? null, wallet: r.wallet, value: Number(r.value) || 0, level: r.level })) }));
  } catch (err) {
    return send(res, err.status || 500, { error: err.status ? err.message : 'Server error' });
  }
}
