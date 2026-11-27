import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChildGate } from "@/components/child-gate";
import { useDemo } from "@/components/demo-provider";
import { lessonWorld } from "@/lib/interest-content";
import { questions } from "@/lib/demo-data";
import { nextDiagnosticQuestion } from "@/lib/demo-rules";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/diagnostic")({
  head: () => pageMeta("A friendly math check", "After the parent finishes child setup, the child tries ten gentle math questions."),
  component: Diagnostic,
});

function Diagnostic() {
  const { state, update } = useDemo();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => { setLoading(false); setDone(true); }, 1100);
    return () => clearTimeout(id);
  }, [loading]);

  const gate = useChildGate();
  if (gate) return gate;

  if (!state.childSetupComplete) return (
    <main className="flow-container text-center">
      <UserRound size={48} className="mx-auto text-primary mb-6" />
      <h1 className="page-title">Your parent needs to finish setup.</h1>
      <p className="page-subtitle">They’ll choose your avatar and interests, then your math check will be ready.</p>
      <Button className="mt-7" asChild><Link to="/start">Open parent setup<ArrowRight /></Link></Button>
    </main>
  );

  if (loading) return (
    <main className="flow-container text-center"><Sparkles size={48} className="mx-auto text-primary mb-6" /><h1 className="page-title">Putting the pieces together…</h1><p className="page-subtitle">Finding a good place to start.</p></main>
  );

  if (done) return (
    <main className="flow-container text-center">
      <div className="bg-sunshine w-20 h-20 mx-auto rounded-full grid place-items-center mb-7"><Check size={42} /></div>
      <h1 className="page-title">You did it, Leo!</h1>
      <p className="page-subtitle">Thanks for giving each question a try.<br />Your first lesson is ready.</p>
      <Button variant="hero" className="mt-8 start-button" asChild><Link to="/child">Start<ArrowRight /></Link></Button>
    </main>
  );

  const q = questions[index];
  const easier = index === 6 ? nextDiagnosticQuestion(5, answers[5] ?? "") : undefined;
  if (!q) return null;
  return (
    <main className="flow-container">
      <div className="flex justify-between text-xs mb-3 text-muted-foreground"><span>{state.profiles.Leo.guideName ? `${state.profiles.Leo.guideName}’s warm-up` : "Leo’s math check"}{lessonWorld(state.profiles.Leo) ? ` · ${lessonWorld(state.profiles.Leo) === "soccer" ? "before kickoff" : "before launch"}` : ""}</span><span>Question {index + 1} of 10</span></div>
      <div className="progress-track"><progress value={index + 1} max={10} /></div>
      <div className="flow-card fade-in" key={index}>
        <span className="eyebrow text-primary">{q.domain}</span>
        <h1 className="text-3xl font-bold leading-snug mt-4">{easier || q.prompt}</h1>
        <div className="choice-grid">{q.options.map((option) => <Button key={option} variant="outline" className={`choice-button ${selected === option ? "selected" : ""}`} onClick={() => setSelected(option)}>{option}</Button>)}</div>
        <div className="flex gap-3">
          {index > 0 && <Button variant="outline" onClick={() => {
            setSelected(answers[index - 1] ?? "");
            setAnswers(answers.slice(0, index - 1));
            setIndex((current) => current - 1);
          }}><ArrowLeft />Back</Button>}
          <Button className="flex-1" disabled={!selected} onClick={() => {
            const next = [...answers.slice(0, index), selected];
            setAnswers(next);
            setSelected("");
            if (index === 9) { update({ diagnostic: next }); setLoading(true); } else setIndex((current) => current + 1);
          }}>{index === 9 ? "Finish" : "Next"}<ArrowRight /></Button>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-5">A little thinking is a good thing.</p>
    </main>
  );
}


