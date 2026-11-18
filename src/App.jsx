import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { DEFAULT, MARQUEE, PRESETS, badgeSrc, fromHash, params } from './data.js';
import { SFX, beep, burst, isMuted, onNotify, setMuted, store, toast, unlock } from './fx.js';
import Builder from './Builder.jsx';
import Scan from './Scan.jsx';
import Readme from './Readme.jsx';
import Api from './Api.jsx';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export default function App() {
  const [S, setS] = useState(() => fromHash() || DEFAULT);
  const [icons, setIcons] = useState({});
  const [inv, setInv] = useState(() => store.get('inv', []));
  const [title, setTitle] = useState(() => store.get('title', ''));
  const [drawer, setDrawer] = useState(false);
  const [scanReq, setScanReq] = useState(null);
  const [muted, setMute] = useState(isMuted());
  const root = useRef();

  /* icons: fetch any slug we need to draw that isn't cached yet */
  const loading = useRef(new Set());
  const addIcons = useCallback((list) => setIcons((p) => ({ ...p, ...Object.fromEntries(list.map((i) => [i.slug, i])) })), []);
  const need = [S.icon, ...inv.map((b) => b.icon), ...MARQUEE.map((b) => b.icon), ...PRESETS.map(([, b]) => b.icon)];
  useEffect(() => {
    for (const slug of need) {
      if (!slug || icons[slug] || loading.current.has(slug)) continue;
      loading.current.add(slug);
      fetch('/api/icons?q=' + encodeURIComponent(slug)).then((r) => r.json()).then(addIcons).catch(() => {});
    }
  }, [need.join(), icons, addIcons]);
  const src = useCallback((s, o) => badgeSrc(icons, s, o), [icons]);

  useEffect(() => { history.replaceState(null, '', '#b=' + encodeURIComponent(params(S))); }, [S]);

  const load = (s) => { setS({ ...s }); document.getElementById('build').scrollIntoView(); };

  const addToReadme = (...badges) => {
    setInv((v) => [...v, ...badges.map((b) => ({ ...b }))]);
    beep(SFX.drop);
    burst('+' + badges.length);
    toast(badges.length > 1 ? `${badges.length} badges added` : 'Added to README');
    unlock('readme');
    if (inv.length + badges.length >= 5) unlock('five');
  };

  /* toast + queued achievements */
  const [note, setNote] = useState('');
  const [achQ, setAchQ] = useState([]);
  useEffect(() => {
    let t;
    onNotify((n) => {
      if (n.type === 'toast') { setNote(n.text); clearTimeout(t); t = setTimeout(() => setNote(''), 1400); }
      else setAchQ((q) => [...q, n.text]);
    });
  }, []);
  const achRef = useRef();
  useGSAP(() => {
    if (!achQ.length) return;
    gsap.timeline({ onComplete: () => setAchQ((q) => q.slice(1)) })
      .fromTo(achRef.current, { x: 420 }, { x: 0, duration: 0.3, ease: 'steps(4)' })
      .to(achRef.current, { x: 420, duration: 0.3, ease: 'steps(4)', delay: 2.2 });
  }, { dependencies: [achQ[0], achQ.length === 0] });

  /* sounds for every chip/button click */
  useEffect(() => {
    const h = (e) => {
      if (e.target.closest('.chip,.swatches button,.iconlist button,.tabs button,.sizes figure,.bgs button')) beep(SFX.select);
      else if (e.target.closest('.btn:not(.nosfx),.preset,.marquee img')) beep(SFX.click);
    };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  /* opening sequence + scroll reveals */
  useGSAP(() => {
    const mm = gsap.matchMedia();
    // boot lives outside #root (static HTML), so pass elements, not scoped selectors
    const boot = document.querySelector('.boot');
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const split = SplitText.create('.hero h1', { type: 'chars' });
      gsap.timeline()
        .to(boot.querySelector('.load i'), { width: '100%', duration: 0.9, ease: 'steps(10)' })
        .to(boot, { clipPath: 'inset(0 0 100% 0)', duration: 0.35, ease: 'steps(5)' })
        .set(boot, { display: 'none' })
        .from('nav', { yPercent: -100, duration: 0.3, ease: 'steps(4)' }, '<')
        .from('.hero .logo', { y: -180, opacity: 0, duration: 0.8, ease: 'bounce.out' }, '-=0.1')
        .from(split.chars, { y: 24, opacity: 0, duration: 0.2, ease: 'steps(3)', stagger: 0.03 }, '-=0.35')
        .from('.hero p, .quick, .or', { y: 18, opacity: 0, duration: 0.3, ease: 'steps(4)', stagger: 0.1 })
        .from('.marquee', { xPercent: -100, duration: 0.6, ease: 'steps(8)' }, '-=0.2')
        .add(() => gsap.to('.hero .logo', { y: -8, duration: 0.6, ease: 'steps(2)', repeat: -1, yoyo: true }));
      ScrollTrigger.batch('[data-reveal]', {
        once: true,
        onEnter: (els) => gsap.from(els, { y: 28, opacity: 0, duration: 0.4, ease: 'steps(4)', stagger: 0.07 }),
      });
      return () => split.revert();
    });
    mm.add('(prefers-reduced-motion: reduce)', () => gsap.set(boot, { display: 'none' }));
  }, { scope: root });

  const stars = useMemo(() => Array.from({ length: 40 }, () => ({
    left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', animationDelay: (Math.random() * 2.4).toFixed(1) + 's', opacity: 0.3 + Math.random() * 0.5,
  })), []);

  return (
    <div ref={root}>
      <div className="stars">{stars.map((st, i) => <i key={i} style={st} />)}</div>

      <nav><div className="wrap">
        <a className="brand" href="#"><img className="px" src="/logo.svg" alt="" />badger</a>
        <div className="links"><a href="#build">Builder</a><a href="#scan">GitHub scan</a><a href="#presets">Presets</a><a href="#api">API</a></div>
        <button className="snd" type="button" aria-label="Toggle sound" onClick={() => { setMuted(!muted); setMute(!muted); beep(SFX.select); }}>{muted ? 'SND OFF' : 'SND ON'}</button>
      </div></nav>

      <header className="hero wrap">
        <img className="logo px" src="/logo.svg" alt="Badger logo" />
        <h1>Badges with <em>bite.</em></h1>
        <p>Design README badges in any size and style, pick from 3,000+ brand icons, or scan a GitHub profile and turn the stats into live badges.<span className="blink">_</span></p>
        <form className="scanbar quick" onSubmit={(e) => { e.preventDefault(); const user = e.currentTarget.user.value.trim(); setScanReq({ user, at: Date.now() }); document.getElementById('scan').scrollIntoView(); }}>
          <div className="at"><input name="user" type="text" placeholder="your-username" required pattern="[A-Za-z0-9](?:[A-Za-z0-9\-]{0,38})" autoComplete="off" aria-label="GitHub username" /></div>
          <button className="btn primary" type="submit">▶ Press start</button>
        </form>
        <p className="or">or <a href="#build">build one from scratch</a> · <a href="#presets">browse presets</a></p>
        <div className="marquee"><div className="track">
          {[...MARQUEE, ...MARQUEE].map((s, i) => <img key={i} src={src(s, { size: 'md' })} alt="" onClick={() => load(s)} />)}
        </div></div>
      </header>

      <Builder S={S} setS={setS} icons={icons} addIcons={addIcons} src={src} onAdd={() => addToReadme(S)} />
      <Scan req={scanReq} onEdit={load} onAddAll={addToReadme} onScanned={(s) => setTitle((t) => t || `Hi, I'm ${s.login}`)} />

      <section id="presets"><div className="wrap">
        <div className="kicker" data-reveal>Stage 3 · Presets</div>
        <h2 data-reveal>Start from something good.</h2>
        <p className="sub">Click one to load it into the builder.</p>
        <div className="presets">
          {PRESETS.map(([n, s]) => (
            <button key={n} type="button" className="preset" data-reveal onClick={() => load(s)}><img src={src(s)} alt={`${n} badge`} /><span>{n}</span></button>
          ))}
        </div>
      </div></section>

      <Api />

      <footer><div className="wrap">
        <img src="/logo.svg" alt="" /> <b>badger</b> · Brand icons by <a href="https://simpleicons.org" target="_blank" rel="noopener">Simple Icons</a> (CC0). Not affiliated with GitHub.
      </div></footer>

      <div className={'toast' + (note ? ' show' : '')} role="status">{note}</div>
      <div className="ach" ref={achRef} role="status"><img src="/logo.svg" alt="" /><div><small>Achievement unlocked</small><b>{achQ[0]}</b></div></div>
      <Readme inv={inv} setInv={setInv} title={title} setTitle={setTitle} open={drawer} setOpen={setDrawer} src={src} />
    </div>
  );
}
