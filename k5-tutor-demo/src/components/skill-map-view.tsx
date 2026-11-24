import { CheckCircle2, Circle, CircleDashed, Lightbulb, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/components/demo-provider";
import { domains, type SkillStatus } from "@/lib/demo-data";
import { skillStatus } from "@/lib/progress-data";
import type { PickedSkill } from "@/components/progress-charts";

export function Status({ state }: { state: string }) {
  const icons = { Mastered: CheckCircle2, Practicing: Sprout, "Needs teaching": Lightbulb, "Not started": CircleDashed };
  const Icon = icons[state as SkillStatus] || Circle;
  return (
    <span className={`status ${state === "Mastered" ? "status-mastered" : state === "Practicing" ? "status-practicing" : state === "Needs teaching" ? "status-needs" : "status-not"}`}>
      <Icon size={13} />
      {state}
    </span>
  );
}

/** Full six-domain skill grid. Statuses come from the same helper as every Progress chart. */
export function SkillMapView({ onPick }: { onPick: (skill: PickedSkill) => void }) {
  const { state } = useDemo();
  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-5">
        {["Mastered", "Practicing", "Needs teaching", "Not started"].map((s) => <Status key={s} state={s} />)}
      </div>
      <div className="domain-grid">
        {domains.map((domain, d) => (
          <section className="domain-panel" key={domain.name}>
            <h3>{domain.name}</h3>
            {domain.skills.map((name, i) => {
              const status = skillStatus(state.child, d, i, state.lesson);
              return (
                <Button variant="ghost" className="skill-button" key={name} onClick={() => onPick({ name, status, domain: domain.name })}>
                  <span>{name}</span>
                  <Status state={status} />
                </Button>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}


