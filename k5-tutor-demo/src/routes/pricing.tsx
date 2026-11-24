import { createFileRoute } from "@tanstack/react-router";
import { PricingSection } from "@/components/pricing-section";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/pricing")({
  head: () =>
    pageMeta(
      "Family pricing",
      "Compare K-5 Tutor annual, quarterly, and monthly plans. Get 30% off each additional child.",
    ),
  component: PricingSection,
});


