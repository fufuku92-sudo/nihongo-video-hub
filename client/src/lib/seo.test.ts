import { describe, expect, it } from "vitest";
import { HOME_SEO, applySeoMetadata } from "./seo";

describe("HOME_SEO", () => {
  it("keeps the homepage title within the requested SEO length range", () => {
    expect(HOME_SEO.title.length).toBeGreaterThanOrEqual(30);
    expect(HOME_SEO.title.length).toBeLessThanOrEqual(60);
    expect(HOME_SEO.title).toContain("Nihongo Video Hub");
    expect(HOME_SEO.title).toContain("JLPT");
  });

  it("keeps the homepage description within the requested SEO length range", () => {
    expect(HOME_SEO.description.length).toBeGreaterThanOrEqual(50);
    expect(HOME_SEO.description.length).toBeLessThanOrEqual(160);
    expect(HOME_SEO.description).toContain("免費非營利");
    expect(HOME_SEO.description).toContain("YouTube");
  });

  it("provides detectable homepage keywords for Japanese learning search intent", () => {
    expect(HOME_SEO.keywords.length).toBeGreaterThanOrEqual(8);
    expect(HOME_SEO.keywords).toEqual(expect.arrayContaining(["日文學習", "JLPT", "YouTube 日文影片", "日文歌曲"]));
    expect(HOME_SEO.keywords.join(", ").length).toBeGreaterThan(0);
  });
});

describe("applySeoMetadata", () => {
  it("sets document.title and updates description and keywords meta tags", () => {
    const metaTags = new Map<string, { attributes: Record<string, string>; setAttribute: (key: string, value: string) => void }>();
    const createMeta = () => ({
      attributes: {} as Record<string, string>,
      setAttribute(key: string, value: string) {
        this.attributes[key] = value;
      },
    });
    const fakeDocument = {
      title: "",
      head: {
        querySelector(selector: string) {
          const match = selector.match(/meta\[name="(.+)"\]/);
          return match ? metaTags.get(match[1]) ?? null : null;
        },
        appendChild(element: ReturnType<typeof createMeta>) {
          const name = element.attributes.name;
          metaTags.set(name, element);
        },
      },
      createElement() {
        return createMeta();
      },
    } as unknown as Document;

    applySeoMetadata(HOME_SEO, fakeDocument);

    expect(fakeDocument.title).toBe(HOME_SEO.title);
    expect(metaTags.get("description")?.attributes.content).toBe(HOME_SEO.description);
    expect(metaTags.get("keywords")?.attributes.content).toBe(HOME_SEO.keywords.join(", "));
  });
});
