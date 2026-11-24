import { createFileRoute } from "@tanstack/react-router";
import { AvatarPicker } from "@/components/avatar-picker";
import { AvatarBuilder } from "@/components/avatar-builder";
import { InterestProfileEditor } from "@/components/interest-profile-editor";
import { ParentLayout, PageHeading } from "@/components/app-shell";
import { useDemo } from "@/components/demo-provider";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/parent/profile")({
  head: () =>
    pageMeta(
      "Edit child profile and interests",
      "Parents can update the selected child’s original avatar, favorite topics, interest worlds, and lesson personalization.",
    ),
  component: ChildProfileSettings,
});

function ChildProfileSettings() {
  const { state, update } = useDemo();
  const child = state.child;

  return (
    <ParentLayout>
      <PageHeading
        title={`${child}’s profile`}
        subtitle="Update the avatar and interests used to personalize stories and examples. Math difficulty stays the same."
      />
      <section className="panel">
        <h2 className="text-xl font-bold">Avatar and interests</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-5">
          Grade {child === "Leo" ? state.grade : 2} · Original avatars only, no photos.
        </p>
        <AvatarPicker
          value={state.avatars[child]}
          onChange={(avatar) => update({ avatars: { ...state.avatars, [child]: avatar } })}
        />
        <details className="mt-5">
          <summary className="text-sm font-semibold text-primary cursor-pointer">Open the full avatar builder</summary>
          <div className="mt-4">
            <AvatarBuilder
              value={state.avatars[child]}
              onChange={(avatar) => update({ avatars: { ...state.avatars, [child]: avatar } })}
            />
          </div>
        </details>
        <InterestProfileEditor />
      </section>
    </ParentLayout>
  );
}


