import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { priceForChildren } from "@/lib/demo-rules";
export function PricingSection() {
  const [children, setChildren] = useState(2);
  const [period, setPeriod] = useState<"annual" | "quarterly" | "monthly">("annual");
  return (
    <section className="section-wrap">
      <div className="section-heading">
        <span className="eyebrow text-primary">One plan. Their next step.</span>
        <h2>A little practice. A clear path.</h2>
        <p>Start with a free 10-minute check. Choose a plan when you're ready.</p>
      </div>
      <div className="price-grid">
        {[
          {
            label: "Annual",
            value: 399,
            unit: "year",
            detail: "A full year of math teaching at home.",
            best: true,
          },
          {
            label: "Quarterly",
            value: 149,
            unit: "quarter",
            detail: "Room to find your rhythm.",
            best: false,
          },
          {
            label: "Monthly",
            value: 59,
            unit: "month",
            detail: "Take it one month at a time.",
            best: false,
          },
        ].map((p) => (
          <article key={p.label} className={`price-card ${p.best ? "best" : ""}`}>
            {p.best && <span className="best-badge">BEST VALUE</span>}
            <h3 className="text-lg font-bold">{p.label}</h3>
            <p className="my-5">
              <span className="price-value">${p.value}</span>
              <span className="text-sm text-muted-foreground"> / child / {p.unit}</span>
            </p>
            <p className="text-xs text-muted-foreground mb-5">{p.detail}</p>
            <div className="space-y-3 text-xs mb-7">
              {[
                "Narrated teaching and guided practice",
                "Post-practice checks and spaced reviews",
                "Daily time limits, time slots, and pause",
                "Evaluation-ready portfolio",
              ].map((t) => (
                <p className="flex items-center gap-2" key={t}>
                  <Check size={14} className="text-leaf" />
                  {t}
                </p>
              ))}
            </div>
            <Button asChild variant={p.best ? "default" : "outline"} className="w-full">
              <Link to="/start">
                Start with the free check <ArrowRight />
              </Link>
            </Button>
          </article>
        ))}
      </div>
      <div className="calculator">
        <div className="flex gap-3 items-center">
          <Users className="text-primary" size={25} />
          <div>
            <p className="font-semibold text-sm">More kids, more confidence.</p>
            <p className="text-xs text-muted-foreground mt-1">30% off each additional child.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Fewer children"
            disabled={children <= 1}
            onClick={() => setChildren((c) => c - 1)}
          >
            <Minus />
          </Button>
          <span className="w-20 text-center text-sm">{children} children</span>
          <Button
            variant="outline"
            size="icon"
            aria-label="More children"
            disabled={children >= 6}
            onClick={() => setChildren((c) => c + 1)}
          >
            <Plus />
          </Button>
          <select
            aria-label="Billing period"
            className="form-control w-28 ml-2"
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
          >
            <option value="annual">Annual</option>
            <option value="quarterly">Quarterly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <p className="text-primary font-bold text-xl whitespace-nowrap">
          ${priceForChildren(children, period)}
          <span className="font-normal text-xs text-muted-foreground">
            {" "}
            / {period === "annual" ? "year" : period === "quarterly" ? "quarter" : "month"}
          </span>
        </p>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-5">
        Demo pricing only. No payment information is collected.
      </p>
    </section>
  );
}


