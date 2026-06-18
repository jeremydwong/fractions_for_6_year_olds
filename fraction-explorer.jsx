import { useState, useEffect } from "react";
import Markdown from "./Markdown.jsx";
import { Prose } from "./shared-blocks.jsx";
import { colors as COLORS, fonts } from "./theme.js";

// Vite/CRA/Webpack all support `?raw` to import a file as a string
import ch0Md from "./content/ch0-intro.md?raw";
import ch1Md from "./content/ch1-weird-ones.md?raw";
import ch2Md from "./content/ch2-same-kinds.md?raw";
import ch3Md from "./content/ch3-magic-one.md?raw";
import ch4Md from "./content/ch4-now-we-can-add.md?raw";
import ch5Md from "./content/ch5-everywhere.md?raw";

// --- Split a .md file into # intro / # outro sections ----------------------
function splitMd(src) {
  const sections = { intro: "", outro: "" };
  const re = /^#\s+(\w+)\s*$/gim;
  const matches = [...src.matchAll(re)];
  if (matches.length === 0) {
    sections.intro = src.trim();
    return sections;
  }
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const name = m[1].toLowerCase();
    const start = m.index + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : src.length;
    sections[name] = src.slice(start, end).trim();
  }
  return sections;
}

const CONTENT = {
  0: splitMd(ch0Md),
  1: splitMd(ch1Md),
  2: splitMd(ch2Md),
  3: splitMd(ch3Md),
  4: splitMd(ch4Md),
  5: splitMd(ch5Md),
};

// --- little maths helpers --------------------------------------------------
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

// =============================================================================
// SHARED VISUAL PIECES
// =============================================================================

// A big stacked fraction:  top
//                          ───
//                          bottom
function Fraction({ top, bottom, color = COLORS.text, size = 30 }) {
  return (
    <span style={{
      display: "inline-flex", flexDirection: "column", alignItems: "center",
      verticalAlign: "middle", fontFamily: fonts.mono, fontWeight: 700,
      color, lineHeight: 1.05, margin: "0 4px",
    }}>
      <span style={{ fontSize: size }}>{top}</span>
      <span style={{
        width: "100%", minWidth: size * 0.9, height: 0,
        borderTop: `${Math.max(2, size / 14)}px solid ${color}`,
        margin: "2px 0",
      }} />
      <span style={{ fontSize: size }}>{bottom}</span>
    </span>
  );
}

// A pizza/pie: a circle cut into `n` equal slices, with some slices filled.
// `filled` may be an array of booleans (length n) OR a count `k`.
// If `onToggle` is given, slices are clickable.
function Pie({ n, filled, k, size = 150, color = COLORS.slice, onToggle }) {
  const r = size / 2 - 4;
  const cx = size / 2, cy = size / 2;
  const isFilled = (i) => (Array.isArray(filled) ? !!filled[i] : i < (k ?? 0));

  const wedge = (i) => {
    const step = (2 * Math.PI) / n;
    const start = -Math.PI / 2 + i * step;
    const end = start + step;
    const x0 = cx + r * Math.cos(start), y0 = cy + r * Math.sin(start);
    const x1 = cx + r * Math.cos(end), y1 = cy + r * Math.sin(end);
    const large = step > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ touchAction: "manipulation" }}>
      {n === 1 ? (
        <circle cx={cx} cy={cy} r={r}
          fill={isFilled(0) ? color : COLORS.surfaceLight}
          stroke={COLORS.text} strokeWidth={2}
          style={{ cursor: onToggle ? "pointer" : "default", transition: "fill 0.2s" }}
          onClick={onToggle ? () => onToggle(0) : undefined} />
      ) : (
        Array.from({ length: n }).map((_, i) => (
          <path key={i} d={wedge(i)}
            fill={isFilled(i) ? color : COLORS.surfaceLight}
            stroke={COLORS.text} strokeWidth={1.5}
            style={{ cursor: onToggle ? "pointer" : "default", transition: "fill 0.2s" }}
            onClick={onToggle ? () => onToggle(i) : undefined} />
        ))
      )}
    </svg>
  );
}

