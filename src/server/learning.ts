import { randomInt } from "crypto";
import type { Attempt, SkillState } from "@prisma/client";
import { GENERATORS } from "@/content/generators";
import { misconceptionLabel } from "@/content/misconceptions";
import { skillById, skillNodes, SKILLS, type SkillDef } from "@/content/skills";
import { masteredAlert, readyAlert, stallAlert, isStalling } from "@/lib/alerts";
import { bktUpdate, DEFAULT_BKT, statusFor } from "@/lib/bkt";
import { placeFromDiagnostic, nextDiagnosticSkill } from "@/lib/diagnostic";
import { expectedCorrect, updateDifficulty } from "@/lib/elo";
import { generateFromKey, pickTemplateKey, toPublicChoices, type StoredChoice } from "@/lib/items";
import { proposePlan, validatePlanSelection } from "@/lib/plan";
import { renderWeeklyReport, topMisconception, type WeeklyReport } from "@/lib/report";
import { addDays, initialReviewDue, nextIntervalDays } from "@/lib/review";
import { mulberry32 } from "@/lib/rng";
import {
  frontierSkills,
  nextPracticeSkill,
  reviewDue,
  type SkillMasterySnapshot,
} from "@/lib/selection";
import { formatWhen } from "@/lib/labels";
import { prisma } from "@/server/db";

const nodes = skillNodes();

export class LearningError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

function titles() {
  return new Map(SKILLS.map((skill) => [skill.id, skill.title]));
}

export function toSnapshot(state: SkillState): SkillMasterySnapshot {
  return {
    skillId: state.skillId,
    status: state.status as SkillMasterySnapshot["status"],
    pMastery: state.pMastery,
    attempts: state.attempts,
    reviewDueAt: state.reviewDueAt,
  };
}

export async function loadStates(childId: string): Promise<SkillState[]> {
  return prisma.skillState.findMany({ where: { childId } });
}

export async function latestApprovedPlan(childId: string) {
  return prisma.learningPlan.findFirst({
    where: { childId, status: "APPROVED" },
    orderBy: { approvedAt: "desc" },
  });
}

export async function latestProposedPlan(childId: string) {
  return prisma.learningPlan.findFirst({
    where: { childId, status: "PROPOSED" },
    orderBy: { createdAt: "desc" },
  });
}

async function createAlert(
  childId: string,
  type: string,
  skillId: string | null,
  message: string,
) {
  const existing = await prisma.alert.findFirst({
    where: { childId, type, skillId, readAt: null, message },
  });
  if (existing) return existing;
  return prisma.alert.create({
    data: { childId, type, skillId, message },
  });
}

export async function refreshProposal(childId: string) {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) throw new LearningError("Child not found.", 404);
  const states = (await loadStates(childId)).map(toSnapshot);
  const proposal = proposePlan(nodes, states, child.grade, new Date(), titles());
  const open = await latestProposedPlan(childId);
  const data = {
    skillIds: JSON.stringify(proposal.skillIds),
    note: proposal.note,
    minutesPerDay: child.dailyMinutes,
    daysPerWeek: 5,
  };
  if (open) {
    return prisma.learningPlan.update({ where: { id: open.id }, data });
  }
  return prisma.learningPlan.create({
    data: { childId, status: "PROPOSED", parentNote: "", ...data },
  });
}

export async function approvePlan(
  childId: string,
  skillIds: string[],
  parentNote: string,
  minutesPerDay: number,
) {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) throw new LearningError("Child not found.", 404);
  const unique = [...new Set(skillIds)];
  if (unique.length === 0) {
    throw new LearningError("Pick at least one skill before approving.");
  }
  const states = (await loadStates(childId)).map(toSnapshot);
  const issues = validatePlanSelection(nodes, states, unique);
  if (issues.length > 0) {
    throw new LearningError(issues[0]!.message);
  }
  await prisma.child.update({
    where: { id: childId },
    data: { dailyMinutes: minutesPerDay },
  });
  const open = await latestProposedPlan(childId);
  const note = open?.note ?? "Approved by the parent.";
  const data = {
    status: "APPROVED",
    skillIds: JSON.stringify(unique),
    parentNote,
    minutesPerDay,
    note,
    approvedAt: new Date(),
  };
  if (open) return prisma.learningPlan.update({ where: { id: open.id }, data });
  return prisma.learningPlan.create({ data: { childId, daysPerWeek: 5, ...data } });
}

