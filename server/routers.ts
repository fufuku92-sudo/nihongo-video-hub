import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

const levelSchema = z.enum(["N5", "N4", "N3", "N2", "N1"]);
const topicSchema = z.enum(["文法", "單字", "聽解", "讀解", "綜合"]);

const youtubeIdSchema = z
  .string()
  .trim()
  .min(6, "影片 ID 太短")
  .max(32, "影片 ID 太長")
  .regex(/^[a-zA-Z0-9_-]+$/, "影片 ID 只能包含英數字、底線與連字號");

const editableVideoFieldsSchema = z.object({
  title: z.string().trim().min(1, "請填寫影片標題").max(300, "影片標題過長"),
  level: levelSchema,
  reason: z.string().trim().max(800, "備註過長").optional(),
});

const videoInputSchema = editableVideoFieldsSchema.extend({
  youtubeId: youtubeIdSchema,
  channel: z.string().trim().min(1, "請填寫頻道名稱").max(200, "頻道名稱過長"),
  topic: topicSchema,
});

const videoUpdateSchema = editableVideoFieldsSchema.extend({
  youtubeId: youtubeIdSchema,
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
    add: adminProcedure.input(videoInputSchema).mutation(({ ctx, input }) =>
      db.upsertVideo({
        youtubeId: input.youtubeId,
        title: input.title,
        channel: input.channel,
        level: input.level,
        topic: input.topic,
        reason: input.reason || null,
        createdByUserId: ctx.user.id,
      }),
    ),
    update: adminProcedure.input(videoUpdateSchema).mutation(({ input }) =>
      db.updateVideoByYoutubeId(input.youtubeId, {
        title: input.title,
        level: input.level,
        reason: input.reason || null,
      }),
    ),
    delete: adminProcedure
      .input(
        z.object({
          youtubeId: youtubeIdSchema,
        }),
      )
      .mutation(({ input }) => db.deleteVideoByYoutubeId(input.youtubeId)),
  }),
});

export type AppRouter = typeof appRouter;