// A chocolate bar: a rectangle cut into `n` equal pieces, first `k` filled
// (or use a `filled` boolean array). Optional click-to-toggle.
function Bar({ n, k, filled, width = 280, height = 54, color = COLORS.slice, onToggle }) {
  const isFilled = (i) => (Array.isArray(filled) ? !!filled[i] : i < (k ?? 0));
  const pw = width / n;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ touchAction: "manipulation" }}>
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={i * pw} y={0} width={pw} height={height}
          fill={isFilled(i) ? color : COLORS.surfaceLight}
          stroke={COLORS.text} strokeWidth={1.5}
          style={{ cursor: onToggle ? "pointer" : "default", transition: "fill 0.2s" }}
          onClick={onToggle ? () => onToggle(i) : undefined} />
      ))}
    </svg>
  );
}

// A friendly row of choosable buttons.
function PickRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "8px 0" }}>
      {label && <span style={{ fontSize: 13, color: COLORS.muted, fontWeight: 600, minWidth: 64 }}>{label}</span>}
      {children}
    </div>
  );
}

function PickButton({ active, onClick, color = COLORS.cyan, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 14px", borderRadius: 10, cursor: "pointer",
      fontFamily: fonts.mono, fontWeight: 700, fontSize: 16,
      border: `2px solid ${active ? color : COLORS.border}`,
      background: active ? `${color}22` : COLORS.surfaceLight,
      color: active ? color : COLORS.text,
      transition: "all 0.15s",
    }}>{children}</button>
  );
}

// A card wrapper for every interactive widget.
function Widget({ kicker, children }) {
  return (
    <div style={{
      margin: "20px 0", padding: "18px 18px 22px",
      background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14,
    }}>
      {kicker && (
        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
          {kicker}
        </div>
      )}
      {children}
    </div>
  );
}

// =============================================================================
// CHAPTER 0 — Hi Emery! (the pizza cutter)
// =============================================================================
function PizzaCutter() {
  const [n, setN] = useState(4);
  const [filled, setFilled] = useState(() => Array(4).fill(false).map((_, i) => i < 3));

  const setPieces = (newN) => {
    setN(newN);
    setFilled(Array(newN).fill(false));
  };
  const toggle = (i) => setFilled((f) => f.map((v, idx) => (idx === i ? !v : v)));

  const k = filled.filter(Boolean).length;

  let message;
  if (k === 0) message = "Nothing coloured in yet — that's zero pieces! Tap the pizza to colour a slice.";
  else if (k === n && n > 1) message = "You coloured in EVERY slice — that's the whole pizza, which is 1 whole!";
  else if (n === 1 && k === 1) message = "One piece, and it's the whole thing! That's 1 whole.";
  else message = `You cut the pizza into ${n} fair pieces, and coloured ${k} of them.`;

  return (
    <Widget kicker="Try it — cut and colour a pizza">
      <Prose>
        First, choose how many <b>fair pieces</b> to cut the pizza into. Then <b>tap the slices</b> to colour them in. Watch the fraction at the bottom change!
      </Prose>

      <PickRow label="Cut into:">
        {[1, 2, 3, 4, 5, 6, 8].map((v) => (
          <PickButton key={v} active={n === v} onClick={() => setPieces(v)} color={COLORS.cyan}>{v}</PickButton>
        ))}
      </PickRow>

      <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", justifyContent: "center", margin: "10px 0" }}>
        <Pie n={n} filled={filled} size={190} onToggle={toggle} />
        <div style={{ textAlign: "center" }}>
          <Fraction top={k} bottom={n} color={COLORS.gold} size={56} />
          <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 8, fontFamily: fonts.mono }}>
            {k} out of {n}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 10, padding: "10px 14px", borderRadius: 10,
        background: `${COLORS.cyan}12`, border: `1px solid ${COLORS.cyan}33`,
        fontSize: 14, color: COLORS.text, lineHeight: 1.6,
      }}>
        {message}
      </div>
    </Widget>
  );
}

function Ch0() {
  return (
    <div>
      <Markdown src={CONTENT[0].intro} />
      <PizzaCutter />
      <Markdown src={CONTENT[0].outro} />
    </div>
  );
}

