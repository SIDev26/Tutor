import { InterestGuide } from "@/components/interest-guide";
import { ACTION_SECONDS, STRIP, beats, teachThemes, easeInOut, pieceRect, sceneBeats, type Choice } from "@/lib/teach-timeline";

type Theme = "space" | "soccer";
export const VIEW = { w: 720, h: 380 } as const;
const BAR = { y: 196, h: 56 };
const SHELF = { y: 44, h: 32, slots: { 2: 120, 4: 380, 8: 520 } as Record<number, number> };
const ROWS = [118, 184, 250];
const ROW_H = 44;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const seg = (p: number, from: number, to: number) => easeInOut(clamp01((p - from) / (to - from)));

function Piece({ x, y, w, h, theme, shaded = true, glow = false, faint = false, opacity = 1 }: { x: number; y: number; w: number; h: number; theme: Theme; shaded?: boolean; glow?: boolean; faint?: boolean; opacity?: number }) {
  return (
    <g opacity={opacity} className={glow ? "teach-glow" : undefined}>
      <rect x={x} y={y} width={w} height={h} rx={theme === "soccer" ? Math.min(14, h / 2.5) : 6}
        className={shaded ? `teach-piece teach-${theme}` : "teach-piece-empty"} opacity={faint ? 0.35 : 1} />
      {shaded && theme === "space" && <rect x={x + 4} y={y + 5} width={Math.max(0, w - 8)} height={Math.max(2, h * 0.14)} rx="2" className="teach-sheen" />}
      {shaded && theme === "soccer" && <line x1={x + 3} x2={x + w - 3} y1={y + h * 0.22} y2={y + h * 0.22} className="teach-pith" />}
    </g>
  );
}

function Whole({ y, h, theme, opacity = 1 }: { y: number; h: number; theme: Theme; opacity?: number }) {
  return <Piece x={STRIP.x} y={y} w={STRIP.length} h={h} theme={theme} opacity={opacity} />;
}

function Cut({ x, y, h, p }: { x: number; y: number; h: number; p: number }) {
  if (p <= 0) return null;
  return <line x1={x} x2={x} y1={y - 8} y2={y - 8 + (h + 16) * p} className="teach-cut" />;
}

function Person({ x, y, theme, opacity }: { x: number; y: number; theme: Theme; opacity: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      {theme === "space" ? <>
        <path d="M-14 34 Q-14 14 0 14 Q14 14 14 34 Z" className="teach-person-body" />
        <circle cx="0" cy="0" r="13" className="teach-person-head" />
        <rect x="-8" y="-5" width="16" height="9" rx="4" className="teach-visor" />
      </> : <>
        <path d="M-15 34 L-12 14 L12 14 L15 34 Z" className="teach-person-body" />
        <circle cx="0" cy="2" r="11" className="teach-person-head" />
        <path d="M-11 -2 Q0 -14 11 -2" className="teach-visor-line" />
      </>}
    </g>
  );
}

function Fraction({ x, y, d, num = 1, reveal }: { x: number; y: number; d: number; num?: number; reveal: { n: number; line: number; d: number } }) {
  return (
    <g className="teach-fraction" aria-hidden>
      <clipPath id={`fn${x}${y}${d}`}><rect x={x - 20} y={y - 30} width="40" height={30 * reveal.n} /></clipPath>
      <clipPath id={`fd${x}${y}${d}`}><rect x={x - 20} y={y + 4} width="40" height={30 * reveal.d} /></clipPath>
      <text x={x} y={y - 6} textAnchor="middle" clipPath={`url(#fn${x}${y}${d})`}>{num}</text>
      {reveal.line > 0 && <line x1={x - 14} x2={x - 14 + 28 * reveal.line} y1={y} y2={y} className="teach-fraction-bar" />}
      <text x={x} y={y + 26} textAnchor="middle" clipPath={`url(#fd${x}${y}${d})`}>{d}</text>
    </g>
  );
}
const full = { n: 1, line: 1, d: 1 };

