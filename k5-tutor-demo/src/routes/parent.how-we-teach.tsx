import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { ParentLayout, PageHeading } from "@/components/app-shell";
import { LessonProgress } from "@/components/lesson-progress";
import { teachingSources } from "@/lib/lesson-data";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/parent/how-we-teach")({
  head: () =>
    pageMeta(
      "How we teach",
      "Five evidence-based design principles behind K-5 Tutor’s Learn, Practice, and Check lessons.",
    ),
  component: HowWeTeach,
});

function HowWeTeach() {
  return (
    <ParentLayout>
      <PageHeading
        title="How we teach"
        subtitle="Clear teaching for your child. Full visibility for you."
      />
      <div className="bg-leaf-soft rounded-md p-5 mb-7 flex gap-3">
        <ShieldCheck className="text-leaf shrink-0" />
        <p className="text-sm leading-7">
          <strong>You set the time. K-5 Tutor does the teaching. You see everything.</strong> Every lesson is animated and spoken aloud in a natural voice, with captions available. When
          your child gets stuck, K-5 Tutor re-teaches with a different example first. A short
          Review warm-up appears on its own a few days after each Check.
        </p>
      </div>
      <LessonProgress stage="teach" />
      <p className="text-xs text-muted-foreground mt-3">Mastery rule in our pilot: 4/5 on the Check, then 3/3 on the Review warm-up.</p>
      <div className="space-y-4 mt-7">
        {teachingSources.map((item, index) => (
          <article className="panel teaching-principle" key={item.title}>
            <span className="principle-number">0{index + 1}</span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.principle}</p>
              <a href={item.url} target="_blank" rel="noreferrer">
                {item.source}
                <ExternalLink size={13} />
              </a>
            </div>
          </article>
        ))}
      </div>
      <section className="panel mt-7 bg-sunshine-soft">
        <h2 className="text-xl font-bold">Every format belongs to every child.</h2>
        <p className="text-sm leading-7 mt-3">
          Children can replay the visuals, try with blocks, or hear the narration again. We do not
          use learning-style labels or restrict formats based on a quiz. These sources inform the
          demo’s design; the demo itself is not a validated curriculum or formal assessment.
        </p>
      </section>
    </ParentLayout>
  );
}


