import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/components/demo-provider";
import { SPEECH_PITCH, SPEECH_RATE, naturalVoices, pickVoice } from "@/lib/voice";

/** Lists only the natural-sounding voices found on this device. */
export function VoicePicker() {
  const { state, update } = useDemo();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);
  const list = naturalVoices(voices);
  const active = pickVoice(voices, state.voiceName);
  function sample() {
    if (!active) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`Hi ${state.child}! Let’s cut this energy bar into four equal parts. Which piece is bigger?`);
    u.voice = active; u.lang = active.lang; u.rate = SPEECH_RATE; u.pitch = SPEECH_PITCH;
    window.speechSynthesis.speak(u);
  }
  return (
    <section className="panel mb-6">
      <h2 className="text-xl font-bold flex gap-2 items-center"><Volume2 size={19} className="text-primary" />Lesson voice</h2>
      <p className="text-sm text-muted-foreground mt-2">Every lesson is animated and spoken aloud. We only use natural-sounding voices on this device.</p>
      {list.length ? (
        <div className="flex flex-wrap gap-3 items-center mt-4">
          <select className="form-control max-w-sm" aria-label="Lesson voice" value={active?.name ?? ""} onChange={(e) => update({ voiceName: e.target.value })}>
            {list.map((v) => <option key={v.name} value={v.name}>{v.name}</option>)}
          </select>
          <Button variant="outline" onClick={sample}><Volume2 />Play sample</Button>
        </div>
      ) : (
        <p className="text-sm mt-4 bg-blue-soft rounded-md p-3">No natural-sounding voice found on this device. Lessons play with captions instead of a robotic voice.</p>
      )}
    </section>
  );
}