function Strip({ row, parts, theme, glowShaded = false, dim = false, countUpTo, hideShaded = false, outlineGlow = false }: { row: number; parts: number; theme: Theme; glowShaded?: boolean; dim?: boolean; countUpTo?: number | undefined; hideShaded?: boolean; outlineGlow?: boolean }) {
  const y = ROWS[row]!;
  return (
    <g opacity={dim ? 0.35 : 1}>
      {Array.from({ length: parts }, (_, i) => {
        const r = pieceRect(parts, i);
        const counted = countUpTo !== undefined && i < countUpTo;
        return (
          <g key={i}>
            {i === 0 ? (!hideShaded && <Piece x={r.x} y={y} w={r.w} h={ROW_H} theme={theme} glow={glowShaded} />) : <rect x={r.x} y={y} width={r.w} height={ROW_H} className={`teach-piece-empty ${counted ? "teach-counted" : ""}`} />}
            {i === 0 && counted && <rect x={r.x} y={y} width={r.w} height={ROW_H} className="teach-counted-outline" />}
            {counted && <text x={r.x + r.w / 2} y={y + ROW_H + 13} textAnchor="middle" className="teach-count">{i + 1}</text>}
          </g>
        );
      })}
      <rect x={STRIP.x} y={y} width={STRIP.length} height={ROW_H} className={outlineGlow ? "teach-strip-outline teach-pulse" : "teach-strip-outline"} />
    </g>
  );
}

/**
 * Renders the frame for beat `index` at `local` seconds into that beat.
 * Earlier beats in the scene are drawn finished; only the current beat's action moves.
 */
