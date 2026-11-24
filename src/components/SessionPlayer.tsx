"use client";

import { useEffect, useRef, useState } from "react";
import { RichMath } from "@/components/RichMath";
import { clock } from "@/lib/labels";

type Choice = { id: string; text: string };

type Question = {
  mode: "question";
  nickname: string;
  remainingSec: number;
  attemptId: string;
  stem: string;
  skillTitle: string;
  kidIntro: string;
  choices: Choice[];
  answered: number;
  maxItems: number | null;
  kind: string;
};

type Done = {
  mode: "done";
  nickname: string;
  kind: string;
  answered: number;
  correctCount: number;
  reason: string;
};

type Feedback = {
  correct: boolean;
  explanation: string;
  correctChoiceId: string;
  selectedChoiceId: string | null;
};

export function SessionPlayer() {
  const [data, setData] = useState<Question | Done | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const started = useRef(0);
  const finishing = useRef(false);
  const expired = useRef(false);

  async function load() {
    const response = await fetch("/api/child-session", { cache: "no-store" });
    const json = (await response.json()) as Question | Done | { error?: string };
    if (!response.ok || !("mode" in json)) {
      setError("error" in json ? json.error ?? "The session could not load." : "The session could not load.");
      return;
    }
    setData(json);
    setFeedback(null);
    setError(null);
    started.current = Date.now();
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (data?.mode === "question") {
      setDeadline(Date.now() + data.remainingSec * 1000);
    }
  }, [data]);

  const remaining = deadline === null ? null : Math.max(0, Math.round((deadline - now) / 1000));

  async function finish() {
    if (finishing.current) return;
    finishing.current = true;
    setBusy(true);
    await fetch("/api/child-session/finish", { method: "POST" });
    finishing.current = false;
    setBusy(false);
    await load();
  }

  useEffect(() => {
    if (data?.mode === "question" && remaining === 0 && !expired.current) {
      expired.current = true;
      void finish();
    }
  }, [remaining, data?.mode]);

  async function choose(choiceId: string) {
    if (!data || data.mode !== "question" || feedback || busy) return;
    setBusy(true);
    const response = await fetch("/api/child-session/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId: data.attemptId,
        choiceId,
        responseMs: Date.now() - started.current,
      }),
    });
    const json = (await response.json()) as Feedback & { error?: string };
    setBusy(false);
    if (!response.ok) {
      if (response.status === 409) {
        await finish();
        return;
      }
      setError(json.error ?? "That answer did not save.");
      return;
    }
    setFeedback(json);
  }

  if (!data && !error) {
    return <p className="text-lg">Getting the next question ready…</p>;
  }
  if (error && !data) {
    return (
      <div className="card p-6">
        <p>{error}</p>
        <a className="btn mt-4" href="/child/unlock">Grown-up unlock</a>
      </div>
    );
  }
  if (!data || data.mode === "done") {
    const done = data as Done | null;
    return (
      <section className="card p-6 sm:p-8">
        <p className="text-sm uppercase tracking-wide text-[var(--muted)]">Hand the device back</p>
        <h1 className="mt-2 font-serif text-4xl">Nice focus today{done?.nickname ? `, ${done.nickname}` : ""}.</h1>
        <p className="mt-3 text-lg leading-relaxed">
          {done?.answered
            ? `You worked on ${done.answered} question${done.answered === 1 ? "" : "s"}.`
            : "This session is finished."}{" "}
          A grown-up can see what got stronger.
        </p>
        <a className="btn mt-6" href="/child/unlock">Grown-up unlock</a>
      </section>
    );
  }

  const questionNumber = data.answered + 1;
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted)]">
            {data.kind === "DIAGNOSTIC" ? "Placement" : "Practice"} · Question {questionNumber}
            {data.maxItems ? ` of up to ${data.maxItems}` : ""}
          </p>
          <h1 className="font-serif text-3xl">{data.skillTitle}</h1>
        </div>
        <p className="rounded-full bg-white px-3 py-2 text-lg tabular-nums" aria-live="polite">
          {remaining === null ? "" : clock(remaining)}
        </p>
      </div>
      <article className="card p-5 sm:p-7">
        <p className="text-sm text-[var(--muted)]">{data.kidIntro}</p>
        <p className="mt-3 text-2xl leading-snug">
          <RichMath text={data.stem} />
        </p>
        <div className="mt-5 grid gap-3">
          {data.choices.map((choice) => {
            const picked = feedback?.selectedChoiceId === choice.id;
            const right = feedback?.correctChoiceId === choice.id;
            const className = feedback
              ? right
                ? "choice right"
                : picked
                  ? "choice wrong"
                  : "choice"
              : "choice";
            return (
              <button
                key={choice.id}
                className={className}
                disabled={Boolean(feedback) || busy}
                onClick={() => void choose(choice.id)}
              >
                <RichMath text={choice.text} />
              </button>
            );
          })}
        </div>
        {feedback && (
          <div className={feedback.correct ? "note mt-5 bg-[var(--good)]" : "note mt-5"}>
            <p className="font-semibold">{feedback.correct ? "That's right." : "Not quite."}</p>
            <p className="mt-1 leading-relaxed">
              <RichMath text={feedback.explanation} />
            </p>
            <button className="btn mt-4" onClick={() => void load()} disabled={busy}>
              Next question
            </button>
          </div>
        )}
        {error && <p className="mt-4 text-[var(--clay)]">{error}</p>}
      </article>
      <div className="mt-4 flex justify-between gap-3">
        <button className="btn-quiet" onClick={() => void finish()} disabled={busy}>
          Finish for today
        </button>
        <a className="btn-quiet" href="/child/unlock">Grown-up unlock</a>
      </div>
    </section>
  );
}
