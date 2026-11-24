import { MISCONCEPTIONS } from "@/content/misconceptions";
import { intBetween, pickOne, type Rng } from "@/lib/rng";

export type RawChoice = {
  text: string;
  correct: boolean;
  misconception: string | null;
  explanation: string;
};

export type ItemFacts =
  | { kind: "sum"; a: number; b: number }
  | { kind: "diff"; a: number; b: number }
  | { kind: "sum-many"; values: number[] }
  | { kind: "place"; number: number; place: 1 | 10 | 100 | 1000; digit: number }
  | { kind: "expanded"; hundreds: number; tens: number; ones: number }
  | { kind: "money"; quarters: number; dimes: number; nickels: number; pennies: number }
  | { kind: "product"; a: number; b: number }
  | { kind: "two-step"; packs: number; each: number; give: number }
  | { kind: "round"; n: number; place: 10 | 100 }
  | { kind: "fraction"; numerator: number; denominator: number }
  | { kind: "equivalent"; n1: number; d1: number; n2: number; d2: number }
  | { kind: "elapsed"; start: number; end: number }
  | { kind: "times-as-much"; factor: number }
  | { kind: "like-den"; a: number; b: number; den: number };

export type RawItem = {
  stem: string;
  choices: RawChoice[];
  successExplanation: string;
  facts: ItemFacts;
};

export type Generator = {
  key: string;
  skillId: string;
  difficulty: number;
  generate: (rng: Rng) => RawItem;
};

type Distractor = {
  text: string;
  misconception: string;
  explanation: string;
};

function fmt(n: number): string {
  return Math.abs(n) >= 1000 ? n.toLocaleString("en-US") : String(n);
}

function buildItem(
  stem: string,
  correctText: string,
  success: string,
  distractors: Distractor[],
  facts: ItemFacts,
): RawItem {
  const used = new Set<string>([correctText]);
  const chosen: Distractor[] = [];
  for (const distractor of distractors) {
    if (!distractor.text || used.has(distractor.text)) continue;
    if (!MISCONCEPTIONS[distractor.misconception]) {
      throw new Error(`Unknown misconception ${distractor.misconception}`);
    }
    used.add(distractor.text);
    chosen.push(distractor);
    if (chosen.length === 3) break;
  }
  const numeric = Number(correctText.replace(/,/g, "").split(" ")[0]);
  let step = 1;
  while (chosen.length < 3) {
    const fallback = Number.isFinite(numeric)
      ? fmt(numeric + (step % 2 === 0 ? -1 : 1) * Math.ceil(step / 2) * (step > 4 ? 10 : 1))
      : `${correctText} `;
    step += 1;
    if (used.has(fallback) || fallback === correctText) continue;
    used.add(fallback);
    chosen.push({
      text: fallback,
      misconception: "nearby-value",
      explanation: `The answer is ${correctText}. ${fallback} is close, so check the last step again.`,
    });
    if (step > 20) break;
  }
  if (chosen.length < 3) {
    throw new Error(`Not enough distractors for: ${stem}`);
  }
  return {
    stem,
    successExplanation: success,
    facts,
    choices: [
      {
        text: correctText,
        correct: true,
        misconception: null,
        explanation: success,
      },
      ...chosen.slice(0, 3).map((choice) => ({ ...choice, correct: false as const })),
    ],
  };
}

function dropCarry(a: number, b: number): number {
  let result = 0;
  let place = 1;
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    const digit = (x % 10) + (y % 10);
    result += (digit % 10) * place;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
    place *= 10;
  }
  return result;
}

function subSmallerFromLarger(a: number, b: number): number {
  let result = 0;
  let place = 1;
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    result += Math.abs((x % 10) - (y % 10)) * place;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
    place *= 10;
  }
  return result;
}

function pairWithCarry(
  rng: Rng,
  min: number,
  max: number,
  sumMax = Number.POSITIVE_INFINITY,
): [number, number] {
  for (let i = 0; i < 50; i += 1) {
    const a = intBetween(rng, min, max);
    const b = intBetween(rng, min, max);
    if (a + b > sumMax) continue;
    if ((a % 10) + (b % 10) >= 10 && dropCarry(a, b) !== a + b) return [a, b];
  }
  return [28, 17];
}

function pairWithoutCarry(rng: Rng, min: number, max: number): [number, number] {
  for (let i = 0; i < 40; i += 1) {
    const a = intBetween(rng, min, max);
    const b = intBetween(rng, min, max);
    const sum = a + b;
    if ((a % 10) + (b % 10) < 10 && Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10 < 10) {
      return [a, b];
    }
    void sum;
  }
  return [21, 34];
}

