import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InterestGuide } from "@/components/interest-guide";
import { useDemo } from "@/components/demo-provider";
import { interestOptions, type InterestId } from "@/lib/lesson-data";
import { emptyProfile, framingPairs, guideNameChoices, isWorking, profileA, profileB, worldSubs, type InterestProfile } from "@/lib/interest-content";

/** Parent view of the child's interest profile: everything is visible, editable and erasable. */
export function InterestProfileEditor() {
  const { state, update } = useDemo();
  const child = state.child;
  const p = state.profiles[child];
  const set = (next: InterestProfile) => update({ profiles: { ...state.profiles, [child]: next }, interests: { ...state.interests, [child]: next.worlds } });
  const name = (w: InterestId) => interestOptions.find((o) => o.id === w)?.name ?? w;

  function toggleWorld(w: InterestId) {
    const has = p.worlds.includes(w);
    if (!has && p.worlds.length >= 3) { toast("Up to three worlds. Remove one first."); return; }
    const worlds = has ? p.worlds.filter((x) => x !== w) : [...p.worlds, w];
    set({ ...p, worlds, favorite: worlds.includes(p.favorite as InterestId) ? p.favorite : (worlds[0] ?? null) });
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap justify-between gap-3 items-start">
        <div>
          <h3 className="font-bold">Choose interests</h3>
          <p className="text-sm text-muted-foreground mt-1">You set this up for {child}, and you can change it any time. It changes stories and quantities, never the skill, difficulty or answers. Categories only, no free text.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { set({ ...emptyProfile(), createdDay: state.today }); toast("Interest profile erased. Lessons use plain problems until it is rebuilt."); }}><Trash2 />Erase interest profile</Button>
      </div>

      <div>
        <div className="flex justify-between items-center"><h4 className="font-semibold text-sm">Worlds (up to three)</h4><Button variant="ghost" size="sm" disabled={!p.worlds.length} onClick={() => set({ ...p, worlds: [], favorite: null, subs: {} })}>Clear</Button></div>
        <div className="interest-tile-grid mt-3">
          {interestOptions.map((o) => (
            <Button key={o.id} variant="outline" className={`interest-tile ${p.worlds.includes(o.id) ? "selected" : ""}`} aria-pressed={p.worlds.includes(o.id)} onClick={() => toggleWorld(o.id)}>
              <InterestGuide interest={o.id} size={44} /><span><strong>{o.name}</strong>{!isWorking(o.id) && <small>More worlds coming soon</small>}</span>
            </Button>
          ))}
        </div>
      </div>

      {p.worlds.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm">Favorite</h4>
          <div className="flex flex-wrap gap-2 mt-2">{p.worlds.map((w) => <Button key={w} size="sm" variant={p.favorite === w ? "default" : "outline"} onClick={() => set({ ...p, favorite: w })}>{name(w)}</Button>)}</div>
        </div>
      )}

      {p.worlds.map((w) => (
        <div key={w}>
          <div className="flex justify-between items-center"><h4 className="font-semibold text-sm">Inside {name(w)}</h4><Button variant="ghost" size="sm" disabled={!(p.subs[w] ?? []).length} onClick={() => set({ ...p, subs: { ...p.subs, [w]: [] } })}>Clear</Button></div>
          <div className="flex flex-wrap gap-2 mt-2">{worldSubs[w].map((s) => {
            const on = (p.subs[w] ?? []).includes(s.id);
            return <Button key={s.id} size="sm" variant={on ? "default" : "outline"} aria-pressed={on} onClick={() => set({ ...p, subs: { ...p.subs, [w]: on ? (p.subs[w] ?? []).filter((x) => x !== s.id) : [...(p.subs[w] ?? []), s.id].slice(-3) } })}>{s.label}</Button>;
          })}</div>
        </div>
      ))}

      <div>
        <div className="flex justify-between items-center"><h4 className="font-semibold text-sm">Story preferences</h4><Button variant="ghost" size="sm" disabled={!Object.keys(p.framing).length} onClick={() => set({ ...p, framing: {} })}>Clear</Button></div>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">{framingPairs.map((f) => (
          <div key={f.id} className="flex gap-2 items-center">
            {[f.a, f.b].map((o) => <Button key={o.id} size="sm" className="flex-1" variant={p.framing[f.id] === o.id ? "default" : "outline"} onClick={() => set({ ...p, framing: { ...p.framing, [f.id]: o.id } })}>{o.label}</Button>)}
          </div>
        ))}</div>
      </div>

      <div>
        <h4 className="font-semibold text-sm">Guide name</h4>
        <div className="flex flex-wrap gap-2 mt-2">{(guideNameChoices[p.favorite ?? "space"] ?? [interestOptions.find((o) => o.id === p.favorite)?.guideName ?? "Sunny", "Bo", "Kip"]).map((g) => <Button key={g} size="sm" variant={p.guideName === g ? "default" : "outline"} onClick={() => set({ ...p, guideName: g })}>{g}</Button>)}</div>
      </div>

      {child === "Leo" && (
        <div className="demo-note">
          <p className="text-xs font-bold uppercase tracking-wide">Interview demo · swap profile</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => set(profileA())}>Profile A: Soccer fan</Button>
            <Button size="sm" variant="outline" onClick={() => set(profileB())}>Profile B: Space, quick challenges</Button>
          </div>
        </div>
      )}
    </div>
  );
}