async function upsertTemplate(key: string, skillId: string, difficulty: number) {
  return prisma.itemTemplate.upsert({
    where: { key },
    create: { key, skillId, difficulty },
    update: {},
  });
}

async function makeAttempt(input: {
  childId: string;
  sessionId: string;
  skillId: string;
  reason: string;
}) {
  const state = await prisma.skillState.findUnique({
    where: { childId_skillId: { childId: input.childId, skillId: input.skillId } },
  });
  const pMastery = state?.pMastery ?? DEFAULT_BKT.pL0;
  const templates = await prisma.itemTemplate.findMany({ where: { skillId: input.skillId } });
  for (const generator of GENERATORS.filter((item) => item.skillId === input.skillId)) {
    if (!templates.some((template) => template.key === generator.key)) {
      const created = await upsertTemplate(generator.key, generator.skillId, generator.difficulty);
      templates.push(created);
    }
  }
  let item: ReturnType<typeof generateFromKey> | null = null;
  for (let attempt = 0; attempt < 5 && !item; attempt += 1) {
    const rng = mulberry32(randomInt(1, 2 ** 31 - 1));
    const key = pickTemplateKey(
      input.skillId,
      templates.map((template) => ({ key: template.key, difficulty: template.difficulty })),
      pMastery,
      rng,
    );
    const stored = templates.find((template) => template.key === key);
    try {
      item = generateFromKey(key, rng, stored?.difficulty);
    } catch {
      item = null;
    }
  }
  if (!item) throw new LearningError("Could not build a question for that skill.");
  return prisma.attempt.create({
    data: {
      childId: input.childId,
      sessionId: input.sessionId,
      skillId: input.skillId,
      templateKey: item.templateKey,
      reason: input.reason,
      stem: item.stem,
      choicesJson: JSON.stringify(item.choices),
      correctChoiceId: item.correctChoiceId,
      difficulty: item.difficulty,
    },
  });
}

function remainingSec(startedAt: Date, limitSec: number, now = new Date()) {
  return Math.max(0, Math.ceil(limitSec - (now.getTime() - startedAt.getTime()) / 1000));
}

function publicQuestion(attempt: Attempt, answered: number, maxItems: number | null, kind: string) {
  const choices = JSON.parse(attempt.choicesJson) as StoredChoice[];
  const skill = skillById(attempt.skillId);
  return {
    attemptId: attempt.id,
    stem: attempt.stem,
    skillId: attempt.skillId,
    skillTitle: skill?.kidTitle ?? attempt.skillId,
    kidIntro: skill?.kidIntro ?? "",
    reason: attempt.reason,
    choices: toPublicChoices(choices),
    answered,
    maxItems,
    kind,
  };
}

