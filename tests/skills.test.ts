import { describe, expect, it } from "vitest";
import { SKILLS } from "@/content/skills";

describe("skill graph", () => {
  it("is a DAG of known Common Core codes with real prerequisites", () => {
    const ids = new Set(SKILLS.map((skill) => skill.id));
    expect(ids.size).toBe(SKILLS.length);
    for (const skill of SKILLS) {
      expect(skill.id).toMatch(/^[2-4]\.(OA|NBT|NF|MD)\./);
      for (const prereq of skill.prereqIds) expect(ids.has(prereq)).toBe(true);
      expect(skill.prereqIds.includes(skill.id)).toBe(false);
    }

    const visiting = new Set<string>();
    const visited = new Set<string>();
    const byId = new Map(SKILLS.map((skill) => [skill.id, skill]));
    function walk(id: string) {
      if (visited.has(id)) return;
      if (visiting.has(id)) throw new Error(`Cycle at ${id}`);
      visiting.add(id);
      for (const prereq of byId.get(id)?.prereqIds ?? []) walk(prereq);
      visiting.delete(id);
      visited.add(id);
    }
    for (const skill of SKILLS) walk(skill.id);
  });
});
