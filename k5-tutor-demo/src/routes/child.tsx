import { createFileRoute } from "@tanstack/react-router";
import { ChildLesson } from "@/components/child-lesson";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/child")({
  head: () =>
    pageMeta(
      "Today’s math lesson",
      "One big Start button, then Learn, Practice, and Check. A Review warm-up appears on its own days later.",
    ),
  component: ChildLesson,
});