// =============================================================================
// CHAPTER 1 — Weirdly-Written 1s  (5 is 5/1)
// =============================================================================
function WeirdOnesDemo() {
  const [num, setNum] = useState(5);

  return (
    <Widget kicker="Try it — a number in its fraction costume">
      <PickRow label="Pick a number:">
        {[1, 2, 3, 4, 5, 6].map((v) => (
          <PickButton key={v} active={num === v} onClick={() => setNum(v)} color={COLORS.magenta}>{v}</PickButton>
        ))}
      </PickRow>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", margin: "16px 0 10px" }}>
        {Array.from({ length: num }).map((_, i) => (
          <Pie key={i} n={1} k={1} size={66} color={COLORS.slice} />
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 14, color: COLORS.muted, marginBottom: 16 }}>
        {num} whole {num === 1 ? "cookie" : "cookies"} — each one is <b>1 whole</b>.
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
        flexWrap: "wrap", padding: "14px", borderRadius: 12,
        background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`,
      }}>
        <span style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 44, color: COLORS.text }}>{num}</span>
        <span style={{ fontSize: 28, color: COLORS.muted }}>is the same as</span>
        <Fraction top={num} bottom={1} color={COLORS.magenta} size={42} />
      </div>
      <div style={{ textAlign: "center", fontSize: 14, color: COLORS.text, marginTop: 12, lineHeight: 1.6 }}>
        Cut into <b>1</b> piece (don't cut at all!), take <b>{num}</b> of those whole pieces. Same amount — fraction costume!
      </div>
    </Widget>
  );
}

function Ch1() {
  return (
    <div>
      <Markdown src={CONTENT[1].intro} />
      <WeirdOnesDemo />
      <Markdown src={CONTENT[1].outro} />
    </div>
  );
}

// =============================================================================
// CHAPTER 2 — Same Kinds Add Up
// =============================================================================
function SameKindsDemo() {
  const [nA, setNA] = useState(4), [kA, setKA] = useState(1);
  const [nB, setNB] = useState(4), [kB, setKB] = useState(2);

  const same = nA === nB;
  const KIND_NAMES = { 2: "halves", 3: "thirds", 4: "quarters", 6: "sixths" };

  const clampTop = (k, n) => Math.max(0, Math.min(n, k));

  const Picker = ({ n, setN, k, setK, color, who }) => (
    <div style={{ flex: "1 1 240px", minWidth: 220 }}>
      <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 700, marginBottom: 6 }}>{who}</div>
      <PickRow label="Kind:">
        {[2, 3, 4, 6].map((v) => (
          <PickButton key={v} active={n === v} onClick={() => { setN(v); setK((kk) => clampTop(kk, v)); }} color={color}>{v}</PickButton>
        ))}
      </PickRow>
      <Bar n={n} k={k} color={color} width={240} onToggle={(i) => setK(i + 1 === k ? i : i + 1)} />
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <Fraction top={k} bottom={n} color={color} size={30} />
        <div style={{ fontSize: 12, color: COLORS.muted }}>tap the bar to change the top number</div>
      </div>
    </div>
  );

  return (
    <Widget kicker="Try it — can we add these two?">
      <Prose>
        Pick a <b>kind</b> (the bottom number) for each chocolate bar, and tap a bar to choose how many pieces to take. Then look down below to see if we can add them!
      </Prose>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", margin: "10px 0 16px" }}>
        <Picker n={nA} setN={setNA} k={kA} setK={setKA} color={COLORS.cyan} who="First bar" />
        <Picker n={nB} setN={setNB} k={kB} setK={setKB} color={COLORS.magenta} who="Second bar" />
      </div>

      <div style={{
        padding: "14px 16px", borderRadius: 12,
        background: same ? `${COLORS.green}12` : `${COLORS.magenta}10`,
        border: `2px solid ${same ? COLORS.green : COLORS.magenta}44`,
      }}>
        {same ? (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.green, marginBottom: 8 }}>
              ✅ Same kind! Both are {KIND_NAMES[nA] || `${nA}ths`}. We can just add the tops:
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center", fontFamily: fonts.mono }}>
              <Fraction top={kA} bottom={nA} color={COLORS.cyan} size={28} />
              <span style={{ fontSize: 24, color: COLORS.muted }}>+</span>
              <Fraction top={kB} bottom={nB} color={COLORS.magenta} size={28} />
              <span style={{ fontSize: 24, color: COLORS.muted }}>=</span>
              <Fraction top={kA + kB} bottom={nA} color={COLORS.gold} size={32} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
              <Bar n={nA} k={Math.min(kA + kB, nA)} color={COLORS.gold} width={260} />
            </div>
            {kA + kB > nA && (
              <div style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", marginTop: 6 }}>
                (That's more than one whole bar — you'd need another bar to hold the extra. Still the same kind, though!)
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.magenta, marginBottom: 6 }}>
              ✋ Different kinds! One is {KIND_NAMES[nA] || `${nA}ths`}, the other is {KIND_NAMES[nB] || `${nB}ths`}.
            </div>
            <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>
              The pieces are different sizes — look how they don't line up. It's like adding apples and bananas! We <b>can't</b> just add the tops yet. We need a trick first... (that's the next page!)
            </div>
          </div>
        )}
      </div>
    </Widget>
  );
}

function Ch2() {
  return (
    <div>
      <Markdown src={CONTENT[2].intro} />
      <SameKindsDemo />
      <Markdown src={CONTENT[2].outro} />
    </div>
  );
}

// =============================================================================
// CHAPTER 3 — The Magic 1
// =============================================================================
function MagicOneDemo() {
  const BASES = [
    { a: 1, b: 2 }, { a: 1, b: 3 }, { a: 2, b: 3 }, { a: 1, b: 4 }, { a: 3, b: 4 },
  ];
  const [baseIdx, setBaseIdx] = useState(0);
  const [magic, setMagic] = useState(2);

  const base = BASES[baseIdx];
  const newTop = base.a * magic;
  const newBottom = base.b * magic;

  return (
    <Widget kicker="Try it — the magic 1 re-cuts a pizza">
      <PickRow label="Fraction:">
        {BASES.map((f, i) => (
          <PickButton key={i} active={baseIdx === i} onClick={() => setBaseIdx(i)} color={COLORS.cyan}>
            {f.a}/{f.b}
          </PickButton>
        ))}
      </PickRow>
      <PickRow label="Magic 1:">
        {[2, 3, 4].map((m) => (
          <PickButton key={m} active={magic === m} onClick={() => setMagic(m)} color={COLORS.purple}>
            {m}/{m}
          </PickButton>
        ))}
      </PickRow>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, flexWrap: "wrap", margin: "16px 0" }}>
        <div style={{ textAlign: "center" }}>
          <Pie n={base.b} k={base.a} size={150} color={COLORS.slice} />
          <div style={{ marginTop: 8 }}><Fraction top={base.a} bottom={base.b} color={COLORS.cyan} size={28} /></div>
        </div>
        <div style={{ fontSize: 30, color: COLORS.muted, textAlign: "center" }}>
          <div style={{ fontFamily: fonts.mono, fontWeight: 700 }}>→</div>
          <div style={{ fontSize: 13 }}>same amount!</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <Pie n={newBottom} k={newTop} size={150} color={COLORS.slice} />
          <div style={{ marginTop: 8 }}><Fraction top={newTop} bottom={newBottom} color={COLORS.gold} size={28} /></div>
        </div>
      </div>

      <div style={{
        padding: "14px 16px", borderRadius: 12, background: COLORS.surfaceLight,
        border: `1px solid ${COLORS.border}`, textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center", fontFamily: fonts.mono }}>
          <Fraction top={base.a} bottom={base.b} color={COLORS.cyan} size={26} />
          <span style={{ fontSize: 22, color: COLORS.muted }}>×</span>
          <Fraction top={magic} bottom={magic} color={COLORS.purple} size={26} />
          <span style={{ fontSize: 22, color: COLORS.muted }}>=</span>
          <Fraction top={`${base.a}×${magic}`} bottom={`${base.b}×${magic}`} color={COLORS.muted} size={20} />
          <span style={{ fontSize: 22, color: COLORS.muted }}>=</span>
          <Fraction top={newTop} bottom={newBottom} color={COLORS.gold} size={30} />
        </div>
        <div style={{ fontSize: 14, color: COLORS.text, marginTop: 12, lineHeight: 1.6 }}>
          We multiplied by <b style={{ color: COLORS.purple }}>{magic}/{magic}</b>, which is really just <b>1</b>. So the amount of pizza is <b>exactly the same</b> — we only cut it into more, smaller pieces!
        </div>
      </div>
    </Widget>
  );
}

function Ch3() {
  return (
    <div>
      <Markdown src={CONTENT[3].intro} />
      <MagicOneDemo />
      <Markdown src={CONTENT[3].outro} />
    </div>
  );
}

// =============================================================================
// CHAPTER 4 — Now We Can Add!
// =============================================================================
function AddItUpDemo() {
  const PROBLEMS = [
    { a: 1, b: 2, c: 1, d: 4 },
    { a: 1, b: 3, c: 1, d: 6 },
    { a: 1, b: 2, c: 1, d: 3 },
    { a: 1, b: 4, c: 1, d: 4 },
  ];
  const [pIdx, setPIdx] = useState(0);
  const [step, setStep] = useState(0);

  const p = PROBLEMS[pIdx];
  const L = lcm(p.b, p.d);
  const fA = L / p.b, fC = L / p.d;
  const topA = p.a * fA, topC = p.c * fC;
  const sum = topA + topC;
  const alreadySame = p.b === p.d;
  const maxStep = alreadySame ? 1 : 2;

  const pick = (i) => { setPIdx(i); setStep(0); };

  return (
    <Widget kicker="Try it — add two fractions, step by step">
      <PickRow label="Problem:">
        {PROBLEMS.map((q, i) => (
          <PickButton key={i} active={pIdx === i} onClick={() => pick(i)} color={COLORS.orange}>
            {q.a}/{q.b} + {q.c}/{q.d}
          </PickButton>
        ))}
      </PickRow>

      {/* The problem */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", margin: "16px 0" }}>
        <Fraction top={p.a} bottom={p.b} color={COLORS.cyan} size={34} />
        <span style={{ fontSize: 28, color: COLORS.muted }}>+</span>
        <Fraction top={p.c} bottom={p.d} color={COLORS.magenta} size={34} />
        {step >= maxStep && (
          <>
            <span style={{ fontSize: 28, color: COLORS.muted }}>=</span>
            <Fraction top={sum} bottom={L} color={COLORS.gold} size={38} />
          </>
        )}
      </div>

      {/* Step explanations */}
      <div style={{ minHeight: 120, padding: "14px 16px", borderRadius: 12, background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}` }}>
        {step === 0 && (
          <div style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.text }}>
            {alreadySame ? (
              <>The bottoms are <b>both {p.b}</b> — already the <b style={{ color: COLORS.green }}>same kind</b>! No magic needed. Press <b>Next step</b> to add the tops.</>
            ) : (
              <>Look at the bottoms: <b style={{ color: COLORS.cyan }}>{p.b}</b> and <b style={{ color: COLORS.magenta }}>{p.d}</b>. They're <b style={{ color: COLORS.magenta }}>different kinds</b>! Both can become <b style={{ color: COLORS.gold }}>{L}ths</b>. Press <b>Next step</b> to use a magic 1.</>
            )}
          </div>
        )}

        {step === 1 && !alreadySame && (
          <div style={{ fontSize: 14, lineHeight: 1.9, color: COLORS.text }}>
            <div style={{ marginBottom: 8 }}>Use a magic 1 to turn both into <b style={{ color: COLORS.gold }}>{L}ths</b>:</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Fraction top={p.a} bottom={p.b} color={COLORS.cyan} size={22} />
              <span style={{ color: COLORS.muted }}>×</span>
              <Fraction top={fA} bottom={fA} color={COLORS.purple} size={22} />
              <span style={{ color: COLORS.muted }}>=</span>
              <Fraction top={topA} bottom={L} color={COLORS.gold} size={24} />
              <span style={{ color: COLORS.muted, margin: "0 6px" }}>and</span>
              <Fraction top={p.c} bottom={p.d} color={COLORS.magenta} size={22} />
              <span style={{ color: COLORS.muted }}>×</span>
              <Fraction top={fC} bottom={fC} color={COLORS.purple} size={22} />
              <span style={{ color: COLORS.muted }}>=</span>
              <Fraction top={topC} bottom={L} color={COLORS.gold} size={24} />
            </div>
            <div style={{ marginTop: 8, color: COLORS.muted }}>Now both are the same kind! Press <b>Next step</b> to add.</div>
          </div>
        )}

        {step >= maxStep && (
          <div style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.text }}>
            <div style={{ marginBottom: 8 }}>Same kind now — just <b style={{ color: COLORS.green }}>add the tops</b> and keep the bottom:</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontFamily: fonts.mono }}>
              <Fraction top={topA} bottom={L} color={COLORS.cyan} size={24} />
              <span style={{ color: COLORS.muted }}>+</span>
              <Fraction top={topC} bottom={L} color={COLORS.magenta} size={24} />
              <span style={{ color: COLORS.muted }}>=</span>
              <Fraction top={`${topA}+${topC}`} bottom={L} color={COLORS.muted} size={18} />
              <span style={{ color: COLORS.muted }}>=</span>
              <Fraction top={sum} bottom={L} color={COLORS.gold} size={30} />
            </div>
            <div style={{ marginTop: 10, color: COLORS.green, fontWeight: 700 }}>🎉 Done! {p.a}/{p.b} + {p.c}/{p.d} = {sum}/{L}.</div>
          </div>
        )}
      </div>

      {/* Bars line-up */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", margin: "16px 0 4px" }}>
        <Bar n={step >= maxStep ? L : p.b} k={step >= maxStep ? topA : p.a} color={COLORS.cyan} width={300} height={40} />
        <Bar n={step >= maxStep ? L : p.d} k={step >= maxStep ? topC : p.c} color={COLORS.magenta} width={300} height={40} />
        {step >= maxStep && <Bar n={L} k={Math.min(sum, L)} color={COLORS.gold} width={300} height={40} />}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
          style={{ ...stepBtn, opacity: step === 0 ? 0.4 : 1 }}>← Back</button>
        <button onClick={() => setStep((s) => Math.min(maxStep, s + 1))} disabled={step >= maxStep}
          style={{ ...stepBtn, background: COLORS.orange, color: "#fff", borderColor: COLORS.orange, opacity: step >= maxStep ? 0.4 : 1 }}>
          Next step →
        </button>
        <button onClick={() => setStep(0)} style={stepBtn}>↺ Start over</button>
      </div>
    </Widget>
  );
}