export async function finishSession(sessionId: string) {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: { attempts: true, child: true },
  });
  if (!session) return null;
  const locked = await prisma.learningSession.updateMany({
    where: { id: sessionId, status: "ACTIVE" },
    data: { status: "COMPLETE", endedAt: new Date() },
  });
  if (locked.count === 0) return session;

  if (session.kind === "DIAGNOSTIC") {
    const responses = session.attempts
      .filter((attempt) => attempt.answeredAt && attempt.correct !== null)
      .map((attempt) => ({ skillId: attempt.skillId, correct: Boolean(attempt.correct) }));
    const practiceCount = await prisma.attempt.count({
      where: {
        childId: session.childId,
        answeredAt: { not: null },
        session: { kind: "PRACTICE" },
      },
    });
    if (responses.length > 0 && practiceCount === 0) {
      const correctBySkill = new Map<string, number>();
      for (const response of responses) {
        if (!response.correct) continue;
        correctBySkill.set(response.skillId, (correctBySkill.get(response.skillId) ?? 0) + 1);
      }
      const placement = placeFromDiagnostic(nodes, responses);
      await prisma.skillState.deleteMany({ where: { childId: session.childId } });
      await prisma.learningPlan.deleteMany({ where: { childId: session.childId } });
      const rows = placement.filter((item) => item.attempts > 0);
      if (rows.length > 0) {
        const now = new Date();
        await prisma.skillState.createMany({
          data: rows.map((item) => ({
            childId: session.childId,
            skillId: item.skillId,
            pMastery: item.pMastery,
            attempts: item.attempts,
            correctCount: item.inferred ? item.attempts : (correctBySkill.get(item.skillId) ?? 0),
            status: item.status,
            inferred: item.inferred,
            reviewStreak: item.status === "MASTERED" ? 1 : 0,
            reviewDueAt: item.status === "MASTERED" ? initialReviewDue(now) : null,
          })),
        });
      }
      await refreshProposal(session.childId);
      await createAlert(
        session.childId,
        "READY",
        null,
        `${session.child.nickname}'s diagnostic is in. Review the proposed plan before practice starts.`,
      );
    }
  } else {
    const approved = await latestApprovedPlan(session.childId);
    const snapshots = (await loadStates(session.childId)).map(toSnapshot);
    const approvedIds = approved ? (JSON.parse(approved.skillIds) as string[]) : [];
    const planDone =
      approvedIds.length > 0 &&
      approvedIds.every((skillId) => snapshots.find((state) => state.skillId === skillId)?.status === "MASTERED");
    const proposed = await latestProposedPlan(session.childId);
    if (planDone && !proposed) await refreshProposal(session.childId);
  }

  await scanStallAlerts(session.childId);
  return session;
}

async function scanStallAlerts(childId: string) {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) return;
  const states = await loadStates(childId);
  for (const state of states) {
    if (state.status !== "IN_PROGRESS") continue;
    const recent = await prisma.attempt.findMany({
      where: {
        childId,
        skillId: state.skillId,
        answeredAt: { not: null },
        pMasteryBefore: { not: null },
        pMasteryAfter: { not: null },
        session: { kind: "PRACTICE" },
      },
      orderBy: { answeredAt: "desc" },
      take: 6,
    });
    if (recent.length < 6) continue;
    const points = recent.reverse().map((attempt) => ({
      correct: Boolean(attempt.correct),
      pMasteryBefore: attempt.pMasteryBefore ?? state.pMastery,
      pMasteryAfter: attempt.pMasteryAfter ?? state.pMastery,
    }));
    if (!isStalling(points)) continue;
    const skill = skillById(state.skillId);
    const draft = stallAlert(child.nickname, skill?.title ?? state.skillId, state.skillId);
    await createAlert(childId, draft.type, draft.skillId, draft.message);
  }
}

export async function startLearningSession(childId: string, kind: "DIAGNOSTIC" | "PRACTICE") {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) throw new LearningError("Child not found.", 404);
  const approved = await latestApprovedPlan(childId);
  if (kind === "PRACTICE" && !approved) {
    throw new LearningError("Approve a plan before practice starts.");
  }
  const active = await prisma.learningSession.findMany({
    where: { childId, status: "ACTIVE" },
  });
  for (const open of active) await finishSession(open.id);
  const session = await prisma.learningSession.create({
    data: {
      childId,
      kind,
      limitSec: kind === "DIAGNOSTIC" ? 12 * 60 : child.dailyMinutes * 60,
      maxItems: kind === "DIAGNOSTIC" ? 10 : null,
      planId: kind === "PRACTICE" ? approved?.id : null,
      status: "ACTIVE",
    },
  });
  return { child, session };
}

async function choosePracticeSkill(childId: string, planId: string | null, answered: number) {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) return null;
  const states = (await loadStates(childId)).map(toSnapshot);
  const stateMap = new Map(states.map((state) => [state.skillId, state]));
  const frontier = frontierSkills(nodes, stateMap, child.grade);
  const plan = planId
    ? await prisma.learningPlan.findUnique({ where: { id: planId } })
    : await latestApprovedPlan(childId);
  const allowed = new Set<string>(plan ? (JSON.parse(plan.skillIds) as string[]) : frontier);
  const focus = frontier.filter((skillId) => allowed.has(skillId));
  const due = reviewDue(states, new Date()).filter((skillId) => allowed.has(skillId));
  return nextPracticeSkill(focus, due, answered);
}

