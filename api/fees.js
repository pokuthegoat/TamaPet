// /api/fees — public. Total creator fees the TamaPet coin has made, in SOL and USD, read straight from the Solana
// chain (no pump.fun website / API involved). Cached at the edge so the live counter can poll it cheaply.
//
// Where a pump.fun creator fee can be (pump-fun/pump-public-docs: PUMP_PROGRAM_README, SWEEP_FEES,
// PUMP_SWAP_CREATOR_FEE_README). Every lamport is in exactly one of these, so the sum is the total ever made:
//   1. waiting on the coin's bonding curve      BondingCurve.creator_fee     (new-style trades keep it there until a sweep)
//   2. waiting in the PumpSwap pool (graduated)  Pool.creator_fees
//   3. in the Pump creator vault                 PDA ["creator-vault", creator]            (SOL above its rent)
//   4. in the PumpSwap creator vault             WSOL ATA of PDA ["creator_vault", creator]
//   5. already claimed                           decreases of 3 / 4 in the creator's own transactions
// The vaults belong to the CREATOR, not the coin: if that wallet ever made other coins, their fees would count too.
// Before the coin exists every bucket is empty, so this simply returns 0 until launch.
import { createHash } from 'node:crypto';
import { send } from './_lib.js';

const MINT = process.env.FEES_MINT || '6t7XgUW2q2KcXFAUexPXCwLekXemczRdNx5RG2Tfpump';
const RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const PUMP = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
const PUMP_AMM = 'pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA';
const WSOL = 'So11111111111111111111111111111111111111112';
const TOKEN = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const ATA = 'ATokenGPvbdGVxXSZaWEhzojFAxmHn8wDLKc9oDwB7';
const VAULT_RENT = 890880; // lamports a 0-byte account must keep (rent-exempt minimum) — not a fee

// ---- base58 + program addresses (no npm packages: the site deploys as plain files) -----------------------------
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58decode(s) {
  let n = 0n;
  for (const c of s) { const i = B58.indexOf(c); if (i < 0) throw new Error('bad base58'); n = n * 58n + BigInt(i); }
  const out = [];
  while (n > 0n) { out.unshift(Number(n & 255n)); n >>= 8n; }
  for (const c of s) { if (c === '1') out.unshift(0); else break; }
  return Buffer.from(out);
}
function b58encode(buf) {
  let n = BigInt(`0x${Buffer.from(buf).toString('hex') || '0'}`), s = '';
  while (n > 0n) { s = B58[Number(n % 58n)] + s; n /= 58n; }
  for (const b of buf) { if (b === 0) s = `1${s}`; else break; }
  return s;
}
// is this 32-byte value a point on ed25519? (PDAs must NOT be)
const P = 2n ** 255n - 19n;
const D = ((-121665n * modpow(121666n, P - 2n)) % P + P) % P; // (BigInt % keeps the sign: normalise)
function modpow(b, e) { let r = 1n; b %= P; if (b < 0n) b += P; while (e > 0n) { if (e & 1n) r = (r * b) % P; b = (b * b) % P; e >>= 1n; } return r; }
function onCurve(bytes) {
  const b = Buffer.from(bytes); b[31] &= 0x7f;
  const y = BigInt(`0x${Buffer.from(b).reverse().toString('hex')}`) % P; // (Solana reduces a non-canonical y)
  const y2 = (y * y) % P, u = (y2 - 1n + P) % P, v = (D * y2 + 1n) % P;
  const x = (u * modpow(v, 3n) % P) * modpow(u * modpow(v, 7n), (P - 5n) / 8n) % P;
  const vx2 = (v * x % P) * x % P;
  return vx2 === u || vx2 === (P - u) % P;
}
export function pda(seeds, program) {
  for (let bump = 255; bump >= 0; bump--) {
    const h = createHash('sha256');
    seeds.forEach((s) => h.update(s));
    h.update(Buffer.from([bump])); h.update(b58decode(program)); h.update('ProgramDerivedAddress');
    const out = h.digest();
    if (!onCurve(out)) return b58encode(out);
  }
  throw new Error('no PDA');
}
const key = (a) => b58decode(a);

// ---- RPC -------------------------------------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function rpc(method, params) {
  let r;
  for (let attempt = 0; ; attempt++) { // the free public RPC rate-limits (429): back off and retry a few times
    r = await fetch(RPC, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
    if (r.status !== 429 || attempt === 3) break;
    await sleep(500 * 2 ** attempt);
  }
  if (!r.ok) throw Object.assign(new Error(`RPC ${r.status}`), { status: 502 });
  const j = await r.json();
  if (j.error) throw Object.assign(new Error(`RPC: ${j.error.message}`), { status: 502 });
  return j.result;
}
const accounts = async (keys) => (await rpc('getMultipleAccounts', [keys, { encoding: 'base64', commitment: 'confirmed' }])).value
  .map((a) => (a ? { lamports: a.lamports, data: Buffer.from(a.data[0], 'base64') } : null));
const u64 = (d, o) => (d && d.length >= o + 8 ? Number(d.readBigUInt64LE(o)) : 0); // missing trailing field = 0
const pubkeyAt = (d, o) => (d && d.length >= o + 32 ? b58encode(d.subarray(o, o + 32)) : null);