// A gentle multiple-choice practice (same-kind adding).
function AddPractice() {
  const QS = [
    { a: 1, c: 2, n: 4, choices: [3, 2, 4] },
    { a: 2, c: 2, n: 6, choices: [5, 4, 6] },
    { a: 1, c: 1, n: 3, choices: [2, 3, 1] },
  ];
  const [picked, setPicked] = useState({});

  return (
    <Widget kicker="Your turn — these are the easy same-kind ones!">
      <Prose>Same bottoms, so just add the tops. Tap the answer you think is right.</Prose>
      {QS.map((q, qi) => {
        const answer = q.a + q.c;
        const chosen = picked[qi];
        return (
          <div key={qi} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", margin: "14px 0", paddingBottom: 10, borderBottom: qi < QS.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
            <Fraction top={q.a} bottom={q.n} color={COLORS.cyan} size={26} />
            <span style={{ fontSize: 22, color: COLORS.muted }}>+</span>
            <Fraction top={q.c} bottom={q.n} color={COLORS.magenta} size={26} />
            <span style={{ fontSize: 22, color: COLORS.muted }}>=</span>
            <div style={{ display: "flex", gap: 6 }}>
              {q.choices.map((ch) => {
                const isChosen = chosen === ch;
                const correct = ch === answer;
                let bg = COLORS.surfaceLight, bc = COLORS.border, col = COLORS.text;
                if (isChosen && correct) { bg = `${COLORS.green}22`; bc = COLORS.green; col = COLORS.green; }
                else if (isChosen && !correct) { bg = `${COLORS.magenta}18`; bc = COLORS.magenta; col = COLORS.magenta; }
                return (
                  <button key={ch} onClick={() => setPicked((pp) => ({ ...pp, [qi]: ch }))}
                    style={{ cursor: "pointer", border: `2px solid ${bc}`, background: bg, borderRadius: 10, padding: "4px 6px" }}>
                    <Fraction top={ch} bottom={q.n} color={col} size={22} />
                  </button>
                );
              })}
            </div>
            {chosen != null && (
              <span style={{ fontSize: 14, fontWeight: 700, color: chosen === answer ? COLORS.green : COLORS.gold }}>
                {chosen === answer ? "🎉 Yes!" : "Try again — add just the tops!"}
              </span>
            )}
          </div>
        );
      })}
    </Widget>
  );
}

