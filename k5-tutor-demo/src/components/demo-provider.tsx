import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { emptyProfile, profileA, type InterestProfile } from "@/lib/interest-content";
import { initialCards, type CoachingCard } from "@/lib/demo-data";
import {
  createLesson,
  defaultLeoAvatar,
  defaultParentAvatar,
  defaultSofiaAvatar,
  type AvatarConfig,
  type InterestId,
  type LessonProgress,
} from "@/lib/lesson-data";
import { defaultSchedule, type ScheduleSettings } from "@/lib/schedule";

export type DemoState = {
  child: "Leo" | "Sofia";
  grade: number;
  consent: boolean;
  sharing: boolean;
  mode: "parent" | "child";
  settings: ScheduleSettings;
  paused: boolean;
  /** Demo clock: days after Thursday, Nov 19, 2026, and the hour of day. */
  today: number;
  hour: number;
  minutesToday: number;
  weekMinutes: number;
  cards: CoachingCard[];
  tipDismissed: boolean;
  diagnostic: string[];
  parentAvatar: AvatarConfig;
  avatars: Record<"Leo" | "Sofia", AvatarConfig>;
  interests: Record<"Leo" | "Sofia", InterestId[]>;
  childSetupComplete: boolean;
  lesson: LessonProgress;
  /** Parent-chosen narration voice (device voice name), or null for automatic. */
  voiceName: string | null;
  profiles: Record<"Leo" | "Sofia", InterestProfile>;
};

const seed = (): DemoState => ({
  child: "Leo",
  grade: 3,
  consent: false,
  sharing: false,
  mode: "parent",
  settings: defaultSchedule(),
  paused: false,
  today: 0,
  hour: 16,
  minutesToday: 0,
  weekMinutes: 42,
  cards: initialCards.map((card) => ({ ...card })),
  tipDismissed: false,
  diagnostic: [],
  parentAvatar: { ...defaultParentAvatar },
  avatars: { Leo: { ...defaultLeoAvatar }, Sofia: { ...defaultSofiaAvatar } },
  interests: { Leo: ["soccer", "space"], Sofia: ["animals"] },
  childSetupComplete: false,
  lesson: createLesson(),
  voiceName: null,
  profiles: { Leo: profileA(), Sofia: { ...emptyProfile(), worlds: ["animals"], favorite: "animals", subs: { animals: ["jungle", "pets"] }, framing: { wrap: "mission" }, guideName: "Momo", createdDay: -38 } },
});

const STORAGE_KEY = "k5-tutor-demo-v3";

const DemoContext = createContext<{
  state: DemoState;
  update: (value: Partial<DemoState>) => void;
  reset: () => void;
} | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(seed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<DemoState>;
        const fresh = seed();
        setState({
          ...fresh,
          ...parsed,
          settings: { ...fresh.settings, ...parsed.settings, slots: { ...fresh.settings.slots, ...parsed.settings?.slots } },
          parentAvatar: { ...fresh.parentAvatar, ...parsed.parentAvatar },
          avatars: {
            Leo: { ...fresh.avatars.Leo, ...parsed.avatars?.Leo },
            Sofia: { ...fresh.avatars.Sofia, ...parsed.avatars?.Sofia },
          },
          interests: { ...fresh.interests, ...parsed.interests },
          lesson: { ...fresh.lesson, ...parsed.lesson },
          profiles: { Leo: { ...fresh.profiles.Leo, ...parsed.profiles?.Leo }, Sofia: { ...fresh.profiles.Sofia, ...parsed.profiles?.Sofia } },
        });
      }
    } catch {
      /* Reset corrupt demo data. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  return (
    <DemoContext.Provider
      value={{
        state,
        update: (value) => setState((current) => ({ ...current, ...value })),
        reset: () => setState(seed()),
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider is required");
  return context;
}

export function demoDateLabel(today: number) {
  return `Nov ${19 + today}, 2026`;
}
export function demoDayIndex(today: number) {
  return (3 + today) % 7;
}


