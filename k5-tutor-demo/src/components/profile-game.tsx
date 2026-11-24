import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InterestGuide } from "@/components/interest-guide";
import { AvatarPicker } from "@/components/avatar-picker";
import { interestOptions, type AvatarConfig, type InterestId } from "@/lib/lesson-data";
import { framingPairs, guideNameChoices, worldSubs, type InterestProfile } from "@/lib/interest-content";

type Step = "avatar" | "worlds" | "favorite" | "zoom" | "pairs" | "guide";
const steps: Step[] = ["avatar", "worlds", "favorite", "zoom", "pairs", "guide"];

/** Parent-led, tap-only child profile setup. No typing or child-facing profile controls. */
export function ProfileGame({ child, initial, avatar, onDone, onBack }: {
  child: string;
  initial: InterestProfile;
  avatar: AvatarConfig;
  onDone: (profile: InterestProfile, avatar: AvatarConfig) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState<InterestProfile>(initial);
  const [look, setLook] = useState(avatar);
  const [zoomIdx, setZoomIdx] = useState(0);
  const [pairIdx, setPairIdx] = useState(0);
  const cur = steps[step]!;
  const name = (w: InterestId) => interestOptions.find((o) => o.id === w)?.name ?? w;
  const zoomWorld = p.worlds[zoomIdx];
  const pair = framingPairs[pairIdx]!;
  const favorite = p.favorite ?? p.worlds[0] ?? "space";
  const guideNames = guideNameChoices[favorite] ?? [interestOptions.find((o) => o.id === favorite)?.guideName ?? "Sunny", "Sunny", "Bo", "Kip"];

  const prompt =
    cur === "avatar" ? `Choose an avatar for ${child}.` :
    cur === "worlds" ? `Pick up to three worlds ${child} loves.` :
    cur === "favorite" ? `Which one is ${child}’s favorite?` :
    cur === "zoom" ? `What does ${child} like in ${zoomWorld ? name(zoomWorld) : "it"}? Pick up to three.` :
    cur === "pairs" ? pair.question :
    `Pick a name for ${child}’s ${name(favorite)} guide.`;

  const next = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  const back = () => {
    if (cur === "avatar") { onBack(); return; }
    if (cur === "zoom" && zoomIdx > 0) { setZoomIdx((i) => i - 1); return; }
    if (cur === "pairs") {
      if (pairIdx > 0) { setPairIdx((i) => i - 1); return; }
      setZoomIdx(Math.max(0, p.worlds.length - 1));
    }
    if (cur === "guide") setPairIdx(framingPairs.length - 1);
    setStep((s) => Math.max(0, s - 1));
  };
  const toggleWorld = (w: InterestId) => {
    setZoomIdx(0);
    setP((x) => {
      const has = x.worlds.includes(w);
      if (!has && x.worlds.length >= 3) return x;
      const worlds = has ? x.worlds.filter((y) => y !== w) : [...x.worlds, w];
      return { ...x, worlds, favorite: worlds.includes(x.favorite as InterestId) ? x.favorite : null };
    });
  };
  const toggleSub = (w: InterestId, s: string) => setP((x) => {
    const current = x.subs[w] ?? [];
    const has = current.includes(s);
    if (!has && current.length >= 3) return x;
    return { ...x, subs: { ...x.subs, [w]: has ? current.filter((y) => y !== s) : [...current, s] } };
  });

  return (
    <section className="profile-setup" aria-live="polite">
      <div className="flex justify-between text-xs text-muted-foreground mb-3"><span>{child}’s profile · Parent setup</span><span>{step + 1} of {steps.length}</span></div>
      <div className="progress-track mb-6"><progress max={steps.length} value={step + 1} /></div>
      <h2 className="text-2xl font-bold text-center leading-snug">{prompt}</h2>

      {cur === "avatar" && <section className="panel mt-6"><AvatarPicker value={look} onChange={setLook} /></section>}

      {cur === "worlds" && (
        <div className="interest-tile-grid mt-6">
          {interestOptions.map((o) => (
            <Button key={o.id} variant="outline" className={`interest-tile ${p.worlds.includes(o.id) ? "selected" : ""}`} aria-pressed={p.worlds.includes(o.id)} onClick={() => toggleWorld(o.id)}>
              <InterestGuide interest={o.id} size={52} /><span><strong>{o.name}</strong></span>
            </Button>
          ))}
        </div>
      )}

      {cur === "favorite" && (
        <div className="interest-tile-grid mt-6">
          {p.worlds.map((w) => (
            <Button key={w} variant="outline" className={`interest-tile ${p.favorite === w ? "selected" : ""}`} aria-pressed={p.favorite === w} onClick={() => setP((x) => ({ ...x, favorite: w }))}>
              <InterestGuide interest={w} size={52} /><span><strong>{name(w)}</strong>{p.favorite === w && <small><Heart size={12} className="inline" /> Favorite</small>}</span>
            </Button>
          ))}
        </div>
      )}

      {cur === "zoom" && zoomWorld && (
        <div className="interest-tile-grid mt-6">
          {worldSubs[zoomWorld].map((s) => {
            const on = (p.subs[zoomWorld] ?? []).includes(s.id);
            return <Button key={s.id} variant="outline" className={`interest-tile ${on ? "selected" : ""}`} aria-pressed={on} onClick={() => toggleSub(zoomWorld, s.id)}><InterestGuide interest={zoomWorld} size={40} /><span><strong>{s.label}</strong></span></Button>;
          })}
        </div>
      )}

      {cur === "pairs" && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[pair.a, pair.b].map((o) => (
            <Button key={o.id} variant="outline" className={`this-or-that ${p.framing[pair.id] === o.id ? "selected" : ""}`} onClick={() => {
              setP((x) => ({ ...x, framing: { ...x.framing, [pair.id]: o.id } }));
              if (pairIdx < framingPairs.length - 1) setPairIdx((i) => i + 1); else next();
            }}>
              {o.id === pair.a.id ? <Star size={28} /> : <ArrowRight size={28} />}<span>{o.label}</span>
            </Button>
          ))}
        </div>
      )}

      {cur === "guide" && (
        <div className="mt-6 text-center">
          <div className="flex justify-center"><InterestGuide interest={favorite} size={110} /></div>
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            {guideNames.map((g) => <Button key={g} variant={p.guideName === g ? "default" : "outline"} className="min-h-12 min-w-24 text-lg" onClick={() => setP((x) => ({ ...x, guideName: g }))}>{g}</Button>)}
          </div>
        </div>
      )}

      <div className="flex gap-3 items-center mt-8">
        <Button variant="outline" onClick={back}><ArrowLeft />Back</Button>
        {cur === "zoom" ? (
          <Button variant="hero" className="start-button flex-1" onClick={() => { if (zoomIdx < p.worlds.length - 1) setZoomIdx((i) => i + 1); else { setPairIdx(0); next(); } }}>Next<ArrowRight /></Button>
        ) : cur === "guide" ? (
          <Button variant="hero" className="start-button flex-1" disabled={!p.guideName} onClick={() => onDone({ ...p, favorite }, look)}><Check />Save profile & start check</Button>
        ) : cur !== "pairs" && (
          <Button variant="hero" className="start-button flex-1" disabled={(cur === "worlds" && p.worlds.length === 0) || (cur === "favorite" && !p.favorite)} onClick={() => {
            if (cur === "worlds" && p.worlds.length === 1) { setP((x) => ({ ...x, favorite: x.worlds[0]! })); setZoomIdx(0); setStep((s) => s + 2); return; }
            if (cur === "favorite") setZoomIdx(0);
            next();
          }}>Next<ArrowRight /></Button>
        )}
      </div>
    </section>
  );
}


