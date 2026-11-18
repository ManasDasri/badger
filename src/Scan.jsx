import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { STYLES } from '../lib/render.js';
import { STATS, badgeUrl, snippet } from './data.js';
import { SFX, beep, copy, unlock } from './fx.js';

const COLORS = { stars: 'e3b341', followers: 'db61a2', repos: '58a6ff', forks: 'a371f7', gists: '39c5bb', language: 'f78166', joined: '3fb950', rank: '7fb59b' };

export default function Scan({ req, onEdit, onAddAll, onScanned }) {
  const [user, setUser] = useState('');
  const [state, setState] = useState(null); // null | 'loading' | { error } | stats
  const [style, setStyle] = useState('pixel');
  const out = useRef();

  async function scan(u) {
    setUser(u);
    setState('loading');
    try {
      const r = await fetch('/api/stats?user=' + encodeURIComponent(u));
      const s = await r.json();
      if (!r.ok) throw new Error(s.error);
      beep(SFX.up);
      setState(s);
      unlock('scan');
      onScanned(s);
    } catch (e) {
      beep(SFX.err);
      setState({ error: e.message || 'network error' });
    }
  }
  useEffect(() => { if (req) scan(req.user); }, [req]);

  // profile + cards deal in like a hand of cards
  useGSAP(() => {
    if (!state?.login || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.timeline()
      .from('.profile', { x: -40, opacity: 0, duration: 0.3, ease: 'steps(4)' })
      .from('.xp .bar i.f', { opacity: 0, duration: 0.05, stagger: 0.06 }, '-=0.1')
      .from('.stat', { y: 30, opacity: 0, duration: 0.3, ease: 'steps(4)', stagger: 0.06 }, '<');
  }, { scope: out, dependencies: [state?.login] });

  const s = state?.login ? state : null;
  const items = s ? Object.keys(STATS).map((k) => ({ k, b: { gh: s.login, stat: k, color: COLORS[k], style, size: 'md' } })) : [];
  const raw = s && { stars: s.stars, followers: s.followers, repos: s.repos, forks: s.forks, gists: s.gists, language: s.language || 'n/a', joined: s.joined, rank: `Lv.${s.lv} ${s.title}` };

  return (
    <section id="scan"><div className="wrap" ref={out}>
      <div className="kicker" data-reveal>Stage 2 · GitHub scan</div>
      <h2 data-reveal>Turn your profile into badges.</h2>
      <p className="sub">Enter a username. Badger reads public GitHub data and gives you a live badge for each stat.</p>
      <form className="scanbar" onSubmit={(e) => { e.preventDefault(); scan(user.trim()); }}>
        <div className="at"><input type="text" placeholder="username" required pattern="[A-Za-z0-9](?:[A-Za-z0-9\-]{0,38})" autoComplete="off" value={user} onChange={(e) => setUser(e.target.value)} aria-label="GitHub username" /></div>
        <button className="btn primary" type="submit">Scan</button>
      </form>

      {state === 'loading' && <p className="note">Loading<span className="blink">...</span></p>}
      {state?.error && <p className="err">Couldn't scan “{user}”: {state.error}.</p>}
      {s && (
        <>
          <div className="profile">
            <img src={`https://github.com/${s.login}.png?size=128`} alt="" />
            <div>
              <h3>@{s.login}</h3>
              <p>{s.repos} public repos · joined {s.joined}</p>
              <div className="xp">LV.{s.lv} <span className="bar">{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < Math.round(s.lv / 10) ? 'f' : ''} />)}</span> {s.title.toUpperCase()}</div>
            </div>
          </div>
          <div className="field"><span className="lbl">Style for all</span>
            <div className="chips">{STYLES.map((x) => <button key={x} type="button" className={'chip' + (x === style ? ' on' : '')} onClick={() => setStyle(x)}>{x}</button>)}</div>
          </div>
          <div className="statgrid">
            {items.map(({ k, b }) => (
              <div className="stat" key={k}>
                <div className="k">{STATS[k]} <b>{raw[k]}</b></div>
                <div className="b"><img src={badgeUrl(b)} alt={STATS[k] + ' badge'} /></div>
                <div className="acts">
                  <button className="btn nosfx" type="button" onClick={() => copy(snippet(b, 'md'))}>Copy</button>
                  <button className="btn" type="button" onClick={() => onEdit(b)}>Customize</button>
                </div>
              </div>
            ))}
          </div>
          <div className="actions">
            <button className="btn primary nosfx" type="button" onClick={() => onAddAll(...items.map((x) => x.b))}>+ Add all to README</button>
            <button className="btn nosfx" type="button" onClick={() => copy(items.map((x) => snippet(x.b, 'md')).join(' '))}>Copy all as Markdown</button>
          </div>
          <p className="note">Badger rank is a made-up, just-for-fun score from stars, followers, repos, forks and account age. Stars and forks count your first 300 non-fork repos.</p>
        </>
      )}
    </div></section>
  );
}