function addWithin20(rng: Rng): RawItem {
  const a = intBetween(rng, 4, 11);
  const b = intBetween(rng, 3, 20 - a);
  const sum = a + b;
  const names = pickOne(rng, ["Sam", "Mei", "Luis", "Noor"] as const);
  return buildItem(
    `${names} has ${a} stickers and gets ${b} more. How many stickers now?`,
    fmt(sum),
    `${a} + ${b} = ${sum}. You can count on from ${a}.`,
    [
      {
        text: fmt(sum - 1),
        misconception: "off-by-one",
        explanation: `${a} + ${b} is ${sum}, not ${sum - 1}. The last count got skipped.`,
      },
      {
        text: fmt(sum + 1),
        misconception: "overcount",
        explanation: `${a} + ${b} is ${sum}. That count went one too far.`,
      },
      {
        text: fmt(Math.abs(a - b)),
        misconception: "subtracted-instead",
        explanation: `The stickers are joining, so add. ${a} + ${b} = ${sum}.`,
      },
      {
        text: fmt(a + a),
        misconception: "doubled-one-addend",
        explanation: `Add both amounts: ${a} + ${b} = ${sum}.`,
      },
    ],
    { kind: "sum", a, b },
  );
}

function subWithin20(rng: Rng): RawItem {
  const a = intBetween(rng, 11, 18);
  const b = intBetween(rng, 3, a - 2);
  const diff = a - b;
  return buildItem(
    `There are ${a} grapes. ${b} get eaten. How many are left?`,
    fmt(diff),
    `${a} - ${b} = ${diff}. Start at ${a} and count back ${b}.`,
    [
      {
        text: fmt(diff + 1),
        misconception: "off-by-one",
        explanation: `${a} - ${b} is ${diff}, not ${diff + 1}. Count back one more.`,
      },
      {
        text: fmt(diff - 1),
        misconception: "overcount",
        explanation: `${a} - ${b} is ${diff}. That count went one too far.`,
      },
      {
        text: fmt(a + b),
        misconception: "added-instead",
        explanation: `Grapes were eaten, so subtract. ${a} - ${b} = ${diff}.`,
      },
    ],
    { kind: "diff", a, b },
  );
}

function placeValue(rng: Rng): RawItem {
  let hundreds = 1;
  let tens = 0;
  let ones = 0;
  for (let i = 0; i < 20; i += 1) {
    hundreds = intBetween(rng, 1, 9);
    tens = intBetween(rng, 0, 9);
    ones = intBetween(rng, 0, 9);
    if (hundreds !== tens && hundreds !== ones) break;
  }
  const number = hundreds * 100 + tens * 10 + ones;
  const place = tens === 0 ? "hundreds" : pickOne(rng, ["hundreds", "tens"] as const);
  const digit = place === "hundreds" ? hundreds : tens;
  const value = place === "hundreds" ? hundreds * 100 : tens * 10;
  const shift = place === "hundreds" ? hundreds * 10 : tens * 100;
  const extra = place === "hundreds" ? hundreds * 1000 : tens * 1000;
  return buildItem(
    `In ${fmt(number)}, what is the value of the ${digit}?`,
    fmt(value),
    `The ${digit} is in the ${place} place, so it is worth ${fmt(value)}.`,
    [
      {
        text: fmt(digit),
        misconception: "digit-face-value",
        explanation: `The digit is ${digit}, but in the ${place} place it is worth ${fmt(value)}.`,
      },
      {
        text: fmt(shift),
        misconception: "place-shift",
        explanation: `That uses the wrong place. The ${digit} in the ${place} place is worth ${fmt(value)}.`,
      },
      {
        text: fmt(extra),
        misconception: "extra-zero",
        explanation: `That has an extra zero. The ${digit} in the ${place} place is worth ${fmt(value)}.`,
      },
    ],
    { kind: "place", number, place: place === "hundreds" ? 100 : 10, digit },
  );
}

function expandedForm(rng: Rng): RawItem {
  const hundreds = intBetween(rng, 1, 9);
  const tens = intBetween(rng, 2, 8);
  const ones = intBetween(rng, 1, 9);
  const safeOnes = ones === tens ? ones + (ones < 9 ? 1 : -1) : ones;
  const number = hundreds * 100 + tens * 10 + safeOnes;
  return buildItem(
    `What number is ${hundreds} hundreds, ${tens} tens, and ${safeOnes} ones?`,
    fmt(number),
    `${hundreds * 100} + ${tens * 10} + ${safeOnes} = ${fmt(number)}.`,
    [
      {
        text: fmt(hundreds * 100 + safeOnes),
        misconception: "omitted-place",
        explanation: `The ${tens} tens are worth ${tens * 10}. The number is ${fmt(number)}.`,
      },
      {
        text: fmt(hundreds * 100 + safeOnes * 10 + tens),
        misconception: "transposed-digits",
        explanation: `Tens and ones swapped. ${hundreds} hundreds, ${tens} tens, and ${safeOnes} ones make ${fmt(number)}.`,
      },
      {
        text: fmt(hundreds * 100),
        misconception: "omitted-place",
        explanation: `That is only the hundreds. Add the tens and ones too: ${fmt(number)}.`,
      },
    ],
    { kind: "expanded", hundreds, tens, ones: safeOnes },
  );
}