export function TeachFrame({ index, local, theme, choice, reduced }: { index: number; local: number; theme: Theme; choice: Choice; reduced: boolean }) {
  const beat = beats[index]!;
  const scene = beat.scene;
  const k = index - sceneBeats(scene)[0]!;
  const p = reduced ? 1 : easeInOut(clamp01(local / ACTION_SECONDS));
  const f = reduced ? 1 : clamp01(local / beat.dur);
  const at = (step: number) => (k > step ? 1 : k === step ? p : 0);
  const shelfPiece = (parts: number, glow = false) => <Piece key={`s${parts}`} x={SHELF.slots[parts]!} y={SHELF.y} w={STRIP.length / parts} h={SHELF.h} theme={theme} glow={glow} />;
  const shelfLine = <line key="shelf" x1={100} x2={620} y1={SHELF.y + SHELF.h + 3} y2={SHELF.y + SHELF.h + 3} className="teach-shelf" />;
  const out: React.ReactNode[] = [];

  if (scene === 0) {
    out.push(<Whole key="w" y={BAR.y} h={BAR.h} theme={theme} opacity={at(0)} />);
    const shown = k >= 3 ? 8 : k >= 2 ? 4 : k >= 1 ? 2 : 0;
    const prev = k === 3 ? 4 : k === 2 ? 2 : k === 1 ? 0 : shown;
    for (let i = 0; i < shown; i++) {
      const arriving = i >= prev;
      const pp = arriving ? p : 1;
      out.push(<Person key={i} x={165 + i * 56 + (1 - pp) * 160} y={290} theme={theme} opacity={pp} />);
    }
    if (k >= 4) out.push(<text key="q" x={360} y={130} textAnchor="middle" className="teach-question" opacity={p}>More or less?</text>);
  }

  if (scene === 1) {
    const apart = at(1) * 8;
    const lift = at(2) * 26;
    out.push(<Piece key="l" x={STRIP.x - apart} y={BAR.y - lift} w={240} h={BAR.h} theme={theme} glow={k === 2 || k === 3} />);
    out.push(<Piece key="r" x={STRIP.x + 240 + apart} y={BAR.y} w={240} h={BAR.h} theme={theme} />);
    if (k === 0) out.push(<Cut key="c" x={STRIP.x + 240} y={BAR.y} h={BAR.h} p={p} />);
    if (k >= 3) out.push(<text key="lab" x={STRIP.x + 120} y={BAR.y - lift - 14} textAnchor="middle" className="teach-label" opacity={p}>1 of 2 equal parts</text>);
  }

  if (scene === 2) {
    out.push(shelfLine);
    // k0: the lifted half travels to the shelf.
    const m0 = at(0);
    out.push(<Piece key="h" x={lerp(STRIP.x - 8, SHELF.slots[2]!, m0)} y={lerp(BAR.y - 26, SHELF.y, m0)} w={240} h={lerp(BAR.h, SHELF.h, m0)} theme={theme} glow={k === 0} />);
    if (k >= 2) out.push(shelfPiece(2, k === 5));
    // Bar: right half alone, then whole again.
    if (k === 0) out.push(<Piece key="r" x={STRIP.x + 248} y={BAR.y} w={240} h={BAR.h} theme={theme} />);
    const cuts = k >= 4 ? 8 : k >= 2 ? 4 : 0;
    if (k === 1) { out.push(<Piece key="r" x={lerp(STRIP.x + 248, STRIP.x + 240, p)} y={BAR.y} w={240} h={BAR.h} theme={theme} />); out.push(<Piece key="g" x={STRIP.x} y={BAR.y} w={240} h={BAR.h} theme={theme} opacity={p} />); }
    if (k >= 2) {
      const reform = k === 4 ? seg(p, 0, 0.45) : 1;
      const cutP = k === 2 ? p : k === 4 ? seg(p, 0.5, 1) : 1;
      const parts = k === 4 && reform < 1 ? 4 : cuts;
      const lifted = k >= 5 ? 8 : k >= 3 ? 4 : 0;
      // The bar's first piece is missing once it has gone to the shelf.
      const missingFirst = (k === 3) || (k >= 5);
      if (k === 4) {
        out.push(<Whole key="whole" y={BAR.y} h={BAR.h} theme={theme} />);
        if (reform < 1) out.push(<rect key="gap" x={STRIP.x} y={BAR.y} width={120} height={BAR.h} className="teach-gap" opacity={1 - reform} />);
        for (let i = 1; i < 8; i++) out.push(<Cut key={`c8${i}`} x={pieceRect(8, i).x} y={BAR.y} h={BAR.h} p={clamp01(cutP * 7 - (i - 1))} />);
      } else {
        for (let i = 0; i < parts; i++) {
          if (i === 0 && missingFirst) continue;
          const r = pieceRect(parts, i);
          out.push(<Piece key={`b${parts}${i}`} x={r.x} y={BAR.y} w={r.w} h={BAR.h} theme={theme} />);
        }
        if (k === 2) for (let i = 1; i < 4; i++) out.push(<Cut key={`c4${i}`} x={pieceRect(4, i).x} y={BAR.y} h={BAR.h} p={clamp01(cutP * 3 - (i - 1))} />);
      }
      if (lifted === 4 && k === 3) { const r = pieceRect(4, 0); out.push(<Piece key="m4" x={lerp(r.x, SHELF.slots[4]!, p)} y={lerp(BAR.y, SHELF.y, p)} w={r.w} h={lerp(BAR.h, SHELF.h, p)} theme={theme} glow />); }
      if (k >= 4) out.push(shelfPiece(4, k === 5));
      if (k === 5) { const r = pieceRect(8, 0); out.push(<Piece key="m8" x={lerp(r.x, SHELF.slots[8]!, p)} y={lerp(BAR.y, SHELF.y, p)} w={r.w} h={lerp(BAR.h, SHELF.h, p)} theme={theme} glow />); }
      void parts;
    }
  }

  if (scene === 3) {
    const partsFor = [2, 4, 8];
    out.push(shelfLine);
    partsFor.forEach((parts, row) => {
      const s = at(row);
      if (s === 0) { out.push(shelfPiece(parts)); return; }
      const move = k > row ? 1 : seg(p, 0, 0.6);
      const grow = k > row ? 1 : seg(p, 0.6, 1);
      const w = STRIP.length / parts;
      if (grow > 0) out.push(<g key={`st${row}`} opacity={grow}><Strip row={row} parts={parts} theme={theme} hideShaded outlineGlow={k === 3} /></g>);
      out.push(<Piece key={`mv${row}`} x={lerp(SHELF.slots[parts]!, STRIP.x, move)} y={lerp(SHELF.y, ROWS[row]!, move)} w={w} h={lerp(SHELF.h, ROW_H, move)} theme={theme} />);
    });
    if (k === 3) {
      out.push(<line key="e1" x1={STRIP.x} x2={STRIP.x} y1={ROWS[0]! - 14} y2={ROWS[2]! + ROW_H + 14} className="teach-edge" opacity={p} />);
      out.push(<line key="e2" x1={STRIP.x + STRIP.length} x2={STRIP.x + STRIP.length} y1={ROWS[0]! - 14} y2={ROWS[2]! + ROW_H + 14} className="teach-edge" opacity={p} />);
    }
  }

  if (scene === 4) {
    [2, 4, 8].forEach((parts, row) => {
      let count: number | undefined;
      let reveal = { n: 0, line: 0, d: 0 };
      if (k > row) reveal = full;
      if (k === row) {
        reveal = { n: seg(f, 0.02, 0.14), line: seg(f, 0.14, 0.2), d: seg(f, 0.22, 0.36) };
        // Pieces count up in time with "one, two, …" in the second half of the narration.
        count = reduced ? parts : Math.min(parts, Math.floor(clamp01((f - 0.42) / 0.5) * parts + (f > 0.42 ? 1 : 0)));
      }
      out.push(<Strip key={`s${row}`} row={row} parts={parts} theme={theme} countUpTo={count} />);
      out.push(<g key={`f${row}`} className={k === 3 ? "teach-pulse" : undefined}><Fraction x={650} y={ROWS[row]! + 22} d={parts} reveal={k >= 3 ? full : reveal} /></g>);
    });
  }

  if (scene === 5) {
    [2, 4, 8].forEach((parts, row) => {
      out.push(<Strip key={`s${row}`} row={row} parts={parts} theme={theme} dim={row === 0} glowShaded={k === 0 && row > 0} />);
      out.push(<Fraction key={`f${row}`} x={650} y={ROWS[row]! + 22} d={parts} reveal={full} />);
    });
    out.push(<text key="q" x={360} y={70} textAnchor="middle" className="teach-question">Which is bigger?</text>);
    const cmpY = [318, 348];
    const m1 = k > 1 ? 1 : k === 1 ? seg(p, 0, 0.5) : 0;
    const m2 = k > 1 ? 1 : k === 1 ? seg(p, 0.5, 1) : 0;
    if (k >= 1) {
      out.push(<line key="edge" x1={STRIP.x} x2={STRIP.x} y1={308} y2={376} className="teach-edge" />);
      out.push(<Piece key="c4" x={STRIP.x} y={lerp(ROWS[1]!, cmpY[0]!, m1)} w={120} h={lerp(ROW_H, 24, m1)} theme={theme} glow={k === 2} />);
      out.push(<Piece key="c8" x={STRIP.x} y={lerp(ROWS[2]!, cmpY[1]!, m2)} w={60} h={lerp(ROW_H, 24, m2)} theme={theme} />);
    }
    if (k >= 3) {
      const r = p;
      out.push(<g key="cmp" className="teach-fraction"><text x={330} y={350} textAnchor="end">1/4</text>
        <clipPath id="gtclip"><rect x={342} y={320} width={36 * r} height={40} /></clipPath>
        <text x={360} y={350} textAnchor="middle" clipPath="url(#gtclip)">&gt;</text>
        <text x={390} y={350} textAnchor="start" opacity={seg(r, 0.8, 1)}>1/8</text></g>);
    }
  }

  if (scene === 6) {
    const rows = [{ y: 132, parts: 3 }, { y: 214, parts: 6 }];
    rows.forEach(({ y, parts }, row) => {
      const cutP = k > 1 ? 1 : k === 1 ? seg(p, row === 0 ? 0 : 0.5, row === 0 ? 0.5 : 1) : 0;
      const liftP = k > 2 ? 1 : k === 2 ? seg(p, row === 0 ? 0 : 0.5, row === 0 ? 0.5 : 1) : 0;
      const cut = cutP >= 1;
      if (!cut) {
        out.push(<Whole key={`w${row}`} y={y} h={ROW_H} theme={theme} />);
        for (let i = 1; i < parts; i++) out.push(<Cut key={`c${row}${i}`} x={pieceRect(parts, i).x} y={y} h={ROW_H} p={clamp01(cutP * (parts - 1) - (i - 1))} />);
      } else {
        for (let i = 1; i < parts; i++) { const r = pieceRect(parts, i); out.push(<Piece key={`p${row}${i}`} x={r.x} y={y} w={r.w} h={ROW_H} theme={theme} />); }
        const r = pieceRect(parts, 0);
        const ty = 312 + row * 32;
        out.push(<Piece key={`m${row}`} x={r.x} y={lerp(y, ty, liftP)} w={r.w} h={lerp(ROW_H, 26, liftP)} theme={theme} glow={k === 3 && row === 0} />);
      }
      out.push(<Fraction key={`f${row}`} x={650} y={y + 22} d={parts} reveal={full} />);
    });
    if (k >= 2) out.push(<line key="edge" x1={STRIP.x} x2={STRIP.x} y1={304} y2={376} className="teach-edge" />);
    if (k >= 3) out.push(<text key="ans" x={420} y={350} className="teach-fraction-inline" opacity={p}>1/3 &gt; 1/6</text>);
    if (k === 0 && choice) out.push(<text key="guess" x={360} y={80} textAnchor="middle" className="teach-label">You picked {choice}</text>);
  }

  if (scene === 7) {
    const pp = reduced ? 1 : k > 0 ? 1 : clamp01(local / 2.4);
    [2, 4, 8].forEach((parts, row) => {
      const m = easeInOut(clamp01(pp * 3 - row));
      out.push(<Piece key={`r${parts}`} x={lerp(SHELF.slots[parts]!, STRIP.x, m)} y={lerp(SHELF.y, ROWS[row]!, m)} w={STRIP.length / parts} h={lerp(SHELF.h, ROW_H, m)} theme={theme} glow={k === 0 && m > 0 && m < 1} />);
      if (m >= 1) out.push(<Fraction key={`f${parts}`} x={STRIP.x + STRIP.length / parts + 40} y={ROWS[row]! + 22} d={parts} reveal={full} />);
    });
    if (k >= 1) out.push(<text key="rule" x={360} y={340} textAnchor="middle" className="teach-rule" opacity={p}>More equal pieces → each piece is smaller</text>);
  }

  return (
    <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className={`teach-stage teach-theme-${theme}`} role="img" aria-label={beat.text(teachThemes[theme], choice)}>
      {out}
    </svg>
  );
}

