import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  listVideos: vi.fn(),
  upsertVideo: vi.fn(),
  deleteVideoByYoutubeId: vi.fn(),
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
      level: "N3",
      topic: "聽解",
      reason: "逐句解析適合中級學習者。",
    });

    expect(result?.youtubeId).toBe("n3Listen_01");
    expect(dbMocks.upsertVideo).toHaveBeenCalledWith(
      expect.objectContaining({
        youtubeId: "n3Listen_01",
        title: "N3 聽力逐句解析",
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
        level: "N2",
        topic: "文法",
        reason: "管理員限定操作測試。",
      }),
    ).rejects.toThrow("You do not have required permission");
    expect(dbMocks.upsertVideo).not.toHaveBeenCalled();
  });
});