export async function currentQuestion(sessionId: string) {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: { child: true, attempts: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) throw new LearningError("Session not found.", 404);
  const answered = session.attempts.filter((attempt) => attempt.answeredAt);
  const correctCount = answered.filter((attempt) => attempt.correct).length;
  if (session.status !== "ACTIVE") {
    return {
      mode: "done" as const,
      nickname: session.child.nickname,
      kind: session.kind,
      answered: answered.length,
      correctCount,
      reason: "complete" as const,
    };
  }
  const remaining = remainingSec(session.startedAt, session.limitSec);
  if (remaining <= 0) {
    await finishSession(session.id);
    return {
      mode: "done" as const,
      nickname: session.child.nickname,
      kind: session.kind,
      answered: answered.length,
      correctCount,
      reason: "time" as const,
    };
  }

  const pending = session.attempts.find((attempt) => !attempt.answeredAt);
  if (pending) {
    return {
      mode: "question" as const,
      nickname: session.child.nickname,
      remainingSec: remaining,
      ...publicQuestion(pending, answered.length, session.maxItems, session.kind),
    };
  }

  if (session.kind === "DIAGNOSTIC") {
    const responses = answered.map((attempt) => ({
      skillId: attempt.skillId,
      correct: Boolean(attempt.correct),
    }));
    const next = nextDiagnosticSkill(
      nodes,
      responses,
      session.child.grade,
      session.maxItems ?? 10,
    );
    if (!next) {
      await finishSession(session.id);
      return {
        mode: "done" as const,
        nickname: session.child.nickname,
        kind: session.kind,
        answered: answered.length,
        correctCount,
        reason: "complete" as const,
      };
    }
    const created = await makeAttempt({
      childId: session.childId,
      sessionId: session.id,
      skillId: next,
      reason: "diagnostic",
    });
    return {
      mode: "question" as const,
      nickname: session.child.nickname,
      remainingSec: remaining,
      ...publicQuestion(created, answered.length, session.maxItems, session.kind),
    };
  }

  const pick = await choosePracticeSkill(session.childId, session.planId, answered.length);
  if (!pick) {
    await finishSession(session.id);
    await createAlert(
      session.childId,
      "READY",
      null,
      `${session.child.nickname} finished the skills on the approved plan. Approve a new plan to open the next ones.`,
    );
    return {
      mode: "done" as const,
      nickname: session.child.nickname,
      kind: session.kind,
      answered: answered.length,
      correctCount,
      reason: "plan" as const,
    };
  }
  const created = await makeAttempt({
    childId: session.childId,
    sessionId: session.id,
    skillId: pick.skillId,
    reason: pick.reason,
  });
  return {
    mode: "question" as const,
    nickname: session.child.nickname,
    remainingSec: remaining,
    ...publicQuestion(created, answered.length, session.maxItems, session.kind),
  };
}

