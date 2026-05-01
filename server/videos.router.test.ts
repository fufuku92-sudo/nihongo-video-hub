import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  listVideos: vi.fn(),
  upsertVideo: vi.fn(),
  deleteVideoByYoutubeId: vi.fn(),
  updateVideoByYoutubeId: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: AuthenticatedUser["role"] = "admin"): TrpcContext {
  return {
    user: {
      id: 7,
      openId: `sample-${role}`,
      email: `${role}@example.com`,
      name: role === "admin" ? "Admin User" : "Normal User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("videos router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows public users to list persisted videos", async () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    dbMocks.listVideos.mockResolvedValue([
      {
        id: 1,
        youtubeId: "abc123XYZ",
        title: "N5 文法練習",
        channel: "Nihongo Channel",
        channelUrl: "https://www.youtube.com/@nihongo",
        level: "N5",
        topic: "文法",
        reason: "適合入門複習。",
        createdByUserId: 7,
        createdAt,
        updatedAt: createdAt,
      },
    ]);

    const caller = appRouter.createCaller({ ...createContext(), user: null });
    const result = await caller.videos.list();

    expect(result).toHaveLength(1);
    expect(result[0]?.youtubeId).toBe("abc123XYZ");
    expect(result[0]?.channelUrl).toBe("https://www.youtube.com/@nihongo");
    expect(dbMocks.listVideos).toHaveBeenCalledTimes(1);
  });

  it("allows admins to add or update persisted videos", async () => {
    dbMocks.upsertVideo.mockImplementation(async input => ({
      id: 2,
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.videos.add({
      youtubeId: "n3Listen_01",
      title: "N3 聽力逐句解析",
      channel: "Elsaの放送",
      channelUrl: "https://www.youtube.com/@ElsaJapanese",
      level: "N3",
      topic: "聽解",
      reason: "逐句解析適合中級學習者。",
    });

    expect(result?.youtubeId).toBe("n3Listen_01");
    expect(dbMocks.upsertVideo).toHaveBeenCalledWith(
      expect.objectContaining({
        youtubeId: "n3Listen_01",
        title: "N3 聽力逐句解析",
        channelUrl: "https://www.youtube.com/@ElsaJapanese",
        createdByUserId: 7,
      }),
    );
  });

  it("rejects non-admin users from adding videos", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(
      caller.videos.add({
        youtubeId: "n2Grammar",
        title: "N2 文法整理",
        channel: "Nihongo Channel",
        channelUrl: "https://www.youtube.com/@nihongo",
        level: "N2",
        topic: "文法",
        reason: "管理員限定操作測試。",
      }),
    ).rejects.toThrow("You do not have required permission");
    expect(dbMocks.upsertVideo).not.toHaveBeenCalled();
  });

  it("allows admins to update persisted video title, channel link, level and reason", async () => {
    dbMocks.updateVideoByYoutubeId.mockImplementation(async (youtubeId, input) => ({
      id: 3,
      youtubeId,
      title: input.title,
      channel: input.channel,
      channelUrl: input.channelUrl,
      level: input.level,
      topic: "文法",
      reason: input.reason,
      createdByUserId: 7,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    }));

    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.videos.update({
      youtubeId: "n4Grammar01",
      title: "N4 文法整理更新版",
      channel: "更新後頻道",
      channelUrl: "https://www.youtube.com/@updated-channel",
      level: "N4",
      reason: "更新後的備註資訊。",
    });

    expect(result?.title).toBe("N4 文法整理更新版");
    expect(result?.level).toBe("N4");
    expect(result?.channel).toBe("更新後頻道");
    expect(result?.channelUrl).toBe("https://www.youtube.com/@updated-channel");
    expect(result?.reason).toBe("更新後的備註資訊。");
    expect(dbMocks.updateVideoByYoutubeId).toHaveBeenCalledWith(
      "n4Grammar01",
      expect.objectContaining({
        title: "N4 文法整理更新版",
        channel: "更新後頻道",
        channelUrl: "https://www.youtube.com/@updated-channel",
        level: "N4",
        reason: "更新後的備註資訊。",
      }),
    );
  });

  it("rejects non-admin users from updating videos", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(
      caller.videos.update({
        youtubeId: "n4Grammar01",
        title: "未授權更新",
        channel: "未授權頻道",
        channelUrl: "https://www.youtube.com/@unauthorized",
        level: "N4",
        reason: "不應寫入。",
      }),
    ).rejects.toThrow("You do not have required permission");
    expect(dbMocks.updateVideoByYoutubeId).not.toHaveBeenCalled();
  });
});
