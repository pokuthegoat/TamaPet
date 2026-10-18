// "Connect wallet" button for the navbars (landing + /play): Privy, Solana wallets only (Phantom, Solflare, …).
// Built into /wallet.js with `npm run build:wallet` (the site itself stays plain static files).
// The page puts an empty <div id="wallet-slot"></div> in its navbar and loads config.js + wallet.js.
// Other scripts can listen for `tamapet:wallet` events (detail: { address } or { address: null }).
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

const APP_ID = window.TAMAPET_PRIVY_APP_ID;

const CSS = `
.wallet-btn{font:inherit; font-size:14px; font-weight:700; padding:9px 14px; border-radius:10px; border:0; cursor:pointer;
  background:#EFE3D3; color:#0B3986; display:flex; align-items:center; gap:8px; white-space:nowrap;}
.wallet-btn:disabled{opacity:.5; cursor:default;}
.wallet-btn.is-on{background:rgba(255,255,255,.1); color:#EFE3D3; font-weight:500;}
.wallet-btn.is-on::before{content:""; width:8px; height:8px; border-radius:50%; background:#6be38f;}
.wallet-wrap{position:relative;}
.wallet-menu{position:absolute; right:0; top:calc(100% + 8px); min-width:180px; padding:6px; border-radius:12px; z-index:30;
  background:rgba(11,40,100,.92); border:1px solid rgba(239,227,211,.16); backdrop-filter:blur(14px); box-shadow:0 14px 40px rgba(0,0,0,.3);}
.wallet-menu button{display:block; width:100%; text-align:left; font:inherit; font-size:14px; color:#EFE3D3; background:none; border:0;
  padding:9px 10px; border-radius:8px; cursor:pointer;}
.wallet-menu button:hover{background:rgba(255,255,255,.1);}
`;

const short = (a) => `${a.slice(0, 4)}…${a.slice(-4)}`;

function WalletButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrap = useRef(null);
  const address = authenticated ? user?.wallet?.address ?? null : null;

  // Tell the rest of the page who is connected (cloud save, leaderboard later).
  useEffect(() => {
    window.tamapetWallet = { address };
    window.dispatchEvent(new CustomEvent('tamapet:wallet', { detail: { address } }));
  }, [address]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!wrap.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  if (!address) {
    return <button className="wallet-btn" disabled={!ready} onClick={() => login()}>Connect wallet</button>;
  }
  return (
    <div className="wallet-wrap" ref={wrap}>
      <button className="wallet-btn is-on" onClick={() => setOpen(!open)} title={address}>{short(address)}</button>
      {open && (
        <div className="wallet-menu">
          <button onClick={() => { navigator.clipboard?.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1200); }}>
            {copied ? 'Copied!' : 'Copy address'}
          </button>
          <button onClick={() => { setOpen(false); logout(); }}>Disconnect</button>
        </div>
      )}
    </div>
  );
}

function mount() {
  const slot = document.getElementById('wallet-slot');
  if (!slot) return;
  if (!APP_ID) { console.warn('[TamaPet] No Privy App ID set in config.js — wallet button hidden.'); return; }
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  createRoot(slot).render(
    <PrivyProvider
      appId={APP_ID}
      config={{
        loginMethods: ['wallet'],
        appearance: { theme: 'dark', accentColor: '#EFE3D3', walletChainType: 'solana-only', walletList: ['phantom', 'solflare', 'backpack', 'detected_solana_wallets'] },
        externalWallets: { solana: { connectors: toSolanaWalletConnectors() } },
        embeddedWallets: { solana: { createOnLogin: 'off' }, ethereum: { createOnLogin: 'off' } },
      }}
    >
      <WalletButton />
    </PrivyProvider>,
  );
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
else mount();
