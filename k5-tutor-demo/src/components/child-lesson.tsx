import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarClock, Check, Lightbulb, PartyPopper, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import { InterestGuide } from "@/components/interest-guide";
import { LessonPlayer } from "@/components/lesson-player";
import { LineUp } from "@/components/teach-scene";
import { LessonProgress } from "@/components/lesson-progress";
import { FractionStripManipulative } from "@/components/fraction-manipulative";
import { VocabularyCards } from "@/components/vocabulary-cards";
import { demoDateLabel, demoDayIndex, useDemo } from "@/components/demo-provider";
import { SeeYouTomorrow, useChildGate } from "@/components/child-gate";
import { canStartStep, stepMinutes, timeWindows, weekDays, type Slots } from "@/lib/schedule";
import { checkNeedsCoaching, hints } from "@/lib/demo-rules";
import {
  FULL_LESSON_TITLE,
  interestOptions,
  type LessonProblem,
} from "@/lib/lesson-data";
import { lessonContent, lessonWorld, lessonWrapper, storyFor, teachWordsFor, worldSubs, type InterestProfile } from "@/lib/interest-content";

function FractionModel({ parts, coral = false }: { parts: number; coral?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-10 text-lg font-semibold">1/{parts}</span>
      <div className={`fraction-bar flex-1 ${coral ? "coral" : ""}`} style={{ "--parts": parts } as CSSProperties}>
        {Array.from({ length: parts }, (_, index) => <span key={index} />)}
      </div>
    </div>
  );
}

function ProblemModel({ model }: { model?: [number, number] | undefined }) {
  if (!model) return null;
  return <div className="fraction-bars"><FractionModel parts={model[0]} /><FractionModel parts={model[1]} coral /></div>;
}

function LearningProblem({
  problem,
  guidedStep,
  interest,
  onComplete,
  onStruggle,
}: {
  problem: LessonProblem;
  guidedStep?: number;
  interest: "space" | "soccer" | "animals" | "dinosaurs" | "cooking" | "music" | "building" | "ocean" | "art" | "castles" | "cars";
  onComplete: (correctFirstTry: boolean) => void;
  onStruggle: () => void;
}) {
  const [selected, setSelected] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState("");
  const correct = feedback === problem.explanation;
  const guided = guidedStep !== undefined;
  const reteaching = mistakes >= 2 && !correct;

  function submit() {
    if (selected === problem.answer) {
      setFeedback(problem.explanation);
      return;
    }
    const count = mistakes + 1;
    setMistakes(count);
    setFeedback(count >= 2 ? "" : "Good try. Look at the size of one piece, then choose again.");
    if (count === 2) onStruggle();
    setSelected("");
  }

  return (
    <section className="flow-card fade-in">
      <p className="eyebrow text-primary">
        {guided ? `Learn · try together ${guidedStep + 1} of 2` : "Practice · immediate feedback"}
      </p>
      {guided && <p className="support-fade-note">{guidedStep === 0 ? "We’ll use movable strips and a picture together." : "The strips are put away. Use the picture and what you noticed."}</p>}
      <h1 className="text-2xl font-bold leading-snug mt-4">{problem.prompt}</h1>
      {guidedStep === 0 && <FractionStripManipulative interest={interest} />}
      {reteaching && (
        <div className="bg-sunshine-soft rounded-md p-5 my-5" role="status">
          <p className="eyebrow text-coral">Let’s look at it another way</p>
          <p className="text-sm leading-7 mt-2">Picture two same-sized pizzas. One is cut into 2 slices, the other into 6. Which single slice would fill you up more? The pizza with fewer slices has bigger slices.</p>
          <div className="fraction-bars mt-3"><FractionModel parts={2} /><FractionModel parts={6} coral /></div>
          <p className="text-sm leading-7 mt-3">Now use the same idea on the question above. Try again!</p>
        </div>
      )}
      <ProblemModel model={problem.model} />
      {!correct && (
        <div className="choice-grid">
          {problem.options.map((option) => (
            <Button key={option} variant="outline" className={`choice-button ${selected === option ? "selected" : ""}`} onClick={() => setSelected(option)}>{option}</Button>
          ))}
        </div>
      )}
      {hintCount > 0 && !correct && (
        <div className="bg-sunshine-soft p-4 text-sm leading-7 rounded-md mb-4" role="status">
          {Array.from({ length: hintCount }, (_, index) => <p key={index}><strong>Hint {index + 1}:</strong> {hints[index]}</p>)}
          {hintCount >= 2 && problem.model && <LineUp a={problem.model[0]} b={problem.model[1]} theme={interest === "soccer" ? "soccer" : "space"} />}
        </div>
      )}
      {feedback && <p role="status" className={`text-sm p-4 rounded-md mb-5 ${correct ? "bg-leaf-soft text-leaf" : "bg-blue-soft text-primary"}`}>{feedback}</p>}
      <div className="flex justify-between gap-3">
        {!correct && (
          <Button variant="ghost" disabled={hintCount >= 2} onClick={() => setHintCount((value) => Math.min(2, value + 1))}>
            <Lightbulb />{hintCount >= 2 ? "Both hints are here" : "Need a hint?"}
          </Button>
        )}
        <Button className={correct ? "w-full" : "ml-auto"} disabled={!correct && !selected} onClick={correct ? () => onComplete(mistakes === 0) : submit}>
          {correct ? "Next little step" : "Check my answer"}<ArrowRight />
        </Button>
      </div>
    </section>
  );
}

