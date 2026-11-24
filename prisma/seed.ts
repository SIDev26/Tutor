import { existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { GENERATORS } from "../src/content/generators";
import { skillById, skillNodes, SKILLS } from "../src/content/skills";
import { readyAlert, stallAlert } from "../src/lib/alerts";
import { bktUpdate, DEFAULT_BKT, statusFor } from "../src/lib/bkt";
import { generateFromKey } from "../src/lib/items";
import { proposePlan } from "../src/lib/plan";
import { addDays } from "../src/lib/review";
import { mulberry32 } from "../src/lib/rng";
import type { SkillMasterySnapshot } from "../src/lib/selection";

const envPath = fileURLToPath(new URL("../.env", import.meta.url));
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
    if (!match) continue;
    if (!process.env[match[1]]) process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

const prisma = new PrismaClient();

const DEMO_PARENT = "parent@example.com";
const DEMO_ADMIN = "admin@example.com";

async function main() {
  for (const generator of GENERATORS) {
    await prisma.itemTemplate.upsert({
      where: { key: generator.key },
      create: {
        key: generator.key,
        skillId: generator.skillId,
        difficulty: generator.difficulty,
      },
      update: { skillId: generator.skillId },
    });
  }

  const parent = await prisma.user.upsert({
    where: { email: DEMO_PARENT },
    create: {
      email: DEMO_PARENT,
      name: "Alex Parent",
      role: "PARENT",
      passwordHash: await bcrypt.hash("homeschool-demo", 10),
    },
    update: {
      name: "Alex Parent",
      role: "PARENT",
      passwordHash: await bcrypt.hash("homeschool-demo", 10),
    },
  });
  await prisma.user.upsert({
    where: { email: DEMO_ADMIN },
    create: {
      email: DEMO_ADMIN,
      name: "Beacon Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash("admin-demo-change", 10),
    },
    update: {
      name: "Beacon Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash("admin-demo-change", 10),
    },
  });

  await ensureChild(parent.id, "Sam", 2);
  const riley = await ensureChild(parent.id, "Riley", 3);
  await seedRiley(riley.id);
  console.log("Seed upserted demo parent, admin, Sam, and Riley. Existing practice was left in place.");
}

async function ensureChild(parentId: string, nickname: string, grade: number) {
  const existing = await prisma.child.findFirst({ where: { parentId, nickname } });
  if (existing) return existing;
  return prisma.child.create({
    data: { parentId, nickname, grade, dailyMinutes: 15 },
  });
}

type Drill = { skillId: string; outcomes: boolean[]; day: number; prefer: string };

async function seedRiley(childId: string) {
  const drills: Drill[] = [
    { skillId: "2.OA.B.2", outcomes: [true, true, true, true, true, true], day: 6, prefer: "" },
    { skillId: "2.NBT.A.1", outcomes: [true, true, true, true, true, true], day: 5, prefer: "" },
    { skillId: "2.NBT.A.3", outcomes: [true, true, true, true, true, true], day: 5, prefer: "" },
    { skillId: "2.NBT.B.5", outcomes: [true, true, true, true, true, true], day: 4, prefer: "" },
    { skillId: "3.OA.A.1", outcomes: [true, true, true, true, true, true], day: 3, prefer: "" },
    { skillId: "3.OA.C.7", outcomes: [true, true, false, false, true, false], day: 1, prefer: "neighbor-fact" },
    { skillId: "3.NF.A.1", outcomes: [false, false, false, false, false, false], day: 0, prefer: "inverted-fraction" },
  ];

  const pending: Drill[] = [];
  for (const drill of drills) {
    const existing = await prisma.skillState.findUnique({
      where: { childId_skillId: { childId, skillId: drill.skillId } },
    });
    if (!existing) pending.push(drill);
  }

  const sessions = new Map<number, string>();
  for (const day of [...new Set(pending.map((drill) => drill.day))]) {
    const started = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
    started.setUTCHours(15, 0, 0, 0);
    const session = await prisma.learningSession.create({
      data: {
        childId,
        kind: "PRACTICE",
        status: "COMPLETE",
        startedAt: started,
        endedAt: new Date(started.getTime() + 12 * 60 * 1000),
        limitSec: 15 * 60,
      },
    });
    sessions.set(day, session.id);
  }

  let rngSeed = 42;
  for (const drill of pending) {
    let p = DEFAULT_BKT.pL0;
    let correctCount = 0;
    const started = new Date(Date.now() - drill.day * 24 * 60 * 60 * 1000);
    started.setUTCHours(15, 0, 0, 0);
    for (let index = 0; index < drill.outcomes.length; index += 1) {
      const correct = drill.outcomes[index]!;
      const before = p;
      const after = bktUpdate(before, correct);
      p = after;
      if (correct) correctCount += 1;
      const generator = GENERATORS.find((item) => item.skillId === drill.skillId)!;
      const item = generateFromKey(generator.key, mulberry32(rngSeed), generator.difficulty);
      rngSeed += 1;
      const selected = correct
        ? item.choices.find((choice) => choice.correct)!
        : item.choices.find((choice) => choice.misconception === drill.prefer) ??
          item.choices.find((choice) => !choice.correct)!;
      const when = new Date(started.getTime() + index * 45 * 1000);
      await prisma.attempt.create({
        data: {
          childId,
          sessionId: sessions.get(drill.day)!,
          skillId: drill.skillId,
          templateKey: item.templateKey,
          reason: "frontier",
          stem: item.stem,
          choicesJson: JSON.stringify(item.choices),
          correctChoiceId: item.correctChoiceId,
          selectedChoiceId: selected.id,
          correct,
          misconception: selected.misconception,
          explanation: selected.explanation,
          difficulty: item.difficulty,
          pMasteryBefore: before,
          pMasteryAfter: after,
          createdAt: when,
          answeredAt: when,
          responseMs: 8000 + index * 300,
        },
      });
    }
    const status = statusFor(p, drill.outcomes.length);
    const reviewDueAt =
      status === "MASTERED"
        ? drill.skillId === "2.OA.B.2"
          ? addDays(new Date(), -1)
          : addDays(new Date(), 3)
        : null;
    await prisma.skillState.upsert({
      where: { childId_skillId: { childId, skillId: drill.skillId } },
      create: {
        childId,
        skillId: drill.skillId,
        pMastery: p,
        attempts: drill.outcomes.length,
        correctCount,
        status,
        inferred: false,
        reviewStreak: status === "MASTERED" ? 2 : 0,
        reviewDueAt,
        lastPracticedAt: started,
      },
      update: { skillId: drill.skillId },
    });
  }

  const states = await prisma.skillState.findMany({ where: { childId } });
  const snapshots: SkillMasterySnapshot[] = states.map((state) => ({
    skillId: state.skillId,
    status: state.status as SkillMasterySnapshot["status"],
    pMastery: state.pMastery,
    attempts: state.attempts,
    reviewDueAt: state.reviewDueAt,
  }));
  const titles = new Map(SKILLS.map((skill) => [skill.id, skill.title]));
  const approved = await prisma.learningPlan.findFirst({
    where: { childId, status: "APPROVED" },
  });
  if (!approved && snapshots.length > 0) {
    const proposal = proposePlan(skillNodes(), snapshots, 3, new Date(), titles);
    await prisma.learningPlan.create({
      data: {
        childId,
        status: "APPROVED",
        skillIds: JSON.stringify(proposal.skillIds),
        note: proposal.note,
        minutesPerDay: 15,
        daysPerWeek: 5,
        approvedAt: new Date(),
      },
    });
  }
  const stall = stallAlert("Riley", skillById("3.NF.A.1")!.title, "3.NF.A.1");
  const ready = readyAlert("Riley", skillById("3.NBT.A.1")!.title, "3.NBT.A.1");
  for (const alert of [stall, ready]) {
    const existing = await prisma.alert.findFirst({
      where: { childId, type: alert.type, skillId: alert.skillId, message: alert.message },
    });
    if (!existing) {
      await prisma.alert.create({
        data: { childId, type: alert.type, skillId: alert.skillId, message: alert.message },
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