function Ch4() {
  return (
    <div>
      <Markdown src={CONTENT[4].intro} />
      <AddItUpDemo />
      <AddPractice />
      <Markdown src={CONTENT[4].outro} />
    </div>
  );
}

// =============================================================================
// CHAPTER 5 — Fractions Are Everywhere (summary)
// =============================================================================
function Ch5() {
  return (
    <div>
      <Markdown src={CONTENT[5].intro} />
      <Markdown src={CONTENT[5].outro} />
    </div>
  );
}

// =============================================================================
// MAIN APP
// =============================================================================
const stepBtn = {
  padding: "8px 16px", borderRadius: 10, border: `1px solid ${COLORS.border}`,
  background: COLORS.surfaceLight, color: COLORS.text, fontFamily: "inherit",
  fontSize: 14, fontWeight: 700, cursor: "pointer",
};

const btnStyle = {
  padding: "10px 18px", borderRadius: 10, border: `1px solid ${COLORS.border}`,
  background: COLORS.surfaceLight, color: COLORS.text, fontFamily: "inherit",
  fontSize: 14, fontWeight: 700, cursor: "pointer",
};

const chapterData = [
  { num: 0, title: "Hi Emery!",            component: Ch0, color: COLORS.cyan },
  { num: 1, title: "Weirdly-Written 1s",   component: Ch1, color: COLORS.magenta },
  { num: 2, title: "Same Kinds Add Up",    component: Ch2, color: COLORS.green },
  { num: 3, title: "The Magic 1",          component: Ch3, color: COLORS.purple },
  { num: 4, title: "Now We Can Add!",      component: Ch4, color: COLORS.orange },
  { num: 5, title: "Fractions Everywhere", component: Ch5, color: COLORS.gold },
];

