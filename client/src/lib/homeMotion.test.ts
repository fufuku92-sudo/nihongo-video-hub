import { describe, expect, it } from "vitest";

import { HOME_MOTION, MOTION_REDUCED_MEDIA_QUERY, type HomeMotionKey } from "./homeMotion";

const expectedKeys: HomeMotionKey[] = [
  "page",
  "nav",
  "heroBadge",
  "heroTitle",
  "heroCopy",
  "heroActions",
  "heroImage",
  "switchSection",
  "switchTabs",
  "switchTrigger",
  "tabViewport",
  "videoTabPanel",
  "songTabPanel",
  "videoPanel",
  "videoGrid",
  "songPanel",
  "songNotes",
  "songGrid",
  "mobileSwitcher",
  "mobileSwitcherButton",
  "activeMobileSwitcherButton",
];

describe("HOME_MOTION", () => {
  it("covers every homepage area that needs entrance or exit-like motion", () => {
    expect(Object.keys(HOME_MOTION)).toEqual(expectedKeys);
  });

  it("uses named motion utility classes instead of inline animation styles", () => {
    for (const value of Object.values(HOME_MOTION)) {
      expect(value).toMatch(/motion-/);
      expect(value).not.toMatch(/style=/);
      expect(value).not.toMatch(/animation:/);
    }
  });

  it("keeps hero content staged with readable timing", () => {
    expect(HOME_MOTION.heroBadge).toContain("motion-delay-2");
    expect(HOME_MOTION.heroTitle).toContain("motion-delay-3");
    expect(HOME_MOTION.heroCopy).toContain("motion-delay-4");
    expect(HOME_MOTION.heroActions).toContain("motion-delay-5");
  });

  it("defines smooth tab transition classes for video and song panels", () => {
    expect(HOME_MOTION.tabViewport).toBe("motion-tab-viewport");
    expect(HOME_MOTION.videoTabPanel).toContain("motion-tab-panel");
    expect(HOME_MOTION.videoTabPanel).toContain("motion-tab-panel-videos");
    expect(HOME_MOTION.songTabPanel).toContain("motion-tab-panel");
    expect(HOME_MOTION.songTabPanel).toContain("motion-tab-panel-songs");
  });

  it("keeps desktop and mobile tab switches using shared motion utilities", () => {
    expect(HOME_MOTION.switchTrigger).toBe("motion-switch-trigger");
    expect(HOME_MOTION.mobileSwitcherButton).toBe("motion-switch-button");
    expect(HOME_MOTION.activeMobileSwitcherButton).toBe("motion-switch-button-active");
  });

  it("defines a reduced motion media query token for accessibility checks", () => {
    expect(MOTION_REDUCED_MEDIA_QUERY).toBe("prefers-reduced-motion: reduce");
  });
});
