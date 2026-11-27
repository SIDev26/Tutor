import { describe, expect, it } from "vitest";
import { pickVoice, sentences, voiceScore } from "../lib/voice";

const v = (name: string, lang = "en-US") => ({ name, lang });
describe("Natural voice choice", () => {
  it("prefers a natural or enhanced voice over the basic default", () => expect(pickVoice([v("Microsoft David Desktop"), v("Microsoft Aria Online (Natural) - English (United States)")], null)?.name).toContain("Aria"));
  it("never picks a novelty or robotic voice", () => expect(pickVoice([v("Zarvox"), v("eSpeak English")], null)).toBeNull());
  it("falls back to captions when only basic voices exist", () => expect(pickVoice([v("Microsoft David Desktop"), v("Alex")], null)).toBeNull());
  it("ignores non-English voices", () => expect(voiceScore(v("Google Deutsch Natural", "de-DE"))).toBe(-1));
  it("honors the parent's chosen voice when it is natural", () => expect(pickVoice([v("Samantha (Enhanced)"), v("Ava (Premium)")], "Samantha (Enhanced)")?.name).toBe("Samantha (Enhanced)"));
  it("speaks sentence by sentence", () => expect(sentences("Now four. Now eight! More or less?")).toEqual(["Now four.", "Now eight!", "More or less?"]));
});


