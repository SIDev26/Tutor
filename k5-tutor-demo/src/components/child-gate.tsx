import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, HandHeart, Moon, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoDayIndex, useDemo } from "@/components/demo-provider";
import { isOpen, nextOpening } from "@/lib/schedule";

/** Returns a friendly blocking screen when the child may not work right now, otherwise null. */
export function useChildGate() {
  const { state, update } = useDemo();
  const dayIndex = demoDayIndex(state.today);

  if (!state.consent) return (
    <main className="flow-container text-center">
      <HandHeart size={52} className="text-primary mx-auto mb-6" />
      <h1 className="page-title">Grown-up first, please.</h1>
      <p className="page-subtitle mb-6">Your grown-up needs to sign up and give permission once before we begin.</p>
      <Button asChild><Link to="/start">Go to grown-up sign-up<ArrowRight /></Link></Button>
    </main>
  );

  if (state.paused) return (
    <main className="flow-container text-center">
      <Moon size={52} className="text-primary mx-auto mb-6" />
      <h1 className="page-title">Taking a little break.</h1>
      <p className="page-subtitle">Math is paused for now. Your grown-up will turn it back on.</p>
    </main>
  );

  if (!isOpen(state.settings.slots, dayIndex, state.hour)) {
    const next = nextOpening(state.settings.slots, dayIndex, state.hour);
    return (
      <main className="flow-container text-center">
        <Clock3 size={52} className="text-primary mx-auto mb-6" />
        <h1 className="page-title">{next ? `Come back ${next.daysAhead === 0 ? "at " : ""}${next.label}.` : "Not math time right now."}</h1>
        <p className="page-subtitle">Your math friends will be ready for you then.</p>
        {next && <Button variant="outline" className="mt-7" onClick={() => update({ today: state.today + next.daysAhead, hour: next.hour, minutesToday: next.daysAhead ? 0 : state.minutesToday })}>Skip to then · demo<ArrowRight /></Button>}
      </main>
    );
  }

  if (state.minutesToday >= state.settings.minutes) return <SeeYouTomorrow />;
  return null;
}

export function SeeYouTomorrow() {
  const { state, update } = useDemo();
  return (
    <main className="flow-container text-center">
      <PartyPopper size={52} className="text-coral mx-auto mb-6" />
      <h1 className="page-title">Great work, see you tomorrow!</h1>
      <p className="page-subtitle">You used today’s {state.settings.minutes} minutes. We’ll pick up right where you stopped.</p>
      <Button variant="outline" className="mt-7" onClick={() => update({ today: state.today + 1, hour: 16, minutesToday: 0 })}>Next day · demo<ArrowRight /></Button>
    </main>
  );
}