function addWithin100(rng: Rng): RawItem {
  const [a, b] = pairWithCarry(rng, 16, 60, 100);
  const sum = a + b;
  return buildItem(
    `What is ${a} + ${b}?`,
    fmt(sum),
    `${a} + ${b} = ${sum}. The ones make more than 9, so trade 10 ones for 1 ten.`,
    [
      {
        text: fmt(dropCarry(a, b)),
        misconception: "forgot-regroup",
        explanation: `The ones add past 9. Trade 10 ones for a ten. ${a} + ${b} = ${sum}.`,
      },
      {
        text: fmt(sum + 10),
        misconception: "off-by-ten",
        explanation: `The tens place is one ten too high. ${a} + ${b} = ${sum}.`,
      },
      {
        text: fmt(Math.abs(a - b)),
        misconception: "subtracted-instead",
        explanation: `This problem adds. ${a} + ${b} = ${sum}.`,
      },
    ],
    { kind: "sum", a, b },
  );
}

function addWithin100NoCarry(rng: Rng): RawItem {
  const [a, b] = pairWithoutCarry(rng, 12, 40);
  const sum = a + b;
  return buildItem(
    `What is ${a} + ${b}?`,
    fmt(sum),
    `${a} + ${b} = ${sum}. Add the ones, then the tens. No trade this time.`,
    [
      {
        text: fmt(sum + 10),
        misconception: "spurious-regroup",
        explanation: `The ones do not make a ten, so do not add an extra ten. ${a} + ${b} = ${sum}.`,
      },
      {
        text: fmt(sum - 1),
        misconception: "off-by-one",
        explanation: `${a} + ${b} = ${sum}. The ones are off by one.`,
      },
      {
        text: fmt(Math.abs(a - b)),
        misconception: "subtracted-instead",
        explanation: `Add the numbers. ${a} + ${b} = ${sum}.`,
      },
    ],
    { kind: "sum", a, b },
  );
}

function subWithin100(rng: Rng): RawItem {
  let a = 70;
  let b = 28;
  for (let i = 0; i < 30; i += 1) {
    a = intBetween(rng, 40, 98);
    b = intBetween(rng, 15, a - 8);
    if (a % 10 < b % 10 && subSmallerFromLarger(a, b) !== a - b) break;
  }
  const diff = a - b;
  const smaller = subSmallerFromLarger(a, b);
  return buildItem(
    `What is ${a} - ${b}?`,
    fmt(diff),
    `${a} - ${b} = ${diff}. If the ones are too small, trade a ten for 10 ones first.`,
    [
      {
        text: fmt(smaller),
        misconception: "subtracted-smaller-from-larger",
        explanation: `You cannot just flip the digits. Trade a ten, then subtract. ${a} - ${b} = ${diff}.`,
      },
      {
        text: fmt(diff + 10),
        misconception: "off-by-ten",
        explanation: `The tens are off by one. ${a} - ${b} = ${diff}.`,
      },
      {
        text: fmt(a + b),
        misconception: "added-instead",
        explanation: `This problem subtracts. ${a} - ${b} = ${diff}.`,
      },
    ],
    { kind: "diff", a, b },
  );
}

function addList(rng: Rng): RawItem {
  const values = [intBetween(rng, 10, 30), intBetween(rng, 10, 25), intBetween(rng, 10, 25)];
  const sum = values.reduce((total, value) => total + value, 0);
  const leftOut = sum - values[2]!;
  return buildItem(
    `What is ${values[0]} + ${values[1]} + ${values[2]}?`,
    fmt(sum),
    `${values[0]} + ${values[1]} = ${values[0]! + values[1]!}. Add ${values[2]} more to get ${sum}.`,
    [
      {
        text: fmt(leftOut),
        misconception: "left-out-addend",
        explanation: `All three numbers count. ${values.join(" + ")} = ${sum}.`,
      },
      {
        text: fmt(sum + 10),
        misconception: "off-by-ten",
        explanation: `The total is ${sum}, not ${sum + 10}. Check the tens again.`,
      },
      {
        text: fmt(sum - 1),
        misconception: "off-by-one",
        explanation: `${values.join(" + ")} = ${sum}. The count is one off.`,
      },
    ],
    { kind: "sum-many", values },
  );
}

