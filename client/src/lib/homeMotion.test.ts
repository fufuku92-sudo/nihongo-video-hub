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
  "videoPanel",
  "videoGrid",
  "songPanel",
  "songNotes",
  "songGrid",
  "mobileSwitcher",
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

  it("defines a reduced motion media query token for accessibility checks", () => {
    expect(MOTION_REDUCED_MEDIA_QUERY).toBe("prefers-reduced-motion: reduce");
  });
});
