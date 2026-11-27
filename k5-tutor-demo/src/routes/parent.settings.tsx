import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Moon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ParentLayout, PageHeading } from "@/components/app-shell";
import { ScheduleEditor } from "@/components/schedule-editor";
import { AvatarBuilder } from "@/components/avatar-builder";
import { VoicePicker } from "@/components/voice-picker";
import { InterestProfileEditor } from "@/components/interest-profile-editor";
import { demoDayIndex, useDemo } from "@/components/demo-provider";
import { weekDayNames } from "@/lib/schedule";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/parent/settings")({
  head: () => pageMeta("Platform settings: time, interests, voice and privacy", "Set daily time and weekly time slots, edit each child’s interests, pause any time, choose narration, and manage platform privacy."),
  component: Settings,
});

const demoClocks = [
  { label: "Thursday 4:00 pm", today: 0, hour: 16 },
  { label: "Thursday 7:00 pm", today: 0, hour: 19 },
  { label: "Saturday 10:00 am", today: 2, hour: 10 },
];

function Settings() {
  const { state, update } = useDemo();
  return (
    <ParentLayout>
      <PageHeading title="Platform settings" subtitle="Time, child interests, narration, privacy, and pause controls for your family. Changes apply right away." />

      <section className="panel mb-6 pause-switch">
        <div>
          <h2 className="text-xl font-bold flex gap-2 items-center"><Moon size={19} className="text-primary" />Pause</h2>
          <p className="text-sm text-muted-foreground mt-1">Stops all child activity until you switch it back on.</p>
        </div>
        <Switch checked={state.paused} onCheckedChange={(paused) => update({ paused })} aria-label="Pause all child activity" />
      </section>

      <section className="panel mb-6" aria-labelledby="child-interests-heading">
        <h2 id="child-interests-heading" className="text-xl font-bold">{state.child}’s interests</h2>
        <p className="text-sm text-muted-foreground mt-1">Update the interests you chose during {state.child}’s setup. Switch children above to edit their own profile.</p>
        <InterestProfileEditor />
      </section>

      <section className="panel mb-6">
        <h2 className="text-xl font-bold mb-5">Time</h2>
        <ScheduleEditor value={state.settings} onChange={(settings) => update({ settings })} />
        <div className="bg-muted rounded-md p-4 mt-6 text-sm flex flex-wrap gap-3 items-center">
          <label htmlFor="clock" className="font-semibold">Demo clock</label>
          <select id="clock" className="form-control w-56" value={demoClocks.findIndex((c) => c.today === state.today && c.hour === state.hour)} onChange={(e) => { const c = demoClocks[Number(e.target.value)]; if (c) update({ today: c.today, hour: c.hour, minutesToday: 0 }); }}>
            {demoClocks.findIndex((c) => c.today === state.today && c.hour === state.hour) === -1 && <option value={-1}>{weekDayNames[demoDayIndex(state.today)]} {state.hour}:00 (now)</option>}
            {demoClocks.map((c, i) => <option key={c.label} value={i}>{c.label}</option>)}
          </select>
          <span className="text-xs text-muted-foreground">Demo only: see the child view inside and outside a time slot.</span>
        </div>
      </section>

      <VoicePicker />

      <section className="panel mb-6">
        <h2 className="text-xl font-bold">Your avatar <span className="text-sm font-normal text-muted-foreground">· optional</span></h2>
        <div className="mt-4"><AvatarBuilder value={state.parentAvatar} onChange={(parentAvatar) => update({ parentAvatar })} compact /></div>
      </section>

      <section className="panel">
        <h2 className="text-xl font-bold flex gap-2 items-center"><ShieldCheck size={19} className="text-leaf" />Privacy</h2>
        <ul className="text-sm leading-7 mt-3 list-disc pl-5">
          <li>Parental consent: {state.consent ? "given at sign-up" : "not given yet"}.</li>
          <li>No open chat. Your child never types free text to an AI.</li>
          <li>Hints guide and never give the answer. Math only, grades 2–4.</li>
          <li>Child data is not used to train models and is not sold.</li>
        </ul>
        <label className="flex gap-3 items-center text-sm mt-4">
          <Switch checked={state.sharing} onCheckedChange={(sharing) => update({ sharing })} aria-label="Optional third-party data sharing" />
          Optional third-party data sharing (off by default; no sharing happens in this demo)
        </label>
        <Button variant="link" className="px-0 mt-3" asChild><Link to="/parent/how-we-teach">How we teach<ArrowRight /></Link></Button>
      </section>
    </ParentLayout>
  );
}