function addWithin1000(rng: Rng): RawItem {
  const [a, b] = pairWithCarry(rng, 120, 430, 999);
  const sum = a + b;
  return buildItem(
    `What is ${fmt(a)} + ${fmt(b)}?`,
    fmt(sum),
    `${fmt(a)} + ${fmt(b)} = ${fmt(sum)}. Trade when a column makes 10 or more.`,
    [
      {
        text: fmt(dropCarry(a, b)),
        misconception: "forgot-regroup",
        explanation: `A column made more than 9. Trade it to the next place. The sum is ${fmt(sum)}.`,
      },
      {
        text: fmt(sum + 100),
        misconception: "off-by-hundred",
        explanation: `The hundreds are one too high. ${fmt(a)} + ${fmt(b)} = ${fmt(sum)}.`,
      },
      {
        text: fmt(Math.abs(a - b)),
        misconception: "subtracted-instead",
        explanation: `This problem adds. ${fmt(a)} + ${fmt(b)} = ${fmt(sum)}.`,
      },
    ],
    { kind: "sum", a, b },
  );
}

function subWithin1000(rng: Rng): RawItem {
  let a = 620;
  let b = 180;
  for (let i = 0; i < 30; i += 1) {
    a = intBetween(rng, 320, 860);
    b = intBetween(rng, 140, a - 40);
    if (subSmallerFromLarger(a, b) !== a - b) break;
  }
  const diff = a - b;
  return buildItem(
    `What is ${fmt(a)} - ${fmt(b)}?`,
    fmt(diff),
    `${fmt(a)} - ${fmt(b)} = ${fmt(diff)}. Trade when a column does not have enough.`,
    [
      {
        text: fmt(subSmallerFromLarger(a, b)),
        misconception: "subtracted-smaller-from-larger",
        explanation: `Do not flip the digits in a column. Trade from the next place. ${fmt(a)} - ${fmt(b)} = ${fmt(diff)}.`,
      },
      {
        text: fmt(diff + 100),
        misconception: "off-by-hundred",
        explanation: `The hundreds are off. ${fmt(a)} - ${fmt(b)} = ${fmt(diff)}.`,
      },
      {
        text: fmt(a + b),
        misconception: "added-instead",
        explanation: `This problem subtracts. ${fmt(a)} - ${fmt(b)} = ${fmt(diff)}.`,
      },
    ],
    { kind: "diff", a, b },
  );
}

function multiDigitAdd(rng: Rng): RawItem {
  const [a, b] = pairWithCarry(rng, 1200, 4300);
  const sum = a + b;
  return buildItem(
    `What is ${fmt(a)} + ${fmt(b)}?`,
    fmt(sum),
    `${fmt(a)} + ${fmt(b)} = ${fmt(sum)}. Add ones, then tens, then hundreds, then thousands, and trade when you need to.`,
    [
      {
        text: fmt(dropCarry(a, b)),
        misconception: "forgot-regroup",
        explanation: `One column made 10 or more. Trade it forward. The sum is ${fmt(sum)}.`,
      },
      {
        text: fmt(sum + 100),
        misconception: "off-by-hundred",
        explanation: `One place is 100 too big. ${fmt(a)} + ${fmt(b)} = ${fmt(sum)}.`,
      },
      {
        text: fmt(a - b > 0 ? a - b : b - a),
        misconception: "subtracted-instead",
        explanation: `This problem adds. ${fmt(a)} + ${fmt(b)} = ${fmt(sum)}.`,
      },
    ],
    { kind: "sum", a, b },
  );
}

function money(rng: Rng): RawItem {
  const quarters = intBetween(rng, 1, 3);
  const dimes = intBetween(rng, 0, 3);
  const nickels = intBetween(rng, 0, 2);
  const pennies = intBetween(rng, 0, 4);
  const cents = quarters * 25 + dimes * 10 + nickels * 5 + pennies;
  const quarterWrong = cents - quarters * 5;
  const dimeWrong = dimes > 0 ? cents - dimes * 5 : cents - 10;
  const leftOut = cents - quarters * 25;
  const coinCount = quarters + dimes + nickels + pennies;
  const parts = [
    `${quarters} quarter${quarters === 1 ? "" : "s"}`,
    dimes ? `${dimes} dime${dimes === 1 ? "" : "s"}` : null,
    nickels ? `${nickels} nickel${nickels === 1 ? "" : "s"}` : null,
    pennies ? `${pennies} penn${pennies === 1 ? "y" : "ies"}` : null,
  ].filter(Boolean);
  return buildItem(
    `How many cents are ${parts.join(", ")}?`,
    `${cents} cents`,
    `A quarter is 25 cents. ${parts.join(" + ")} = ${cents} cents.`,
    [
      {
        text: `${quarterWrong} cents`,
        misconception: "quarter-as-20",
        explanation: `A quarter is 25 cents, not 20. The total is ${cents} cents.`,
      },
      {
        text: `${dimeWrong} cents`,
        misconception: "dime-as-nickel",
        explanation: `A dime is 10 cents, not 5. The total is ${cents} cents.`,
      },
      {
        text: `${leftOut} cents`,
        misconception: "left-out-coin",
        explanation: `The quarters still count. ${quarters} quarter${quarters === 1 ? " is" : "s are"} ${quarters * 25} cents. The total is ${cents} cents.`,
      },
      {
        text: `${coinCount * 10} cents`,
        misconception: "counted-all-as-dimes",
        explanation: `The coins are not all dimes. Count each kind, then add. The total is ${cents} cents.`,
      },
    ],
    { kind: "money", quarters, dimes, nickels, pennies },
  );
}

