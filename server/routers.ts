import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const levelSchema = z.enum(["N5", "N4", "N3", "N2", "N1"]);
const topicSchema = z.enum(["文法", "單字", "聽解", "讀解", "綜合"]);

const youtubeIdSchema = z
  .string()
  .trim()
  .min(6, "影片 ID 太短")
  .max(32, "影片 ID 太長")
  .regex(/^[a-zA-Z0-9_-]+$/, "影片 ID 只能包含英數字、底線與連字號");

const optionalChannelUrlSchema = z.preprocess(
  value => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().url("請填寫有效的頻道網址").max(500, "頻道網址過長").optional(),
);

const optionalLyricsUrlSchema = z.preprocess(
  value => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().url("請填寫有效的歌詞或官方資訊網址").max(500, "歌詞來源網址過長").optional(),
);

const editableVideoFieldsSchema = z.object({
  title: z.string().trim().min(1, "請填寫影片標題").max(300, "影片標題過長"),
  channel: z.string().trim().min(1, "請填寫頻道名稱").max(200, "頻道名稱過長"),
  channelUrl: optionalChannelUrlSchema,
  level: levelSchema,
  reason: z.string().trim().max(800, "備註過長").optional(),
});

const videoInputSchema = editableVideoFieldsSchema.extend({
  youtubeId: youtubeIdSchema,
  topic: topicSchema,
});

const videoUpdateSchema = editableVideoFieldsSchema.extend({
  youtubeId: youtubeIdSchema,
});

const editableSongFieldsSchema = z.object({
  title: z.string().trim().min(1, "請填寫歌曲名稱").max(300, "歌曲名稱過長"),
  artist: z.string().trim().min(1, "請填寫歌手或作品名稱").max(200, "歌手名稱過長"),
  channel: z.string().trim().min(1, "請填寫頻道名稱").max(200, "頻道名稱過長"),
  channelUrl: optionalChannelUrlSchema,
  level: levelSchema,
  mood: z.string().trim().min(1, "請填寫歌曲分類或氛圍").max(80, "分類文字過長"),
  reason: z.string().trim().max(800, "推薦理由過長").optional(),
  lyricsUrl: optionalLyricsUrlSchema,
  lyricsNote: z.string().trim().max(1200, "歌詞備註過長").optional(),
  vocabularyNotes: z.string().trim().max(1600, "單字重點過長").optional(),
  grammarNotes: z.string().trim().max(1600, "文法重點過長").optional(),
  listeningPrompt: z.string().trim().max(1000, "聽力提示過長").optional(),
});

const songInputSchema = editableSongFieldsSchema.extend({
  youtubeId: youtubeIdSchema,
});

const songUpdateSchema = editableSongFieldsSchema.extend({
  youtubeId: youtubeIdSchema,
});

const pageViewInputSchema = z.object({
  path: z.string().trim().min(1).max(255).default("/"),
});

// 假數據存儲（只在內存中，重啟後會消失）
let mockVideos = [
  {
    id: 1,
    youtubeId: "abc123XYZ",
    title: "N5 文法練習",
    channel: "Nihongo Channel",
    channelUrl: "https://www.youtube.com/@nihongo",
    level: "N5" as const,
    topic: "文法" as const,
    reason: "適合入門複習。",
    createdByUserId: 1,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
];

let mockSongs = [
  {
    id: 1,
    youtubeId: "song123ABC",
    title: "やさしい日本語の歌",
    artist: "Sample Artist",
    channel: "Sample Music Channel",
    channelUrl: "https://www.youtube.com/@samplemusic",
    level: "N4" as const,
    mood: "抒情",
    reason: "語速清楚，適合聽力練習。",
    lyricsUrl: "https://example.com/lyrics",
    lyricsNote: "請使用官方授權歌詞來源搭配學習。",
    vocabularyNotes: "常見生活動詞與形容詞。",
    grammarNotes: "て形與普通形表現。",
    listeningPrompt: "先聽副歌，再練習跟唱。",
    createdByUserId: 1,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-01"),
  },
];

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  videos: router({
    list: publicProcedure.query(() => {
      return mockVideos;
    }),
    add: publicProcedure.input(videoInputSchema).mutation(({ input }) => {
      const newVideo = {
        id: mockVideos.length + 1,
        youtubeId: input.youtubeId,
        title: input.title,
        channel: input.channel,
        channelUrl: input.channelUrl || null,
        level: input.level,
        topic: input.topic,
        reason: input.reason || null,
        createdByUserId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockVideos.push(newVideo);
      return newVideo;
    }),
    update: publicProcedure.input(videoUpdateSchema).mutation(({ input }) => {
      const index = mockVideos.findIndex(v => v.youtubeId === input.youtubeId);
      if (index !== -1) {
        mockVideos[index] = {
          ...mockVideos[index],
          title: input.title,
          channel: input.channel,
          channelUrl: input.channelUrl || null,
          level: input.level,
          reason: input.reason || null,
          updatedAt: new Date(),
        };
        return mockVideos[index];
      }
      throw new Error("影片未找到");
    }),
    delete: publicProcedure
      .input(
        z.object({
          youtubeId: youtubeIdSchema,
        }),
      )
      .mutation(({ input }) => {
        mockVideos = mockVideos.filter(v => v.youtubeId !== input.youtubeId);
        return { success: true } as const;
      }),
  }),
  analytics: router({
    stats: publicProcedure.query(() => ({
      totalViews: 0,
    })),
    recordPageView: publicProcedure.input(pageViewInputSchema).mutation(({ ctx, input }) => ({
      success: true,
      totalViews: 0,
    })),
  }),
  songs: router({
    list: publicProcedure.query(() => {
      return mockSongs;
    }),
    add: publicProcedure.input(songInputSchema).mutation(({ input }) => {
      const newSong = {
        id: mockSongs.length + 1,
        youtubeId: input.youtubeId,
        title: input.title,
        artist: input.artist,
        channel: input.channel,
        channelUrl: input.channelUrl || null,
        level: input.level,
        mood: input.mood,
        reason: input.reason || null,
        lyricsUrl: input.lyricsUrl || null,
        lyricsNote: input.lyricsNote || null,
        vocabularyNotes: input.vocabularyNotes || null,
        grammarNotes: input.grammarNotes || null,
        listeningPrompt: input.listeningPrompt || null,
        createdByUserId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSongs.push(newSong);
      return newSong;
    }),
    update: publicProcedure.input(songUpdateSchema).mutation(({ input }) => {
      const index = mockSongs.findIndex(s => s.youtubeId === input.youtubeId);
      if (index !== -1) {
        mockSongs[index] = {
          ...mockSongs[index],
          title: input.title,
          artist: input.artist,
          channel: input.channel,
          channelUrl: input.channelUrl || null,
          level: input.level,
          mood: input.mood,
          reason: input.reason || null,
          lyricsUrl: input.lyricsUrl || null,
          lyricsNote: input.lyricsNote || null,
          vocabularyNotes: input.vocabularyNotes || null,
          grammarNotes: input.grammarNotes || null,
          listeningPrompt: input.listeningPrompt || null,
          updatedAt: new Date(),
        };
        return mockSongs[index];
      }
      throw new Error("歌曲未找到");
    }),
    delete: publicProcedure
      .input(
        z.object({
          youtubeId: youtubeIdSchema,
        }),
      )
      .mutation(({ input }) => {
        mockSongs = mockSongs.filter(s => s.youtubeId !== input.youtubeId);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