export async function answerAttempt(input: {
  sessionId: string;
  attemptId: string;
  choiceId: string;
  responseMs?: number;
}) {
  const session = await prisma.learningSession.findUnique({ where: { id: input.sessionId } });
  if (!session || session.status !== "ACTIVE") {
    throw new LearningError("This session is over.", 409);
  }
  if (remainingSec(session.startedAt, session.limitSec) <= 0) {
    await finishSession(session.id);
    throw new LearningError("Time is up.", 409);
  }
  const attempt = await prisma.attempt.findFirst({
    where: { id: input.attemptId, sessionId: input.sessionId },
  });
  if (!attempt) throw new LearningError("Question not found.", 404);
  const choices = JSON.parse(attempt.choicesJson) as StoredChoice[];
  if (attempt.answeredAt) {
    return feedbackPayload(attempt, choices);
  }
  const selected = choices.find((choice) => choice.id === input.choiceId);
  if (!selected) throw new LearningError("Choose one of the answers.");

  if (session.kind === "DIAGNOSTIC") {
    const saved = await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        selectedChoiceId: selected.id,
        correct: selected.correct,
        misconception: selected.misconception,
        explanation: selected.explanation,
        answeredAt: new Date(),
        responseMs: input.responseMs ?? null,
      },
    });
    return feedbackPayload(saved, choices);
  }

  const existing = await prisma.skillState.findUnique({
    where: { childId_skillId: { childId: attempt.childId, skillId: attempt.skillId } },
  });
  const before = existing?.pMastery ?? DEFAULT_BKT.pL0;
  const after = bktUpdate(before, selected.correct);
  const attempts = (existing?.attempts ?? 0) + 1;
  const correctCount = (existing?.correctCount ?? 0) + (selected.correct ? 1 : 0);
  const wasMastered = existing?.status === "MASTERED";
  let nextStatus = statusFor(after, attempts);
  let reviewStreak = existing?.reviewStreak ?? 0;
  let reviewDueAt = existing?.reviewDueAt ?? null;
  let inferred = existing?.inferred ?? false;
  const now = new Date();
  if (nextStatus === "MASTERED") {
    inferred = false;
    if (!wasMastered) {
      reviewStreak = 1;
      reviewDueAt = initialReviewDue(now);
    } else if (attempt.reason === "review" && selected.correct) {
      reviewStreak = (existing?.reviewStreak ?? 0) + 1;
      reviewDueAt = addDays(now, nextIntervalDays(reviewStreak));
    } else if (attempt.reason === "review" && !selected.correct) {
      reviewStreak = 0;
      reviewDueAt = initialReviewDue(now);
    }
  } else {
    reviewStreak = 0;
    reviewDueAt = null;
  }

  await prisma.skillState.upsert({
    where: { childId_skillId: { childId: attempt.childId, skillId: attempt.skillId } },
    create: {
      childId: attempt.childId,
      skillId: attempt.skillId,
      pMastery: after,
      attempts,
      correctCount,
      status: nextStatus,
      inferred,
      reviewStreak,
      reviewDueAt,
      lastPracticedAt: now,
    },
    update: {
      pMastery: after,
      attempts,
      correctCount,
      status: nextStatus,
      inferred,
      reviewStreak,
      reviewDueAt,
      lastPracticedAt: now,
    },
  });

  const saved = await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      selectedChoiceId: selected.id,
      correct: selected.correct,
      misconception: selected.misconception,
      explanation: selected.explanation,
      pMasteryBefore: before,
      pMasteryAfter: after,
      answeredAt: now,
      responseMs: input.responseMs ?? null,
    },
  });

  const expected = expectedCorrect(before, attempt.difficulty);
  const difficulty = updateDifficulty(attempt.difficulty, selected.correct, expected);
  await prisma.itemTemplate.update({
    where: { key: attempt.templateKey },
    data: {
      difficulty,
      attempts: { increment: 1 },
      correctCount: { increment: selected.correct ? 1 : 0 },
    },
  }).catch(async () => {
    await prisma.itemTemplate.create({
      data: {
        key: attempt.templateKey,
        skillId: attempt.skillId,
        difficulty,
        attempts: 1,
        correctCount: selected.correct ? 1 : 0,
      },
    });
  });

  if (!wasMastered && nextStatus === "MASTERED") {
    const child = await prisma.child.findUnique({ where: { id: attempt.childId } });
    const skill = skillById(attempt.skillId);
    const nickname = child?.nickname ?? "Your child";
    const mastered = masteredAlert(nickname, skill?.title ?? attempt.skillId, attempt.skillId);
    await createAlert(attempt.childId, mastered.type, mastered.skillId, mastered.message);
    const snapshots = (await loadStates(attempt.childId)).map(toSnapshot);
    const opened = frontierSkills(
      nodes,
      new Map(snapshots.map((item) => [item.skillId, item])),
      child?.grade ?? 2,
    );
    for (const skillId of opened) {
      const nextSkill = skillById(skillId);
      if (!nextSkill?.prereqIds.includes(attempt.skillId)) continue;
      const ready = readyAlert(nickname, nextSkill.title, nextSkill.id);
      await createAlert(attempt.childId, ready.type, ready.skillId, ready.message);
    }
  }
  await scanStallAlerts(attempt.childId);
  return feedbackPayload(saved, choices);
}