function equalGroups(rng: Rng): RawItem {
  const groups = intBetween(rng, 2, 6);
  const size = intBetween(rng, 2, 6);
  const product = groups * size;
  const thing = pickOne(rng, ["apples", "shells", "blocks", "stickers"] as const);
  return buildItem(
    `There are ${groups} bags with ${size} ${thing} in each bag. How many ${thing} are there?`,
    fmt(product),
    `${groups} groups of ${size} is ${product}. You can add ${size} that many times.`,
    [
      {
        text: fmt(groups + size),
        misconception: "added-factors",
        explanation: `The bags are equal groups, so multiply. ${groups} × ${size} = ${product}.`,
      },
      {
        text: fmt(Number(`${groups}${size}`)),
        misconception: "concat-factors",
        explanation: `Write a product, not the digits side by side. ${groups} × ${size} = ${product}.`,
      },
      {
        text: fmt((groups - 1) * size),
        misconception: "one-group-short",
        explanation: `That left out one bag. ${groups} groups of ${size} is ${product}.`,
      },
    ],
    { kind: "product", a: groups, b: size },
  );
}

function multFacts(rng: Rng, pairs: readonly (readonly [number, number])[]): RawItem {
  const [a, b] = pickOne(rng, pairs);
  const product = a * b;
  const neighbor = b < 9 ? a * (b + 1) : a * (b - 1);
  return buildItem(
    `What is ${a} × ${b}?`,
    fmt(product),
    `${a} × ${b} = ${product}. That is ${a} added ${b} times.`,
    [
      {
        text: fmt(neighbor),
        misconception: "neighbor-fact",
        explanation: `That is a nearby fact. ${a} × ${b} = ${product}.`,
      },
      {
        text: fmt(a + b),
        misconception: "added-factors",
        explanation: `Multiply, don't add the factors. ${a} × ${b} = ${product}.`,
      },
      {
        text: fmt((a - 1) * b),
        misconception: "one-group-short",
        explanation: `That is one group too few. ${a} × ${b} = ${product}.`,
      },
    ],
    { kind: "product", a, b },
  );
}

function multWord(rng: Rng): RawItem {
  const groups = intBetween(rng, 3, 8);
  const size = pickOne(rng, [2, 3, 4, 5, 10] as const);
  const product = groups * size;
  return buildItem(
    `A garden has ${groups} rows of tomato plants. Each row has ${size} plants. How many plants are in the garden?`,
    fmt(product),
    `${groups} rows of ${size} is ${groups} × ${size} = ${product}.`,
    [
      {
        text: fmt(groups + size),
        misconception: "added-factors",
        explanation: `Rows of equal plants means multiply. ${groups} × ${size} = ${product}.`,
      },
      {
        text: fmt(product - size),
        misconception: "one-group-short",
        explanation: `One row got left out. ${groups} × ${size} = ${product}.`,
      },
      {
        text: fmt(Number(`${groups}${size}`)),
        misconception: "concat-factors",
        explanation: `${groups} × ${size} is ${product}, not those digits written together.`,
      },
    ],
    { kind: "product", a: groups, b: size },
  );
}

function twoStep(rng: Rng): RawItem {
  const packs = intBetween(rng, 2, 5);
  const each = pickOne(rng, [4, 5, 10] as const);
  const total = packs * each;
  const give = intBetween(rng, 2, Math.max(2, total - 2));
  const left = total - give;
  return buildItem(
    `Priya has ${packs} packs of pencils with ${each} pencils in each pack. She gives ${give} pencils to a friend. How many pencils does she have left?`,
    fmt(left),
    `First ${packs} × ${each} = ${total}. Then ${total} - ${give} = ${left}.`,
    [
      {
        text: fmt(total),
        misconception: "stopped-early",
        explanation: `That is only the first step. She gives some away: ${total} - ${give} = ${left}.`,
      },
      {
        text: fmt(total + give),
        misconception: "wrong-second-step",
        explanation: `Giving pencils away means subtract. ${total} - ${give} = ${left}.`,
      },
      {
        text: fmt(packs + each + give),
        misconception: "added-all-numbers",
        explanation: `Don't add every number in the story. Multiply the packs, then subtract. The answer is ${left}.`,
      },
    ],
    { kind: "two-step", packs, each, give },
  );
}

function roundTo(n: number, place: 10 | 100): number {
  return Math.round(n / place) * place;
}

