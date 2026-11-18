import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { altText, snippet } from './data.js';
import { SFX, beep, copy, store } from './fx.js';

export default function Readme({ inv, setInv, title, setTitle, open, setOpen, src }) {
  const [align, setAlign] = useState(() => store.get('align', 'center'));
  const dock = useRef();

  useEffect(() => { store.set('inv', inv); store.set('title', title); store.set('align', align); }, [inv, title, align]);
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [setOpen]);

  // dock hops whenever the count changes
  useGSAP(() => {
    if (inv.length) gsap.fromTo(dock.current, { y: -14 }, { y: 0, duration: 0.35, ease: 'bounce.out' });
  }, { dependencies: [inv.length] });

  const center = align === 'center';
  const imgs = inv.map((b) => snippet(b, center ? 'html' : 'md'));
  const body = center ? `<p align="center">\n  ${imgs.join('\n  ')}\n</p>` : imgs.join(' ');
  const md = (title.trim() ? `# ${title.trim()}\n\n` : '') + (inv.length ? body : '');

  return (
    <>
      {inv.length > 0 && <button ref={dock} className="btn yellow dock" type="button" onClick={() => setOpen(true)}>README <b>{inv.length}</b></button>}
      <div className={'scrim' + (open ? ' open' : '')} onClick={() => setOpen(false)} />
      <aside className={'drawer' + (open ? ' open' : '')} aria-label="Your README" aria-hidden={!open}>
        <header><h3>Your README</h3><button className="btn" type="button" aria-label="Close" onClick={() => setOpen(false)}>X</button></header>
        <div className="field"><label htmlFor="rtitle">Heading</label><input id="rtitle" type="text" placeholder="Hi, I'm …" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="field"><span className="lbl">Align</span>
          <div className="chips">{[['center', 'Center'], ['left', 'Left']].map(([a, l]) => <button key={a} type="button" className={'chip' + (align === a ? ' on' : '')} onClick={() => setAlign(a)}>{l}</button>)}</div>
        </div>
        <div className="readme">
          <div className="file">README.md</div>
          <h1>{title || "Hi, I'm …"}</h1>
          <div className={'row ' + align}>
            {inv.length
              ? inv.map((b, i) => <img key={i} src={src(b)} alt={altText(b)} title="Click to remove" onClick={() => { beep(SFX.err); setInv((v) => v.filter((_, j) => j !== i)); }} />)
              : <span className="empty">No badges yet. Add some from the builder or a scan.</span>}
          </div>
        </div>
        <p className="note" style={{ margin: '0 0 14px' }}>Click a badge to remove it.</p>
        <div className="code"><span>{md}</span><button className="btn copy nosfx" type="button" onClick={() => copy(md, 'README copied!')}>Copy</button></div>
        <div className="actions"><button className="btn" type="button" onClick={() => setInv([])}>Clear all</button></div>
      </aside>
    </>
  );
}
