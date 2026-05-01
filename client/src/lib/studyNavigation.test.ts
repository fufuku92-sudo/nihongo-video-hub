import { describe, expect, it } from "vitest";

import { getStudyModeOption, STUDY_MODE_OPTIONS } from "./studyNavigation";

describe("studyNavigation", () => {
  it("exposes exactly three primary homepage study modes", () => {
    expect(STUDY_MODE_OPTIONS.map((option) => option.value)).toEqual(["videos", "songs", "podcasts"]);
    expect(STUDY_MODE_OPTIONS.map((option) => option.label)).toEqual(["影片學習", "日文歌曲", "推薦 Podcast"]);
  });

  it("keeps each study mode copy concise for the top switcher", () => {
    for (const option of STUDY_MODE_OPTIONS) {
      expect(option.description.length).toBeLessThanOrEqual(24);
      expect(option.description).not.toContain("管理員");
    }
  });

  it("can resolve a study mode option by value", () => {
    expect(getStudyModeOption("videos")?.label).toBe("影片學習");
    expect(getStudyModeOption("songs")?.label).toBe("日文歌曲");
    expect(getStudyModeOption("podcasts")?.label).toBe("推薦 Podcast");
  });

  it("keeps mobile bottom switcher labels reasonable length", () => {
    for (const option of STUDY_MODE_OPTIONS) {
      expect(option.label.length).toBeLessThanOrEqual(10);
      expect(option.label).not.toContain("平台");
      expect(option.label).not.toContain("後台");
    }
  });
});
