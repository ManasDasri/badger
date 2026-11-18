const STEPS = [
  ['Design', 'Pick a style, size, colors and icon in the builder, or start from a preset.'],
  ['Copy', <>Paste the Markdown into your <code>README.md</code>. GitHub renders the badge like any image.</>],
  ['Go live', <>Add <code>gh=you&amp;stat=stars</code> and the value updates from GitHub about every hour.</>],
];

const PARAMS = [
  ['label, value', 'Text for the left and right halves. Leave one empty for a single-part badge.'],
  ['style', 'pixel · flat · pill · glass · outline · square'],
  ['size', 'xs · sm · md · lg · xl · xxl, or a height in px (12–128)'],
  ['labelColor, color, color2', 'Hex without # (e.g. 3fb950) or a name: green, blue, red, orange, yellow, purple, pink, teal, mint, grey, black, white. color2 makes a gradient.'],
  ['icon, iconColor, iconPos', <>Any <a href="https://simpleicons.org" target="_blank" rel="noopener">Simple Icons</a> slug or a Badger icon (badger, star, flame, bolt, heart, rankup, trophy, crown, sparkle, code, check, commit). iconPos=value puts it on the right.</>],
  ['gh, stat', 'Live GitHub value. stat: stars · followers · repos · forks · gists · language · joined · rank'],
  ['labelText, valueText', 'Override the automatic text colors.'],
];

export default function Api() {
  return (
    <section id="api"><div className="wrap">
      <div className="kicker" data-reveal>Stage 4 · API</div>
      <h2 data-reveal>It's just a URL.</h2>
      <p className="sub">Every badge is an SVG served from <code>/api/badge</code>. Edit the query string by hand if you like.</p>
      <div className="how">
        {STEPS.map(([h, p], i) => <div className="card" data-reveal key={h}><span className="num">0{i + 1}</span><h3>{h}</h3><p>{p}</p></div>)}
      </div>
      <table className="params"><tbody>
        {PARAMS.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}
      </tbody></table>
    </div></section>
  );
}