export default function FractionExplorer() {
  const [chapter, setChapter] = useState(0);
  const ch = chapterData[chapter];
  const Comp = ch.component;

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [chapter]);

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg, color: COLORS.text,
      fontFamily: "'Quicksand', 'Segoe UI', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Baloo+2:wght@500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button:hover { filter: brightness(1.05); }
        ::selection { background: ${COLORS.cyan}33; }
      `}</style>

      {/* Header */}
      <header style={{
        padding: "22px 24px 18px", borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
      }}>
        <h1 style={{
          fontSize: 26, fontWeight: 700, letterSpacing: -0.5, fontFamily: fonts.mono,
          background: `linear-gradient(135deg, ${COLORS.magenta}, ${COLORS.gold})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          🍕 Fractions for Emery
        </h1>
        <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>
          cutting, sharing, and adding — one slice at a time
        </div>
      </header>

      {/* Page nav */}
      <nav style={{
        display: "flex", gap: 0, overflowX: "auto", borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
      }}>
        {chapterData.map((c, i) => (
          <button key={i} onClick={() => setChapter(i)}
            style={{
              padding: "11px 15px", fontSize: 13, background: "transparent",
              border: "none", borderBottom: `3px solid ${i === chapter ? c.color : "transparent"}`,
              color: i === chapter ? c.color : COLORS.muted,
              cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
              fontWeight: i === chapter ? 700 : 500,
              transition: "all 0.15s",
            }}>
            {c.num}. {c.title}
          </button>
        ))}
      </nav>

      {/* Page content */}
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "24px 20px 48px" }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{
            fontSize: 11, color: ch.color, fontFamily: fonts.mono,
            textTransform: "uppercase", letterSpacing: 2, fontWeight: 700,
          }}>
            Page {ch.num}
          </span>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, marginTop: 2, fontFamily: fonts.mono }}>
            {ch.title}
          </h2>
        </div>
        <Comp />

        {/* Nav buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
          <button onClick={() => setChapter(Math.max(0, chapter - 1))} disabled={chapter === 0}
            style={{ ...btnStyle, opacity: chapter === 0 ? 0.3 : 1 }}>
            ← Previous
          </button>
          <button onClick={() => setChapter(Math.min(chapterData.length - 1, chapter + 1))} disabled={chapter === chapterData.length - 1}
            style={{ ...btnStyle, opacity: chapter === chapterData.length - 1 ? 0.3 : 1, background: ch.color + "22", borderColor: ch.color + "55", color: ch.color }}>
            Next →
          </button>
        </div>
      </main>
    </div>
  );
}
