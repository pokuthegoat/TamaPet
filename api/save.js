// /api/save — the player's cloud save, tied to their Privy (wallet) login.
//   GET  → { data } (null if this wallet has no save yet)
//   POST { data, base } → stores it (whole save object from game.js), returns { ok, updatedAt }.
//     `base` = the updatedAt this save started from. If the cloud has a different (newer) version — another tab or
//     device saved meanwhile — nothing is written: 409 { error, data, updatedAt } so the page loads that instead.
import { verifyPrivy, privyWallet, db, send } from './_lib.js';

const MAX_BYTES = 64 * 1024; // a save is ~2 KB; anything far bigger isn't a real save

// Basic sanity checks so obviously broken / tampered saves are refused.
function check(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'No save data';
  if (JSON.stringify(data).length > MAX_BYTES) return 'Save too big';
  const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  if (!int(data.level ?? 1, 1, 100000)) return 'Bad level';
  if (!int(data.xp ?? 0, 0, 10000000)) return 'Bad XP';
  if (!int(data.tp ?? 0, 0, 100000000)) return 'Bad TamaPoints';
  if (!int(data.saved ?? 0, 0, 100000)) return 'Bad saved count';
  if (data.name != null && (typeof data.name !== 'string' || !/^[A-Z0-9]{0,8}$/.test(data.name))) return 'Bad name';
  if (data.animal == null) return 'No pet in this save'; // an empty game never replaces a real pet
  return null;
}

export default async function handler(req, res) {
  try {
    const userId = await verifyPrivy(req);
    if (req.method === 'GET') {
      const rows = await db(`saves?user_id=eq.${encodeURIComponent(userId)}&select=data,updated_at`);
      return send(res, 200, { data: rows[0]?.data ?? null, updatedAt: rows[0]?.updated_at ?? null });
    }
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
      const data = body?.data;
      const bad = check(data);
      if (bad) return send(res, 400, { error: bad });
      const current = (await db(`saves?user_id=eq.${encodeURIComponent(userId)}&select=data,updated_at`))[0];
      if (current && (!body.base || Date.parse(body.base) !== Date.parse(current.updated_at))) {
        return send(res, 409, { error: 'Newer save in the cloud', data: current.data, updatedAt: current.updated_at });
      }
      const wallet = await privyWallet(userId);
      const rows = await db('saves?on_conflict=user_id', {
        method: 'POST',
        prefer: 'resolution=merge-duplicates,return=representation',
        body: {
          user_id: userId, wallet, name: data.name || null, level: data.level ?? 1, saved: data.saved ?? 0,
          data, updated_at: new Date().toISOString(),
        },
      });
      return send(res, 200, { ok: true, updatedAt: rows?.[0]?.updated_at ?? null });
    }
    res.setHeader('Allow', 'GET, POST');
    return send(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    return send(res, err.status || 500, { error: err.status ? err.message : 'Server error' });
  }
}