function rounding(rng: Rng, place: 10 | 100): RawItem {
  let n = place === 10 ? 64 : 260;
  for (let i = 0; i < 20; i += 1) {
    n = place === 10 ? intBetween(rng, 21, 89) : intBetween(rng, 120, 880);
    const digit = Math.floor(n / (place / 10)) % 10;
    if (digit !== 0 && digit !== 5) break;
  }
  const rounded = roundTo(n, place);
  const other = rounded > n ? rounded - place : rounded + place;
  const label = place === 10 ? "ten" : "hundred";
  return buildItem(
    `Round ${fmt(n)} to the nearest ${label}.`,
    fmt(rounded),
    `${fmt(n)} is closer to ${fmt(rounded)} than to ${fmt(other)}.`,
    [
      {
        text: fmt(other),
        misconception: n % place < place / 2 ? "always-round-up" : "rounded-wrong-way",
        explanation: `Look at the next digit. ${fmt(n)} rounds to ${fmt(rounded)}.`,
      },
      {
        text: fmt(n),
        misconception: "did-not-round",
        explanation: `The number still needs to move to the nearest ${label}: ${fmt(rounded)}.`,
      },
      {
        text: fmt(Math.floor(n / place)),
        misconception: "truncated-place",
        explanation: `That dropped the rest of the number. ${fmt(n)} rounds to ${fmt(rounded)}.`,
      },
    ],
    { kind: "round", n, place },
  );
}

function fractionShaded(rng: Rng): RawItem {
  const denominator = pickOne(rng, [2, 3, 4, 6, 8] as const);
  const numerator = intBetween(rng, 1, denominator - 1);
  const correct = `${numerator}/${denominator}`;
  const unshaded = denominator - numerator;
  return buildItem(
    `A bar is split into ${denominator} equal parts. ${numerator} ${numerator === 1 ? "part is" : "parts are"} shaded. What fraction is shaded?`,
    correct,
    `${numerator} shaded part${numerator === 1 ? "" : "s"} out of ${denominator} equal parts is ${correct}.`,
    [
      {
        text: `${denominator}/${numerator}`,
        misconception: "inverted-fraction",
        explanation: `The bottom is the whole, ${denominator}. The top is the shaded part, ${numerator}. That is ${correct}.`,
      },
      {
        text: unshaded === numerator ? `${numerator}/${denominator + 1}` : `${numerator}/${unshaded}`,
        misconception: "part-part-confusion",
        explanation: `Compare the shaded parts to the whole bar, not to the unshaded parts. The fraction is ${correct}.`,
      },
      {
        text: `${denominator}/${denominator}`,
        misconception: "counted-all-parts",
        explanation: `That would mean the whole bar is shaded. Only ${numerator} of ${denominator} parts are shaded: ${correct}.`,
      },
    ],
    { kind: "fraction", numerator, denominator },
  );
}

function numberLine(rng: Rng): RawItem {
  const denominator = pickOne(rng, [2, 3, 4] as const);
  const numerator = intBetween(rng, 1, denominator - 1);
  const correct = `${numerator}/${denominator}`;
  const neighbor = numerator === 1 ? numerator + 1 : numerator - 1;
  const ordinal = ["", "first", "second", "third"][numerator] ?? `${numerator}th`;
  return buildItem(
    `A number line from 0 to 1 is split into ${denominator} equal parts. A dot sits on the ${ordinal} mark after 0. Which fraction is the dot?`,
    correct,
    `Each jump is 1/${denominator}. The ${ordinal} mark is ${correct}.`,
    [
      {
        text: `${neighbor}/${denominator}`,
        misconception: "off-by-one-tick",
        explanation: `Count the jumps from 0 again. The ${ordinal} mark is ${correct}.`,
      },
      {
        text: `${numerator}/${numerator === 1 ? denominator + 1 : numerator}`,
        misconception: "wrong-denominator",
        explanation: `The line has ${denominator} equal parts, so the bottom number is ${denominator}. The dot is ${correct}.`,
      },
      {
        text: "1",
        misconception: "counted-all-parts",
        explanation: `1 would be the end of the line. The dot is still between 0 and 1, at ${correct}.`,
      },
    ],
    { kind: "fraction", numerator, denominator },
  );
}

const EQUIV: readonly (readonly [number, number, number, number])[] = [
  [1, 2, 2, 4],
  [1, 2, 4, 8],
  [1, 3, 2, 6],
  [2, 3, 4, 6],
  [1, 4, 2, 8],
  [3, 4, 6, 8],
  [2, 4, 1, 2],
];

