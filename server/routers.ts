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

const optionalImageUrlSchema = z.preprocess(
  value => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().url("請填寫有效的圖片網址").max(500, "圖片網址過長").optional(),
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

const editablePodcastFieldsSchema = z.object({
  name: z.string().trim().min(1, "請填寫 Podcast 名稱").max(300, "名稱過長"),
  host: z.string().trim().min(1, "請填寫主持人或頻道名稱").max(200, "主持人名稱過長"),
  level: levelSchema,
  platform: z.string().trim().min(1, "請填寫平台名稱").max(100, "平台名稱過長"),
  platformUrl: z.string().trim().url("請填寫有效的平台連結").max(500, "連結過長"),
  description: z.string().trim().max(800, "描述過長").optional(),
  coverImageUrl: optionalImageUrlSchema,
});

const podcastInputSchema = editablePodcastFieldsSchema.extend({
  podcastId: z.string().trim().min(1, "請填寫 Podcast ID").max(100, "ID 過長"),
});

const podcastUpdateSchema = editablePodcastFieldsSchema.extend({
  podcastId: z.string().trim().min(1, "請填寫 Podcast ID").max(100, "ID 過長"),
});

const pageViewInputSchema = z.object({
  path: z.string().trim().min(1).max(255).default("/"),
});

// 假數據存儲
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

let mockPodcasts = [
  {
    id: 1,
    podcastId: "nhk-easy-japanese",
    name: "NHK Easy Japanese",
    host: "NHK WORLD",
    level: "N5" as const,
    platform: "Spotify",
    platformUrl: "https://open.spotify.com/show/",
    description: "NHK 官方推出的初級日文學習 Podcast，每集介紹日常用語與基礎文法。",
    coverImageUrl: "https://example.com/nhk-easy.jpg",
    createdByUserId: 1,
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
  },
];

let pageViews = 46;

// CSV 解析函數
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

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
      totalViews: pageViews,
    })),
    recordPageView: publicProcedure.input(pageViewInputSchema).mutation(({ ctx, input }) => {
      pageViews++;
      return {
        success: true,
        totalViews: pageViews,
      };
    }),
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
    importFromCSV: publicProcedure
      .input(z.object({
        csvContent: z.string(),
      }))
      .mutation(({ input }) => {
        const lines = input.csvContent.split("\n").filter(line => line.trim());
        const headers = parseCSVLine(lines[0]);
        const results = {
          success: 0,
          failed: 0,
          errors: [] as string[],
        };

        for (let i = 1; i < lines.length; i++) {
          try {
            const values = parseCSVLine(lines[i]);
            const row: Record<string, string> = {};

            headers.forEach((header, index) => {
              row[header] = values[index] || "";
            });

            if (!row.youtubeId || !row.title || !row.artist || !row.channel) {
              results.failed++;
              results.errors.push(`第 ${i + 1} 行：缺少必要欄位`);
              continue;
            }

            if (!["N5", "N4", "N3", "N2", "N1"].includes(row.level)) {
              results.failed++;
              results.errors.push(`第 ${i + 1} 行：級別不正確`);
              continue;
            }

            const exists = mockSongs.some(s => s.youtubeId === row.youtubeId);
            if (exists) {
              results.failed++;
              results.errors.push(`第 ${i + 1} 行：歌曲已存在`);
              continue;
            }

            const newSong = {
              id: mockSongs.length + 1,
              youtubeId: row.youtubeId,
              title: row.title,
              artist: row.artist,
              channel: row.channel,
              channelUrl: row.channelUrl || null,
              level: row.level as "N5" | "N4" | "N3" | "N2" | "N1",
              mood: row.mood || "日文歌",
              reason: row.reason || null,
              lyricsUrl: row.lyricsUrl || null,
              lyricsNote: row.lyricsNote || null,
              vocabularyNotes: row.vocabularyNotes || null,
              grammarNotes: row.grammarNotes || null,
              listeningPrompt: row.listeningPrompt || null,
              createdByUserId: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            mockSongs.push(newSong);
            results.success++;
          } catch (error) {
            results.failed++;
            results.errors.push(`第 ${i + 1} 行：解析錯誤`);
          }
        }

        return results;
      }),
  }),
  podcasts: router({
    list: publicProcedure.query(() => {
      return mockPodcasts;
    }),
    add: publicProcedure.input(podcastInputSchema).mutation(({ input }) => {
      const newPodcast = {
        id: mockPodcasts.length + 1,
        podcastId: input.podcastId,
        name: input.name,
        host: input.host,
        level: input.level,
        platform: input.platform,
        platformUrl: input.platformUrl,
        description: input.description || null,
        coverImageUrl: input.coverImageUrl || null,
        createdByUserId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPodcasts.push(newPodcast);
      return newPodcast;
    }),
    update: publicProcedure.input(podcastUpdateSchema).mutation(({ input }) => {
      const index = mockPodcasts.findIndex(p => p.podcastId === input.podcastId);
      if (index !== -1) {
        mockPodcasts[index] = {
          ...mockPodcasts[index],
          name: input.name,
          host: input.host,
          level: input.level,
          platform: input.platform,
          platformUrl: input.platformUrl,
          description: input.description || null,
          coverImageUrl: input.coverImageUrl || null,
          updatedAt: new Date(),
        };
        return mockPodcasts[index];
      }
      throw new Error("Podcast 未找到");
    }),
    delete: publicProcedure
      .input(
        z.object({
          podcastId: z.string().trim().min(1, "請填寫 Podcast ID"),
        }),
      )
      .mutation(({ input }) => {
        mockPodcasts = mockPodcasts.filter(p => p.podcastId !== input.podcastId);
        return { success: true } as const;
      }),
    importFromCSV: publicProcedure
      .input(z.object({
        csvContent: z.string(),
      }))
      .mutation(({ input }) => {
        const lines = input.csvContent.split("\n").filter(line => line.trim());
        const headers = parseCSVLine(lines[0]);
        const results = {
          success: 0,
          failed: 0,
          errors: [] as string[],
        };

        for (let i = 1; i < lines.length; i++) {
          try {
            const values = parseCSVLine(lines[i]);
            const row: Record<string, string> = {};

            headers.forEach((header, index) => {
              row[header] = values[index] || "";
            });

            if (!row.name || !row.host || !row.platform || !row.platformUrl) {
              results.failed++;
              results.errors.push(`第 ${i + 1} 行：缺少必要欄位`);
              continue;
            }

            if (!["N5", "N4", "N3", "N2", "N1"].includes(row.level)) {
              results.failed++;
              results.errors.push(`第 ${i + 1} 行：級別不正確`);
              continue;
            }

            const exists = mockPodcasts.some(p => p.podcastId === row.podcastId);
            if (exists) {
              results.failed++;
              results.errors.push(`第 ${i + 1} 行：Podcast 已存在`);
              continue;
            }

            const newPodcast = {
              id: mockPodcasts.length + 1,
              podcastId: row.podcastId,
              name: row.name,
              host: row.host,
              level: row.level as "N5" | "N4" | "N3" | "N2" | "N1",
              platform: row.platform,
              platformUrl: row.platformUrl,
              description: row.description || null,
              coverImageUrl: row.coverImageUrl || null,
              createdByUserId: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            mockPodcasts.push(newPodcast);
            results.success++;
          } catch (error) {
            results.failed++;
            results.errors.push(`第 ${i + 1} 行：解析錯誤`);
          }
        }

        return results;
      }),
  }),
});

export type AppRouter = typeof appRouter;
