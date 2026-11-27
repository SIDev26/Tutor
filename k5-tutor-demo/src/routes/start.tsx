import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleEditor } from "@/components/schedule-editor";
import { ProfileGame } from "@/components/profile-game";
import { useDemo } from "@/components/demo-provider";
import { createLesson, type AvatarConfig } from "@/lib/lesson-data";
import { emptyProfile, type InterestProfile } from "@/lib/interest-content";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/start")({
  head: () => pageMeta("Set up your child’s math check", "Give consent, choose your child’s avatar and interests, set the daily time, and start the free K-5 Tutor diagnostic."),
  component: Start,
});

function Start() {
  const { state, update } = useDemo();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [consent, setConsent] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [grade, setGrade] = useState(state.grade);
  const [settings, setSettings] = useState(state.settings);
  const [profile, setProfile] = useState<InterestProfile>(() => ({ ...emptyProfile(), createdDay: state.today }));
  const [avatar, setAvatar] = useState<AvatarConfig>(state.avatars.Leo);
  const navigate = useNavigate();

  const title = step === 0 ? "Let’s find their next step." : step === 1 ? "How much time, and when?" : "Set up Leo’s profile.";
  const subtitle = step === 0 ? "Free 10-minute check · Math only · Grades 2–4" : step === 1 ? "We pre-filled sensible defaults. Change them any time in Settings." : "Choose what will make Leo’s lessons feel familiar. You can edit everything later in Settings.";

  function finishSetup(nextProfile: InterestProfile, nextAvatar: AvatarConfig) {
    update({
      consent: true,
      sharing,
      grade,
      settings,
      paused: false,
      mode: "child",
      diagnostic: [],
      childSetupComplete: true,
      minutesToday: 0,
      avatars: { ...state.avatars, Leo: nextAvatar },
      profiles: { ...state.profiles, Leo: nextProfile },
      interests: { ...state.interests, Leo: nextProfile.worlds },
      lesson: { ...createLesson(), interest: nextProfile.favorite ?? nextProfile.worlds[0] ?? "space" },
    });
    navigate({ to: "/diagnostic" });
  }

  return (
    <main className="flow-container signup-flow">
      <p className="eyebrow text-primary">Parent setup · Step {step + 1} of 3</p>
      <h1 className="page-title mt-3">{title}</h1>
      <p className="page-subtitle">{subtitle}</p>
      <div className="progress-track mt-6"><progress value={step + 1} max={3} /></div>
      {step === 0 ? (
        <form className="flow-card fade-in" onSubmit={(e) => { e.preventDefault(); if (consent) setStep(1); }}>
          <p className="text-xs text-muted-foreground mb-5">Fictional demo family. Please don’t enter real personal information.</p>
          <label className="field"><span>Parent email</span><input className="form-control" type="email" value="maria@example.com" readOnly /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="field"><span>Child’s first name</span><input className="form-control" value="Leo" readOnly /></label>
            <label className="field"><span>Grade</span><select className="form-control" value={grade} onChange={(e) => setGrade(Number(e.target.value))}><option value={2}>Grade 2</option><option value={3}>Grade 3</option><option value={4}>Grade 4</option></select></label>
          </div>
          <div className="bg-leaf-soft p-5 rounded-md text-sm leading-7 my-5">
            <p className="font-semibold flex gap-2 items-center"><ShieldCheck size={16} className="text-leaf" />In plain language</p>
            <p className="mt-2">We collect your child’s first name, grade, math answers, practice time, avatar, and an interest profile (favorite worlds, things they like inside them, and simple story preferences like “mission or quick challenge”), only to teach math at the right level and to set lesson stories. Categories only: no free text, photos, or names of real people or places. You choose the profile during parent setup and can edit or erase it any time. No open chat: your child never types to an AI. Hints never give the answer. Child data is not used to train models and is not sold. You can see everything and pause any time.</p>
          </div>
          <label className="flex gap-3 items-start text-sm mb-4">
            <input type="checkbox" className="mt-1 accent-primary" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>I am the parent or legal guardian and give consent for my child to use K-5 Tutor as described above.<small className="block text-muted-foreground mt-1">Required.</small></span>
          </label>
          <label className="flex gap-3 items-start text-sm">
            <input type="checkbox" className="mt-1 accent-primary" checked={sharing} onChange={(e) => setSharing(e.target.checked)} />
            <span>Allow optional third-party data sharing.<small className="block text-muted-foreground mt-1">Separate and optional. No sharing occurs in this demo.</small></span>
          </label>
          <Button type="submit" className="w-full mt-7" disabled={!consent}>Continue<ArrowRight /></Button>
        </form>
      ) : step === 1 ? (
        <div className="flow-card fade-in">
          <ScheduleEditor value={settings} onChange={setSettings} />
          <div className="flex justify-between items-center mt-8">
            <Button variant="ghost" type="button" onClick={() => setStep(0)}><ArrowLeft />Back</Button>
            <Button variant="hero" type="button" onClick={() => setStep(2)}>Continue to child profile<ArrowRight /></Button>
          </div>
        </div>
      ) : (
        <div className="flow-card fade-in mt-6">
          <ProfileGame child="Leo" initial={profile} avatar={avatar} onBack={() => setStep(1)} onDone={(nextProfile, nextAvatar) => {
            setProfile(nextProfile);
            setAvatar(nextAvatar);
            finishSetup(nextProfile, nextAvatar);
          }} />
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground mt-5 flex gap-2 items-center justify-center"><ShieldCheck size={13} />Demo data only. No real child information is collected.</p>
    </main>
  );
}


