import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DemoProvider, useDemo } from "@/components/demo-provider";
import { InterestProfileEditor } from "@/components/interest-profile-editor";
import { ProfileGame } from "@/components/profile-game";
import { avatarPresets, defaultLeoAvatar } from "@/lib/lesson-data";
import { emptyProfile } from "@/lib/interest-content";

function SelectedChildInterestEditor() {
  const { state, update } = useDemo();
  return (
    <>
      <button onClick={() => update({ child: state.child === "Leo" ? "Sofia" : "Leo" })}>Switch selected child</button>
      <InterestProfileEditor />
    </>
  );
}

describe("Parent-owned child profile", () => {
  beforeEach(() => localStorage.clear());
  it("lets the parent create the child’s avatar and interest profile without typing", () => {
    const onDone = vi.fn();
    render(<ProfileGame child="Leo" initial={emptyProfile()} avatar={defaultLeoAvatar} onBack={() => {}} onDone={onDone} />);

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Avatar 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: /Soccer/ }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: /Goalkeeping/ }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    for (const choice of ["Story mission", "Build something", "Team", "Calm", "Funny", "Day"]) {
      fireEvent.click(screen.getByRole("button", { name: choice }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Pip" }));
    fireEvent.click(screen.getByRole("button", { name: "Save profile & start check" }));

    expect(onDone).toHaveBeenCalledWith(
      expect.objectContaining({ worlds: ["soccer"], favorite: "soccer", subs: { soccer: ["goalkeeping"] }, guideName: "Pip" }),
      avatarPresets[1],
    );
  });

  it("lets the parent add an interest to an existing child profile", () => {
    render(<DemoProvider><InterestProfileEditor /></DemoProvider>);
    const animals = screen.getByRole("button", { name: /Animals/ });
    expect(animals).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(animals);
    expect(animals).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps interest edits with the selected child", () => {
    render(<DemoProvider><SelectedChildInterestEditor /></DemoProvider>);
    const leoArt = screen.getByRole("button", { name: /original Art guide/ });
    expect(leoArt).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(leoArt);
    expect(leoArt).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Switch selected child" }));
    expect(screen.getByRole("button", { name: /original Art guide/ })).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getByRole("button", { name: "Switch selected child" }));
    expect(screen.getByRole("button", { name: /original Art guide/ })).toHaveAttribute("aria-pressed", "true");
  });
});


