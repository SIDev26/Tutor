import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  HeartHandshake,
  LockKeyhole,
  MessageCircleOff,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Sprout,
  BookOpen,
  Clock3,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/pricing-section";
import { pageMeta } from "@/lib/page-meta";
// Lovable serves this photo from `/__l5e/assets-v1/...` (see k5-family.png.asset.json).
// Outside Lovable that URL does not exist, so the landing hero uses the exported PNG.
import familyPhoto from "@/assets/k5-family.png";
export const Route = createFileRoute("/")({
  head: () =>
    pageMeta(
      "Math confidence, at home",
      "You set the time. K-5 Tutor does the teaching. You see everything. Math for homeschool families, grades 2–4.",
    ),
  component: Index,
});
function Index() {
  return (
    <main>
      <section className="hero">
        <img
          className="hero-art"
          src={familyPhoto}
          alt="A mother and her son exploring fractions with colorful paper strips at home"
        />
        <div className="hero-content">
          <div className="hero-eyebrow eyebrow">
            <Sprout size={14} />
            For homeschool families · Grades 2–4
          </div>
          <h1>
            Math confidence,
            <br />
            <span>at home.</span>
          </h1>
          <p className="hero-copy">
            <strong>You set the time. K-5 Tutor does the teaching. You see everything.</strong>
          </p>
          <Button variant="hero" asChild>
            <Link to="/start">
              Start the free 10-minute check <ArrowRight />
            </Link>
          </Button>
          <div className="hero-trust">
            <span>
              <Check size={13} className="text-leaf" />
              No credit card
            </span>
            <span>
              <ShieldCheck size={13} className="text-leaf" />
              Pause anytime
            </span>
            <span>
              <BookOpen size={13} className="text-leaf" />
              Math only
            </span>
          </div>
        </div>
      </section>
      <section className="stat-band">
        <div className="stat-inner">
          <div className="flex items-center gap-5">
            <span className="stat-number">24%</span>
            <div>
              <p className="text-sm font-medium">of U.S. 4th graders score below Basic in math.</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                NCES, NAEP 2024 Mathematics, grade 4
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <HeartHandshake className="text-primary" size={24} />
            <p className="text-xs leading-5">
              You don't have to figure out
              <br />
              <strong>the next step alone.</strong>
            </p>
          </div>
        </div>
      </section>
      <section className="section-wrap">
        <div className="section-heading">
          <span className="eyebrow text-primary">A rhythm that fits your home</span>
          <h2>Diagnose. Learn. Check.</h2>
          <p>K-5 Tutor plans, teaches, checks, and adjusts on its own.</p>
        </div>
        <div className="step-grid three">
          {[
            { name: "Diagnose", icon: ScanLine, color: "bg-blue-soft text-primary", copy: "A free 10-minute check finds where your child is ready and builds the first week automatically." },
            { name: "Learn", icon: Sprout, color: "bg-leaf-soft text-leaf", copy: "A short narrated lesson, guided examples, then practice with hints that never give the answer." },
            { name: "Check", icon: ClipboardCheck, color: "bg-sunshine-soft text-foreground", copy: "Five quiet questions. A short Review warm-up appears on its own a few days later." },
          ].map((s, i) => (
            <article className="step" key={s.name}>
              <div className="flex items-center">
                <div className={`step-symbol ${s.color}`}>
                  <s.icon size={26} />
                </div>
                <span className="step-number">0{i + 1}</span>
              </div>
              <h3>{s.name}</h3>
              <p>{s.copy}</p>
            </article>
          ))}
        </div>
        <p className="interest-tailoring-line"><HeartHandshake size={16} /><strong>Your part:</strong> Set the time. See the progress.</p>
        <p className="interest-tailoring-line"><Sparkles size={16} />Space fuel tanks or soccer pitch sections: real interests shape the quantities and story, never the difficulty.</p>
      </section>
      <section className="safety-band">
        <div className="section-wrap">
          <div className="section-heading">
            <span className="eyebrow text-leaf">
              <ShieldCheck size={14} />
              Safe by default
            </span>
            <h2>You set the limits. You see everything.</h2>
            <p>Math only, grades 2–4. Supervision means limits and visibility, not chores.</p>
          </div>
          <div className="step-grid">
            {[
              { title: "No open chat", icon: MessageCircleOff, copy: "Only focused math problems. Your child never types free text to an AI." },
              { title: "You set the limits", icon: Clock3, copy: "Choose 10, 15, or 20 minutes a day and the times it can be used." },
              { title: "See everything, pause anytime", icon: Eye, copy: "Progress, plans, and results are always visible. One switch pauses everything." },
              { title: "Data not used to train or sell", icon: LockKeyhole, copy: "Child data is not used to train models and is never sold." },
            ].map((s) => (
              <article className="safety-item" key={s.title}>
                <s.icon size={24} className="text-leaf" />
                <h3>{s.title}</h3>
                <p>{s.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <PricingSection />
      <section className="bg-blue-soft text-center py-12 px-6">
        <Sparkles className="mx-auto text-primary mb-3" size={26} />
        <h2 className="text-3xl font-bold">Start with where they are.</h2>
        <p className="text-sm text-muted-foreground mt-3 mb-6">
          A small check. A clearer picture. No pressure.
        </p>
        <Button variant="hero" asChild>
          <Link to="/start">
            Start the free 10-minute check <ArrowRight />
          </Link>
        </Button>
      </section>
    </main>
  );
}