function feedbackPayload(attempt: Attempt, choices: StoredChoice[]) {
  return {
    attemptId: attempt.id,
    correct: Boolean(attempt.correct),
    explanation: attempt.explanation,
    correctChoiceId: attempt.correctChoiceId,
    selectedChoiceId: attempt.selectedChoiceId,
    choices: choices.map((choice) => ({ id: choice.id, text: choice.text })),
  };
}

export type SkillView = SkillDef & {
  status: string;
  inferred: boolean;
  pMastery: number;
  attempts: number;
  correctCount: number;
  reviewDueAt: string | null;
  misconceptions: { id: string; label: string; count: number }[];
};

export async function childOverview(childId: string) {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: {
      states: true,
      alerts: { orderBy: { createdAt: "desc" }, take: 12 },
      plans: { orderBy: { createdAt: "desc" }, take: 6 },
    },
  });
  if (!child) return null;
  const wrongs = await prisma.attempt.findMany({
    where: { childId, correct: false, misconception: { not: null } },
    orderBy: { answeredAt: "desc" },
    take: 100,
  });
  const misconceptionCounts = new Map<string, Map<string, number>>();
  for (const attempt of wrongs) {
    if (!attempt.misconception) continue;
    const bySkill = misconceptionCounts.get(attempt.skillId) ?? new Map<string, number>();
    bySkill.set(attempt.misconception, (bySkill.get(attempt.misconception) ?? 0) + 1);
    misconceptionCounts.set(attempt.skillId, bySkill);
  }
  const stateBySkill = new Map(child.states.map((state) => [state.skillId, state]));
  const skills: SkillView[] = SKILLS.map((skill) => {
    const state = stateBySkill.get(skill.id);
    const counts = [...(misconceptionCounts.get(skill.id)?.entries() ?? [])]
      .map(([id, count]) => ({ id, label: misconceptionLabel(id) ?? id, count }))
      .filter((item) => item.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    return {
      ...skill,
      status: state?.status ?? "NOT_STARTED",
      inferred: state?.inferred ?? false,
      pMastery: state?.pMastery ?? DEFAULT_BKT.pL0,
      attempts: state?.attempts ?? 0,
      correctCount: state?.correctCount ?? 0,
      reviewDueAt: state?.reviewDueAt ? state.reviewDueAt.toISOString() : null,
      misconceptions: counts,
    };
  });
  const week = await weekStats(childId);
  return { child, skills, week };
}

async function weekStats(childId: string, now = new Date()) {
  const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [attempts, sessions] = await Promise.all([
    prisma.attempt.findMany({
      where: { childId, answeredAt: { gte: from } },
    }),
    prisma.learningSession.findMany({
      where: { childId, startedAt: { gte: from } },
    }),
  ]);
  let seconds = 0;
  for (const session of sessions) {
    const end = session.endedAt ?? now;
    const elapsed = Math.max(0, (end.getTime() - session.startedAt.getTime()) / 1000);
    seconds += Math.min(session.limitSec, elapsed);
  }
  const correct = attempts.filter((attempt) => attempt.correct).length;
  return {
    from,
    to: now,
    minutes: Math.round(seconds / 60),
    answered: attempts.length,
    correct,
  };
}

