export type Misconception = {
  id: string;
  /** Plain language for the parent dashboard and weekly report. */
  parent: string;
};

export const MISCONCEPTIONS: Record<string, Misconception> = {
  "off-by-one": {
    id: "off-by-one",
    parent: "The count is one step off",
  },
  overcount: {
    id: "overcount",
    parent: "Counted one too many",
  },
  "added-instead": {
    id: "added-instead",
    parent: "Added when the problem asks for something else",
  },
  "subtracted-instead": {
    id: "subtracted-instead",
    parent: "Subtracted when the problem asks to add",
  },
  "doubled-one-addend": {
    id: "doubled-one-addend",
    parent: "Added one number to itself",
  },
  "forgot-regroup": {
    id: "forgot-regroup",
    parent: "Did not trade when a column made ten or more",
  },
  "spurious-regroup": {
    id: "spurious-regroup",
    parent: "Traded a ten when the column did not need it",
  },
  "off-by-ten": {
    id: "off-by-ten",
    parent: "The tens place is off by one ten",
  },
  "off-by-hundred": {
    id: "off-by-hundred",
    parent: "The hundreds place is off by one hundred",
  },
  "left-out-addend": {
    id: "left-out-addend",
    parent: "Left out one of the numbers being added",
  },
  "subtracted-smaller-from-larger": {
    id: "subtracted-smaller-from-larger",
    parent: "Subtracted the smaller digit from the larger in a column instead of regrouping",
  },
  "digit-face-value": {
    id: "digit-face-value",
    parent: "Read the digit itself instead of its place value",
  },
  "place-shift": {
    id: "place-shift",
    parent: "Gave the digit the value of a neighboring place",
  },
  "extra-zero": {
    id: "extra-zero",
    parent: "Wrote too many zeros for the place",
  },
  "omitted-place": {
    id: "omitted-place",
    parent: "Left a place out of the number",
  },
  "transposed-digits": {
    id: "transposed-digits",
    parent: "Swapped two digits",
  },
  "quarter-as-20": {
    id: "quarter-as-20",
    parent: "Counted a quarter as 20 cents",
  },
  "dime-as-nickel": {
    id: "dime-as-nickel",
    parent: "Counted a dime as 5 cents",
  },
  "left-out-coin": {
    id: "left-out-coin",
    parent: "Left a coin out of the total",
  },
  "counted-all-as-dimes": {
    id: "counted-all-as-dimes",
    parent: "Counted every coin as a dime",
  },
  "added-factors": {
    id: "added-factors",
    parent: "Added the group size and the number of groups",
  },
  "concat-factors": {
    id: "concat-factors",
    parent: "Wrote the two factors side by side",
  },
  "one-group-short": {
    id: "one-group-short",
    parent: "Left out one of the equal groups",
  },
  "neighbor-fact": {
    id: "neighbor-fact",
    parent: "Used a neighboring multiplication fact",
  },
  "stopped-early": {
    id: "stopped-early",
    parent: "Stopped after the first step of a two-step problem",
  },
  "wrong-second-step": {
    id: "wrong-second-step",
    parent: "Used the wrong operation on the second step",
  },
  "added-all-numbers": {
    id: "added-all-numbers",
    parent: "Added every number in the story",
  },
  "always-round-up": {
    id: "always-round-up",
    parent: "Rounded up even though the digit was less than 5",
  },
  "rounded-wrong-way": {
    id: "rounded-wrong-way",
    parent: "Rounded in the wrong direction",
  },
  "did-not-round": {
    id: "did-not-round",
    parent: "Left the number unrounded",
  },
  "truncated-place": {
    id: "truncated-place",
    parent: "Kept only the leading digit",
  },
  "inverted-fraction": {
    id: "inverted-fraction",
    parent: "Swapped the numerator and the denominator",
  },
  "part-part-confusion": {
    id: "part-part-confusion",
    parent: "Compared shaded parts to unshaded parts instead of to the whole",
  },
  "counted-all-parts": {
    id: "counted-all-parts",
    parent: "Used the whole as the numerator",
  },
  "off-by-one-tick": {
    id: "off-by-one-tick",
    parent: "Landed on a neighboring mark on the number line",
  },
  "wrong-denominator": {
    id: "wrong-denominator",
    parent: "Used the wrong number of equal parts as the denominator",
  },
  "same-numerator": {
    id: "same-numerator",
    parent: "Kept the numerator and only changed the denominator",
  },
  "added-denominators": {
    id: "added-denominators",
    parent: "Added the denominators as well as the numerators",
  },
  "ignored-numerator": {
    id: "ignored-numerator",
    parent: "Left out one of the numerators",
  },
  "counted-endpoints": {
    id: "counted-endpoints",
    parent: "Counted the clock hours at both ends instead of the time between them",
  },
  "added-clock-numbers": {
    id: "added-clock-numbers",
    parent: "Added the clock numbers instead of finding the time between them",
  },
  "times-100": {
    id: "times-100",
    parent: "Said 100 times instead of 10 times for the next place",
  },
  "same-digit": {
    id: "same-digit",
    parent: "Compared the digits instead of their place values",
  },
  "place-distance": {
    id: "place-distance",
    parent: "Counted how many places apart the digits are",
  },
  "nearby-value": {
    id: "nearby-value",
    parent: "Chose a nearby value",
  },
};

export function misconceptionLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  return MISCONCEPTIONS[id]?.parent ?? id;
}