function firstOpenDayFrom(slots: Slots, from: number) {
  for (let d = from; d < from + 8; d++) {
    const day = weekDays[demoDayIndex(d)]!;
    const window = timeWindows.find((w) => slots[day].includes(w.id));
    if (window) return { today: d, hour: window.start };
  }
  return { today: from, hour: 16 };
}

export function ChildLesson() {
  const { state, update } = useDemo();
  const [started, setStarted] = useState(false);
  const [guidedIndex, setGuidedIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [checkIndex, setCheckIndex] = useState(0);
  const [checkAnswers, setCheckAnswers] = useState<string[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewAnswers, setReviewAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const gate = useChildGate();
  const lesson = state.lesson;
  const profile = state.profiles.Leo;
  const world = lessonWorld(profile);
  const interest = world ?? "space";
  const problems = useMemo(() => lessonContent(profile), [profile]);
  const interestName = interestOptions.find((item) => item.id === interest)?.name;
  const story = storyFor(profile, (lesson.checkScore !== null ? 1 : 0) + (lesson.reviewScore !== null ? 1 : 0));
  const setProfile = (p: InterestProfile) => update({ profiles: { ...state.profiles, Leo: p }, interests: { ...state.interests, Leo: p.worlds } });
  const limit = state.settings.minutes;
  const reviewDue = lesson.stage === "review" && lesson.checkDay !== null && state.today >= lesson.checkDay + 3;

  function spend(cost: number) {
    return { minutesToday: state.minutesToday + cost, weekMinutes: state.weekMinutes + cost };
  }

  function markStuck() {
    update({ lesson: { ...lesson, retaught: true }, tipDismissed: false });
  }

  if (gate) return gate;

  if (!state.childSetupComplete || state.diagnostic.length === 0) {
    return (
      <main className="flow-container text-center">
        <Avatar config={state.avatars[state.child]} size={90} label={`${state.child}’s avatar`} />
        <p className="eyebrow text-leaf mt-5"><Sparkles size={16} />Hi, {state.child}!</p>
        <h1 className="page-title mt-3">Let’s find your starting point.</h1>
        <Button variant="hero" className="mt-8 start-button" asChild><Link to="/diagnostic">Start<ArrowRight /></Link></Button>
      </main>
    );
  }

  if (!started) {
    const finished = lesson.stage === "complete" || (lesson.stage === "review" && !reviewDue);
    return (
      <main className="flow-container text-center">
        <div className="child-home-friends">
          <Avatar config={state.avatars[state.child]} size={82} label={`${state.child}’s avatar`} />
          <InterestGuide interest={interest} size={72} />
        </div>
        <p className="eyebrow text-leaf"><Sparkles size={16} />Hi, {state.child}!</p>
        <h1 className="page-title mt-4">{reviewDue ? "Quick warm-up first!" : finished ? "You finished today’s lesson." : "Today’s lesson"}</h1>
        <h2 className="text-lg font-bold mt-3 leading-snug">{reviewDue ? "3 questions to bring back what you learned" : FULL_LESSON_TITLE}</h2>
        <p className="page-subtitle">{world ? `${interestName} stories` : "Plain problems"} · {limit} minutes today</p>
        {!world && <p className="text-sm mt-2">More worlds coming soon. Today’s lesson uses plain problems.</p>}
        {story && <p className="story-line mt-4"><strong>{story.title} · Part {story.part} of {story.of}.</strong> {story.text}</p>}
        <div className="my-7"><LessonProgress stage={lesson.stage} /></div>
        <Button variant="hero" className="start-button" onClick={() => { setStarted(true); update({ mode: "child" }); }}>
          Start<ArrowRight />
        </Button>
        <section className="about-me mt-6">
          <p className="font-bold">My interests</p>
          <p className="text-sm mt-2">I love {profile.worlds.map((w) => interestOptions.find((o) => o.id === w)?.name).join(" and ") || "lots of things"}{profile.favorite ? `, most of all ${interestOptions.find((o) => o.id === profile.favorite)?.name}` : ""}. {profile.worlds.flatMap((w) => (profile.subs[w] ?? []).map((s) => worldSubs[w].find((x) => x.id === s)?.label)).filter(Boolean).join(", ")}{profile.guideName ? `. My guide is ${profile.guideName}.` : ""}</p>
          <p className="text-xs text-muted-foreground mt-3">Your parent can update these in Settings.</p>
        </section>
      </main>
    );
  }

  const stepCost = reviewDue ? stepMinutes.review : lesson.stage === "teach" ? stepMinutes.learn : lesson.stage === "practice" ? stepMinutes.practice : lesson.stage === "check" ? stepMinutes.check : 0;
  if (stepCost && (reviewDue || ["teach", "practice", "check"].includes(lesson.stage)) && !canStartStep(state.minutesToday, stepCost, limit)) return <SeeYouTomorrow />;

  return (
    <main className="lesson-container">
      {!reviewDue && lesson.stage !== "review" && lesson.stage !== "complete" && <LessonProgress stage={lesson.stage} />}
      {lesson.stage === "teach" && (
        <div className="mt-7">
          <p className="story-line mb-4">{lessonWrapper(profile, state.child)}</p>
          <LessonPlayer interest={interest} overrides={world ? { ...teachWordsFor(profile)!, guide: profile.guideName ?? undefined } : null} onReplay={() => setProfile({ ...profile, behavior: { ...profile.behavior, replays: { ...profile.behavior.replays, [interest]: (profile.behavior.replays[interest] ?? 0) + 1 } } })} onComplete={() => update({ lesson: { ...lesson, stage: "guided", lessonWatchedAt: demoDateLabel(state.today) } })} />
        </div>
      )}

      {lesson.stage === "guided" && (
        <div>
          <VocabularyCards />
          <LearningProblem
            key={guidedIndex}
            guidedStep={guidedIndex}
            interest={interest}
            problem={problems.guided[guidedIndex] ?? problems.guided[0]!}
            onStruggle={markStuck}
            onComplete={() => {
              if (guidedIndex === problems.guided.length - 1) update({ lesson: { ...lesson, stage: "practice" }, ...spend(stepMinutes.learn) });
              else setGuidedIndex((value) => value + 1);
            }}
          />
        </div>
      )}

      {lesson.stage === "practice" && (
        <div>
          <div className="flex justify-between mb-3 text-xs text-muted-foreground"><span>Practice</span><span>{practiceIndex + 1} of {problems.practice.length}</span></div>
          <div className="progress-track"><progress max={problems.practice.length} value={practiceIndex + 1} /></div>
          <LearningProblem
            key={practiceIndex}
            interest={interest}
            problem={problems.practice[practiceIndex] ?? problems.practice[0]!}
            onStruggle={markStuck}
            onComplete={(correctFirstTry) => {
              const totalCorrect = practiceCorrect + (correctFirstTry ? 1 : 0);
              setPracticeCorrect(totalCorrect);
              if (practiceIndex === problems.practice.length - 1) update({ lesson: { ...lesson, stage: "check", practiceCorrect: totalCorrect, practiceTotal: problems.practice.length }, ...spend(stepMinutes.practice) });
              else setPracticeIndex((value) => value + 1);
            }}
          />
        </div>
      )}

      {lesson.stage === "check" && (
        <section className="flow-card fade-in" key={checkIndex}>
          <div className="flex justify-between gap-3 mb-4"><p className="eyebrow text-primary">Check · just your thinking</p><span className="text-xs text-muted-foreground">{checkIndex + 1} of {problems.check.length}</span></div>
          <div className="progress-track mb-6"><progress max={problems.check.length} value={checkIndex + 1} /></div>
          <h1 className="text-2xl font-bold leading-snug">{problems.check[checkIndex]?.prompt}</h1>
          <ProblemModel model={problems.check[checkIndex]?.model} />
          <div className="choice-grid">
            {problems.check[checkIndex]?.options.map((option) => <Button key={option} variant="outline" className={`choice-button ${selected === option ? "selected" : ""}`} onClick={() => setSelected(option)}>{option}</Button>)}
          </div>
          <p className="text-xs text-muted-foreground mb-5">No hints during this short check. You can go back before you finish. Just show your thinking.</p>
          <div className="flex gap-3">
          {checkIndex > 0 && <Button variant="outline" onClick={() => { setSelected(checkAnswers[checkIndex - 1] ?? ""); setCheckAnswers(checkAnswers.slice(0, checkIndex - 1)); setCheckIndex((value) => value - 1); }}><ArrowLeft />Back</Button>}
          <Button className="flex-1" disabled={!selected} onClick={() => {
            const answers = [...checkAnswers.slice(0, checkIndex), selected];
            if (checkIndex < problems.check.length - 1) {
              setCheckAnswers(answers);
              setCheckIndex((value) => value + 1);
              setSelected("");
              return;
            }
            const score = problems.check.reduce((total, problem, index) => total + (answers[index] === problem.answer ? 1 : 0), 0);
            const plainCorrect = problems.check.reduce((total, problem, index) => total + (problem.context === "plain" && answers[index] === problem.answer ? 1 : 0), 0);
            const base = { ...lesson, checkScore: score, checkPlainCorrect: plainCorrect, checkDate: demoDateLabel(state.today), checkDay: state.today };
            update({
              lesson: checkNeedsCoaching(score) ? { ...base, stage: "teach", retaught: true } : { ...base, stage: "review" },
              ...(checkNeedsCoaching(score) ? { tipDismissed: false } : {}),
              ...spend(stepMinutes.check),
              profiles: { ...state.profiles, Leo: { ...profile, behavior: { ...profile.behavior, finishedSessions: { ...profile.behavior.finishedSessions, [interest]: (profile.behavior.finishedSessions[interest] ?? 0) + 1 } } } },
            });
            setSelected("");
            setCheckIndex(0);
            setCheckAnswers([]);
            setGuidedIndex(0);
            setPracticeIndex(0);
            setPracticeCorrect(0);
            setStarted(false);
          }}>
            {checkIndex === problems.check.length - 1 ? "Finish check" : "Next question"}<ArrowRight />
          </Button>
          </div>
        </section>
      )}

      {lesson.stage === "review" && !reviewDue && (
        <section className="flow-card text-center">
          <div className="bg-sunshine rounded-full h-20 w-20 grid place-items-center mx-auto mb-6"><Star size={38} /></div>
          <p className="eyebrow text-primary">Lesson done</p>
          <h1 className="page-title mt-3">Thanks for showing your thinking.</h1>
          <p className="page-subtitle">In a few days, a short warm-up will pop up to help you remember.</p>
          <div className="bg-blue-soft rounded-md p-5 my-6 flex gap-3 text-left">
            <CalendarClock className="text-primary shrink-0" />
            <p className="text-sm">Three warm-up questions arrive on their own, three days from now.</p>
          </div>
          <Button onClick={() => { update({ ...firstOpenDayFrom(state.settings.slots, (lesson.checkDay ?? state.today) + 3), minutesToday: 0 }); setStarted(false); }}>Skip ahead 3 days · demo<ArrowRight /></Button>
        </section>
      )}

      {reviewDue && (
        <section className="flow-card fade-in" key={reviewIndex}>
          <div className="flex justify-between gap-3 mb-4"><p className="eyebrow text-primary">Warm-up · {demoDateLabel(state.today)}</p><span className="text-xs text-muted-foreground">{reviewIndex + 1} of {problems.review.length}</span></div>
          <div className="progress-track mb-6"><progress max={problems.review.length} value={reviewIndex + 1} /></div>
          <h1 className="text-2xl font-bold leading-snug">{problems.review[reviewIndex]?.prompt}</h1>
          <ProblemModel model={problems.review[reviewIndex]?.model} />
          <div className="choice-grid">
            {problems.review[reviewIndex]?.options.map((option) => <Button key={option} variant="outline" className={`choice-button ${selected === option ? "selected" : ""}`} onClick={() => setSelected(option)}>{option}</Button>)}
          </div>
          <p className="text-xs text-muted-foreground mb-5">Take your time. This is a chance to remember, not a race.</p>
          <div className="flex gap-3">
          {reviewIndex > 0 && <Button variant="outline" onClick={() => { setSelected(reviewAnswers[reviewIndex - 1] ?? ""); setReviewAnswers(reviewAnswers.slice(0, reviewIndex - 1)); setReviewIndex((value) => value - 1); }}><ArrowLeft />Back</Button>}
          <Button className="flex-1" disabled={!selected} onClick={() => {
            const answers = [...reviewAnswers.slice(0, reviewIndex), selected];
            if (reviewIndex < problems.review.length - 1) {
              setReviewAnswers(answers);
              setReviewIndex((value) => value + 1);
              setSelected("");
              return;
            }
            const score = problems.review.reduce((total, problem, index) => total + (answers[index] === problem.answer ? 1 : 0), 0);
            update({ lesson: { ...lesson, stage: "complete", reviewScore: score, reviewDate: demoDateLabel(state.today) }, ...spend(stepMinutes.review) });
            setSelected("");
          }}>
            {reviewIndex === problems.review.length - 1 ? "Finish warm-up" : "Next question"}<ArrowRight />
          </Button>
          </div>
        </section>
      )}

      {lesson.stage === "complete" && (
        <section className="flow-card text-center">
          <PartyPopper size={48} className="text-coral mx-auto mb-5 celebrate-once" />
          <h1 className="page-title">Warm-up done!</h1>
          <p className="page-subtitle">You learned an idea, practiced it, and remembered it days later. Your grown-up can see it too.</p>
          <div className="bg-leaf-soft rounded-md p-5 mt-7 text-sm leading-7"><Check className="text-leaf mx-auto mb-2" />No score here, just a well-earned pause.</div>
          <Button variant="outline" className="mt-7" onClick={() => setStarted(false)}>Back home</Button>
        </section>
      )}
    </main>
  );
}