export async function weeklyReportFor(childId: string, now = new Date()): Promise<{
  child: { nickname: string; grade: number };
  report: WeeklyReport;
  stats: { minutes: number; answered: number; correct: number; from: Date; to: Date };
} | null> {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) return null;
  const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const attempts = await prisma.attempt.findMany({
    where: { childId, answeredAt: { gte: from } },
    orderBy: { answeredAt: "asc" },
  });
  const states = await loadStates(childId);
  const stats = await weekStats(childId, now);
  const bySkill = new Map<string, Attempt[]>();
  for (const attempt of attempts) {
    const list = bySkill.get(attempt.skillId) ?? [];
    list.push(attempt);
    bySkill.set(attempt.skillId, list);
  }
  const improved = [...bySkill.entries()]
    .map(([skillId, list]) => {
      const first = list[0]!;
      const last = list[list.length - 1]!;
      const fromP = first.pMasteryBefore ?? DEFAULT_BKT.pL0;
      const toP = last.pMasteryAfter ?? fromP;
      const mastered = (last.pMasteryAfter ?? 0) >= 0.95 && fromP < 0.95;
      return { skillId, title: skillById(skillId)?.title ?? skillId, fromP, toP, mastered };
    })
    .filter((item) => item.mastered || item.toP - item.fromP >= 0.1);

  const hard = [...bySkill.entries()]
    .map(([skillId, list]) => {
      const correct = list.filter((attempt) => attempt.correct).length;
      return {
        title: skillById(skillId)?.title ?? skillId,
        accuracy: list.length ? correct / list.length : 0,
        attempts: list.length,
        topMisconception: topMisconception(list.map((attempt) => attempt.misconception)),
      };
    })
    .filter((item) => item.attempts >= 3 && item.accuracy < 0.6);

  const approved = await latestApprovedPlan(childId);
  const proposed = await latestProposedPlan(childId);
  const planIds = JSON.parse(approved?.skillIds ?? proposed?.skillIds ?? "[]") as string[];
  const recommendations = (planIds.length > 0 ? planIds : frontierSkills(
    nodes,
    new Map(states.map((state) => [state.skillId, toSnapshot(state)])),
    child.grade,
  ).slice(0, 3)).map((skillId) => ({
    title: skillById(skillId)?.title ?? skillId,
    reason: "This is on the plan because earlier skills are in place and it still needs practice.",
  }));

  const report = renderWeeklyReport({
    nickname: child.nickname,
    fromLabel: formatWhen(from),
    toLabel: formatWhen(now),
    minutes: stats.minutes,
    answered: stats.answered,
    correct: stats.correct,
    improved,
    hard,
    recommendations,
    masteredCount: states.filter((state) => state.status === "MASTERED").length,
    inProgressCount: states.filter((state) => state.status === "IN_PROGRESS").length,
  });
  return { child: { nickname: child.nickname, grade: child.grade }, report, stats };
}

export async function exportRows(childId: string) {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) return null;
  const attempts = await prisma.attempt.findMany({
    where: { childId, answeredAt: { not: null } },
    orderBy: { answeredAt: "asc" },
    include: { session: true },
  });
  const header = [
    "answered_at",
    "session",
    "skill_code",
    "skill",
    "reason",
    "stem",
    "selected",
    "correct_answer",
    "is_correct",
    "misconception",
    "confidence_after",
  ];
  const rows = attempts.map((attempt) => {
    const choices = JSON.parse(attempt.choicesJson) as StoredChoice[];
    const selected = choices.find((choice) => choice.id === attempt.selectedChoiceId);
    const correct = choices.find((choice) => choice.id === attempt.correctChoiceId);
    return [
      attempt.answeredAt?.toISOString() ?? "",
      attempt.session.kind,
      attempt.skillId,
      skillById(attempt.skillId)?.title ?? attempt.skillId,
      attempt.reason,
      attempt.stem,
      selected?.text ?? "",
      correct?.text ?? "",
      attempt.correct ? "yes" : "no",
      misconceptionLabel(attempt.misconception) ?? "",
      attempt.pMasteryAfter === null ? "" : attempt.pMasteryAfter.toFixed(3),
    ];
  });
  return { child, header, rows };
}

export async function markAlertsRead(childId: string, alertId?: string) {
  await prisma.alert.updateMany({
    where: { childId, readAt: null, ...(alertId ? { id: alertId } : {}) },
    data: { readAt: new Date() },
  });
}

export async function deleteChildRecords(childId: string) {
  await prisma.child.delete({ where: { id: childId } });
}
