import { Check } from "lucide-react";
import { lessonSteps, visibleStepIndex, type LessonStage } from "@/lib/lesson-data";

export function LessonProgress({ stage }: { stage: LessonStage }) {
  const currentIndex = visibleStepIndex(stage);
  return (
    <ol className="lesson-stage-list three-steps" aria-label="Lesson progress">
      {lessonSteps.map((item, index) => {
        const complete = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li
            key={item.id}
            className={`${complete ? "complete" : ""} ${active ? "active" : ""}`}
            aria-current={active ? "step" : undefined}
          >
            <span className="lesson-stage-dot">{complete ? <Check size={13} /> : index + 1}</span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </span>
          </li>
        );
      })}
    </ol>
  );
}


