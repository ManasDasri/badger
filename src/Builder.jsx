import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SIZES, STYLES } from '../lib/render.js';
import { STATS, SWATCHES, altText, badgeUrl, snippet } from './data.js';
import { copy, unlock } from './fx.js';

const Chips = ({ value, options, onPick }) => (
  <div className="chips">
    {options.map(([v, l]) => <button key={v} type="button" className={'chip' + (value === v ? ' on' : '')} onClick={() => onPick(v)}>{l}</button>)}
  </div>
);

function Color({ label, k, S, set, placeholder }) {
  const v = S[k] || '';
  return (
    <div className="field"><span className="lbl">{label}</span>
      <div className="color">
        <input type="color" value={/^[0-9a-f]{6}$/i.test(v) ? '#' + v : '#000000'} onChange={(e) => set(k, e.target.value.slice(1))} aria-label={label} />
        <input type="text" value={v} placeholder={placeholder} onChange={(e) => set(k, e.target.value.trim().replace(/^#/, ''))} aria-label={label + ' hex'} />
      </div>
    </div>
  );
}

const iconFill = (i) => (['000000', '181717'].includes(i.hex.toLowerCase()) ? '#e6edf3' : '#' + i.hex);

export default function Builder({ S, setS, icons, addIcons, src, onAdd }) {
  const set = (k, v) => setS((s) => ({ ...s, [k]: v }));
  const [tab, setTab] = useState('md');
  const [bg, setBg] = useState('dark');
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  const tried = useRef(new Set());
  const preview = useRef();

  useEffect(() => {
    const t = setTimeout(() => fetch('/api/icons?q=' + encodeURIComponent(q)).then((r) => r.json()).then((l) => { addIcons(l); setList(l); }).catch(() => {}), 180);
    return () => clearTimeout(t);
  }, [q, addIcons]);

  // pixel "bump" when the look changes (not on every keystroke)
  useGSAP(() => {
    gsap.fromTo(preview.current, { scale: 1.07 }, { scale: 1, duration: 0.18, ease: 'steps(2)' });
  }, { dependencies: [S.style, S.size, S.color, S.color2, S.labelColor, S.icon, S.iconPos] });

  const pickStyle = (v) => {
    set('style', v);
    tried.current.add(v);
    if (tried.current.size === STYLES.length) unlock('styles');
  };

  const surprise = () => {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const words = [['vibes', 'immaculate'], ['bugs', 'zero*'], ['coffee', '∞ cups'], ['status', 'shipping'], ['mood', 'refactoring'], ['tests', 'probably'], ['powered by', 'snacks'], ['level', 'over 9000']];
    const [label, value] = pick(words);
    setS({
      label, value, style: pick(STYLES), size: pick(['md', 'lg', 'xl']), color: pick(SWATCHES.slice(0, 9)),
      color2: Math.random() < 0.35 ? pick(SWATCHES.slice(0, 9)) : '',
      icon: pick(['badger', 'star', 'flame', 'bolt', 'heart', 'rankup', 'trophy', 'crown', 'sparkle', 'rust', 'python', 'react', 'go', 'typescript', 'docker', 'linux', 'neovim', 'svelte']),
    });
  };

  const download = async () => {
    const blob = await (await fetch(badgeUrl(S))).blob();
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: (altText(S).replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'badge') + '.svg' });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const cur = icons[S.icon];
  const [dims, setDims] = useState('');
  // live GitHub badges hit the server: wait for typing to settle before fetching
  const [shown, setShown] = useState(S);
  useEffect(() => {
    const t = setTimeout(() => setShown(S), S.gh ? 400 : 0);
    return () => clearTimeout(t);
  }, [S]);

  return (
    <section id="build"><div className="wrap">
      <div className="kicker" data-reveal>Stage 1 · Builder</div>
      <h2 data-reveal>Make it yours.</h2>
      <p className="sub">Every change updates the badge instantly. Add it to your README collection when you're happy.</p>

      <div className="builder">
        <div className="card" data-reveal>
          <div className="row">
            <div className="field"><label htmlFor="f-label">Label</label><input id="f-label" type="text" value={S.label ?? ''} onChange={(e) => set('label', e.target.value)} /></div>
            <div className="field"><label htmlFor="f-value">Value</label><input id="f-value" type="text" value={S.value ?? ''} onChange={(e) => set('value', e.target.value)} /></div>
          </div>
          <div className="field"><span className="lbl">Style</span><Chips value={S.style || 'glass'} options={STYLES.map((s) => [s, s])} onPick={pickStyle} /></div>
          <div className="field"><span className="lbl">Size</span><Chips value={S.size || 'sm'} options={Object.keys(SIZES).map((s) => [s, s])} onPick={(v) => set('size', v)} /></div>
          <div className="row">
            <Color label="Label color" k="labelColor" S={S} set={set} placeholder="auto" />
            <Color label="Value color" k="color" S={S} set={set} />
          </div>
          <div className="swatches">
            {SWATCHES.map((c) => <button key={c} type="button" style={{ background: '#' + c }} title={'#' + c} aria-label={'Value color #' + c} onClick={() => set('color', c)} />)}
          </div>
          <label className="toggle"><input type="checkbox" checked={!!S.color2} onChange={(e) => set('color2', e.target.checked ? S.color2 || 'a371f7' : '')} /> Gradient value</label>
          {S.color2 ? <div style={{ marginTop: 10 }}><Color label="Gradient end" k="color2" S={S} set={set} /></div> : null}

          <div className="field" style={{ marginTop: 16 }}><label htmlFor="f-icon">Icon</label>
            <div className="iconpick">
              <input id="f-icon" type="search" placeholder="Search: react, star, rust, badger…" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
              {cur ? <svg className="current" viewBox="0 0 24 24"><path fill={iconFill(cur)} fillRule="evenodd" d={cur.path} /></svg> : null}
            </div>
            <div className="iconlist">
              <button type="button" title="No icon" className={!S.icon ? 'on' : ''} onClick={() => set('icon', '')} style={{ color: 'var(--mute)', fontSize: 18 }}>∅</button>
              {list.map((i) => (
                <button key={i.slug} type="button" title={i.title} className={S.icon === i.slug ? 'on' : ''} onClick={() => set('icon', i.slug)}>
                  <svg viewBox="0 0 24 24"><path fill={iconFill(i)} fillRule="evenodd" d={i.path} /></svg>
                </button>
              ))}
            </div>
          </div>
          <div className="row">
            <Color label="Icon color" k="iconColor" S={S} set={set} placeholder="brand" />
            <div className="field"><span className="lbl">Icon side</span><Chips value={S.iconPos || 'label'} options={[['label', 'Left'], ['value', 'Right']]} onPick={(v) => set('iconPos', v)} /></div>
          </div>

          <details className="gh" open={!!S.gh || undefined}>
            <summary><img className="px" src="/logo.svg" alt="" width="20" height="20" /> Live GitHub stat <span style={{ color: 'var(--mute)' }}>(optional)</span></summary>
            <div className="field"><label htmlFor="f-gh">Username</label><input id="f-gh" type="text" placeholder="torvalds" value={S.gh || ''} onChange={(e) => set('gh', e.target.value.trim())} /></div>
            <div className="field"><span className="lbl">Stat</span><Chips value={S.stat} options={Object.entries(STATS)} onPick={(v) => set('stat', v)} /></div>
            <p className="note" style={{ margin: 0 }}>When set, the value is pulled from GitHub and refreshes about hourly.</p>
          </details>
        </div>

        <div>
          <div className="stage" data-bg={bg}>
            <span className="zoom">{dims}</span>
            <div className="bgs">
              {[['dark', '#0d1117'], ['light', '#fff'], ['check', 'conic-gradient(#555 25%,#222 0 50%,#555 0 75%,#222 0)']].map(([b, c]) => (
                <button key={b} type="button" className={bg === b ? 'on' : ''} style={{ background: c }} aria-label={b + ' background'} onClick={() => setBg(b)} />
              ))}
            </div>
            <img ref={preview} className="main" src={src(shown)} alt="Badge preview" style={{ zoom: Math.max(1, Math.min(3, 120 / (SIZES[S.size] || 20))) }}
              onLoad={(e) => setDims(`${e.currentTarget.naturalWidth} × ${e.currentTarget.naturalHeight}px`)} />
          </div>
          <div className="sizes">
            {Object.keys(SIZES).map((k) => (
              <figure key={k} className={(S.size || 'sm') === k ? 'on' : ''} onClick={() => set('size', k)}>
                <img src={src(shown, { size: k })} alt="" /><figcaption>{k} · {SIZES[k]}px</figcaption>
              </figure>
            ))}
          </div>
          <div className="out">
            <div className="tabs">
              {[['md', 'Markdown'], ['html', 'HTML'], ['url', 'URL']].map(([t, l]) => <button key={t} type="button" className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{l}</button>)}
            </div>
            <div className="code"><span>{snippet(S, tab)}</span><button className="btn copy nosfx" type="button" onClick={() => copy(snippet(S, tab))}>Copy</button></div>
          </div>
          <div className="actions">
            <button className="btn primary" type="button" onClick={onAdd}>+ Add to README</button>
            <button className="btn nosfx" type="button" onClick={() => copy(location.href, 'Share link copied!')}>Share link</button>
            <button className="btn" type="button" onClick={download}>Download SVG</button>
            <button className="btn" type="button" onClick={surprise}>? Surprise me</button>
          </div>
        </div>
      </div>
    </div></section>
  );
}