// Claims: money that left a vault. A claim is signed by the creator and touches the vault, so only transactions in
// BOTH address histories can be claims — those few are fetched in full (cheap on the free public RPC), and the
// vault's balance drop in each is what was claimed. (History lists come newest-first, 1000 per page.)
async function history(address, stopBefore = 0) {
  const sigs = [];
  for (let before; ;) {
    const page = await rpc('getSignaturesForAddress', [address, { limit: 1000, before, commitment: 'confirmed' }]);
    sigs.push(...page.filter((s) => !s.err));
    if (page.length < 1000 || (page[page.length - 1].blockTime || 0) < stopBefore) break;
    before = page[page.length - 1].signature;
  }
  return sigs;
}
const lastClaims = {}; // creator → claims total from the last successful scan
const claimCache = new Map(); // signature → lamports claimed in it (kept while the function instance is warm)
async function claimed(creator, vaults, vaultAccounts) {
  const mine = await history(creator);
  if (!mine.length) return 0;
  const since = Math.min(...mine.map((s) => s.blockTime || Infinity));
  const touched = new Set();
  for (const [name, acc] of Object.entries(vaultAccounts)) {
    if (!acc) continue; // a vault that doesn't exist has never paid anything out
    (await history(vaults[name], since)).forEach((s) => touched.add(s.signature));
  }
  let total = 0;
  for (const { signature: sig } of mine) {
    if (!touched.has(sig)) continue;
    if (!claimCache.has(sig)) {
      await sleep(120); // pace the lookups (public RPC)
      const tx = await rpc('getTransaction', [sig, { encoding: 'json', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }]);
      let out = 0;
      if (tx?.meta) {
        const m = tx.meta, la = m.loadedAddresses || { writable: [], readonly: [] };
        const keys = [...tx.transaction.message.accountKeys, ...la.writable, ...la.readonly];
        const i = keys.indexOf(vaults.pump); // SOL vault
        if (i >= 0) out += Math.max(0, m.preBalances[i] - m.postBalances[i]);
        const j = keys.indexOf(vaults.amm); // WSOL token vault
        if (j >= 0) {
          const amt = (list) => Number(list?.find((b) => b.accountIndex === j)?.uiTokenAmount.amount || 0);
          out += Math.max(0, amt(m.preTokenBalances) - amt(m.postTokenBalances));
        }
      }
      claimCache.set(sig, out);
    }
    total += claimCache.get(sig);
  }
  return total;
}

// SOL price in USD (Coinbase, CoinGecko as backup).
async function solPrice() {
  try {
    const r = await fetch('https://api.coinbase.com/v2/prices/SOL-USD/spot');
    const v = Number((await r.json())?.data?.amount);
    if (v > 0) return v;
  } catch { /* try the next one */ }
  const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
  const v = Number((await r.json())?.solana?.usd);
  if (!(v > 0)) throw Object.assign(new Error('No SOL price'), { status: 502 });
  return v;
}

export async function feeTotal(mint = MINT, { claims: withClaims = true } = {}) {
  const curve = pda([Buffer.from('bonding-curve'), key(mint)], PUMP);
  const poolAuth = pda([Buffer.from('pool-authority'), key(mint)], PUMP);
  const pool = pda([Buffer.from('pool'), Buffer.from([0, 0]), key(poolAuth), key(mint), key(WSOL)], PUMP_AMM);
  const [bc, pl] = await accounts([curve, pool]);
  if (!bc) return { launched: false, lamports: 0 };

  // BondingCurve: 8 discriminator, 5×u64, complete, creator @49, mayhem, cashback, quote_mint, creator_fee_bps,
  // can_edit, is_holder_reward, creator_fee @125
  const creator = pubkeyAt(bc.data, 49);
  const quote = pubkeyAt(bc.data, 83); // quote asset; Pubkey::default (all 1s) = SOL
  if (quote && quote !== '11111111111111111111111111111111' && quote !== WSOL) {
    throw Object.assign(new Error('Coin is not SOL-paired: fees are not in SOL'), { status: 500 });
  }
  const curveWaiting = u64(bc.data, 125);
  // Pool: 8, bump, index u16, creator, base, quote, lp, base_ta, quote_ta, lp_supply, coin_creator @211, mayhem, cashback,
  // virtual_quote_reserves i128, creator_fee_bps, can_edit, is_holder_reward, protocol_fees, creator_fees @279
  const poolWaiting = pl ? u64(pl.data, 279) : 0;

  const vaults = {
    pump: pda([Buffer.from('creator-vault'), key(creator)], PUMP),
    amm: pda([key(pda([Buffer.from('creator_vault'), key(creator)], PUMP_AMM)), key(TOKEN), key(WSOL)], ATA),
  };
  const [pv, av] = await accounts([vaults.pump, vaults.amm]);
  const inPumpVault = pv ? Math.max(0, pv.lamports - VAULT_RENT) : 0;
  const inAmmVault = av ? u64(av.data, 64) : 0; // token account: mint, owner, amount @64
  let claims = 0;
  if (withClaims) {
    try { claims = lastClaims[creator] = await claimed(creator, vaults, { pump: pv, amm: av }); }
    catch { claims = lastClaims[creator] || 0; } // rate-limited: keep the last known claims, never drop the total
  }

  const lamports = curveWaiting + poolWaiting + inPumpVault + inAmmVault + claims;
  return {
    launched: true, lamports, creator, graduated: Boolean(pl),
    parts: { curveWaiting, poolWaiting, inPumpVault, inAmmVault, claimed: claims },
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // public number (lets the local test server read it too)
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const [t, price] = await Promise.all([feeTotal(), solPrice()]);
    const sol = t.lamports / 1e9;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=45');
    return res.end(JSON.stringify({ ...t, sol, usd: Math.round(sol * price * 100) / 100, solPrice: price, mint: MINT }));
  } catch (err) {
    return send(res, err.status || 500, { error: err.status ? err.message : 'Server error' });
  }
}