function equivalent(rng: Rng): RawItem {
  const [n1, d1, n2, d2] = pickOne(rng, EQUIV);
  const correct = `${n2}/${d2}`;
  return buildItem(
    `Which fraction is equal to ${n1}/${d1}?`,
    correct,
    `${n1}/${d1} and ${n2}/${d2} name the same amount of the whole.`,
    [
      {
        text: `${n1}/${d2}`,
        misconception: "same-numerator",
        explanation: `The bottom changed, so the top has to change too. ${n1}/${d1} = ${correct}.`,
      },
      {
        text: `${d2}/${n2}`,
        misconception: "inverted-fraction",
        explanation: `Don't flip the fraction. ${n1}/${d1} = ${correct}.`,
      },
      {
        text: `${n1 + 1}/${d1 + 1}`,
        misconception: "nearby-value",
        explanation: `Adding 1 to both numbers does not keep the same amount. ${n1}/${d1} = ${correct}.`,
      },
    ],
    { kind: "equivalent", n1, d1, n2, d2 },
  );
}

function elapsed(rng: Rng): RawItem {
  const start = intBetween(rng, 1, 6);
  const hours = intBetween(rng, 2, 4);
  const end = start + hours;
  return buildItem(
    `A game starts at ${start}:00 and ends at ${end}:00. How many hours long is the game?`,
    `${hours} hours`,
    `From ${start}:00 to ${end}:00 is ${hours} hours. Count the jumps, not the numbers on both ends.`,
    [
      {
        text: `${hours + 1} hours`,
        misconception: "counted-endpoints",
        explanation: `Counting both clock numbers counts one hour too many. The game is ${hours} hours long.`,
      },
      {
        text: `${start + end} hours`,
        misconception: "added-clock-numbers",
        explanation: `Don't add ${start} and ${end}. Find the time between them: ${hours} hours.`,
      },
      {
        text: `${hours - 1} hours`,
        misconception: "off-by-one",
        explanation: `From ${start}:00 to ${end}:00 is ${hours} hours, not ${hours - 1}.`,
      },
    ],
    { kind: "elapsed", start, end },
  );
}

function tenTimes(rng: Rng): RawItem {
  const digit = intBetween(rng, 2, 9);
  return buildItem(
    `The ${digit} in ${digit}00 is how many times the ${digit} in ${digit}0?`,
    "10 times",
    `The ${digit} in ${digit}0 is worth ${digit * 10}. The ${digit} in ${digit}00 is worth ${digit * 100}. That is 10 times as much.`,
    [
      {
        text: "100 times",
        misconception: "times-100",
        explanation: `One place to the left is 10 times, not 100 times.`,
      },
      {
        text: String(digit),
        misconception: "same-digit",
        explanation: `The digits match, but the places do not. The hundreds place is 10 times the tens place.`,
      },
      {
        text: "2 times",
        misconception: "place-distance",
        explanation: `The places are next to each other in value by 10, not by how far the zeros look.`,
      },
    ],
    { kind: "times-as-much", factor: 10 },
  );
}

function tenTimesNumber(rng: Rng): RawItem {
  const base = pickOne(rng, [4, 7, 30, 40, 200] as const);
  return buildItem(
    `What number is 10 times as much as ${fmt(base)}?`,
    fmt(base * 10),
    `10 times ${fmt(base)} is ${fmt(base * 10)}. Each digit moves one place to the left.`,
    [
      {
        text: fmt(base * 100),
        misconception: "times-100",
        explanation: `10 times is one zero, not two. 10 × ${fmt(base)} = ${fmt(base * 10)}.`,
      },
      {
        text: fmt(base + 10),
        misconception: "added-instead",
        explanation: `Times means multiply. 10 × ${fmt(base)} = ${fmt(base * 10)}.`,
      },
      {
        text: fmt(base),
        misconception: "same-digit",
        explanation: `The number has to grow. 10 × ${fmt(base)} = ${fmt(base * 10)}.`,
      },
    ],
    { kind: "product", a: base, b: 10 },
  );
}

function likeDenominators(rng: Rng): RawItem {
  const den = pickOne(rng, [3, 4, 5, 6, 8] as const);
  const a = intBetween(rng, 1, den - 2);
  const b = intBetween(rng, 1, den - a);
  const sum = a + b;
  const correct = sum === den ? "1" : `${sum}/${den}`;
  const multiplied = a * b === sum ? `${sum + 1}/${den}` : `${a * b}/${den}`;
  return buildItem(
    `What is ${a}/${den} + ${b}/${den}?`,
    correct,
    sum === den
      ? `${a}/${den} + ${b}/${den} = ${den}/${den}, which is 1 whole.`
      : `The parts are the same size, so add the tops: ${a} + ${b} = ${sum}. The fraction is ${correct}.`,
    [
      {
        text: `${sum}/${den * 2}`,
        misconception: "added-denominators",
        explanation: `When the bottoms match, add only the tops. The bottom stays ${den}. The sum is ${correct}.`,
      },
      {
        text: `${a}/${den}`,
        misconception: "ignored-numerator",
        explanation: `Both fractions count. ${a} + ${b} = ${sum}, so the sum is ${correct}.`,
      },
      {
        text: multiplied,
        misconception: "added-instead",
        explanation: `Add the tops. Do not multiply them. The sum is ${correct}.`,
      },
    ],
    { kind: "like-den", a, b, den },
  );
}

