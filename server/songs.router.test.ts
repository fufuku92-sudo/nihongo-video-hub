import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  listSongs: vi.fn(),
  upsertSong: vi.fn(),
  updateSongByYoutubeId: vi.fn(),
  deleteSongByYoutubeId: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: AuthenticatedUser["role"] = "admin"): TrpcContext {
  return {
    user: {
      id: 9,
      openId: `song-${role}`,
      email: `${role}@example.com`,
      name: role === "admin" ? "Song Admin" : "Normal User",
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

describe("songs router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows public users to list persisted songs", async () => {
    const createdAt = new Date("2026-02-01T00:00:00.000Z");
    dbMocks.listSongs.mockResolvedValue([
      {
        id: 1,
        youtubeId: "songABC123",
        title: "やさしい日本語の歌",
        artist: "Sample Artist",
        channel: "Sample Music Channel",
        channelUrl: "https://www.youtube.com/@samplemusic",
        level: "N4",
        mood: "抒情",
        reason: "語速清楚，適合聽力練習。",
        lyricsUrl: "https://example.com/lyrics",
        lyricsNote: "請使用官方授權歌詞來源搭配學習。",
        vocabularyNotes: "常見生活動詞與形容詞。",
        grammarNotes: "て形與普通形表現。",
        listeningPrompt: "先聽副歌，再練習跟唱。",
        createdByUserId: 9,
        createdAt,
        updatedAt: createdAt,
      },
    ]);

    const caller = appRouter.createCaller({ ...createContext(), user: null });
    const result = await caller.songs.list();

    expect(result).toHaveLength(1);
    expect(result[0]?.youtubeId).toBe("songABC123");
    expect(result[0]?.lyricsUrl).toBe("https://example.com/lyrics");
    expect(dbMocks.listSongs).toHaveBeenCalledTimes(1);
  });

  it("allows admins to add or update persisted songs with compliant lyrics support fields", async () => {
    dbMocks.upsertSong.mockImplementation(async input => ({
      id: 2,
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.songs.add({
      youtubeId: "jpSong_01",
      title: "日本語ソング",
      artist: "Nihongo Singer",
      channel: "Music Channel",
      channelUrl: "https://www.youtube.com/@music-channel",
      level: "N3",
      mood: "流行",
      reason: "副歌重複明確，適合練習辨音。",
      lyricsUrl: "https://example.com/official-lyrics",
      lyricsNote: "不收錄完整歌詞，請前往官方來源查看。",
      vocabularyNotes: "情緒形容詞與時間副詞。",
      grammarNotes: "そうだ、ようだ 等推量表現。",
      listeningPrompt: "第一遍聽旋律，第二遍記錄聽到的關鍵詞。",
    });

    expect(result?.youtubeId).toBe("jpSong_01");
    expect(dbMocks.upsertSong).toHaveBeenCalledWith(
      expect.objectContaining({
        youtubeId: "jpSong_01",
        title: "日本語ソング",
        lyricsUrl: "https://example.com/official-lyrics",
        createdByUserId: 9,
      }),
    );
  });

  it("rejects non-admin users from adding songs", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(
      caller.songs.add({
        youtubeId: "lockedSong01",
        title: "未授權歌曲",
        artist: "Sample Artist",
        channel: "Sample Channel",
        channelUrl: "https://www.youtube.com/@sample",
        level: "N5",
        mood: "入門",
        reason: "一般使用者不可新增。",
        lyricsUrl: "https://example.com/lyrics",
        lyricsNote: "不應寫入。",
        vocabularyNotes: "不應寫入。",
        grammarNotes: "不應寫入。",
        listeningPrompt: "不應寫入。",
      }),
    ).rejects.toThrow("You do not have required permission");
    expect(dbMocks.upsertSong).not.toHaveBeenCalled();
  });

  it("allows admins to update and delete persisted songs", async () => {
    dbMocks.updateSongByYoutubeId.mockImplementation(async (youtubeId, input) => ({
      id: 3,
      youtubeId,
      ...input,
      createdByUserId: 9,
      createdAt: new Date("2026-02-01T00:00:00.000Z"),
      updatedAt: new Date("2026-02-02T00:00:00.000Z"),
    }));
    dbMocks.deleteSongByYoutubeId.mockResolvedValue({ success: true });

    const caller = appRouter.createCaller(createContext("admin"));
    const updated = await caller.songs.update({
      youtubeId: "jpSong_01",
      title: "日本語ソング 改訂版",
      artist: "Updated Singer",
      channel: "Updated Channel",
      channelUrl: "https://www.youtube.com/@updated-music",
      level: "N2",
      mood: "搖滾",
      reason: "更新後的學習說明。",
      lyricsUrl: "https://example.com/updated-lyrics",
      lyricsNote: "仍只連到授權來源，不重製完整歌詞。",
      vocabularyNotes: "高階情緒語彙。",
      grammarNotes: "倒裝與省略表現。",
      listeningPrompt: "聽主歌辨識句尾語氣。",
    });
    const deleted = await caller.songs.delete({ youtubeId: "jpSong_01" });

    expect(updated?.title).toBe("日本語ソング 改訂版");
    expect(updated?.level).toBe("N2");
    expect(deleted.success).toBe(true);
    expect(dbMocks.updateSongByYoutubeId).toHaveBeenCalledWith(
      "jpSong_01",
      expect.objectContaining({
        title: "日本語ソング 改訂版",
        lyricsNote: "仍只連到授權來源，不重製完整歌詞。",
      }),
    );
    expect(dbMocks.deleteSongByYoutubeId).toHaveBeenCalledWith("jpSong_01");
  });
});
