// Shared helpers for the /api functions (Vercel). No npm packages: plain fetch + Node's crypto, so the site still
// deploys as plain files (vercel.json skips install/build). Files starting with "_" aren't routes on Vercel.
// Env (Vercel → Settings → Environment Variables, and .env.local here): PRIVY_APP_ID, PRIVY_APP_SECRET,
// SUPABASE_URL, SUPABASE_SECRET_KEY.
import { createPublicKey, verify } from 'node:crypto';

const env = (k) => {
  const v = process.env[k];
  if (!v) throw Object.assign(new Error(`Missing env ${k}`), { status: 500 });
  return v;
};

// ---- Privy: check the login token the page sends (ES256 JWT signed by Privy) ----
let jwks = null, jwksAt = 0;
async function privyKeys() {
  if (!jwks || Date.now() - jwksAt > 3600e3) {
    const r = await fetch(`https://auth.privy.io/api/v1/apps/${env('PRIVY_APP_ID')}/jwks.json`);
    if (!r.ok) throw Object.assign(new Error('Could not load Privy keys'), { status: 502 });
    jwks = (await r.json()).keys;
    jwksAt = Date.now();
  }
  return jwks;
}
const b64json = (s) => JSON.parse(Buffer.from(s, 'base64url').toString('utf8'));

// Returns the Privy user id (did:privy:…) of a valid token, or throws 401.
export async function verifyPrivy(req) {
  const fail = (why) => { throw Object.assign(new Error(why), { status: 401 }); };
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const parts = token.split('.');
  if (parts.length !== 3) fail('Not logged in');
  const [h, p, s] = parts;
  let header, payload;
  try { header = b64json(h); payload = b64json(p); } catch { fail('Bad token'); }
  if (header.alg !== 'ES256') fail('Bad token');
  const jwk = (await privyKeys()).find((k) => k.kid === header.kid);
  if (!jwk) fail('Unknown token key');
  const ok = verify('sha256', Buffer.from(`${h}.${p}`), { key: createPublicKey({ key: jwk, format: 'jwk' }), dsaEncoding: 'ieee-p1363' },
    Buffer.from(s, 'base64url'));
  const now = Math.floor(Date.now() / 1000);
  if (!ok) fail('Bad signature');
  if (payload.iss !== 'privy.io' || payload.aud !== env('PRIVY_APP_ID')) fail('Wrong app');
  if (!payload.exp || payload.exp < now) fail('Login expired');
  if (!payload.sub) fail('Bad token');
  return payload.sub;
}

// The user's Solana wallet address (from Privy, so it can't be faked by the page).
export async function privyWallet(userId) {
  const id = env('PRIVY_APP_ID');
  const r = await fetch(`https://auth.privy.io/api/v1/users/${encodeURIComponent(userId)}`, {
    headers: { 'privy-app-id': id, Authorization: 'Basic ' + Buffer.from(`${id}:${env('PRIVY_APP_SECRET')}`).toString('base64') },
  });
  if (!r.ok) return null;
  const u = await r.json();
  const w = (u.linked_accounts || []).find((a) => a.type === 'wallet' && a.chain_type === 'solana') ||
    (u.linked_accounts || []).find((a) => a.type === 'wallet');
  return w?.address || null;
}

// ---- Supabase (REST, secret key — the table is closed to the public key) ----
export async function db(path, { method = 'GET', body, prefer } = {}) {
  const key = env('SUPABASE_SECRET_KEY');
  const r = await fetch(`${env('SUPABASE_URL')}/rest/v1/${path}`, {
    method,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(prefer ? { Prefer: prefer } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  if (!r.ok) throw Object.assign(new Error(`Database error ${r.status}: ${text}`), { status: 502 });
  return text ? JSON.parse(text) : null;
}

export function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}