const EASY_FACTS: readonly (readonly [number, number])[] = [
  [2, 2],
  [2, 3],
  [2, 4],
  [2, 5],
  [2, 6],
  [2, 8],
  [5, 2],
  [5, 3],
  [5, 4],
  [5, 6],
  [5, 7],
  [10, 2],
  [10, 3],
  [10, 4],
  [10, 6],
  [3, 2],
  [4, 2],
];

const HARDER_FACTS: readonly (readonly [number, number])[] = [
  [3, 4],
  [3, 6],
  [3, 7],
  [4, 4],
  [4, 5],
  [4, 6],
  [4, 7],
  [6, 3],
  [6, 4],
  [7, 3],
  [8, 3],
];

export const GENERATORS: Generator[] = [
  { key: "add-within-20", skillId: "2.OA.B.2", difficulty: 0.28, generate: addWithin20 },
  { key: "sub-within-20", skillId: "2.OA.B.2", difficulty: 0.36, generate: subWithin20 },
  { key: "place-value-digit", skillId: "2.NBT.A.1", difficulty: 0.34, generate: placeValue },
  { key: "expanded-form", skillId: "2.NBT.A.3", difficulty: 0.4, generate: expandedForm },
  { key: "add-within-100", skillId: "2.NBT.B.5", difficulty: 0.48, generate: addWithin100 },
  { key: "add-within-100-plain", skillId: "2.NBT.B.5", difficulty: 0.3, generate: addWithin100NoCarry },
  { key: "sub-within-100", skillId: "2.NBT.B.5", difficulty: 0.52, generate: subWithin100 },
  { key: "add-two-digit-list", skillId: "2.NBT.B.6", difficulty: 0.5, generate: addList },
  { key: "add-within-1000", skillId: "2.NBT.B.7", difficulty: 0.55, generate: addWithin1000 },
  { key: "sub-within-1000", skillId: "2.NBT.B.7", difficulty: 0.62, generate: subWithin1000 },
  { key: "money-cents", skillId: "2.MD.C.8", difficulty: 0.45, generate: money },
  { key: "equal-groups", skillId: "3.OA.A.1", difficulty: 0.38, generate: equalGroups },
  {
    key: "facts-2-5-10",
    skillId: "3.OA.C.7",
    difficulty: 0.35,
    generate: (rng) => multFacts(rng, EASY_FACTS),
  },
  {
    key: "facts-3-4",
    skillId: "3.OA.C.7",
    difficulty: 0.58,
    generate: (rng) => multFacts(rng, HARDER_FACTS),
  },
  { key: "mult-word", skillId: "3.OA.A.3", difficulty: 0.5, generate: multWord },
  { key: "two-step", skillId: "3.OA.D.8", difficulty: 0.66, generate: twoStep },
  { key: "round-10", skillId: "3.NBT.A.1", difficulty: 0.42, generate: (rng) => rounding(rng, 10) },
  { key: "round-100", skillId: "3.NBT.A.1", difficulty: 0.56, generate: (rng) => rounding(rng, 100) },
  { key: "fluent-add-1000", skillId: "3.NBT.A.2", difficulty: 0.5, generate: addWithin1000 },
  { key: "fluent-sub-1000", skillId: "3.NBT.A.2", difficulty: 0.6, generate: subWithin1000 },
  { key: "fraction-shaded", skillId: "3.NF.A.1", difficulty: 0.4, generate: fractionShaded },
  { key: "fraction-line", skillId: "3.NF.A.2", difficulty: 0.52, generate: numberLine },
  { key: "equivalent-simple", skillId: "3.NF.A.3", difficulty: 0.48, generate: equivalent },
  { key: "elapsed-hours", skillId: "3.MD.A.1", difficulty: 0.36, generate: elapsed },
  { key: "ten-times-digit", skillId: "4.NBT.A.1", difficulty: 0.55, generate: tenTimes },
  { key: "ten-times-number", skillId: "4.NBT.A.1", difficulty: 0.4, generate: tenTimesNumber },
  { key: "multi-digit-add", skillId: "4.NBT.B.4", difficulty: 0.64, generate: multiDigitAdd },
  { key: "like-denominators", skillId: "4.NF.B.3", difficulty: 0.46, generate: likeDenominators },
];

export function generatorByKey(key: string): Generator | undefined {
  return GENERATORS.find((generator) => generator.key === key);
}

export function generatorsForSkill(skillId: string): Generator[] {
  return GENERATORS.filter((generator) => generator.skillId === skillId);
}
