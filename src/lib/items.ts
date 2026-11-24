import {
  generatorByKey,
  generatorsForSkill,
  type Generator,
  type RawItem,
} from "@/content/generators";
import { targetDifficulty } from "@/lib/elo";
import { shuffle, type Rng } from "@/lib/rng";

export type PublicChoice = {
  id: string;
  text: string;
};

export type StoredChoice = PublicChoice & {
  correct: boolean;
  misconception: string | null;
  explanation: string;
};

export type BuiltItem = {
  templateKey: string;
  skillId: string;
  stem: string;
  choices: StoredChoice[];
  correctChoiceId: string;
  successExplanation: string;
  difficulty: number;
};

export function assertValidItem(item: RawItem): void {
  if (!item.stem.trim()) throw new Error("Empty stem");
  if (!item.successExplanation.trim()) throw new Error("Empty success explanation");
  if (item.choices.length !== 4) throw new Error(`Expected 4 choices, got ${item.choices.length}`);
  const correct = item.choices.filter((choice) => choice.correct);
  if (correct.length !== 1) throw new Error("Expected exactly one correct choice");
  const texts = new Set(item.choices.map((choice) => choice.text));
  if (texts.size !== 4) throw new Error(`Duplicate choice text: ${item.stem}`);
  for (const choice of item.choices) {
    if (!choice.text.trim()) throw new Error("Blank choice");
    if (!choice.explanation.trim()) throw new Error("Blank explanation");
    if (choice.correct && choice.misconception) throw new Error("Correct choice has a misconception");
    if (!choice.correct && !choice.misconception) throw new Error("Distractor missing misconception");
  }
}

export function materialize(raw: RawItem, template: Generator, rng: Rng): BuiltItem {
  assertValidItem(raw);
  const shuffled = shuffle(rng, raw.choices);
  const choices: StoredChoice[] = shuffled.map((choice, index) => ({
    id: `c${index + 1}`,
    text: choice.text,
    correct: choice.correct,
    misconception: choice.misconception,
    explanation: choice.explanation,
  }));
  const correct = choices.find((choice) => choice.correct);
  if (!correct) throw new Error("Missing correct choice after shuffle");
  return {
    templateKey: template.key,
    skillId: template.skillId,
    stem: raw.stem,
    choices,
    correctChoiceId: correct.id,
    successExplanation: raw.successExplanation,
    difficulty: template.difficulty,
  };
}

export function generateFromKey(key: string, rng: Rng, difficulty?: number): BuiltItem {
  const template = generatorByKey(key);
  if (!template) throw new Error(`Unknown template ${key}`);
  const raw = template.generate(rng);
  const item = materialize(raw, template, rng);
  if (difficulty !== undefined) item.difficulty = difficulty;
  return item;
}

export function pickTemplateKey(
  skillId: string,
  difficulties: { key: string; difficulty: number }[],
  pMastery: number,
  rng: Rng,
): string {
  const known = new Map(difficulties.map((item) => [item.key, item.difficulty]));
  const pool = generatorsForSkill(skillId).map((generator) => ({
    key: generator.key,
    difficulty: known.get(generator.key) ?? generator.difficulty,
  }));
  if (pool.length === 0) throw new Error(`No templates for ${skillId}`);
  const target = targetDifficulty(pMastery);
  const ranked = [...pool].sort(
    (a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target),
  );
  const best = Math.abs(ranked[0]!.difficulty - target);
  const near = ranked.filter((item) => Math.abs(item.difficulty - target) <= best + 0.12);
  return near[Math.floor(rng() * near.length)]!.key;
}

export function toPublicChoices(choices: StoredChoice[]): PublicChoice[] {
  return choices.map((choice) => ({ id: choice.id, text: choice.text }));
}