export function GuideCorner({ theme, talking }: { theme: Theme; talking: boolean }) {
  return <div className={`teach-guide ${talking ? "is-talking" : ""}`}><InterestGuide interest={theme} size={56} /></div>;
}

/**
 * The scene-6 line-up as a short replay: one unit piece of each whole slides out and lines up at the same edge.
 * `showSign` adds the comparison sign; hints leave it off so the child still decides.
 */
export function LineUp({ a, b, theme, showSign = false }: { a: number; b: number; theme: Theme; showSign?: boolean }) {
  const L = 300, x0 = 20;
  const wa = L / a, wb = L / b;
  return (
    <svg viewBox="0 0 440 150" className="lineup-svg" role="img" aria-label={`One piece of ${a} equal parts and one piece of ${b} equal parts lined up at the same starting edge`}>
      {[{ parts: a, y: 12 }, { parts: b, y: 62 }].map(({ parts, y }) => (
        <g key={y}>
          {Array.from({ length: parts }, (_, i) => <rect key={i} x={x0 + (i * L) / parts} y={y} width={L / parts} height="26" className="teach-piece-empty" />)}
          <rect x={x0} y={y} width={L} height="26" className="teach-strip-outline" />
          <text x={x0 + L + 18} y={y + 19} className="lineup-label">1/{parts}</text>
        </g>
      ))}
      <line x1={x0} x2={x0} y1="104" y2="146" className="teach-edge" />
      <rect x={x0} y="12" width={wa} height="26" rx="5" className={`teach-piece teach-${theme} lineup-a`} />
      <rect x={x0} y="62" width={wb} height="26" rx="5" className={`teach-piece teach-${theme} lineup-b`} />
      {showSign && <text x={x0 + Math.max(wa, wb) + 20} y="135" className="lineup-label lineup-sign">1/{Math.min(a, b)} &gt; 1/{Math.max(a, b)}</text>}
    </svg>
  );
}


