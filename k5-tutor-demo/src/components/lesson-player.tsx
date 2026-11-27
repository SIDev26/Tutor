import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Captions, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/components/demo-provider";
import { SENTENCE_PAUSE_MS, SPEECH_PITCH, SPEECH_RATE, pickVoice, sentences } from "@/lib/voice";
import { FractionStripManipulative } from "@/components/fraction-manipulative";
import { GuideCorner, TeachFrame } from "@/components/teach-scene";
import { interestOptions, type InterestId } from "@/lib/lesson-data";
import { SCENE_TITLES, TOTAL_SECONDS, beatAt, beatStart, beats, recordedNarration, sceneEnd, sceneStart, teachThemes, type Choice } from "@/lib/teach-timeline";

const MAX_VOICE_WAIT = 6; // seconds a beat may stretch while waiting for the voice

function deviceVoice(preferred: string | null) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return pickVoice(window.speechSynthesis.getVoices(), preferred);
}

/** Narrated, animated Teach lesson driven by one scene timeline (seconds). */
export function LessonPlayer({ interest, preview = false, onComplete, overrides, onReplay }: { interest: InterestId; preview?: boolean; onComplete?: () => void; overrides?: { object: string; people: string; guide?: string | undefined } | null; onReplay?: () => void }) {
  const theme: "space" | "soccer" = interest === "soccer" ? "soccer" : "space";
  const { state } = useDemo();
  const words = { ...teachThemes[theme], ...(overrides ? { object: overrides.object, objects: `${overrides.object}s`, people: overrides.people, ...(overrides.guide ? { guide: overrides.guide } : {}) } : {}), child: state.child };
  const recorded = recordedNarration[theme];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const option = interestOptions.find((item) => item.id === theme) ?? interestOptions[0]!;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [choice, setChoice] = useState<Choice>(null);
  const [reduced, setReduced] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const hasVoice = !!recorded || !!voice;
  const spokenBeat = useRef(-1);
  const voiceDone = useRef(true);
  const waitStarted = useRef(0);
  const tRef = useRef(0);

  const { index, local } = beatAt(Math.min(Math.max(0, t - 0.0005), TOTAL_SECONDS - 0.0001));
  const beat = beats[index]!;
  const scene = beat.scene;
  const atSceneEnd = !playing && t >= sceneEnd(scene) - 0.001;
  const lessonDone = t >= TOTAL_SECONDS - 0.001;
  const waitingForChoice = !!beat.waitForChoice && choice === null && local >= beat.dur - 0.05;
  const useVoice = voiceOn && hasVoice;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    const check = () => setVoice(deviceVoice(state.voiceName));
    check();
    window.speechSynthesis?.addEventListener?.("voiceschanged", check);
    return () => { mq.removeEventListener("change", onChange); window.speechSynthesis?.removeEventListener?.("voiceschanged", check); stopVoice(); };
  }, [state.voiceName]);

  // Theme switch: same timeline, restart the lesson.
  useEffect(() => { stopVoice(); tRef.current = 0; setT(0); setPlaying(false); setChoice(null); spokenBeat.current = -1; }, [theme]);

  const speakBeat = useCallback((i: number) => {
    spokenBeat.current = i;
    waitStarted.current = 0;
    if (!useVoice) { voiceDone.current = true; return; }
    stopVoice();
    voiceDone.current = false;
    const done = () => { if (spokenBeat.current === i) voiceDone.current = true; };
    if (recorded?.[i]) {
      const a = new Audio(recorded[i]);
      audioRef.current = a;
      a.onended = done; a.onerror = done;
      void a.play().catch(done);
      return;
    }
    // One short sentence at a time, with a small pause between ideas.
    const parts = sentences(beats[i]!.text(words, choice));
    const sayNext = (n: number) => {
      if (spokenBeat.current !== i) return;
      if (n >= parts.length) return done();
      const u = new SpeechSynthesisUtterance(parts[n]!);
      if (voice) { u.voice = voice; u.lang = voice.lang; }
      u.rate = SPEECH_RATE; u.pitch = SPEECH_PITCH;
      u.onend = () => window.setTimeout(() => sayNext(n + 1), SENTENCE_PAUSE_MS);
      u.onerror = done;
      window.speechSynthesis.speak(u);
    };
    sayNext(0);
  }, [useVoice, words, choice, voice, recorded]);
  function stopVoice() { window.speechSynthesis?.cancel(); audioRef.current?.pause(); }

  // Start narration for each beat as the timeline enters it.
  useEffect(() => {
    if (playing && spokenBeat.current !== index) speakBeat(index);
  }, [playing, index, speakBeat]);

  // The clock. Motion is computed from t, so play, pause, replay and the progress bar stay in sync.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let alive = true;
    let last = performance.now();
    const tick = (now: number) => {
      if (!alive) return;
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      const cur = tRef.current;
      const { index: i } = beatAt(Math.min(cur, TOTAL_SECONDS - 0.0001));
      const end = beatStart(i + 1);
      const b = beats[i]!;
      let next = cur + dt;
      if (next >= end - 0.001) {
        const waitVoice = !voiceDone.current && spokenBeat.current === i;
        if (waitVoice && waitStarted.current === 0) waitStarted.current = now;
        const voiceTimedOut = waitStarted.current > 0 && now - waitStarted.current > MAX_VOICE_WAIT * 1000;
        if ((waitVoice && !voiceTimedOut) || (b.waitForChoice && choiceRef.current === null)) next = end - 0.002;
        else if (i === beats.length - 1 || beats[i + 1]!.scene !== b.scene) { tRef.current = end; setT(end); setPlaying(false); return; }
      }
      tRef.current = next;
      setT(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(raf); };
  }, [playing]);
  const choiceRef = useRef<Choice>(null);
  choiceRef.current = choice;

  function play() {
    if (lessonDone) { tRef.current = 0; setT(0); setChoice(null); }
    else if (atSceneEnd) { /* "Next" handles scene changes */ }
    else { tRef.current = beatStart(index) + 0.002; setT(tRef.current); } // resume from the start of the beat so voice and motion line up
    spokenBeat.current = -1;
    setPlaying(true);
  }
  function pause() { stopVoice(); setPlaying(false); }
  function goToScene(s: number) {
    stopVoice();
    if (s <= 6) setChoice((c) => (s < 6 ? c : null));
    tRef.current = sceneStart(s) + 0.002;
    setT(tRef.current);
    spokenBeat.current = -1;
    setPlaying(true);
  }
  function pick(c: Exclude<Choice, null>) { setChoice(c); }

  const talking = local < 1.2 && beats[index - 1]?.scene !== scene;
  const reacting = atSceneEnd;

  return (
    <section className="lesson-player" aria-label={`Narrated ${option.name} unit-fraction lesson`}>
      <div className="lesson-screen">
        <div className="lesson-screen-heading">
          <span className="eyebrow text-primary">Learn · Scene {scene + 1} of {SCENE_TITLES.length}</span>
          <span className="text-xs text-muted-foreground">{SCENE_TITLES[scene]}</span>
        </div>
        <div className="teach-stage-wrap">
          <TeachFrame index={index} local={playing || atSceneEnd || t > 0 ? local : 0} theme={theme} choice={choice} reduced={reduced} />
          <GuideCorner theme={theme} talking={talking || reacting} />
          {reacting && !lessonDone && <span className="teach-guide-bubble" aria-hidden>{scene === 0 ? "Let’s find out!" : "Nice watching."}</span>}
          {lessonDone && <span className="teach-guide-bubble" aria-hidden>You’ve got it!</span>}
          {beat.waitForChoice && (
            <div className="teach-choices" role="group" aria-label="Which is bigger?">
              {(["1/3", "1/6"] as const).map((c) => (
                <Button key={c} variant={choice === c ? "default" : "outline"} className="teach-choice" disabled={choice !== null} onClick={() => pick(c)}>{c}</Button>
              ))}
            </div>
          )}
          {!playing && t === 0 && <button type="button" className="teach-big-play" onClick={play} aria-label="Play lesson"><Play size={34} /></button>}
        </div>
        {captions && <p className="lesson-caption" aria-live="polite">{beat.text(words, choice)}</p>}
        {waitingForChoice && <p className="text-sm text-center font-semibold text-primary mt-2">Tap 1/3 or 1/6 to keep going.</p>}
      </div>
      <div className="lesson-controls">
        <Button variant="outline" size="icon" aria-label={playing ? "Pause lesson" : "Play lesson"} onClick={playing ? pause : play} disabled={atSceneEnd && !lessonDone}>
          {playing ? <Pause /> : <Play />}
        </Button>
        <div className="teach-progress" role="progressbar" aria-label="Lesson progress" aria-valuemin={0} aria-valuemax={Math.round(TOTAL_SECONDS)} aria-valuenow={Math.round(t)}>
          {SCENE_TITLES.map((title, s) => {
            const a = sceneStart(s), b = sceneEnd(s);
            const fill = Math.max(0, Math.min(1, (t - a) / (b - a)));
            return (
              <button type="button" key={title} className="teach-progress-seg" style={{ flexGrow: b - a }} onClick={() => goToScene(s)} aria-label={`Scene ${s + 1}: ${title}`}>
                <span style={{ width: `${fill * 100}%` }} />
              </button>
            );
          })}
        </div>
        <span className="lesson-time">{fmt(t)} / {fmt(TOTAL_SECONDS)}</span>
        <Button variant={captions ? "secondary" : "ghost"} size="icon" aria-label="Toggle captions" aria-pressed={captions} onClick={() => setCaptions((v) => !v)}><Captions /></Button>
        <Button variant={voiceOn ? "secondary" : "ghost"} size="icon" aria-label={voiceOn ? "Turn voice off" : "Turn voice on"} aria-pressed={voiceOn} onClick={() => { stopVoice(); voiceDone.current = true; setVoiceOn((v) => !v); }}>{voiceOn ? <Volume2 /> : <VolumeX />}</Button>
      </div>
      {!hasVoice && <p className="text-xs text-muted-foreground mt-2">No natural-sounding voice on this device, so captions carry the lesson.</p>}
      <div className="lesson-replay-options">
        <Button variant="outline" size="sm" onClick={() => { goToScene(scene); onReplay?.(); }}><RotateCcw />Replay this scene</Button>
        {atSceneEnd && !lessonDone && <Button size="sm" onClick={() => goToScene(scene + 1)}>Next<ArrowRight /></Button>}
      </div>
      {lessonDone && <FractionStripManipulative interest={interest} />}
      {preview ? (
        <p className="text-xs text-muted-foreground mt-4">Preview: the same narrated animation and captions your child sees.</p>
      ) : (
        <Button className="w-full mt-5" variant={lessonDone ? "default" : "outline"} onClick={onComplete}>{lessonDone ? "I watched it · Let’s try" : "Skip ahead · demo"}<ArrowRight /></Button>
      )}
    </section>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;


