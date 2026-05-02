import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

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

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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
    list: publicProcedure.query(() => db.listVideos()),
    add: publicProcedure.input(videoInputSchema).mutation(({ ctx, input }) =>
      db.upsertVideo({
        youtubeId: input.youtubeId,
        title: input.title,
        channel: input.channel,
        channelUrl: input.channelUrl || null,
        level: input.level,
        topic: input.topic,
        reason: input.reason || null,
        createdByUserId: ctx.user?.id || 0,
      }),
    ),
    update: publicProcedure.input(videoUpdateSchema).mutation(({ input }) =>
      db.updateVideoByYoutubeId(input.youtubeId, {
        title: input.title,
        channel: input.channel,
        channelUrl: input.channelUrl || null,
        level: input.level,
        reason: input.reason || null,
      }),
    ),
    delete: publicProcedure
      .input(
        z.object({
          youtubeId: youtubeIdSchema,
        }),
      )
      .mutation(({ input }) => db.deleteVideoByYoutubeId(input.youtubeId)),
  }),
  analytics: router({
    stats: publicProcedure.query(() => db.getPageViewStats()),
    recordPageView: publicProcedure.input(pageViewInputSchema).mutation(({ ctx, input }) =>
      db.recordPageView({
        path: input.path,
        userAgent: ctx.req.get("user-agent") || null,
      }),
    ),
  }),
  songs: router({
    list: publicProcedure.query(() => db.listSongs()),
    add: publicProcedure.input(songInputSchema).mutation(({ ctx, input }) =>
      db.upsertSong({
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
        createdByUserId: ctx.user?.id || 0,
      }),
    ),
    update: publicProcedure.input(songUpdateSchema).mutation(({ input }) =>
      db.updateSongByYoutubeId(input.youtubeId, {
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
      }),
    ),
    delete: publicProcedure
      .input(
        z.object({
          youtubeId: youtubeIdSchema,
        }),
      )
      .mutation(({ input }) => db.deleteSongByYoutubeId(input.youtubeId)),
  }),
});

export type AppRouter = typeof appRouter;
